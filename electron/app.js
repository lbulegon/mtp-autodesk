// electron/app.js
// Requer: main.ts com { nodeIntegration: true, contextIsolation: false }
const { shell } = require("electron");

// -------- Config --------
const C = window.APP_CONFIG || {};
const API = {
  base: (C.API_BASE_URL || "http://localhost:8000/api_v1").replace(/\/$/, ""),
  token: C.TOKEN || "",
  front: (C.FRONT_BASE_URL || "http://localhost:3000").replace(/\/$/, ""),
};



const ENDPOINTS = {
    vagas_list:          "/vagas",                 // GET
    vaga_start:          (id) => `/vagas/${id}/iniciar`,   // POST
    vaga_close:          (id) => `/vagas/${id}/encerrar`,  // POST
    vaga_set_capacity:   (id) => `/vagas/${id}/capacidade`,// POST {max_aloc}
    vaga_allocate:       (id) => `/vagas/${id}/alocar`,    // POST {motoboy_id}
    vaga_deallocate:     (id) => `/vagas/${id}/desalocar`, // POST {motoboy_id}
    riders_list:         "/entregadores",                 // GET  (para alocar)
  };


// -------- Helpers básicos --------
const el = (sel) => document.querySelector(sel);
const fmtPrice = (n) => `R$ ${Number(n || 0).toFixed(2)}`;

async function api(path, { method = "GET", body } = {}) {
  const url = `${API.base}${path}`;
  const headers = { "Content-Type": "application/json" };
  if (API.token) headers["Authorization"] = `Bearer ${API.token}`;
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const text = await res.text();
  try { return text ? JSON.parse(text) : {}; } catch { return text; }
}

// -------- Estado global --------
let ORDERS = [];
let state = {
  query: "",
  selectedId: null,
  view: "orders", // "orders" | "riders" | "vagas"
};

// ====== ORDERS (Pedidos) ======
async function loadOrders() {
  try {
    // Ajuste a rota conforme teu backend (ex.: "/pedidos/abertos")
    const data = await api("/orders/abertos");
    return (data.results || data || []).map((o) => ({
      id: String(o.id ?? o.codigo ?? o.numero),
      title: o.cliente_abreviado || o.cliente_nome || "Cliente",
      status: o.status || "preparo", // preparo | entrega | concluido
      mustDeliverUntil: o.entregar_ate || null,
      customerName: o.cliente_nome || o.cliente || "Cliente",
      address: o.endereco || "",
      city: o.cidade_uf || "",
      zip: o.cep || "",
      channel: o.canal || "App",
      createdAt: o.criado_em_hora || o.criado_em || "",
      eta: o.eta || null,
      items: (o.itens || []).map((i) => ({ name: i.nome, qty: i.qtd })),
      price: Number(o.total || o.preco || 0),
      ownDelivery: !!o.entrega_propria,
      vaga_id: o.vaga_id || null,
      vaga_url: o.vaga_url || null,
    }));
  } catch (e) {
    console.warn("Falha ao buscar pedidos, usando mock:", e.message);
    return [
      {
        id: "3421",
        title: "Vanessa R.",
        status: "preparo",
        mustDeliverUntil: "20:50",
        customerName: "Vanessa Ribeiro",
        address: "Rua Luiz de Camões, 864 - Partenon",
        city: "Porto Alegre - RS",
        zip: "90620150",
        channel: "iFood",
        createdAt: "19:50",
        eta: "20:50",
        items: [{ name: "Hambúrguer vegano feijão azuque", qty: 1 }],
        price: 20.0,
        ownDelivery: true,
        vaga_id: 101,
      },
      {
        id: "5220",
        title: "Douglas P.",
        status: "entrega",
        customerName: "Douglas Pires",
        address: "Rua da Praia, 99",
        city: "Porto Alegre - RS",
        zip: "90010000",
        channel: "iFood",
        createdAt: "19:05",
        eta: "20:00",
        items: [{ name: "Xis Coração", qty: 2 }],
        price: 65.0,
      },
    ];
  }
}

function filteredOrders(status) {
  const q = state.query.trim().toLowerCase();
  return ORDERS.filter((o) => {
    const statusOk = o.status === status;
    if (!q) return statusOk;
    const matches =
      String(o.id).includes(q) ||
      (o.title || "").toLowerCase().includes(q) ||
      (o.customerName || "").toLowerCase().includes(q);
    return statusOk && matches;
  });
}

function renderLists() {
  const sections = [
    ["preparo", "#list-preparo", "#count-preparo"],
    ["entrega", "#list-entrega", "#count-entrega"],
    ["concluido", "#list-concluido", "#count-concluido"],
  ];

  sections.forEach(([status, contSel, countSel]) => {
    const list = filteredOrders(status);
    el(countSel).textContent = list.length;

    el(contSel).innerHTML =
      list
        .map((o) => {
          const badge =
            status === "preparo"
              ? "badge-status badge-preparo"
              : status === "entrega"
              ? "badge-status badge-entrega"
              : "badge-status";
          const until = o.mustDeliverUntil
            ? `<div class="until">Entregar até <b>${o.mustDeliverUntil}</b></div>`
            : "";
          return `
          <button class="card" data-id="${o.id}">
            <div class="row-top">
              <div class="order-id">#${o.id} <span class="order-name">${o.title || ""}</span></div>
              ${until}
            </div>
            <div class="${badge}">
              <span class="dot"></span>
              <span>${
                status === "preparo" ? "Em preparo" : status === "entrega" ? "Em entrega" : "Concluído"
              }</span>
            </div>
            <div><button class="btn btn-outline" data-despachar="${o.id}">Despachar pedido</button></div>
          </button>`;
        })
        .join("") || `<div style="color:#6b7280;font-size:12px">Nenhum pedido</div>`;

    // binds
    document.querySelectorAll(`${contSel} .card`).forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        if (ev.target?.dataset?.despachar) return; // não selecionar ao clicar no botão
        state.selectedId = btn.getAttribute("data-id");
        renderDetail();
      });
    });

    document.querySelectorAll(`${contSel} [data-despachar]`).forEach((b) => {
      b.addEventListener("click", async (ev) => {
        ev.stopPropagation();
        const id = b.getAttribute("data-despachar");
        await dispatchOrder(id);
      });
    });
  });
}

function renderDetail() {
  if (state.view !== "orders") return; // outra view cuida do painel
  const box = el("#detail");
  const o = ORDERS.find((x) => x.id === state.selectedId);
  if (!o) {
    box.className = "detail empty";
    box.innerHTML = "<div>Selecione um pedido na lista</div>";
    return;
  }
  box.className = "detail";
  box.innerHTML = `
    <div class="hdr">
      <div class="title"><span style="font-size:20px;font-weight:800">${o.id}</span> <span style="color:#6b7280">${o.customerName || ""}</span></div>
      <div class="meta">
        <div>Feito às <b>${o.createdAt || ""}</b></div>
        <div><u>Localizador</u> —</div>
        <div>via <b>${o.channel}</b></div>
      </div>
    </div>

    <div style="padding:12px 16px;">
      <span class="pill">⏳ ${o.status === "preparo" ? "Pedido em preparo" : "Status: " + o.status}
        <span style="color:#6b7280;margin-left:8px"></span>
      </span>
    </div>

    <div class="block">
      <div class="addr">📍 <div>${o.address} – ${o.city} • ${o.zip}</div></div>
      <div class="chips">
        <div class="chip">🕒 Entrega prevista: <b style="margin-left:6px">${o.eta || "–"}</b></div>
        <div class="chip">🧾 ${o.items?.length || 0} item(ns)</div>
        ${o.ownDelivery ? `<div class="chip">🛵 Entrega própria</div>` : ""}
      </div>
    </div>

    <div class="block items">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div style="font-weight:600">Itens no pedido</div>
        <button class="btn-soft danger">🏷️ Substituir itens</button>
      </div>
      ${(o.items || [])
        .map(
          (it) => `
        <div class="item">
          <div style="display:flex;gap:12px;align-items:center">
            <div class="thumb"></div>
            <div>
              <div style="font-weight:600">${it.name}</div>
              <div style="color:#6b7280;font-size:12px">Quantidade: ${it.qty}</div>
            </div>
          </div>
          <div class="price">${fmtPrice(o.price)}</div>
        </div>`
        )
        .join("")}
    </div>

    <div class="footer-actions">
      <button class="btn-danger" id="cancelBtn">Cancelar pedido</button>
      <div style="display:flex;align-items:center;gap:8px;margin-left:auto">
        <div style="color:#6b7280">Total</div>
        <div class="price">${fmtPrice(o.price)}</div>
        <button class="btn-primary" id="sendBtn">Enviar pedido</button>
        ${
          o.vaga_url || o.vaga_id
            ? `<button class="btn btn-outline" id="vagaBtn">Abrir vaga</button>`
            : ""
        }
        <button class="btn btn-outline">⋁</button>
      </div>
    </div>
  `;

  el("#sendBtn").addEventListener("click", async () => await sendOrder(o.id));
  el("#cancelBtn").addEventListener("click", async () => await cancelOrder(o.id));
  const vagaBtn = el("#vagaBtn");
  if (vagaBtn) vagaBtn.addEventListener("click", () => openVaga(o));
}

// Ações de pedido
async function refreshOrders() {
  ORDERS = await loadOrders();
  renderLists();
  if (!state.selectedId && ORDERS[0]) state.selectedId = ORDERS[0].id;
  renderDetail();
}
async function sendOrder(id) {
  try { await api(`/orders/${id}/enviar`, { method: "POST" }); await refreshOrders(); alert(`Pedido #${id} enviado.`); }
  catch (e) { alert(`Falha ao enviar pedido #${id}: ${e.message}`); }
}
async function dispatchOrder(id) {
  try { await api(`/orders/${id}/dispatch`, { method: "POST" }); await refreshOrders(); alert(`Pedido #${id} despachado.`); }
  catch (e) { alert(`Falha ao despachar pedido #${id}: ${e.message}`); }
}
async function cancelOrder(id) {
  try { await api(`/orders/${id}/cancelar`, { method: "POST" }); await refreshOrders(); alert(`Pedido #${id} cancelado.`); }
  catch (e) { alert(`Falha ao cancelar pedido #${id}: ${e.message}`); }
}
function openVaga(order) {
  const url = order.vaga_url || `${API.front}/minhas-vagas/${order.vaga_id}`;
  shell.openExternal(url);
}

// ====== RIDERS (Entregadores) ======
async function loadRiders() {
  try {
    // Ajuste a rota real: ex. "/entregadores" ou "/riders/online"
    const data = await api("/entregadores");
    return (data.results || data || []).map((r) => ({
      id: r.id,
      nome: r.nome,
      placa: r.placa || r.moto_placa,
      online: !!r.online,
      entregasHoje: r.entregas_hoje ?? 0,
      nivel: r.nivel || "—",
    }));
  } catch (e) {
    console.warn("Falha ao buscar entregadores, usando mock:", e.message);
    return [
      { id: 11, nome: "Carlos Almeida", placa: "IXY-4312", online: true,  entregasHoje: 8,  nivel: "A" },
      { id: 22, nome: "Jéssica Costa",  placa: "POQ-9090", online: true,  entregasHoje: 5,  nivel: "B" },
      { id: 33, nome: "Rafael Lima",    placa: "MTP-2025", online: false, entregasHoje: 0,  nivel: "C" },
    ];
  }
}

async function renderRiders() {
  const box = el("#detail");
  box.className = "detail";
  box.innerHTML = `
    <div class="hdr"><div class="title" style="font-size:18px;font-weight:800">Entregadores</div></div>
    <div style="padding:12px 16px" id="ridersWrap"></div>
  `;
  const riders = await loadRiders();
  const wrap = el("#ridersWrap");
  if (!riders.length) { wrap.innerHTML = `<div style="color:#6b7280">Nenhum entregador encontrado.</div>`; return; }

  wrap.innerHTML = riders.map(r => `
    <div class="rider-card" data-rider="${r.id}">
      <div>
        <div class="rider-id">${r.nome} <span class="rider-meta">• ${r.placa || "—"}</span></div>
        <div class="rider-meta">Nível ${r.nivel} • Entregas hoje: ${r.entregasHoje}</div>
      </div>
      <div class="${r.online ? "badge-online" : "badge-offline"}">${r.online ? "Online" : "Offline"}</div>
    </div>
  `).join("");

  wrap.querySelectorAll("[data-rider]").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.getAttribute("data-rider");
      shell.openExternal(`${API.front}/entregadores/${id}`);
    });
  });
}

// ====== VAGAS (Gestão de Vagas) ======
async function loadVagas() {
    try {
      const data = await api(ENDPOINTS.vagas_list);
      return (data.results || data || []).map((v) => ({
        id: v.id,
        estabelecimento: v.estabelecimento_nome || v.estabelecimento || "—",
        inicio: v.hora_inicio || v.inicio || v.start,
        fim: v.hora_fim || v.fim || v.end,
        status: v.status || "aberta", // aberta | em_andamento | encerrada
        candidaturas: v.candidaturas ?? v.candidates ?? 0,
        alocados: v.alocados ?? 0,
        maxAloc: v.max_aloc || v.limite || null,
        turno: v.turno || "—",
      }));
    } catch (e) {
      console.warn("Falha ao buscar vagas, usando mock:", e.message);
      return [
        { id: 501, estabelecimento: "Mister X CB", inicio: "18:00", fim: "22:00", status: "aberta",     candidaturas: 3, alocados: 2, maxAloc: 4, turno: "Noite" },
        { id: 502, estabelecimento: "Mister X Centro", inicio: "12:00", fim: "16:00", status: "em_andamento", candidaturas: 5, alocados: 5, maxAloc: 5, turno: "Almoço" },
        { id: 503, estabelecimento: "Mister X Zona Sul", inicio: "10:00", fim: "14:00", status: "encerrada",  candidaturas: 1, alocados: 1, maxAloc: 1, turno: "Manhã" },
      ];
    }
  }


  async function vagaStart(id) {
    await api(ENDPOINTS.vaga_start(id), { method: "POST" });
    await renderVagas(); alert(`Vaga #${id} iniciada.`);
  }
  async function vagaClose(id) {
    await api(ENDPOINTS.vaga_close(id), { method: "POST" });
    await renderVagas(); alert(`Vaga #${id} encerrada.`);
  }
  async function vagaSetCapacity(id) {
    const val = prompt("Nova capacidade máxima (número inteiro):");
    if (!val) return;
    const max = parseInt(val, 10);
    if (Number.isNaN(max) || max < 0) { alert("Valor inválido."); return; }
    await api(ENDPOINTS.vaga_set_capacity(id), { method: "POST", body: { max_aloc: max } });
    await renderVagas(); alert(`Capacidade da vaga #${id} atualizada para ${max}.`);
  }
  async function vagaAllocate(id) {
    // Se quiser uma lista para escolher, podemos carregar do endpoint de entregadores:
    const riders = await api(ENDPOINTS.riders_list).catch(() => []);
    const hint = riders?.results?.length ? `IDs disponíveis: ${riders.results.map(r=>r.id).join(", ")}` : "Informe o ID do motoboy";
    const motoboyId = prompt(`${hint}\nID do motoboy para alocar:`);
    if (!motoboyId) return;
    await api(ENDPOINTS.vaga_allocate(id), { method: "POST", body: { motoboy_id: motoboyId } });
    await renderVagas(); alert(`Motoboy ${motoboyId} alocado na vaga #${id}.`);
  }
  async function vagaDeallocate(id) {
    const motoboyId = prompt("ID do motoboy para remover da vaga:");
    if (!motoboyId) return;
    await api(ENDPOINTS.vaga_deallocate(id), { method: "POST", body: { motoboy_id: motoboyId } });
    await renderVagas(); alert(`Motoboy ${motoboyId} removido da vaga #${id}.`);
  }
  



  
  function badgeVaga(status) {
    if (status === "aberta")    return `<span class="badge-online">Aberta</span>`;
    if (status === "encerrada") return `<span class="badge-offline">Encerrada</span>`;
    return `<span class="chip">Em andamento</span>`;
  }
  
  async function renderVagas() {
    const box = el("#detail");
    box.className = "detail";
    box.innerHTML = `
      <div class="hdr"><div class="title" style="font-size:18px;font-weight:800">Gestão de Vagas</div></div>
      <div style="padding:12px 16px" id="vagasWrap"></div>
    `;
    const vagas = await loadVagas();
    const wrap = el("#vagasWrap");
    if (!vagas.length) { wrap.innerHTML = `<div style="color:#6b7280">Nenhuma vaga encontrada.</div>`; return; }
  
    wrap.innerHTML = vagas.map(v => `
      <div class="card" data-vaga="${v.id}" style="display:flex;justify-content:space-between;align-items:center;gap:12px">
        <div>
          <div class="order-id">#${v.id} <span class="order-name">${v.estabelecimento}</span></div>
          <div class="rider-meta">Turno: ${v.turno} • ${v.inicio}–${v.fim}</div>
          <div class="rider-meta">Candidaturas: ${v.candidaturas} • Alocados: ${v.alocados}${v.maxAloc ? "/" + v.maxAloc : ""}</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          ${badgeVaga(v.status)}
          <button class="btn btn-outline" data-abrir-vaga="${v.id}">Abrir no painel</button>
          <button class="btn-primary" data-iniciar="${v.id}">Iniciar</button>
          <button class="btn btn-outline" data-encerrar="${v.id}">Encerrar</button>
          <button class="btn btn-outline" data-capacidade="${v.id}">Capacidade</button>
          <button class="btn btn-outline" data-alocar="${v.id}">Alocar</button>
          <button class="btn btn-outline" data-desalocar="${v.id}">Desalocar</button>
        </div>
      </div>
    `).join("");
  
    // binds
    wrap.querySelectorAll("[data-abrir-vaga]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-abrir-vaga");
        shell.openExternal(`${API.front}/gestao/vagas/${id}`);
      });
    });
    wrap.querySelectorAll("[data-iniciar]").forEach(btn => btn.addEventListener("click", () => vagaStart(btn.dataset.iniciar)));
    wrap.querySelectorAll("[data-encerrar]").forEach(btn => btn.addEventListener("click", () => vagaClose(btn.dataset.encerrar)));
    wrap.querySelectorAll("[data-capacidade]").forEach(btn => btn.addEventListener("click", () => vagaSetCapacity(btn.dataset.capacidade)));
    wrap.querySelectorAll("[data-alocar]").forEach(btn => btn.addEventListener("click", () => vagaAllocate(btn.dataset.alocar)));
    wrap.querySelectorAll("[data-desalocar]").forEach(btn => btn.addEventListener("click", () => vagaDeallocate(btn.dataset.desalocar)));
  }
  

// -------- Navegação (sidebar) --------
function setActiveSidebar(activeId){
  document.querySelectorAll(".sidebar .side-icon").forEach(b => b.classList.remove("active"));
  const btn = document.getElementById(activeId);
  if (btn) btn.classList.add("active");
}

function bindSidebar() {
  el("#btn-orders").addEventListener("click", () => {
    setActiveSidebar("btn-orders");
    state.view = "orders";
    renderDetail();
  });

  el("#btn-riders").addEventListener("click", async () => {
    setActiveSidebar("btn-riders");
    state.view = "riders";
    await renderRiders();
  });

  el("#btn-vagas").addEventListener("click", async () => {
    setActiveSidebar("btn-vagas");
    state.view = "vagas";
    await renderVagas();
  });

  // extras (se quiser usar futuramente)
  const deliveries = el("#btn-deliveries");
  if (deliveries) deliveries.addEventListener("click", () => alert("Tela de Entregas em construção."));
  const devices = el("#btn-devices");
  if (devices) devices.addEventListener("click", () => alert("Tela de Dispositivos em construção."));
  const settings = el("#btn-settings");
  if (settings) settings.addEventListener("click", () => alert("Configurações em construção."));
}

// -------- Busca da coluna esquerda --------
function bindSearch() {
  el("#search").addEventListener("input", (e) => {
    state.query = e.target.value || "";
    renderLists();
  });
}

// -------- Boot --------
document.addEventListener("DOMContentLoaded", async () => {
  bindSidebar();
  bindSearch();
  await refreshOrders(); // começa em "orders"
});
