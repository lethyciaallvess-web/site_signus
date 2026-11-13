export function decimalParaNumero(valor: unknown): number | null {
  return valor === null || valor === undefined ? null : Number(valor);
}
