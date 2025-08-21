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
      
      // Adicionar evento para o botão Gerar Vagas Fixas com debug
      const btnGerarVagas = document.getElementById("btnGerarVagasFixas");
      console.log('🔍 Debug - Botão Gerar Vagas encontrado:', btnGerarVagas);
      
      if (btnGerarVagas) {
        btnGerarVagas.addEventListener("click", () => {
          console.log('🔍 Debug - Botão Gerar Vagas clicado!');
          handleGerarVagasFixas();
        });
        console.log('✅ Event listener adicionado ao botão Gerar Vagas');
      } else {
        console.error('❌ Botão btnGerarVagasFixas não encontrado!');
      }
      
      // Definir data atual como padrão
      setDefaultDate();
    }

    // Função para definir a data atual como padrão
    function setDefaultDate() {
      const dataInicioInput = document.getElementById("dataInicioVagas");
      if (dataInicioInput) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        dataInicioInput.value = `${year}-${month}-${day}`;
      }
    }

    // Função para lidar com o botão Gerar Vagas Fixas
    async function handleGerarVagasFixas() {
      console.log('🚀 Debug - Função handleGerarVagasFixas iniciada!');
      
      const button = document.getElementById("btnGerarVagasFixas");
      const dataInicioInput = document.getElementById("dataInicioVagas");
      
      console.log('🔍 Debug - Elementos encontrados:', {
        button: !!button,
        dataInput: !!dataInicioInput
      });
      
      if (!button || !dataInicioInput) {
        console.error('❌ Elementos não encontrados - abortando');
        return;
      }

      try {
        // Desabilitar botão durante a operação
        button.disabled = true;
        button.innerHTML = '<span>⏳</span><span>Processando...</span>';

        // Verificar se está autenticado
        if (!window.authManager || !window.authManager.isAuthenticated) {
          alert('❌ Usuário não autenticado - faça login primeiro');
          return;
        }

        // Obter valores dos campos
        const dataInicio = dataInicioInput.value;
        const quantidadeDias = 1; // Valor fixo sempre 1

        // Validar data de início
        if (!dataInicio) {
          alert('❌ Data é obrigatória');
          dataInicioInput.focus();
          return;
        }

        // Validar formato da data (deve estar no formato YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(dataInicio)) {
          alert('❌ Formato de data inválido. Use o seletor de data.');
          dataInicioInput.focus();
          return;
        }

        // Verificar se a data não é muito antiga
        const selectedDate = new Date(dataInicio);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Zerar horas para comparação apenas de data
        
        if (selectedDate < today) {
          if (!confirm('⚠️ A data selecionada é anterior a hoje. Deseja continuar mesmo assim?')) {
            return;
          }
        }

        // Obter configuração do estabelecimento
        const estabelecimentoConfig = await window.api.getEstabelecimentoConfig();
        const estabelecimentoId = estabelecimentoConfig.estabelecimento_id;

        // Confirmar ação
        if (!confirm(`📋 Confirmar geração de vagas fixas?\n\n📅 Data: ${dataInicio}\n🏢 Estabelecimento ID: ${estabelecimentoId}\n\nEsta ação irá gerar vagas fixas para o dia selecionado.`)) {
          return;
        }

        // Preparar payload - garantir que a data está no formato correto
        const payload = {
          estabelecimento_id: parseInt(estabelecimentoId),
          data_inicio: dataInicio, // Já está no formato YYYY-MM-DD do input type="date"
          dias: quantidadeDias
        };

        console.log('📋 Gerando vagas fixas com payload:', payload);
        console.log('📅 Data enviada:', dataInicio, '| Tipo:', typeof dataInicio);

        // Chamar o endpoint
        const response = await window.authManager.authenticatedRequest('/motoboy-vaga/gerar-vagas-fixas/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Vagas fixas geradas com sucesso:', result);
          
          // Processar resultado para mostrar informações detalhadas
          let totalVagas = 0;
          let temVagas = false;
          
          // Determinar quantas vagas foram criadas
          if (result.vagas_criadas && Array.isArray(result.vagas_criadas)) {
            totalVagas = result.vagas_criadas.length;
            temVagas = totalVagas > 0;
          } else if (result.total_vagas_criadas !== undefined) {
            totalVagas = result.total_vagas_criadas;
            temVagas = totalVagas > 0;
          }
          
          let mensagem;
          
          if (temVagas) {
            // Mensagem de sucesso com vagas criadas
            mensagem = `🎉 Vagas fixas geradas com sucesso!\n\n📅 Data: ${dataInicio}\n🏢 Estabelecimento: ${estabelecimentoId}\n\n`;
            mensagem += `📋 Total de vagas criadas: ${totalVagas}\n\n`;
            
            // Mostrar detalhes das vagas se disponível
            if (result.vagas_criadas && Array.isArray(result.vagas_criadas) && result.vagas_criadas.length > 0) {
              mensagem += `📝 Vagas criadas:\n`;
              result.vagas_criadas.forEach((vaga, index) => {
                const vagaInfo = `  ${index + 1}. ID: ${vaga.id || 'N/A'} | Status: ${vaga.status || 'N/A'} | Tipo: ${vaga.tipo_vaga || 'N/A'}`;
                mensagem += `${vagaInfo}\n`;
              });
            }
          } else {
            // Mensagem quando não há vagas criadas
            mensagem = `⚠️ Nenhuma vaga foi criada!\n\n📅 Data: ${dataInicio}\n🏢 Estabelecimento: ${estabelecimentoId}\n\n`;
            mensagem += `❓ Possíveis motivos:\n`;
            mensagem += `• Vagas já existem para esta data\n`;
            mensagem += `• Estabelecimento não configurado\n`;
            mensagem += `• Data inválida ou fora do período permitido\n`;
            mensagem += `• Problemas na configuração do sistema\n\n`;
            
            if (result.message) {
              mensagem += `📋 Mensagem do sistema: ${result.message}\n`;
            }
          }
          
          // Adicionar informações adicionais se disponíveis
          if (result.detalhes) {
            mensagem += `\n📄 Detalhes: ${result.detalhes}\n`;
          }
          
          // Se não houver informações específicas, mostrar o resultado completo
          if (!result.vagas_criadas && result.total_vagas_criadas === undefined && !result.message) {
            mensagem += `\n📄 Resposta da API:\n${JSON.stringify(result, null, 2)}`;
          }
          
          alert(mensagem);
          
          // Limpar campo após sucesso e definir nova data padrão
          setDefaultDate();
          
          // Recarregar vagas na sidebar se estiver na view de vagas
          if (typeof window.renderVagasInSidebar === 'function') {
            try {
              await window.renderVagasInSidebar();
            } catch (error) {
              console.warn('⚠️ Erro ao recarregar vagas:', error);
            }
          }
        } else {
          const errorText = await response.text();
          console.error('❌ Erro ao gerar vagas fixas:', errorText);
          alert(`❌ Erro ao gerar vagas fixas:\n\n${errorText}`);
        }

      } catch (error) {
        console.error('❌ Erro ao gerar vagas fixas:', error);
        alert(`❌ Erro: ${error.message}`);
      } finally {
        // Restaurar botão
        if (button) {
          button.disabled = false;
          button.innerHTML = '<span>🚀</span><span>Gerar Vagas para o Dia</span>';
        }
      }
    }
   
    return { init };
  })();