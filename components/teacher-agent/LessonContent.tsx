"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Resource = { label: string; href: string }

type Props = {
  moduleTitle: string
  lessonTitle: string
  explanationHtml?: string
  codeSample?: string
  resources?: Resource[]
}

export default function LessonContent({ moduleTitle, lessonTitle, explanationHtml, codeSample, resources = [] }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{moduleTitle}</Badge>
          <CardTitle className="text-base">{lessonTitle}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: explanationHtml || "<p>AI will generate explanations here.</p>" }} />
        {codeSample && (
          <div className="rounded-md border bg-background">
            <pre className="p-3 overflow-auto text-xs"><code>{codeSample}</code></pre>
          </div>
        )}
        {resources.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Resources</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              {resources.map((r) => (
                <li key={r.href}><a className="underline" href={r.href} target="_blank" rel="noreferrer">{r.label}</a></li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


