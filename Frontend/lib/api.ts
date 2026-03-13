const BASE_URL = "http://192.168.1.4:8000";

export const getToken = () => {
  return localStorage.getItem("token");
};

// ================= SESSION =================

export async function getSessions() {
  const res = await fetch(`${BASE_URL}/user/sessions`, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  return res.json();
}

export async function loadChat(sessionId: string) {
  const res = await fetch(
    `${BASE_URL}/user/chathistory/${sessionId}`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    }
  );

  return res.json();
}

// ================= ASK =================

export async function askQuestion(
  question: string,
  sessionId: string,
  style = "normal"
) {

  const response = await fetch(`${BASE_URL}/user/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify({
      question,
      sessionId,
      style
    })
  });

  return response.body;
}

// ================= UPLOAD =================

export async function uploadDocument(
  file: File,
  title: string
) {

  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);

  const res = await fetch(`${BASE_URL}/upload_file`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`
    },
    body: formData
  });

  return res.json();
}