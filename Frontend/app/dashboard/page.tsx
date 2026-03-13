"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { Sidebar } from "@/components/dashboard/sidebar"
import ChatWorkspace from "@/components/dashboard/chat-workspace"
import DocumentPanel from "@/components/dashboard/document-panel"
import { useSessions } from "@/hooks/useSessions"

export default function DashboardPage() {

  const router = useRouter()
  const { sessions, reloadSessions } = useSessions()

  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [docPanelOpen, setDocPanelOpen] = useState(false)
  const [activeDocument, setActiveDocument] = useState<any>(null)
  const [checkedAuth, setCheckedAuth] = useState(false)

  /* ================= AUTH ================= */

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.replace("/login")
    } else {
      setCheckedAuth(true)
    }
  }, [router])

  if (!checkedAuth) return null

  /* ================= HANDLERS ================= */

  const handleNewChat = () => {
    setActiveChat(null)
    setActiveDocument(null)
  }

  const handleChatSelect = (id: string) => {
    setActiveChat(id)
    setActiveDocument(null)
  }

  return (
    <div className="flex h-screen w-full">

      <Sidebar
        sessions={sessions}
        activeChat={activeChat}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        reloadSessions={reloadSessions}
        setActiveChat={setActiveChat} 
      />

      <ChatWorkspace
        sessionId={activeChat}
        setSessionId={setActiveChat}
        activeDocument={activeDocument}
        reloadSessions={reloadSessions}
        onToggleDocs={() => setDocPanelOpen(v => !v)}
      />

      {docPanelOpen && (
        <DocumentPanel
          sessionId={activeChat}
          setSessionId={setActiveChat}
          onClose={() => setDocPanelOpen(false)}
          onDocumentSelect={(doc: any) => {
            setActiveDocument(doc)
          }}
        />
      )}

    </div>
  )
}