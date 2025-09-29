"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, ArrowRight, Star, Clock, Code, User, ArrowLeft, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useParams } from "next/navigation"

export default function ProjectTeamsPage() {
  const [teams, setTeams] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isMemberOfTeam, setIsMemberOfTeam] = useState(false)

  const params = useParams()

  const studentId = params.student_id as string
  const companyId = params.company_id as string
  const projectId = params.project_id as string
  
  // State to hold URL parameters and the Supabase client instance
  // const [params, setParams] = useState({ studentId: '', companyId: '', projectId: '' });


  // Effect to fetch data whenever params or the supabase client changes
  useEffect(() => {
    const fetchTeamData = async () => {
      // Guard against running fetch with incomplete params or uninitialized client
     console.log(projectId)
      
      setIsLoading(true);

      // 1. Fetch all teams for the current project
      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select("*")
        .eq("project_id", projectId);

        console.log(teamsData)

      if (teamsError) {
        console.error("Error fetching teams:", teamsError);
        setIsLoading(false);
        return;
      }

      if (!teamsData || teamsData.length === 0) {
        setTeams([]);
        setIsLoading(false);
        return;
      }

      // 2. Fetch all team members for these teams
      const teamIds = teamsData.map(t => t.team_id);
      const { data: membersData, error: membersError } = await supabase
        .from("team_members")
        .select("*, students(student_id, name)") // Join with students table to get names
        .in("team_id", teamIds);

      if (membersError) {
        console.error("Error fetching team members:", membersError);
      }

      // 3. Check if the current student is already in one of the teams
      const isAlreadyMember = membersData?.some(member => member.student_id === studentId) || false;
      setIsMemberOfTeam(isAlreadyMember);

      // 4. Process data to combine teams with their members and determine open roles
      const enrichedTeams = teamsData.map(team => {
        const members = membersData?.filter(m => m.team_id === team.team_id) || [];
        const filledRoles = members.map(m => m.role);
        
        const allRoles = ['frontend', 'backend']; // All possible roles
        const openRoles = allRoles.filter(role => !filledRoles.includes(role));

        return {
          ...team,
          members,
          openRoles,
        };
      });

      setTeams(enrichedTeams);
      setIsLoading(false);
    };

    fetchTeamData();
  }, []); // Rerun if params or supabase client changes

  const handleJoinTeam = async (teamId: string, role: string) => {
    if (!supabase) return; // Guard against uninitialized client
    // const { studentId, companyId, projectId } = params;
    // Insert the student into the team_members table
    const { error } = await supabase
      .from("team_members")
      .insert({
        team_id: teamId,
        student_id: studentId,
        role: role,
      });

    if (error) {
      console.error("Error joining team:", error);
    } else {
      // Navigate to the workspace on successful join
      window.location.href = `/student/${studentId}/company/${companyId}/project/${projectId}/team/${teamId}/workspace`;
    }
  };

  const handleBackToCompany = () => {
    // Navigate back to the main company page, which lists the projects
    window.location.href = `/student/${studentId}/company/${companyId}`;
  };
  
  if (isLoading) {
    return (
        <div className="min-h-screen bg-background grid-pattern flex items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleBackToCompany}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Select Your Team</h1>
              <p className="text-muted-foreground">Choose a team and role to join for this project.</p>
            </div>
          </div>
           {isMemberOfTeam && (
            <Badge variant="default" className="bg-green-600 text-white">Already in a team</Badge>
          )}
        </div>

        {/* Teams Grid */}
        {teams.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {teams.map((team) => (
              <Card key={team.team_id} className="hover:border-primary/50 transition-colors flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" />{team.name}</CardTitle>
                  <CardDescription className="mt-2">{team.description || 'No description provided.'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Team Members */}
                  <div>
                    <p className="text-sm font-medium mb-3">Team Members ({team.members.length}/2)</p>
                    <div className="space-y-2">
                      {team.members.length > 0 ? team.members.map((member: any) => (
                        <div key={member.id} className="flex items-center gap-3">
                          {/* <Avatar className="w-8 h-8"><AvatarFallback className="text-xs">{member.students.name.substring(0, 2)}</AvatarFallback></Avatar> */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{member.students.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                          </div>
                        </div>
                      )) : <p className="text-xs text-muted-foreground">No members yet.</p>}
                    </div>
                  </div>

                  {/* Join Buttons for Open Roles */}
                  <div className="pt-2 space-y-2">
                    {team.openRoles.map((role: string) => (
                        <Button key={role} className="w-full" onClick={() => handleJoinTeam(team.team_id, role)} disabled={isMemberOfTeam}>
                            Join as {role.charAt(0).toUpperCase() + role.slice(1)}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    ))}
                    {team.openRoles.length === 0 && (
                        <Button className="w-full" disabled>Team Full</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
            <div className="text-center py-16">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4"/>
                <h2 className="text-xl font-semibold">No Teams Found</h2>
                <p className="text-muted-foreground mt-2">There are no teams created for this project yet. Check back later!</p>
            </div>
        )}
      </div>
    </div>
  )
}

