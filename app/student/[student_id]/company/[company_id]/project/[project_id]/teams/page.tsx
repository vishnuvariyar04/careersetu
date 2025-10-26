"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, ArrowRight, Star, Clock, Code, User, ArrowLeft, Loader2, Plus } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useParams } from "next/navigation"
import { useStudentAuth } from "@/hooks/use-student-auth"

export default function ProjectTeamsPage() {
  const [teams, setTeams] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isMemberOfTeam, setIsMemberOfTeam] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [teamName, setTeamName] = useState("")
  const [teamDescription, setTeamDescription] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const params = useParams()

  const studentId = params.student_id as string
  const companyId = params.company_id as string
  const projectId = params.project_id as string
  
  // Security check: Verify the logged-in user matches the student_id in URL
  const isAuthorized = useStudentAuth(studentId)
  
  // State to hold URL parameters and the Supabase client instance
  // const [params, setParams] = useState({ studentId: '', companyId: '', projectId: '' });


  // Effect to fetch data whenever params or the supabase client changes
  useEffect(() => {
    // Only fetch data if user is authorized
    if (isAuthorized !== true) {
      return
    }

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
  }, [isAuthorized, projectId, studentId]); // Rerun if params or authorization changes

  const handleJoinTeam = async (teamId: string, role: string) => {
    if (!supabase) return; // Guard against uninitialized client
    
    // Check if student is already in a team
    if (isMemberOfTeam) {
      alert("You are already in a team. Please leave your current team before joining another one.");
      return;
    }
    
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
      alert("Failed to join team. Please try again.");
    } else {
      // Navigate to the workspace on successful join
      window.location.href = `/student/${studentId}/company/${companyId}/project/${projectId}/team/${teamId}/workspace`;
    }
  };

  const handleBackToCompany = () => {
    // Navigate back to the main company page, which lists the projects
    window.location.href = `/student/${studentId}/company/${companyId}`;
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      alert("Please enter a team name");
      return;
    }

    if (!selectedRole) {
      alert("Please select a role");
      return;
    }

    // Check if student is already in a team
    if (isMemberOfTeam) {
      alert("You are already in a team. Please leave your current team before creating a new one.");
      return;
    }

    setIsCreating(true);

    // First, create the team
    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .insert({
        project_id: projectId,
        name: teamName, 
        
      })
      .select()
      .single();

    if (teamError) {
      console.error("Error creating team:", teamError);
      alert("Failed to create team. Please try again.");
      setIsCreating(false);
      return;
    }

    // Then, add the creator as a team member with their selected role
    const { error: memberError } = await supabase
      .from("team_members")
      .insert({
        team_id: teamData.team_id,
        student_id: studentId,
        role: selectedRole,
      });

    if (memberError) {
      console.error("Error adding team member:", memberError);
      alert("Team created but failed to add you as a member. Please try joining manually.");
      setIsCreating(false);
      return;
    }

    // Reset form and close dialog
    setTeamName("");
    setTeamDescription("");
    setSelectedRole("");
    setIsDialogOpen(false);
    
    // Refresh teams list
    const { data: teamsData, error: teamsError } = await supabase
      .from("teams")
      .select("*")
      .eq("project_id", projectId);

    if (!teamsError && teamsData) {
      const teamIds = teamsData.map(t => t.team_id);
      const { data: membersData } = await supabase
        .from("team_members")
        .select("*, students(student_id, name)")
        .in("team_id", teamIds);

      const isAlreadyMember = membersData?.some(member => member.student_id === studentId) || false;
      setIsMemberOfTeam(isAlreadyMember);

      const enrichedTeams = teamsData.map(team => {
        const members = membersData?.filter(m => m.team_id === team.team_id) || [];
        const filledRoles = members.map(m => m.role);
        const allRoles = ['frontend', 'backend'];
        const openRoles = allRoles.filter(role => !filledRoles.includes(role));

        return {
          ...team,
          members,
          openRoles,
        };
      });

      setTeams(enrichedTeams);
    }

    setIsCreating(false);

    // Navigate to the workspace
    window.location.href = `/student/${studentId}/company/${companyId}/project/${projectId}/team/${teamData.team_id}/workspace`;
  };
  
  // Show loading while checking authorization or loading data
  if (isAuthorized === null || isLoading) {
    return (
        <div className="min-h-screen bg-background grid-pattern flex items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
    );
  }

  // If not authorized, don't render anything (redirect is in progress)
  if (isAuthorized === false) {
    return null
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
          <div className="flex items-center gap-3">
            {isMemberOfTeam && (
              <Badge variant="default" className="bg-green-600 text-white">Already in a team</Badge>
            )}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={isMemberOfTeam}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Team</DialogTitle>
                  <DialogDescription>
                    Create a new team for this project. Other students will be able to join your team.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="team-name">Team Name *</Label>
                    <Input
                      id="team-name"
                      placeholder="Enter team name"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="team-description">Description</Label>
                    <Textarea
                      id="team-description"
                      placeholder="Enter team description (optional)"
                      value={teamDescription}
                      onChange={(e) => setTeamDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role-select">Your Role *</Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger id="role-select">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="frontend">Frontend Developer</SelectItem>
                        <SelectItem value="backend">Backend Developer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isCreating}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTeam} disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Team"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
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