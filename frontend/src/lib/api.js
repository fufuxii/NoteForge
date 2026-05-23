import { auth } from "./firebase";

const BASE = import.meta.env.VITE_API_URL || "/api";

async function authHeader() {
  const user = auth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export async function listApuntes() {
  const res = await fetch(`${BASE}/apuntes`, { headers: { ...(await authHeader()) } });
  if (!res.ok) throw new Error(`listApuntes ${res.status}`);
  return res.json();
}

export async function getApunte(id) {
  const res = await fetch(`${BASE}/apuntes/${id}`, { headers: { ...(await authHeader()) } });
  if (!res.ok) throw new Error(`getApunte ${res.status}`);
  return res.json();
}

export async function searchApuntes(q) {
  const res = await fetch(`${BASE}/apuntes/search?q=${encodeURIComponent(q)}`, {
    headers: { ...(await authHeader()) },
  });
  if (!res.ok) throw new Error(`search ${res.status}`);
  return res.json();
}

export async function forjar({ images = [], audios = [], texts = [], asignaturaId = null }) {
  const fd = new FormData();
  images.forEach((img) => fd.append("images", img));
  audios.forEach((a) => fd.append("audios", a));
  texts.forEach((t) => fd.append("texts", t));
  if (asignaturaId) fd.append("asignaturaId", asignaturaId);

  const res = await fetch(`${BASE}/forja`, {
    method: "POST",
    headers: { ...(await authHeader()) },
    body: fd,
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`forjar ${res.status}: ${detail}`);
  }
  return res.json();
}

export async function fetchTTS(id, lang = "es") {
  const res = await fetch(`${BASE}/apuntes/${id}/tts?lang=${lang}`, {
    headers: { ...(await authHeader()) },
  });
  if (!res.ok) throw new Error(`tts ${res.status}`);
  return res.blob();
}

export async function translateApunte(id, lang) {
  const res = await fetch(`${BASE}/apuntes/${id}/translate?lang=${lang}`, {
    headers: { ...(await authHeader()) },
  });
  if (!res.ok) throw new Error(`translate ${res.status}`);
  return res.json();
}

const EXPORT_EXT = { pdf: "pdf", docx: "docx", txt: "txt" };

export async function downloadApunte(id, format, lang = "es", title = "apunte") {
  const res = await fetch(`${BASE}/apuntes/${id}/export?format=${format}&lang=${lang}`, {
    headers: { ...(await authHeader()) },
  });
  if (!res.ok) throw new Error(`export ${res.status}`);

  const blob = await res.blob();
  const safe = (title || "apunte").replace(/[^\w\sáéíóúàèìòùçñ.\-]/gi, "").trim().replace(/\s+/g, "_") || "apunte";
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safe}.${EXPORT_EXT[format] || format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function deleteApunte(id) {
  const res = await fetch(`${BASE}/apuntes/${id}`, {
    method: "DELETE",
    headers: { ...(await authHeader()) },
  });
  if (!res.ok) throw new Error(`deleteApunte ${res.status}`);
}

export async function setVisibility(id, isPublic, asignatura = null) {
  const res = await fetch(`${BASE}/apuntes/${id}/visibility`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await authHeader()) },
    body: JSON.stringify({ isPublic, ...(asignatura ? { asignatura } : {}) }),
  });
  if (!res.ok) throw new Error(`setVisibility ${res.status}`);
  return res.json();
}

export async function getProfile() {
  const res = await fetch(`${BASE}/users/profile`, { headers: { ...(await authHeader()) } });
  if (!res.ok) throw new Error(`getProfile ${res.status}`);
  return res.json();
}

export async function updateProfile(data) {
  const res = await fetch(`${BASE}/users/profile`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await authHeader()) },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`updateProfile ${res.status}`);
  return res.json();
}

export async function getUniversidades() {
  const res = await fetch(`${BASE}/universidades`);
  if (!res.ok) throw new Error(`getUniversidades ${res.status}`);
  return res.json();
}

export async function getEstudios(uniId) {
  const res = await fetch(`${BASE}/universidades/${uniId}/estudios`);
  if (!res.ok) throw new Error(`getEstudios ${res.status}`);
  return res.json();
}

export async function getAllUniversidades() {
  const res = await fetch(`${BASE}/universidades`);
  if (!res.ok) throw new Error(`getAllUniversidades ${res.status}`);
  return res.json();
}

export async function getApuntesPublicos(asignatura) {
  const res = await fetch(`${BASE}/universidades/apuntes-publicos?asignatura=${encodeURIComponent(asignatura)}`);
  if (!res.ok) throw new Error(`getApuntesPublicos ${res.status}`);
  return res.json();
}

export async function getApunteStatus(id) {
  const res = await fetch(`${BASE}/apuntes/${id}`, { headers: { ...(await authHeader()) } });
  if (!res.ok) throw new Error(`getApunteStatus ${res.status}`);
  return res.json();
}

export async function saveTranslation(sourceId, lang, title, translatedData) {
  const res = await fetch(`${BASE}/apuntes/${sourceId}/translate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeader()),
    },
    body: JSON.stringify({ lang, title, structure: translatedData.structure, summary: translatedData.summary }),
  });
  if (!res.ok) throw new Error(`saveTranslation ${res.status}`);
  return res.json();
}