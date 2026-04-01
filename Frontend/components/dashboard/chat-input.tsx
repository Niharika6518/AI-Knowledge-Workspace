"use client"

import { useState } from "react"
import { FaPaperPlane } from "react-icons/fa"

type ChatInputProps = {
  onSend: (message: string) => void
  isGenerating: boolean
  onStop: () => void
}

export function ChatInput({
  onSend,
  isGenerating,
  onStop,
}: ChatInputProps) {
  const [value, setValue] = useState("")

  const send = () => {
    const trimmed = value.trim()

    if (!trimmed || isGenerating) return

    onSend(trimmed)
    setValue("")
  }

  return (
    <div className="rounded-[24px] border border-white/10 bg-[#15151d]/85 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div
        className="
          flex items-end gap-3
          rounded-[20px]
          border border-white/10
          bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))]
          px-4 py-3
          transition-all duration-200
          focus-within:border-purple-400/50
          focus-within:shadow-[0_0_0_4px_rgba(168,85,247,0.12)]
        "
      >
        <textarea
          value={value}

          placeholder="Ask anything.."
          rows={1}
          className="
            max-h-40
            flex-1
            resize-none
            bg-transparent
            pt-1
            text-sm text-gray-100
            outline-none
            placeholder:text-gray-500
          "
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
        />

        {!isGenerating ? (
          <button
            onClick={send}
            disabled={!value.trim()}
            className="
              flex h-11 w-11 items-center justify-center
              rounded-2xl
              bg-gradient-to-br from-purple-500 via-fuchsia-500 to-blue-500
              text-white
              shadow-[0_12px_24px_rgba(139,92,246,0.35)]
              transition-all duration-200
              hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(139,92,246,0.45)]
              active:translate-y-0
              disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0
            "
          >
            <FaPaperPlane size={13} />
          </button>
        ) : (
          <button
            onClick={onStop}
            className="
              rounded-2xl border border-red-400/20 bg-red-500/90 px-4 py-2
              text-sm font-medium text-white
              transition-all duration-200
              hover:bg-red-500
            "
          >
            Stop
          </button>
        )}
      </div>
    </div>
  )
}