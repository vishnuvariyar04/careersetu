'use client'
import { useEffect, useState } from "react";

export default function StreamingAI() {
  const [content, setContent] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        "https://n8n.srv1034714.hstgr.cloud/webhook/84c3f955-1157-4a3f-908d-577fb41f9060"
      );

      if (!res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // n8n streaming usually sends JSON per line
        const lines = chunk.split("\n").filter(Boolean);

        lines.forEach((line) => {
          try {
            const data = JSON.parse(line);
            if (data.type === "item" && data.content) {
              setContent((prev) => prev + data.content);
            }
          } catch (err) {
            console.error("Error parsing chunk:", err);
          }
        });
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ whiteSpace: "pre-wrap", border: "1px solid #ccc", padding: "1rem" }}>
      {content || "Waiting for AI response..."}
    </div>
  );
}
