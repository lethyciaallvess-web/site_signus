import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export abstract class EntidadeBase {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  readonly id!: number;

  @CreateDateColumn({ name: "criado_em", type: "timestamp" })
  readonly criadoEm!: Date;

  @UpdateDateColumn({ name: "atualizado_em", type: "timestamp" })
  readonly atualizadoEm!: Date;
}