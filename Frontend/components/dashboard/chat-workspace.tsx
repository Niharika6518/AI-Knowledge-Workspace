"use client"

import { useState, useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatMessage } from "./chat-message"
import { ChatInput } from "./chat-input"

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://192.168.86.31:8000"

export default function ChatWorkspace({
  sessionId,
  setSessionId,
  activeDocument,
  reloadSessions,
  onToggleDocs
}: any) {

  const [messages, setMessages] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {

    if (!sessionId) {
      setMessages([])
      return
    }

    const token = localStorage.getItem("token")
    if (!token) return

    fetch(`${BASE_URL}/user/chathistory/${sessionId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setMessages(
          data.messages.map((m: any) => ({
            id: crypto.randomUUID(),
            role: m.role,
            content: m.message
          }))
        )
      })

  }, [sessionId])

  const handleSend = async (content: string) => {

    const token = localStorage.getItem("token")
    if (!token) return

    const userId = crypto.randomUUID()
    const botId = crypto.randomUUID()

    setMessages(prev => [
      ...prev,
      { id: userId, role: "user", content },
      { id: botId, role: "assistant", content: "" }
    ])

    setIsGenerating(true)

    const res = await fetch(`${BASE_URL}/user/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        question: content,
        sessionId,
        doc_id: activeDocument?.id || null
      })
    })

    const newSessionId = res.headers.get("X-Session-Id")

    if (!sessionId && newSessionId) {
      setSessionId(newSessionId)
      reloadSessions?.()
    }

    const reader = res.body?.getReader()
    const decoder = new TextDecoder()
    let full = ""

    while (true) {
      const { done, value } = await reader!.read()
      if (done) break
      full += decoder.decode(value, { stream: true })

      setMessages(prev =>
        prev.map(m =>
          m.id === botId
            ? { ...m, content: full }
            : m
        )
      )
    }

    reloadSessions?.()
    setIsGenerating(false)
  }

  return (
    <div className="flex flex-1 flex-col">

      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800 bg-[#171717]">
        {activeDocument && (
          <div className="text-xs bg-blue-600 px-3 py-1 rounded-full">
            Using: {activeDocument.title}
          </div>
        )}

        <button
          onClick={onToggleDocs}
          className="bg-[#2f2f2f] px-4 py-2 rounded-lg"
        >
          Documents
        </button>
      </div>

      <ScrollArea className="flex-1 p-6 overflow-y-auto">
        {messages.map(m => (
          <ChatMessage key={m.id} message={m} />
        ))}
        <div ref={bottomRef} />
      </ScrollArea>

      <ChatInput
        onSend={handleSend}
        isGenerating={isGenerating}
        onStop={() => setIsGenerating(false)}
      />
    </div>
  )
}