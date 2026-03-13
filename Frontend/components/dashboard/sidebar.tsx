"use client"

import { Plus, MessageSquare, Trash2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://192.168.86.31:8000"

export function Sidebar({
  sessions,
  activeChat,
  onChatSelect,
  onNewChat,
  reloadSessions,
  setActiveChat
  
}: any) {

  const deleteSession = async (id: string) => {
  const token = localStorage.getItem("token")
  if (!token) return

  await fetch(`${BASE_URL}/user/session/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  })

  // If deleted chat is active, clear it
  if (activeChat === id) {
    setActiveChat(null)
  }

  reloadSessions?.()
}

  return (
    <aside className="flex flex-col w-72 h-full bg-[#171717] border-r border-gray-800">

      <div className="px-4 py-4">
        <button
          onClick={onNewChat}
          className="flex w-full items-center gap-2 rounded-xl bg-secondary px-4 py-2"
        >
          <Plus className="size-4" />
          New Chat
        </button>
      </div>

      <ScrollArea className="flex-1 px-3 pb-4 overflow-y-auto">

        {sessions.map((session: any) => (
          <div
            key={session.id}
            className="flex items-center justify-between px-3 py-2 hover:bg-sidebar-accent/50 rounded-lg"
          >
            <button
              onClick={() => onChatSelect(session.id)}
              className="flex items-center gap-2 text-left truncate"
            >
              <MessageSquare className="size-4" />
              <span className="truncate text-sm">
                {session.firstQuestion}
              </span>
            </button>

            <Trash2
              onClick={() => deleteSession(session.id)}
              className="size-4 cursor-pointer text-red-500"
            />
          </div>
        ))}

      </ScrollArea>
    </aside>
  )
}