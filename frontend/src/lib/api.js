import { auth } from './firebase';
import { notify } from './toast';

const BASE = import.meta.env.VITE_API_URL || '/api';

async function authHeader() {
  const user = auth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...(await authHeader()), ...(options.headers ?? {}) },
  });
  if (!res.ok) {
    let detail = `${res.status}`;
    try { const body = await res.json(); detail = body.detail ?? body.error ?? detail; } catch {}
    const err = new Error(detail);
    err.status = res.status;
    throw err;
  }
  return res;
}

export async function listApuntes()        { return (await request('/apuntes')).json(); }
export async function getApunte(id)         { return (await request(`/apuntes/${id}`)).json(); }
export async function searchApuntes(q)      { return (await request(`/apuntes/search?q=${encodeURIComponent(q)}`)).json(); }
export async function translateApunte(id, lang) {
  return (await request(`/apuntes/${id}/translate?lang=${lang}`)).json();
}
export async function fetchTTS(id, lang = 'es') {
  return (await request(`/apuntes/${id}/tts?lang=${lang}`)).blob();
}
export async function deleteApunte(id) {
  await request(`/apuntes/${id}`, { method: 'DELETE' });
  notify.success('Apunte eliminado');
}
export async function setVisibility(id, isPublic) {
  const r = await request(`/apuntes/${id}/visibility`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isPublic }),
  });
  notify.success(isPublic ? 'Apunte público' : 'Apunte privado');
  return r.json();
}
export async function forjar({ images = [], audios = [], texts = [], asignaturaId = null }) {
  const fd = new FormData();
  images.forEach((img) => fd.append('images', img));
  audios.forEach((a) => fd.append('audios', a));
  texts.forEach((t) => fd.append('texts', t));
  if (asignaturaId) fd.append('asignaturaId', asignaturaId);
  try {
    const r = await request('/forja', { method: 'POST', body: fd });
    return r.json();
  } catch (e) {
    notify.error(`No se pudo forjar el apunte: ${e.message}`);
    throw e;
  }
}