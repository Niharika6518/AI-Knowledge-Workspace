"use client"

import { useRef, useState, useEffect } from "react"
import { Trash2 } from "lucide-react"

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://192.168.86.31:8000"

export default function DocumentPanel({
  onClose,
  onDocumentSelect,
  sessionId,
  setSessionId
}: any) {

  const fileRef = useRef<HTMLInputElement>(null)
  const [documents, setDocuments] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)

  /* ================= LOAD DOCUMENT LIST ================= */

  const loadDocuments = async () => {

    const token = localStorage.getItem("token")
    if (!token) {
      console.error("No token found")
      return
    }

    try {

      const res = await fetch(`${BASE_URL}/doclist`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (res.status === 401) {
        console.error("Unauthorized while loading documents")
        return
      }

      const data = await res.json()
      setDocuments(data || [])

    } catch (err) {
      console.error("Doclist error:", err)
    }
  }

  useEffect(() => {
    loadDocuments()
  }, [])

  /* ================= DELETE DOCUMENT ================= */

  const deleteDoc = async (id: number) => {

    const token = localStorage.getItem("token")
    if (!token) return

    try {

      await fetch(`${BASE_URL}/docs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      loadDocuments()

    } catch (err) {
      console.error("Delete error:", err)
    }
  }

  /* ================= UPLOAD DOCUMENT ================= */

  const uploadFile = async (file: File) => {

    const token = localStorage.getItem("token")

    if (!token) {
      console.error("No token — cannot upload")
      return
    }

    const formData = new FormData()
    formData.append("file", file)
    formData.append("title", file.name)

    setUploading(true)

    try {

      /* 1️⃣ Upload file */
      const uploadRes = await fetch(`${BASE_URL}/upload_file`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      if (uploadRes.status === 401) {
        console.error("401 Unauthorized during upload")
        setUploading(false)
        return
      }

      if (!uploadRes.ok) {
        throw new Error("Upload failed")
      }

      const uploadData = await uploadRes.json()

      /* 2️⃣ Set active document */
      const setRes = await fetch(`${BASE_URL}/user/set-active-document`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId: sessionId ?? null,
          doc_id: uploadData.id
        })
      })

      if (!setRes.ok) {
        throw new Error("Failed to set active document")
      }

      const sessionData = await setRes.json()

      const finalSessionId = sessionData.session_id

      if (finalSessionId) {
        setSessionId(finalSessionId)
      }

      /* 3️⃣ Save structured output to chat */
      const structuredMessage = `📄 Document Parsed Successfully

${JSON.stringify(uploadData.structured_data, null, 2)}`

      await fetch(`${BASE_URL}/user/system-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId: finalSessionId,
          message: structuredMessage
        })
      })

      /* 4️⃣ Update UI */
      onDocumentSelect({
        id: uploadData.id,
        title: uploadData.title
      })

      await loadDocuments()

    } catch (err) {
      console.error("Upload process error:", err)
    }

    setUploading(false)

    if (fileRef.current) {
      fileRef.current.value = ""
    }
  }

  /* ================= UI ================= */

  return (
    <aside className="w-96 bg-[#171717] border-l border-gray-800 p-4 space-y-4 overflow-y-auto">

      <input
        ref={fileRef}
        type="file"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) uploadFile(file)
        }}
      />

      <button
        onClick={() => fileRef.current?.click()}
        className="w-full bg-[#2f2f2f] hover:bg-[#3a3a3a] transition p-3 rounded-lg"
      >
        {uploading ? "Uploading..." : "Upload Document"}
      </button>

      <div>
        <p className="text-sm mb-2 text-gray-400">
          Uploaded Documents
        </p>

        {documents.map((doc: any) => (
          <div
            key={doc.id}
            className="bg-[#2a2a2a] p-3 mb-2 rounded-lg flex justify-between items-center"
          >
            <span className="truncate">{doc.title}</span>

            <Trash2
              onClick={() => deleteDoc(doc.id)}
              className="size-4 text-red-500 cursor-pointer"
            />
          </div>
        ))}
      </div>

      <button
        onClick={onClose}
        className="w-full border border-gray-700 rounded-lg p-2 hover:bg-[#2a2a2a]"
      >
        Close
      </button>

    </aside>
  )
}