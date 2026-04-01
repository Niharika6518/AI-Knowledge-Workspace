"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FaEye, FaEyeSlash } from "react-icons/fa"

const BASE_URL = "http://127.0.0.1:8001"

export default function Login() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const login = async () => {
    if (!email || !password) {
      setError("Email and password required")
      return
    }

    try {
      setLoading(true)
      setError("")

      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || "Invalid credentials")
      }

      localStorage.setItem("token", data.access_token)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-blue-900" />
      <div className="absolute left-[-120px] top-[-120px] h-[500px] w-[500px] animate-pulse rounded-full bg-purple-600 opacity-30 blur-[180px]" />
      <div className="absolute bottom-[-120px] right-[-80px] h-[400px] w-[400px] animate-pulse rounded-full bg-blue-600 opacity-30 blur-[180px]" />

      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 p-[1px]">
        <div className="rounded-2xl border border-white/10 bg-black/60 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-semibold text-white">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-300">Login to your AI workspace</p>
          </div>

          <div className="space-y-4">
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white outline-none placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white outline-none placeholder-gray-400 focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              />

              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-2.5 text-gray-300 hover:text-white"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {error && <p className="mt-4 text-center text-sm text-red-400">{error}</p>}

          <button
            onClick={login}
            disabled={loading}
            className="mt-6 w-full transform rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 py-2.5 text-sm font-medium text-white transition hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="mt-6 text-center text-sm text-gray-300">
            Don’t have an account?{" "}
            <span
              onClick={() => router.push("/signup")}
              className="cursor-pointer text-purple-400 hover:underline"
            >
              Sign up
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}