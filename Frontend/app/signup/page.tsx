"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { TypeAnimation } from "react-type-animation"
import { FaEye, FaEyeSlash } from "react-icons/fa"

const BASE_URL = "http://127.0.0.1:8001"

export default function SignupPage() {
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSignup = async () => {
    if (!username || !email || !password) {
      setError("All fields are required")
      return
    }

    try {
      setLoading(true)
      setError("")

      const res = await fetch(`${BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || "Signup failed")
      }

      router.push("/login")
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
            <h2 className="text-3xl font-semibold text-white">
              Create your account
            </h2>

            <TypeAnimation
              sequence={[
                "Start using your AI workspace",
                2000,
                "Initializing intelligence...",
                2000,
                "Connecting knowledge base...",
                2000,
              ]}
              wrapper="p"
              speed={50}
              repeat={Infinity}
              className="mt-2 text-sm text-gray-300"
            />
          </div>

          <div className="space-y-4">
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white outline-none placeholder-gray-400 focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
            />

            <input
              type="email"
              placeholder="Email address"
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
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white outline-none placeholder-gray-400 focus:border-pink-400 focus:ring-1 focus:ring-pink-400"
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

          {error && (
            <p className="mt-4 text-center text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            onClick={handleSignup}
            disabled={loading}
            className="mt-6 w-full transform rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 py-2.5 text-sm font-medium text-white transition hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p className="mt-6 text-center text-sm text-gray-300">
            Already have an account?{" "}
            <span
              onClick={() => router.push("/login")}
              className="cursor-pointer text-purple-400 hover:underline"
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}