export const PERFIL_CLIENTE = "CLIENTE";
export const PERFIL_ADMIN = "ADMIN";
export const PERFIL_OPERADOR = "OPERADOR";

export function rotaInicial(perfil: string) {
    return perfil === PERFIL_CLIENTE ? "/cliente" : "/admin/home";
}