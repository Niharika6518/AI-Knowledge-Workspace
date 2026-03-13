"use client"

import { useEffect, useState } from "react"

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://192.168.86.31:8000"

export function ProfileDropdown() {

  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    fetch(`${BASE_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(setProfile)
  }, [])

  const logout = () => {
    localStorage.removeItem("token")
    window.location.href = "/login"
  }

  return (
    <div className="p-4 border-b border-gray-800 flex items-center justify-between">

      <div className="flex items-center gap-3">
        {profile?.profileImage && (
          <img
            src={profile.profileImage}
            className="w-8 h-8 rounded-full"
          />
        )}
        <div className="text-sm">{profile?.username}</div>
      </div>

      <button
        onClick={logout}
        className="text-xs text-red-400"
      >
        Logout
      </button>
    </div>
  )
}