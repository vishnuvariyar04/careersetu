"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Image as ImageIcon, Video } from "lucide-react"
import { useState } from "react"

type Props = {
  title: string
  videoSrc?: string
  imageSrc?: string
  poster?: string
}

export default function LessonPlayer({ title, videoSrc = "/videos/Login vs. Auth.mp4", imageSrc = "/placeholder.jpg", poster = "/lesson-preview.jpg" }: Props) {
  const [mode, setMode] = useState<"video" | "image">("video")

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant={mode === "image" ? "secondary" : "outline"} size="sm" onClick={() => setMode("image")}>
              <ImageIcon className="w-4 h-4 mr-1" /> Image
            </Button>
            <Button variant={mode === "video" ? "secondary" : "outline"} size="sm" onClick={() => setMode("video")}>
              <Video className="w-4 h-4 mr-1" /> Video
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-black/5 flex items-center justify-center">
          {mode === "video" ? (
            <video controls playsInline className="w-full h-full object-cover rounded" poster={poster}>
              <source src={videoSrc} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageSrc} alt={title} className="w-full h-full object-cover rounded" />
          )}
        </div>
      </CardContent>
    </Card>
  )
}


