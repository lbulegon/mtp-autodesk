import React, { useState } from "react";

interface Vaga {
  data: string;
  horaInicio: string;
  horaFim: string;
  quantidade: number;
  observacao?: string;
}

export default function CalendarioVagas() {
  const [formData, setFormData] = useState<Vaga>({
    data: "",
    horaInicio: "",
    horaFim: "",
    quantidade: 1,
    observacao: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Vaga cadastrada:", formData);
    alert("Vaga cadastrada com sucesso!");
    setFormData({ data: "", horaInicio: "", horaFim: "", quantidade: 1, observacao: "" });
  };

  return (
    <div className="bg-white rounded shadow p-4 max-w-md">
      <h2 className="text-xl font-bold mb-4">Cadastro de Vagas</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Data da vaga</label>
          <input
            type="date"
            name="data"
            value={formData.data}
            onChange={handleChange}
            className="border rounded p-2 w-full"
            required
          />
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Hora início</label>
            <input
              type="time"
              name="horaInicio"
              value={formData.horaInicio}
              onChange={handleChange}
              className="border rounded p-2 w-full"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Hora fim</label>
            <input
              type="time"
              name="horaFim"
              value={formData.horaFim}
              onChange={handleChange}
              className="border rounded p-2 w-full"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Quantidade de vagas</label>
          <input
            type="number"
            name="quantidade"
            value={formData.quantidade}
            onChange={handleChange}
            min="1"
            className="border rounded p-2 w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Observações</label>
          <textarea
            name="observacao"
            value={formData.observacao}
            onChange={handleChange}
            className="border rounded p-2 w-full"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
        >
          Salvar
        </button>
      </form>
    </div>
  );
}
