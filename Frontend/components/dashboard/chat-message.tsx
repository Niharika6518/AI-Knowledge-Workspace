"use client"

export function ChatMessage({ message }: any) {

  const isUser = message?.role === "user"

  return (
    <div
      className={`w-full flex mb-4 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >

      <div
        className={`
          max-w-[75%]
          px-4 py-3
          rounded-2xl
          text-sm
          whitespace-pre-wrap
          wrap-break-word
          ${
            isUser
              ? "bg-[#3b3b3b] text-white"
              : "bg-[#2f2f2f] text-gray-100"
          }
        `}
      >
        {message?.content || ""}
      </div>

    </div>
  )
}