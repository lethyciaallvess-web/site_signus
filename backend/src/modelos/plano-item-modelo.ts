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

export class PlanoItemModelo extends Model<
  InferAttributes<PlanoItemModelo>,
  InferCreationAttributes<PlanoItemModelo>
> {
  declare id: CreationOptional<number>;
  declare planoId: number;
  declare itemId: CreationOptional<number | null>;
  declare quantidade: number;
  declare detalhes: CreationOptional<string>;
  declare criadoEm: CreationOptional<Date>;

  declare item?: NonAttribute<ItemModelo>;
}

PlanoItemModelo.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    planoId: {
      type: DataTypes.BIGINT.UNSIGNED,
      field: "plano_id",
      allowNull: false,
      unique: "uk_plano_item",
    },
    itemId: {
      type: DataTypes.BIGINT.UNSIGNED,
      field: "itens_id",
      allowNull: true,
      unique: "uk_plano_item",
    },
    quantidade: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    detalhes: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "",
      unique: "uk_plano_item",
    },
    criadoEm: {
      type: DataTypes.DATE,
      field: "criado_em",
      allowNull: false,
      defaultValue: literal("CURRENT_TIMESTAMP"),
    },
  },
  { sequelize, tableName: "plano_itens", modelName: "PlanoItem" },
);
