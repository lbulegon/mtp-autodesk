// ============================================
// FUNÇÃO GLOBAL: Gerar Vagas por Templates
// ============================================
async function gerarVagasPorTemplates() {
  console.log('✨ Função gerarVagasPorTemplates chamada!');
  
  const diasInput = document.getElementById("diasTemplates");
  if (!diasInput) {
    alert('❌ Campo de dias não encontrado!');
    return;
  }

  const dias = parseInt(diasInput.value) || 7;
  
  if (dias < 1 || dias > 30) {
    alert('❌ Quantidade de dias deve ser entre 1 e 30!');
    diasInput.focus();
    return;
  }

  // Confirmar ação
  const confirmar = confirm(
    `📅 Deseja gerar vagas automáticas para os próximos ${dias} dias?\n\n` +
    `As vagas serão criadas conforme os templates configurados por dia da semana.\n` +
    `(A quantidade varia conforme o dia)`
  );
  
  if (!confirmar) {
    return;
  }

  const button = document.getElementById("btnGerarVagasTemplates");
  
  try {
    // Verificar autenticação
    if (!window.authManager || !window.authManager.isAuthenticated) {
      alert('❌ Usuário não autenticado - faça login primeiro');
      return;
    }

    // Desabilitar botão durante a operação
    if (button) {
      button.disabled = true;
      button.innerHTML = '<span>⏳</span><span>Gerando Vagas...</span>';
    }

    // Preparar payload
    const payload = {
      dias: dias
    };

    console.log('📤 Enviando requisição:', payload);

    // Fazer requisição para API
    const response = await window.authManager.fetchWithAuth(
      'admin/gerar-vagas-templates/',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );

    console.log('📥 Resposta recebida:', response);

    // Verificar resposta
    if (response.success) {
      const data = response.data;
      let mensagem = `✅ ${data.vagas_criadas} vagas criadas com sucesso!\n\n`;
      
      if (data.vagas_ja_existentes > 0) {
        mensagem += `⏭️  ${data.vagas_ja_existentes} vagas já existiam.\n\n`;
      }
      
      if (data.por_estabelecimento) {
        mensagem += `📊 Por estabelecimento:\n`;
        for (const [estab, qtd] of Object.entries(data.por_estabelecimento)) {
          mensagem += `  • ${estab}: ${qtd} vaga(s)\n`;
        }
      }
      
      mensagem += `\n📅 Período: ${data.periodo}`;
      
      alert(mensagem);
      
      // Atualizar lista de vagas se estiver visível
      if (typeof adminVagas !== 'undefined' && adminVagas.init) {
        console.log('🔄 Atualizando lista de vagas...');
        // Recarregar a interface se necessário
      }
    } else {
      alert(`❌ Erro ao gerar vagas:\n${response.message || 'Erro desconhecido'}`);
    }

  } catch (error) {
    console.error('❌ Erro ao gerar vagas:', error);
    alert(`❌ Erro ao conectar com servidor:\n${error.message || 'Erro de conexão'}`);
  } finally {
    // Reabilitar botão
    if (button) {
      button.disabled = false;
      button.innerHTML = '<span>✨</span><span>Gerar Vagas Automáticas</span>';
    }
  }
}

