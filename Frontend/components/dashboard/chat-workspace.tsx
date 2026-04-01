"use client"

import { useEffect, useRef, useState } from "react"
import { FileText, Sparkles, Wand2 } from "lucide-react"

import { ChatInput } from "./chat-input"
import { ChatMessage } from "./chat-message"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"

const SUGGESTIONS = [
  "Summarize this document",
  "Extract key information",
  "Explain this like I'm a beginner",
  "List important insights",
]

export default function ChatWorkspace({
  sessionId,
  setSessionId,
  activeDocument,
  reloadSessions,
}: any) {
  const [messages, setMessages] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasStartedStreaming, setHasStartedStreaming] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const chatAreaRef = useRef<HTMLDivElement>(null)
  const shouldAutoScrollRef = useRef(true)
  const previousSessionIdRef = useRef<string | null>(sessionId)

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleScroll = () => {
    const element = chatAreaRef.current
    if (!element) return

    const distanceFromBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight

    shouldAutoScrollRef.current = distanceFromBottom < 120
  }

  useEffect(() => {
    if (shouldAutoScrollRef.current) {
      scrollToBottom()
    }
  }, [messages])

  useEffect(() => {
    const previousSessionId = previousSessionIdRef.current

    if (!sessionId) {
      if (previousSessionId) {
        setMessages([])
      }

      previousSessionIdRef.current = sessionId
      return
    }

    if (isGenerating) return

    const token = localStorage.getItem("token")
    if (!token) return

    fetch(`${BASE_URL}/chat/history/${sessionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.messages.map((message: any) => ({
          id: crypto.randomUUID(),
          role: message.role,
          message: message.message,
        }))

        setMessages(formatted)
      })

    previousSessionIdRef.current = sessionId
  }, [sessionId, isGenerating])

  const handleSend = async (content: string) => {
    const token = localStorage.getItem("token")
    if (!token) return

    const userMessageId = crypto.randomUUID()
    const assistantId = crypto.randomUUID()

    shouldAutoScrollRef.current = true
    setHasStartedStreaming(false)
    setIsGenerating(true)

    setMessages((prev) => [
      ...prev,
      {
        id: userMessageId,
        role: "user",
        message: content,
      },
    ])

    let newSessionId: string | null = null

    try {
      const res = await fetch(`${BASE_URL}/chat/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: content,
          session_id: sessionId,
          document_id: activeDocument?.id || null,
        }),
      })

      if (!res.ok || !res.body) {
        throw new Error("Streaming failed")
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      newSessionId = res.headers.get("X-Session-Id")

      let fullText = ""
      let assistantCreated = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        if (!chunk) continue

        setHasStartedStreaming(true)
        fullText += chunk

        if (!assistantCreated) {
          assistantCreated = true

          setMessages((prev) => [
            ...prev,
            {
              id: assistantId,
              role: "assistant",
              message: fullText,
            },
          ])
        } else {
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantId
                ? { ...message, message: fullText }
                : message
            )
          )
        }
      }

      if (!sessionId && newSessionId) {
        setSessionId(newSessionId)
      }

      reloadSessions?.()
    } catch (err) {
      console.error(err)

      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          message: "Something went wrong while generating the response.",
        },
      ])
    } finally {
      setIsGenerating(false)
      setHasStartedStreaming(false)
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex h-full flex-col bg-transparent">
      <div className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-6 py-4">
        <div className="flex min-h-[48px] items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <Sparkles size={14} className="text-purple-300" />
              AI Workspace
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Ask questions, explore ideas, and get answers faster
            </p>
          </div>

          {activeDocument && (
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1.5 text-xs text-purple-200">
              <FileText size={13} />
              <span className="max-w-[240px] truncate">
                {activeDocument.title}
              </span>
            </div>
          )}
        </div>
      </div>

      <div
        ref={chatAreaRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-5 py-6">
          {isEmpty && (
            <div className="mt-8 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-purple-400/20 bg-gradient-to-br from-purple-500/20 to-blue-500/15 text-purple-200 shadow-[0_20px_40px_rgba(76,29,149,0.18)]">
                <Wand2 size={24} />
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-white">
                AI Workspace
              </h1>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-400">
                Ask questions, extract insights, and work with your documents.
              </p>

              <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
                {SUGGESTIONS.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSend(suggestion)}
                    className="
                      rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm text-gray-200
                      transition-all duration-200
                      hover:-translate-y-0.5 hover:border-purple-400/30 hover:bg-white/[0.06] hover:text-white
                    "
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages
            .filter(
              (message) =>
                message.role === "user" || message.message.trim() !== ""
            )
            .map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

          {isGenerating && !hasStartedStreaming && (
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1.5 text-xs text-purple-200">
              <span className="h-2 w-2 animate-pulse rounded-full bg-purple-300" />
              AI is thinking...
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-white/10 bg-[#0f0f16]/70 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl">
          <ChatInput
            onSend={handleSend}
            isGenerating={isGenerating}
            onStop={() => setIsGenerating(false)}
          />
        </div>
      </div>
    </div>
  )
}