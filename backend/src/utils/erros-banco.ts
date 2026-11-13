import { BaseError } from "sequelize";

export function codigoErroBanco(erro: unknown): string | undefined {
  if (!(erro instanceof BaseError) || !("original" in erro)) return undefined;
  const original: unknown = erro.original;
  if (typeof original !== "object" || original === null || !("code" in original)) return undefined;
  return typeof original.code === "string" ? original.code : undefined;
}
