// sidebar.js

document.addEventListener("DOMContentLoaded", () => {
    const leftOrders = document.getElementById("left-orders");
    const leftVagas  = document.getElementById("left-vagas");
  
    // Verificar se o container de vagas existe
    if (!leftVagas) {
        console.error('❌ Container de vagas não encontrado no HTML');
        return;
    }
  
    const views = [leftOrders, leftVagas];
  
    // Função para trocar a view
    function showView(view) {
      views.forEach(v => v.classList.add("hidden"));
      view.classList.remove("hidden");
    }
  
    // Eventos dos botões
    document.getElementById("btn-orders").addEventListener("click", () => {
      showView(leftOrders);
    });
  

  
    document.getElementById("btn-vagas").addEventListener("click", async () => {
      showView(leftVagas);
      
      // Carregar vagas quando o botão for clicado
      try {
        // Verificar se o módulo de integração está disponível
        if (typeof window.renderVagasInSidebar === 'function') {
          await window.renderVagasInSidebar();
        } else {
          console.warn('⚠️ Módulo de integração de vagas não carregado');
          // Fallback para conteúdo estático
          leftVagas.innerHTML = `
            <h2 style="padding: 12px;">Gestão de Vagas</h2>
            <div style="padding: 12px; color: #6b7280;">
              <div>📋</div>
              <div>Carregando vagas...</div>
              <div style="margin-top: 10px;">
                <button class="btn btn-primary" onclick="location.reload()">Recarregar</button>
              </div>
            </div>
          `;
        }
      } catch (error) {
        console.error('❌ Erro ao carregar vagas:', error);
        leftVagas.innerHTML = `
          <h2 style="padding: 12px;">Gestão de Vagas</h2>
          <div style="padding: 12px; color: #ef4444;">
            <div>❌</div>
            <div>Erro ao carregar vagas</div>
            <div style="margin-top: 10px;">
              <button class="btn btn-outline" onclick="location.reload()">Tentar Novamente</button>
            </div>
          </div>
        `;
      }
    });
  });
  