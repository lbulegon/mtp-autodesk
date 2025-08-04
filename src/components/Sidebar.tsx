import { Home, Briefcase, MessageCircle, Settings } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, onChangeTab }: SidebarProps) {
  const menuItems = [
    { key: "operacoes", label: "Painel", icon: <Home size={18} /> },
    { key: "vagas", label: "Minhas Vagas", icon: <Briefcase size={18} /> },
    { key: "chat-estab", label: "Chat Estabelecimento", icon: <MessageCircle size={18} /> },
    { key: "chat-central", label: "Chat Central", icon: <MessageCircle size={18} /> },
    { key: "config", label: "Configurações", icon: <Settings size={18} /> },
  ];

  return (
    <aside className="w-64 bg-blue-900 text-white flex flex-col">
      <div className="p-4 text-2xl font-bold border-b border-blue-700">
        MotoPro
      </div>
      <nav className="flex-1 p-4">
        {menuItems.map((item) => (
          <button
            key={item.key}
            className={`w-full flex items-center gap-2 p-2 rounded mb-2 transition-colors ${
              activeTab === item.key ? "bg-blue-700" : "hover:bg-blue-800"
            }`}
            onClick={() => onChangeTab(item.key)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
