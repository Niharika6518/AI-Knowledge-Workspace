"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { FileText, Search, Trash2, Upload, X } from "lucide-react"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"

export default function DocumentPanel({
  onDocumentSelect,
  activeDocument,
  onDocumentUnselect,
}: any) {
  const [documents, setDocuments] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [query, setQuery] = useState("")

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const fetchDocs = () => {
    const token = localStorage.getItem("token")
    if (!token) return

    fetch(`${BASE_URL}/documents/doclist`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setDocuments(data || []))
      .catch(console.error)
  }

  useEffect(() => {
    fetchDocs()
  }, [])

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return

    const token = localStorage.getItem("token")
    if (!token) return

    const formData = new FormData()
    formData.append("file", file)
    formData.append("title", file.name)

    setUploading(true)

    try {
      const res = await fetch(`${BASE_URL}/documents/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error("Upload failed:", errorText)
        alert(`Upload failed: ${errorText}`)
        return
      }

      fetchDocs()
    } catch (err) {
      console.error(err)
      alert("Upload failed")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const handleDelete = async (doc: any) => {
    const token = localStorage.getItem("token")
    if (!token) return

    const confirmed = window.confirm(`Delete "${doc.title}"?`)
    if (!confirmed) return

    setDeletingId(doc.id)

    try {
      const res = await fetch(`${BASE_URL}/documents/${doc.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        throw new Error("Failed to delete document")
      }

      setDocuments((prev) => prev.filter((item) => item.id !== doc.id))

      if (activeDocument?.id === doc.id) {
        onDocumentUnselect?.()
      }
    } catch (err) {
      console.error(err)
      alert("Delete failed")
    } finally {
      setDeletingId(null)
    }
  }

  const filteredDocuments = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return documents

    return documents.filter((doc: any) =>
      (doc.title || "").toLowerCase().includes(normalized)
    )
  }, [documents, query])

  return (
    <div className="flex h-full w-full flex-col bg-[#0b0b12]">
      <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.14),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0))] px-6 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold tracking-tight text-white">
              Documents
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Upload and pick a file to chat with
            </p>
          </div>

          {activeDocument && (
            <button
              onClick={onDocumentUnselect}
              className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs text-purple-200 transition hover:bg-purple-500/15"
            >
              <X size={14} />
              Unselect
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4 border-b border-white/5 px-6 py-5">
        <button
          onClick={handleUploadClick}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] py-4 text-base font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition hover:-translate-y-[1px] hover:border-purple-500/30"
        >
          <Upload size={18} />
          {uploading ? "Uploading..." : "Upload Document"}
        </button>

        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-4 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-purple-500/40 focus:ring-2 focus:ring-purple-500/15"
          />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          hidden
          onChange={handleFileChange}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {filteredDocuments.length === 0 && (
          <div className="mt-14 text-center text-sm text-gray-500">
            {documents.length === 0 ? "No documents yet" : "No matching documents"}
          </div>
        )}

        <div className="space-y-3">
          {filteredDocuments.map((doc: any) => {
            const isSelected = activeDocument?.id === doc.id
            const isDeleting = deletingId === doc.id

            return (
              <div
                key={doc.id}
                className={[
                  "group rounded-[24px] border p-4 transition-all duration-200",
                  isSelected
                    ? "border-purple-500/40 bg-[linear-gradient(135deg,rgba(168,85,247,0.18),rgba(99,102,241,0.08))] shadow-[0_18px_40px_rgba(88,28,135,0.18)]"
                    : "border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] hover:border-purple-500/25 hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))]",
                ].join(" ")}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() =>
                      isSelected ? onDocumentUnselect?.() : onDocumentSelect(doc)
                    }
                    className="flex flex-1 items-start gap-3 text-left"
                  >
                    <div
                      className={[
                        "mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
                        isSelected
                          ? "border-purple-400/30 bg-purple-500/15 text-purple-200"
                          : "border-white/10 bg-white/5 text-gray-400",
                      ].join(" ")}
                    >
                      <FileText size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="break-words text-[15px] font-semibold leading-snug text-white">
                        {doc.title}
                      </div>
                      <div className="mt-1 text-sm text-gray-400">
                        {isSelected ? "Selected for chat" : "Open in chat"}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleDelete(doc)}
                    disabled={isDeleting}
                    title="Delete document"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-gray-400 opacity-100 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50 md:opacity-0 md:group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}