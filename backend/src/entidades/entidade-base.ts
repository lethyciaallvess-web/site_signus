export interface EstadoBase {
  id: number;
  criadoEm: Date;
  atualizadoEm: Date;
}

export abstract class EntidadeBase {
  readonly id!: number;

  readonly criadoEm!: Date;

  readonly atualizadoEm!: Date;

  protected restaurarBase(estado: EstadoBase): void {
    Object.assign(this, {
      id: estado.id,
      criadoEm: estado.criadoEm,
      atualizadoEm: estado.atualizadoEm,
    });
  }
}
