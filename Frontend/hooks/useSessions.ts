"use client"

import { useEffect, useState } from "react"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"

export function useSessions() {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const loadSessions = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      setLoading(true)

      const res = await fetch(`${BASE_URL}/chat/sessions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.status === 401) {
        localStorage.removeItem("token")
        window.location.href = "/login"
        return
      }

      const data = await res.json()
      const raw = data.sessions || data || []

      const normalized = raw.map((session: any) => ({
        id: session.id || session.session_id,
        firstQuestion: session.firstQuestion || session.first_question,
      }))

      setSessions(normalized)
    } catch (err) {
      console.error("Session load failed:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [])

  return {
    sessions,
    reloadSessions: loadSessions,
    loading,
  }
}