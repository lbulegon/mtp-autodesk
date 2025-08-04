import { useState } from "react";
import Sidebar from "./components/Sidebar";
import StatusBar from "./components/StatusBar";

export default function App() {
  const [activeTab, setActiveTab] = useState("operacoes");

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Conteúdo principal */}
      <div className="flex flex-col flex-1">
        <main className="flex-1 p-6 overflow-auto">
          {activeTab === "operacoes" && (
            <div>
              <h1 className="text-3xl font-bold mb-4">Painel de Operações</h1>
              <div className="bg-white rounded shadow p-4">
                <p>Status do Turno: <span className="text-green-600">Ativo</span></p>
                <p>Rotas Ativas: 2</p>
                <p>Pedidos Pendentes: 5</p>
              </div>
            </div>
          )}

          {activeTab === "vagas" && (
            <div>
              <h1 className="text-3xl font-bold mb-4">Minhas Vagas</h1>
              <div className="bg-white rounded shadow p-4">
                <p>Você está inscrito em 3 vagas para hoje.</p>
              </div>
            </div>
          )}

          {activeTab === "chat-estab" && (
            <div>
              <h1 className="text-3xl font-bold mb-4">Chat com Estabelecimento</h1>
              <div className="bg-white rounded shadow p-4">
                <p>Mensagens aqui...</p>
              </div>
            </div>
          )}

          {activeTab === "chat-central" && (
            <div>
              <h1 className="text-3xl font-bold mb-4">Chat com Central</h1>
              <div className="bg-white rounded shadow p-4">
                <p>Mensagens aqui...</p>
              </div>
            </div>
          )}

          {activeTab === "config" && (
            <div>
              <h1 className="text-3xl font-bold mb-4">Configurações</h1>
              <div className="bg-white rounded shadow p-4">
                <p>Opções de configuração do app.</p>
              </div>
            </div>
          )}
        </main>

        {/* StatusBar */}
        <StatusBar />
      </div>
    </div>
  );
}
