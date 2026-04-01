"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LayoutGrid, PanelRightOpen, Sparkles } from "lucide-react"

import ChatWorkspace from "@/components/dashboard/chat-workspace"
import DocumentPanel from "@/components/dashboard/document-panel"
import { Sidebar } from "@/components/dashboard/sidebar"
import { useSessions } from "@/hooks/useSessions"

export default function DashboardPage() {
  const router = useRouter()
  const { sessions, reloadSessions } = useSessions()

  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [activeDocument, setActiveDocument] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [checkedAuth, setCheckedAuth] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [docPanelOpen, setDocPanelOpen] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      router.replace("/login")
      return
    }

    setCheckedAuth(true)
  }, [router])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    fetch("http://localhost:8001/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch(console.error)
  }, [])

  if (!checkedAuth) return null

  const handleNewChat = () => {
    setActiveChat(null)
  }

  const handleChatSelect = (id: string) => {
    setActiveChat(id)
  }

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-[#07070b] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(109,40,217,0.14),transparent_26%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.10),transparent_18%)]" />

      <div
        className={[
          "relative z-10 flex-shrink-0 transition-all duration-300",
          sidebarOpen ? "w-[240px]" : "w-[70px]",
        ].join(" ")}
      >
        <Sidebar
          sessions={sessions}
          activeChat={activeChat}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
          reloadSessions={reloadSessions}
          setActiveChat={setActiveChat}
          user={user}
          collapsed={!sidebarOpen}
        />
      </div>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <div className="border-b border-white/10 px-4 py-3">
          <div className="flex items-center justify-between gap-4 rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-5 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.30)] backdrop-blur-xl">
            <div className="flex min-w-0 items-center gap-4">
              <button
                onClick={() => setSidebarOpen((value) => !value)}
                className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-gray-200 transition hover:border-purple-500/30 hover:bg-white/[0.06]"
              >
                <LayoutGrid size={22} />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2 text-white">
                  <Sparkles size={18} className="text-purple-300" />
                  <h1 className="truncate text-[20px] font-semibold tracking-tight">
                    AI Workspace
                  </h1>
                </div>
                <p className="truncate text-sm text-gray-400">
                  Your AI workspace for documents and everyday questions
                </p>
              </div>
            </div>

            <button
              onClick={() => setDocPanelOpen((value) => !value)}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-base font-medium text-gray-100 transition hover:border-purple-500/30 hover:bg-white/[0.06]"
            >
              <PanelRightOpen size={18} className="text-gray-300" />
              Documents
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 justify-center px-3 py-3 md:px-4">
          <div className="min-w-0 w-full max-w-[85vw]">
            <div className="h-full overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <ChatWorkspace
                sessionId={activeChat}
                setSessionId={setActiveChat}
                activeDocument={activeDocument}
                reloadSessions={reloadSessions}
              />
            </div>
          </div>
        </div>
      </div>

      {docPanelOpen && (
        <div className="relative z-10 w-[340px] flex-shrink-0 border-l border-white/10 bg-[#09090d]/90 backdrop-blur-xl">
          <DocumentPanel
            activeDocument={activeDocument}
            onDocumentSelect={(doc: any) => setActiveDocument(doc)}
            onDocumentUnselect={() => setActiveDocument(null)}
          />
        </div>
      )}
    </div>
  )
}