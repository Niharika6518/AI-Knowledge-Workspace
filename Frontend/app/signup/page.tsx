"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const BASE_URL="http://192.168.86.31:8000"

export default function SignupPage(){

  const router=useRouter()

  const [username,setUsername]=useState("")
  const [email,setEmail]=useState("")
  const [password,setPassword]=useState("")
  const [error,setError]=useState("")

  const handleSignup=async()=>{

    try{

      const res=await fetch(
        `${BASE_URL}/signup`,
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify({
            username,
            email,
            password
          })
        }
      )

      if(!res.ok)
        throw new Error("Signup failed")

      router.push("/login")

    }catch(err:any){
      setError(err.message)
    }
  }

  return(
    <div className="flex h-screen items-center justify-center">

      <div className="w-96 space-y-4 border p-6 rounded-xl">

        <h2 className="text-xl font-semibold">
          Create Account
        </h2>

        <input
          placeholder="Username"
          value={username}
          onChange={e=>setUsername(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          placeholder="Email"
          value={email}
          onChange={e=>setEmail(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e=>setPassword(e.target.value)}
          className="w-full border p-2 rounded"
        />

        {error && (
          <p className="text-red-500 text-sm">
            {error}
          </p>
        )}

        <button
          onClick={handleSignup}
          className="w-full bg-black text-white p-2 rounded"
        >
          Signup
        </button>

      </div>

    </div>
  )
}
