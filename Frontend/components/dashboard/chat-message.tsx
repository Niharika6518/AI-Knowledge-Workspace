"use client"

import ReactMarkdown from "react-markdown"

type ChatMessageType = {
  role: "user" | "assistant"
  message: string
}

export function ChatMessage({
  message,
}: {
  message: ChatMessageType
}) {
  const isUser = message.role === "user"

  return (
    <div
      className={`
        mb-6 flex w-full
        ${isUser ? "justify-end" : "justify-start"}
        animate-fadeIn
      `}
    >
      <div
        className={`
          flex max-w-[82%] items-start gap-3
          ${isUser ? "flex-row-reverse" : ""}
        `}
      >
        <div
          className={`
            flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl
            text-[11px] font-semibold shadow-lg
            ${
              isUser
                ? "bg-gradient-to-br from-purple-500 via-fuchsia-500 to-blue-500 text-white"
                : "border border-white/10 bg-white/[0.04] text-gray-200"
            }
          `}
        >
          {isUser ? "U" : "AI"}
        </div>

        <div
          className={`
            rounded-[22px] px-5 py-4 text-[14px] leading-7
            shadow-[0_12px_30px_rgba(0,0,0,0.22)]
            transition-all duration-200
            ${
              isUser
                ? "bg-gradient-to-br from-purple-500 via-fuchsia-500 to-blue-500 text-white"
                : "border border-white/10 bg-white/[0.04] text-gray-100 backdrop-blur-md"
            }
          `}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.message}</p>
          ) : (
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="mb-3 text-gray-200 last:mb-0">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="mb-3 space-y-1 last:mb-0">
                    {children}
                  </ul>
                ),
                li: ({ children }) => (
                  <li className="ml-4 list-disc text-gray-300">
                    {children}
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-white">
                    {children}
                  </strong>
                ),
                code: ({ children }) => (
                  <code className="rounded-md bg-black/30 px-1.5 py-0.5 text-[13px] text-purple-200">
                    {children}
                  </code>
                ),
              }}
            >
              {message.message}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  )
}