"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const BASE_URL = "http://192.168.86.31:8000"

export default function Login() {

  const router = useRouter()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const login = async () => {

    try {

      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      })

      // ✅ handle invalid login properly
      if (!res.ok) {
        const err = await res.text()
        throw new Error(err || "Invalid credentials")
      }

      const data = await res.json()

      // ✅ store token safely
      localStorage.setItem("token", data.token)

      router.push("/dashboard")

    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center">

      <div className="space-y-3 border p-6 rounded-xl">

        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="border p-2 w-full"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border p-2 w-full"
        />

        {error && (
          <p className="text-red-500 text-sm">
            {error}
          </p>
        )}

        <button
          onClick={login}
          className="bg-black text-white px-4 py-2 w-full rounded"
        >
          Login
        </button>

      </div>

    </div>
  )
}