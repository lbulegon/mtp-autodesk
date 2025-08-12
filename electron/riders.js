// riders.js

// ---- Config base ----
const RC = window.APP_CONFIG || {};
const R_API = (RC.API_BASE_URL || "http://localhost:8000/api_v1").replace(/\/$/, "");
const R_TOKEN = RC.TOKEN || "";

// Ajuste estes endpoints conforme o seu backend
const R_ENDPOINTS = {
  turnoAtual: "/turnos/atual",                              // GET -> { id, ... }
  ridersTurno: (turnoId) => `/entregadores?turno_id=${turnoId}&habilitados=true`, // GET -> [ ... ]
};

// ---- Helper API ----
async function rApi(path, { method = "GET", body } = {}) {
  const url = `${R_API}${path}`;
  const headers = { "Content-Type": "application/json" };
  if (R_TOKEN) headers["Authorization"] = `Bearer ${R_TOKEN}`;
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) {
    let t = "";
    try { t = await res.text(); } catch {}
    throw new Error(`${res.status} ${res.statusText}${t ? " - " + t : ""}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

// ---- Render da view de entregadores na coluna esquerda ----
async function renderRidersLeft() {
  const leftRiders = document.getElementById("left-riders");
  if (!leftRiders) return;

  leftRiders.innerHTML = `
    <div class="auto-accept" style="position:sticky;top:0;z-index:3;background:var(--card)">
      <div style="font-weight:700">Entregadores habilitados no turno</div>
      <div class="chip has-tip" data-tip="Total habilitados"><span id="riders-count">—</span></div>
    </div>

    <div class="search-row" style="position:sticky;top:56px;z-index:2;background:var(--card)">
      <div class="search">
        <span class="search-ico">🔎</span>
        <input id="riders-search" type="text" placeholder="Buscar entregador (nome/placa)"/>
      </div>
    </div>

    <!-- container com rolagem própria -->
    <section class="section section--scroll" style="display:flex;flex-direction:column;min-height:0;margin:12px;">
      <div class="section-title">Lista</div>
      <div class="list" id="riders-list"></div>
    </section>
  `;

  const listEl   = document.getElementById("riders-list");
  const countEl  = document.getElementById("riders-count");
  const searchEl = document.getElementById("riders-search");

  // 1) descobrir turno atual
  let turnoId = null;
  try {
    const t = await rApi(R_ENDPOINTS.turnoAtual, { method: "GET" });
    turnoId = t?.id ?? t?.turno_id ?? null;
  } catch (e) {
    console.warn("Falha ao obter turno atual:", e.message);
  }

  // 2) buscar entregadores habilitados
  let riders = [];
  try {
    if (turnoId != null) {
      riders = await rApi(R_ENDPOINTS.ridersTurno(turnoId), { method: "GET" });
    } else {
      throw new Error("Sem turno atual");
    }
  } catch (e) {
    console.warn("Falha ao buscar entregadores do turno, usando mock:", e.message);
    riders = [
      { id: 11, nome: "Carlos Almeida", placa: "IXY-4312", online: true,  entregas_hoje: 8, nivel: "A" },
      { id: 22, nome: "Jéssica Costa",  placa: "POQ-9090", online: true,  entregas_hoje: 5, nivel: "B" },
      { id: 33, nome: "Rafael Lima",    placa: "MTP-2025", online: false, entregas_hoje: 0, nivel: "C" },
    ];
  }

  // normaliza resultados (caso venham em {results:[]})
  if (riders?.results) riders = riders.results;

  // 3) render + filtro
  const renderList = (data) => {
    countEl.textContent = data.length;
    if (!data.length) {
      listEl.innerHTML = `<div style="color:var(--muted)">Nenhum entregador habilitado para este turno.</div>`;
      return;
    }
    listEl.innerHTML = data.map(r => `
      <div class="rider-card" data-rider="${r.id}" title="Abrir no painel web">
        <div>
          <div class="rider-id">${r.nome || r.name || "—"} <span class="rider-meta">• ${(r.placa || r.moto_placa || "—")}</span></div>
          <div class="rider-meta">Nível ${r.nivel || "—"} • Entregas hoje: ${r.entregas_hoje ?? r.entregasHoje ?? 0}</div>
        </div>
        <div class="${r.online ? "badge-online" : "badge-offline"}">${r.online ? "Online" : "Offline"}</div>
      </div>
    `).join("");

    // clique: abre perfil no front (se tiver FRONT_BASE_URL)
    const front = (RC.FRONT_BASE_URL || "").replace(/\/$/, "");
    if (front) {
      listEl.querySelectorAll("[data-rider]").forEach(card => {
        card.addEventListener("click", () => {
          const id = card.getAttribute("data-rider");
          // Em Electron, abra no navegador padrão:
          try {
            // Se seu projeto já usa Electron e expôs 'shell' via preload, chame aqui.
            // Caso contrário, abra em uma nova aba (em app web):
            window.open(`${front}/entregadores/${id}`, "_blank");
          } catch {
            window.open(`${front}/entregadores/${id}`, "_blank");
          }
        });
      });
    }
  };

  renderList(riders);

  // filtro client-side (nome/placa)
  searchEl.addEventListener("input", () => {
    const q = (searchEl.value || "").toLowerCase();
    const filtered = riders.filter(r =>
      String(r.id).includes(q) ||
      (r.nome || r.name || "").toLowerCase().includes(q) ||
      (r.placa || r.moto_placa || "").toLowerCase().includes(q)
    );
    renderList(filtered);
  });
}

// ---- Alternância de views (Pedidos ↔ Entregadores) ----
document.addEventListener("DOMContentLoaded", () => {
  const btnOrders = document.getElementById("btn-orders");
  const btnRiders = document.getElementById("btn-riders");
  const viewOrders = document.getElementById("left-orders");
  const viewRiders = document.getElementById("left-riders");

  if (!btnOrders || !btnRiders || !viewOrders || !viewRiders) return;

  const setActiveSidebar = (activeBtn) => {
    document.querySelectorAll(".sidebar .side-icon").forEach(b => b.classList.remove("active"));
    activeBtn.classList.add("active");
  };

  btnRiders.addEventListener("click", async () => {
    setActiveSidebar(btnRiders);
    viewOrders.classList.add("hidden");
    viewRiders.classList.remove("hidden");
    await renderRidersLeft();
  });

  btnOrders.addEventListener("click", () => {
    setActiveSidebar(btnOrders);
    viewRiders.classList.add("hidden");
    viewOrders.classList.remove("hidden");
    // (se precisar reexecutar algo específico da view de pedidos, faça aqui)
  });
});
