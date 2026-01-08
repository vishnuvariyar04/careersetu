"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: string;
}

interface TeammatesListProps {
  teamId: string | number; // Accept both
}

export function TeammatesList({ teamId }: any) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


 
  useEffect(() => {
    const fetchTeammates = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("team_members")
        .select(`
          role,
          students ( student_id, name )
        `)
        .eq("team_id", String(teamId)); // ✅ always string

      if (error) {
        console.error("Supabase Error fetching teammates:", error);
        setError("Could not load teammates.");
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setMembers([]);
        setLoading(false);
        return;
      }

      const transformedMembers: TeamMember[] = data.map(
        (member: any, index: number) => ({
          id: member.students.student_id,
          name: member.students.name,
          role: member.role,
          avatar: member.students.name
            .split(" ")
            .map((n: string) => n[0])
            .join(""),
          status: index % 2 === 0 ? "online" : "away",
        })
      );

      setMembers(transformedMembers);
      setLoading(false);
    };

    if (teamId) {
      fetchTeammates();
    }
  }, [teamId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Teammates</CardTitle>
        </CardHeader>
        <CardContent>Loading teammates...</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Teammates</CardTitle>
        </CardHeader>
        <CardContent>{error}</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teammates</CardTitle>
      </CardHeader>
      <CardContent>
        {members.length > 0 ? (
          <ul className="space-y-4">
            {members.map((member) => (
              <li
                key={member.id}
                className="flex items-center space-x-4 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Avatar>
                  <AvatarFallback>{member.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {member.role}
                  </p>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${
                    member.status === "online" ? "bg-green-500" : "bg-yellow-500"
                  }`}
                  title={member.status}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p>No teammates found.</p>
        )}
      </CardContent>
    </Card>
  );
}
