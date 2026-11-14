import {
  type CreationOptional,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  literal,
  Model,
  type NonAttribute,
} from "sequelize";
import { sequelize } from "../config/banco";
import type { ItemModelo } from "./item-modelo";

export class EventoItemModelo extends Model<
  InferAttributes<EventoItemModelo>,
  InferCreationAttributes<EventoItemModelo>
> {
  declare id: CreationOptional<number>;
  declare eventoId: number;
  declare itemId: CreationOptional<number | null>;
  declare quantidade: number;
  declare valorUnitario: CreationOptional<string | number | null>;
  declare detalhes: CreationOptional<string>;
  declare criadoEm: CreationOptional<Date>;

  declare item?: NonAttribute<ItemModelo>;
}

EventoItemModelo.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    eventoId: {
      type: DataTypes.BIGINT.UNSIGNED,
      field: "evento_id",
      allowNull: false,
      unique: "uk_evento_item",
    },
    itemId: {
      type: DataTypes.BIGINT.UNSIGNED,
      field: "itens_id",
      allowNull: true,
      unique: "uk_evento_item",
    },
    quantidade: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    valorUnitario: { type: DataTypes.DECIMAL(12, 2), field: "valor_unitario", allowNull: true },
    detalhes: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "",
      unique: "uk_evento_item",
    },
    criadoEm: {
      type: DataTypes.DATE,
      field: "criado_em",
      allowNull: false,
      defaultValue: literal("CURRENT_TIMESTAMP"),
    },
  },
  { sequelize, tableName: "evento_itens", modelName: "EventoItem" },
);
