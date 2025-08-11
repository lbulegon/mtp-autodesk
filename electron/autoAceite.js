// ---- CONFIG BÁSICA ----
const C = window.APP_CONFIG || {};
const API_BASE = (C.API_BASE_URL || "http://localhost:8000/api_v1").replace(/\/$/, "");
const TOKEN = C.TOKEN || "";

// Defina aqui as rotas reais do seu backend
const ENDPOINTS = {
  get: "/config/auto-aceite", // GET -> { enabled: boolean }
  set: "/config/auto-aceite", // POST -> { enabled: boolean }
};

// ---- HELPER API ----
async function api(path, { method = "GET", body } = {}) {
  const url = `${API_BASE}${path}`;
  const headers = { "Content-Type": "application/json" };
  if (TOKEN) headers["Authorization"] = `Bearer ${TOKEN}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} ${text || ""}`.trim());
  }
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

// ---- UI STATE ----
const btnAuto = document.getElementById("btnAuto");
let isLoading = false;
let autoEnabled = false;

function applyButtonState(enabled) {
  autoEnabled = enabled;
  if (enabled) {
    btnAuto.classList.remove("off");
    btnAuto.textContent = "ON";
    btnAuto.title = "Aceite automático ativado";
  } else {
    btnAuto.classList.add("off");
    btnAuto.textContent = "OFF";
    btnAuto.title = "Aceite automático desativado";
  }
}

// ---- INIT: busca estado atual no backend ----
async function initAutoAccept() {
  try {
    const data = await api(ENDPOINTS.get, { method: "GET" });
    applyButtonState(!!data.enabled);
  } catch (e) {
    console.warn("Falha ao carregar estado do auto-aceite:", e.message);
    applyButtonState(false);
  }
}

// ---- CLICK HANDLER ----
btnAuto.addEventListener("click", async () => {
  if (isLoading) return;
  isLoading = true;

  const previous = autoEnabled;
  const next = !previous;
  applyButtonState(next);

  try {
    await api(ENDPOINTS.set, { method: "POST", body: { enabled: next } });
  } catch (e) {
    applyButtonState(previous);
    alert("Não foi possível atualizar o Aceite automático: " + e.message);
  } finally {
    isLoading = false;
  }
});

// Boot
document.addEventListener("DOMContentLoaded", initAutoAccept);
