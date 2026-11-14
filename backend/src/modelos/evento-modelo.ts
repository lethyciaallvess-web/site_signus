import {
  type CreationOptional,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  Model,
  type NonAttribute,
} from "sequelize";
import { sequelize } from "../config/banco";
import { StatusEvento } from "../entidades/evento";
import type { ClienteModelo } from "./cliente-modelo";
import { colunasBase } from "./colunas-base";
import type { PlanoModelo } from "./plano-modelo";

export class EventoModelo extends Model<
  InferAttributes<EventoModelo>,
  InferCreationAttributes<EventoModelo>
> {
  declare id: CreationOptional<number>;
  declare clienteId: number;
  declare planoId: CreationOptional<number | null>;
  declare criadoPorUsuarioId: number;
  declare nome: string;
  declare dataInicio: Date;
  declare dataFim: Date;
  declare localEvento: string;
  declare status: CreationOptional<StatusEvento>;
  declare valorNegociado: CreationOptional<string | number | null>;
  declare observacoes: CreationOptional<string | null>;
  declare criadoEm: CreationOptional<Date>;
  declare atualizadoEm: CreationOptional<Date>;

  declare cliente?: NonAttribute<ClienteModelo>;
  declare plano?: NonAttribute<PlanoModelo | null>;
}

EventoModelo.init(
  {
    ...colunasBase,
    clienteId: { type: DataTypes.BIGINT.UNSIGNED, field: "cliente_id", allowNull: false },
    planoId: { type: DataTypes.BIGINT.UNSIGNED, field: "plano_id", allowNull: true },
    criadoPorUsuarioId: {
      type: DataTypes.BIGINT.UNSIGNED,
      field: "criado_por_usuario_id",
      allowNull: false,
    },
    nome: { type: DataTypes.STRING(180), allowNull: false },
    dataInicio: { type: DataTypes.DATE, field: "data_inicio", allowNull: false },
    dataFim: { type: DataTypes.DATE, field: "data_fim", allowNull: false },
    localEvento: { type: DataTypes.STRING(255), field: "local_evento", allowNull: false },
    status: {
      type: DataTypes.ENUM(...Object.values(StatusEvento)),
      allowNull: false,
      defaultValue: StatusEvento.ORCAMENTO,
    },
    valorNegociado: {
      type: DataTypes.DECIMAL(12, 2),
      field: "valor_negociado",
      allowNull: true,
    },
    observacoes: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    tableName: "eventos",
    modelName: "Evento",
    indexes: [
      { name: "idx_eventos_periodo", fields: ["data_inicio", "data_fim"] },
      { name: "idx_eventos_status", fields: ["status"] },
    ],
  },
);
