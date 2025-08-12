// sidebar.js

document.addEventListener("DOMContentLoaded", () => {
    const leftOrders = document.getElementById("left-orders");
    const leftRiders = document.getElementById("left-riders");
    const leftVagas  = document.createElement("div");
    leftVagas.id = "left-vagas";
    leftVagas.classList.add("left-view", "hidden");
  
    // Conteúdo de exemplo para vagas
    leftVagas.innerHTML = `
      <h2 style="padding: 12px;">Gestão de Vagas</h2>
      <ul style="padding: 12px; list-style:none; margin:0;">
        <li>Vaga 1 - 14h às 18h</li>
        <li>Vaga 2 - 18h às 22h</li>
      </ul>
    `;
  
    // adiciona o container de vagas na coluna esquerda
    document.querySelector(".left").appendChild(leftVagas);
  
    const views = [leftOrders, leftRiders, leftVagas];
  
    // Função para trocar a view
    function showView(view) {
      views.forEach(v => v.classList.add("hidden"));
      view.classList.remove("hidden");
    }
  
    // Eventos dos botões
    document.getElementById("btn-orders").addEventListener("click", () => {
      showView(leftOrders);
    });
  
    document.getElementById("btn-riders").addEventListener("click", () => {
      leftRiders.innerHTML = `
        <h2 style="padding: 12px;">Entregadores do turno</h2>
        <ul style="padding: 12px; list-style:none; margin:0;">
          <li>João Silva - Moto ABC-1234</li>
          <li>Maria Souza - Moto XYZ-5678</li>
          <li>Carlos Lima - Moto DEF-9012</li>
        </ul>
      `;
      showView(leftRiders);
    });
  
    document.getElementById("btn-vagas").addEventListener("click", () => {
      showView(leftVagas);
    });
  });
  