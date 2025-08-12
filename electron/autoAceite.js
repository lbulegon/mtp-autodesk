// autoaceite.js

// ---- Config ----
const C = window.APP_CONFIG || {};
const API_BASE = (C.API_BASE_URL || "http://localhost:8000/api_v1").replace(/\/$/, "");
const TOKEN    = C.TOKEN || "";

// Endpoints (ajuste para os teus reais)
const ENDPOINTS = {
  get: "/config/auto-aceite", // GET -> { enabled: boolean }
  set: "/config/auto-aceite", // POST -> { enabled: boolean }
};

// ---- Helpers ----
async function api(path, { method = "GET", body } = {}) {
  const url = `${API_BASE}${path}`;
  const headers = { "Content-Type": "application/json" };
  if (TOKEN) headers["Authorization"] = `Bearer ${TOKEN}`;
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) {
    let text = "";
    try { text = await res.text(); } catch {}
    throw new Error(`${res.status} ${res.statusText}${text ? " - " + text : ""}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

function setBtnState(btn, enabled) {
  if (!btn) return;
  if (enabled) {
    btn.classList.remove("off");
    btn.textContent = "ON";
    btn.title = "Aceite automático ativado";
    btn.setAttribute("data-tip", "Aceite automático ativado");
  } else {
    btn.classList.add("off");
    btn.textContent = "OFF";
    btn.title = "Aceite automático desativado";
    btn.setAttribute("data-tip", "Aceite automático desativado");
  }
}

// ---- Boot ----
document.addEventListener("DOMContentLoaded", async () => {
  const btn = document.getElementById("btnAuto");
  if (!btn) return;

  // garante que o botão tenha a classe de tooltip
  if (!btn.classList.contains("has-tip")) btn.classList.add("has-tip");

  let isLoading = false;
  let enabled = false;

  // Estado inicial (GET)
  try {
    const data = await api(ENDPOINTS.get, { method: "GET" });
    enabled = !!data.enabled;
  } catch (e) {
    console.warn("Falha ao carregar estado do auto-aceite:", e.message);
    enabled = false; // fallback
  }
  setBtnState(btn, enabled);

  // Toggle (POST)
  btn.addEventListener("click", async () => {
    if (isLoading) return;
    isLoading = true;

    const prev = enabled;
    const next = !prev;

    // UI otimista
    setBtnState(btn, next);

    try {
      await api(ENDPOINTS.set, { method: "POST", body: { enabled: next } });
      enabled = next; // confirma
    } catch (e) {
      // rollback
      setBtnState(btn, prev);
      enabled = prev;
      alert("Não foi possível atualizar o Aceite automático.\n" + e.message);
    } finally {
      isLoading = false;
    }
  });
});
