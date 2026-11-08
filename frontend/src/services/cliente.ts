import { api } from "../api/axios";
import type { StatusEvento } from "./eventos";

export type EventoCliente = {
    id: number;
    nome: string;
    dataInicio: string;
    dataFim: string;
    localEvento: string;
    status: StatusEvento;
    valor: number | null;
    plano: string | null;
};

type RespostaPainel = {
    eventos: EventoCliente[];
};

export async function buscarMeusEventos() {
    const resposta = await api.get<RespostaPainel>("/cliente/painel");
    return resposta.data.eventos;
}