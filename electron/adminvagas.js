// adminvagas.js
const adminVagas = (() => {
    const store = {}; // "YYYY-MM-DD" -> { M:{cap,used,label}, T:{...}, N:{...} }
    const pad2 = n => String(n).padStart(2,"0");
    const fmt = (y,m,d) => `${y}-${pad2(m)}-${pad2(d)}`;
    let Y, M;
  
    function monthLabel(y,m){
      const dt = new Date(y, m-1, 1);
      return dt.toLocaleDateString("pt-BR",{ month:"long", year:"numeric" });
    }
  
    function setMonth(y,m){
      Y=y; M=m;
      const label = document.getElementById("monthLabelAdmin");
      if (label) label.textContent = monthLabel(y,m);
      renderCalendar();
    }
  
    function shiftMonth(delta){
      let y=Y, m=M+delta;
      if (m<1){ m=12; y--; }
      if (m>12){ m=1; y++; }
      setMonth(y,m);
    }
  
    function renderCalendar(){
      const grid = document.getElementById("calGridAdmin");
      if (!grid) return;
      grid.innerHTML = "";
  
      const first = new Date(Y, M-1, 1);
      const last  = new Date(Y, M, 0);
      const start = first.getDay(); // 0..6
      const total = last.getDate();
  
      for (let i=0;i<start;i++){
        const cell = document.createElement("div");
        cell.className = "cal-day inactive";
        grid.appendChild(cell);
      }
  
      for (let d=1; d<=total; d++){
        const cell = document.createElement("div");
        cell.className = "cal-day";
        const key = fmt(Y,M,d);
  
        const num = document.createElement("div");
        num.className = "num"; num.textContent = d;
        cell.appendChild(num);
  
        const chips = document.createElement("div");
        chips.className = "chips";
        ["M","T","N"].forEach(turn=>{
          const info = store[key]?.[turn];
          if (info){
            const c = document.createElement("span");
            c.className = "chip";
            c.textContent = `${turn}:${info.used||0}/${info.cap||0}`;
            chips.appendChild(c);
          }
        });
        cell.appendChild(chips);
  
        cell.addEventListener("click", () => openEditor(key));
        grid.appendChild(cell);
      }
    }
  
    function openEditor(key){
      const box = document.getElementById("detail");
      if (!box) return;
      box.classList.remove("empty");
  
      if (!store[key]) {
        store[key] = {
          M:{ cap:6, used:3, label:"Manhã (08:00–12:00)" },
          T:{ cap:8, used:5, label:"Tarde (12:00–16:00)" },
          N:{ cap:6, used:2, label:"Noite (18:00–22:00)" },
        };
      }
      const data = store[key];
      const [y,m,d] = key.split("-");
      const titulo = new Date(+y, +m-1, +d).toLocaleDateString("pt-BR",{ weekday:"long", day:"2-digit", month:"long", year:"numeric" });
  
      box.innerHTML = `
        <div class="hdr">
          <div class="title"><strong>Vagas por turno</strong> • ${titulo}</div>
          <div class="meta">
            <span class="pill">Configurar capacidade</span>
            <span class="pill">Salvar/Aplicar</span>
          </div>
        </div>
  
        <div class="block turn-editor">
          ${rowHTML("M", data.M)}
          ${rowHTML("T", data.T)}
          ${rowHTML("N", data.N)}
          <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
            <button id="btnDupWeek" class="btn">Duplicar para semana</button>
            <button id="btnSave" class="btn-primary">Salvar</button>
          </div>
        </div>
  
        <div class="block">
          <div style="font-weight:700;margin-bottom:8px">Resumo</div>
          <div class="chips">
            <span class="chip">Manhã: ${data.M.used}/${data.M.cap}</span>
            <span class="chip">Tarde: ${data.T.used}/${data.T.cap}</span>
            <span class="chip">Noite: ${data.N.used}/${data.N.cap}</span>
          </div>
        </div>
      `;
  
      bindRow("M", key);
      bindRow("T", key);
      bindRow("N", key);
  
      document.getElementById("btnSave").addEventListener("click", () => {
        alert("Salvo (mock). Depois conectamos na API.");
        renderCalendar();
      });
  
      document.getElementById("btnDupWeek").addEventListener("click", () => {
        const start = new Date(+y, +m-1, +d);
        for (let i=1;i<=6;i++){
          const dt = new Date(start); dt.setDate(start.getDate()+i);
          const k = fmt(dt.getFullYear(), dt.getMonth()+1, dt.getDate());
          store[k] = JSON.parse(JSON.stringify(store[key]));
        }
        alert("Capacidades duplicadas para a semana (mock).");
        renderCalendar();
      });
    }
  
    function rowHTML(code,obj){
      return `
        <div class="row" data-turn="${code}">
          <div class="lbl">${obj.label || code}</div>
          <label class="has-tip" data-tip="Capacidade de vagas">
            <input type="number" min="0" step="1" value="${obj.cap}" data-field="cap">
          </label>
          <label class="has-tip" data-tip="Já ocupadas">
            <input type="number" min="0" step="1" value="${obj.used}" data-field="used">
          </label>
        </div>
      `;
    }
  
    function bindRow(code,key){
      const row = document.querySelector(`.turn-editor .row[data-turn="${code}"]`);
      const cap  = row.querySelector('input[data-field="cap"]');
      const used = row.querySelector('input[data-field="used"]');
      cap.addEventListener("input", () => store[key][code].cap  = Math.max(0, parseInt(cap.value||"0",10)));
      used.addEventListener("input", () => store[key][code].used = Math.max(0, parseInt(used.value||"0",10)));
    }
  
    function init(){
      const today = new Date();
      setMonth(today.getFullYear(), today.getMonth()+1);
      document.getElementById("prevMonthAdmin")?.addEventListener("click", ()=>shiftMonth(-1));
      document.getElementById("nextMonthAdmin")?.addEventListener("click", ()=>shiftMonth(1));
    }
  
    return { init };
  })();
  