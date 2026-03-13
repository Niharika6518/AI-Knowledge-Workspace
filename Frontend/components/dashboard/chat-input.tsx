"use client"

import { useState } from "react"

export function ChatInput({
  onSend,
  isGenerating,
  onStop
}: any) {

  const [value, setValue] = useState("")

  const send = () => {
    const trimmed = value.trim()
    if (!trimmed || isGenerating) return

    onSend(trimmed)
    setValue("")
  }

  return (
    <div className="p-4 border-t border-gray-800 bg-[#212121]">

      <div
        className="
          flex items-end gap-2
          bg-[#2f2f2f]
          border border-gray-700
          rounded-2xl
          px-4 py-3
        "
      >

        <textarea
          value={value}
          disabled={isGenerating}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Message AI..."
          rows={1}
          className="
            flex-1
            bg-transparent
            outline-none
            text-gray-100
            placeholder-gray-400
            resize-none
            max-h-40
          "
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
              text-sm
              px-3 py-1
              rounded-lg
              bg-white
              text-black
              disabled:opacity-40
            "
          >
            Send
          </button>
        ) : (
          <button
            onClick={onStop}
            className="
              text-sm
              px-3 py-1
              rounded-lg
              bg-red-500
              text-white
            "
          >
            Stop
          </button>
        )}

      </div>
    </div>
  )
}