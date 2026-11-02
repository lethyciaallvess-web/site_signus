import axios from "axios";
import { ApiError } from "../services/api";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "/api",
});

// antes de cada pedido: manda o token, se existir
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// quando a resposta é um erro: transforma em ApiError
api.interceptors.response.use(
    (resposta) => resposta,
    (erro) => {
        if (!axios.isAxiosError(erro) || !erro.response) {
            return Promise.reject(
                new ApiError(0, "Não foi possível conectar ao servidor.")
            );
        }

        const { status, data } = erro.response;

        if (
            status === 401 &&
            localStorage.getItem("token") &&
            erro.config?.url !== "/autenticacao/login"
        ) {
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            window.location.href = "/admin/login";
        }

        const mensagem = Array.isArray(data?.message)
            ? data.message.join(" ")
            : data?.message ?? "Erro inesperado.";

        return Promise.reject(new ApiError(status, mensagem));
    }
);