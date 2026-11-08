export type Pagina<T> = {
    dados: T[];
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
};