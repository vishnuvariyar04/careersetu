"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import studentsData from "@/data/students.json"

function getInitials(fullName: string): string {
  if (!fullName) return "??"
  return fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function StudentsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Students</h1>
        <p className="text-muted-foreground">Students enrolled or associated with your company</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(studentsData as { student_id: string; full_name: string; email: string; skills: string[]; experience_level: string; github_url: string | null; resume_url: string | null }[]).map((student) => (
          <Card key={student.student_id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="text-sm">{getInitials(student.full_name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base truncate">{student.full_name}</CardTitle>
                  <CardDescription className="text-xs truncate">{student.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Experience: </span>
                <Badge variant="secondary" className="capitalize">{student.experience_level}</Badge>
              </div>
              {Array.isArray(student.skills) && student.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {student.skills.slice(0, 4).map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                  ))}
                  {student.skills.length > 4 && (
                    <Badge variant="outline" className="text-xs">+{student.skills.length - 4}</Badge>
                  )}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                {student.github_url && (
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a href={student.github_url} target="_blank" rel="noopener noreferrer">GitHub</a>
                  </Button>
                )}
                {student.resume_url && (
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a href={student.resume_url} target="_blank" rel="noopener noreferrer">Resume</a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
