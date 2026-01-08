"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type Props = {
  readinessPercent: number
  onJoinProject?: () => void
  showCTA?: boolean
}

export default function ProgressSummary({ readinessPercent, onJoinProject, showCTA }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Readiness</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Overall readiness</span>
          <span className="font-medium">{readinessPercent}%</span>
        </div>
        <Progress value={readinessPercent} />
        {showCTA && onJoinProject && (
          <button onClick={onJoinProject} className="w-full text-sm mt-2 rounded-md bg-primary text-primary-foreground py-2">
            You’re ready — Join the project
          </button>
        )}
      </CardContent>
    </Card>
  )
}


