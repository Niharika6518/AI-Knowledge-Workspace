"use client"

import { useState } from "react"
import { ChevronUp, LogOut, MessageSquare, Plus, Trash2 } from "lucide-react"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"

export function Sidebar({
  sessions,
  activeChat,
  onChatSelect,
  onNewChat,
  reloadSessions,
  setActiveChat,
  user,
  collapsed,
}: any) {
  const [profileOpen, setProfileOpen] = useState(false)

  const deleteSession = async (id: string) => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      await fetch(`${BASE_URL}/chat/session/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (activeChat === id) {
        setActiveChat(null)
      }

      reloadSessions?.()
    } catch (err) {
      console.error(err)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    window.location.href = "/login"
  }

  return (
    <aside className="flex h-screen flex-col bg-transparent">
      <div className="p-3">
        <button
          onClick={onNewChat}
          className={`
            flex w-full items-center gap-2 rounded-2xl border border-white/10
            bg-white/[0.05] py-3 text-xs font-medium text-gray-100
            transition-all duration-200 hover:border-purple-400/30 hover:bg-white/[0.08]
            ${collapsed ? "justify-center px-0" : "justify-start px-3"}
          `}
        >
          <Plus size={15} />
          {!collapsed && "New Chat"}
        </button>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-2 pb-3">
        {sessions.map((session: any) => {
          const isActive = activeChat === session.id

          return (
            <div
              key={session.id}
              onClick={() => onChatSelect(session.id)}
              className={`
                group flex cursor-pointer items-center gap-2 rounded-2xl px-3 py-3
                text-xs transition-all duration-200
                ${collapsed ? "justify-center px-2" : ""}
                ${
                  isActive
                    ? "border border-purple-400/30 bg-purple-500/10 text-white shadow-[0_10px_24px_rgba(76,29,149,0.18)]"
                    : "border border-transparent text-gray-300 hover:bg-white/[0.05]"
                }
              `}
            >
              <MessageSquare
                size={14}
                className={`${isActive ? "text-purple-200" : "text-gray-400"} shrink-0`}
              />

              {!collapsed && (
                <span className="flex-1 truncate">
                  {(session.firstQuestion || "New Chat").slice(0, 35)}
                </span>
              )}

              {!collapsed && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm("Delete chat?")) {
                      deleteSession(session.id)
                    }
                  }}
                  className="rounded-lg p-1 opacity-0 transition hover:bg-red-500/15 group-hover:opacity-100"
                >
                  <Trash2 size={12} className="text-red-400" />
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="border-t border-white/10 p-2">
        <button
          onClick={() => setProfileOpen((value) => !value)}
          className={`
            flex w-full items-center gap-2 rounded-2xl py-2.5
            transition hover:bg-white/[0.05]
            ${collapsed ? "justify-center px-0" : "px-2"}
          `}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-blue-500 text-xs font-semibold text-white shadow-[0_10px_20px_rgba(139,92,246,0.35)]">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>

          {!collapsed && (
            <>
              <div className="min-w-0 flex flex-1 flex-col text-left">
                <span className="truncate text-xs font-medium text-gray-100">
                  {user?.username}
                </span>
                <span className="truncate text-[10px] text-gray-500">
                  {user?.email}
                </span>
              </div>

              <ChevronUp
                size={14}
                className={`ml-auto text-gray-500 transition ${profileOpen ? "rotate-180" : ""}`}
              />
            </>
          )}
        </button>

        {profileOpen && !collapsed && (
          <div className="mx-2 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 px-3 py-3 text-xs text-gray-200 transition hover:bg-white/[0.06]"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}