import {
  type CreationOptional,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../config/banco";
import { colunasBase } from "./colunas-base";

export class ItemModelo extends Model<
  InferAttributes<ItemModelo>,
  InferCreationAttributes<ItemModelo>
> {
  declare id: CreationOptional<number>;
  declare codigo: string;
  declare nome: string;
  declare categoria: string;
  declare quantidadeTotal: CreationOptional<number>;
  declare descricao: CreationOptional<string | null>;
  declare ativo: CreationOptional<boolean>;
  declare imagem: CreationOptional<string | null>;
  declare criadoEm: CreationOptional<Date>;
  declare atualizadoEm: CreationOptional<Date>;
}

ItemModelo.init(
  {
    ...colunasBase,
    codigo: { type: DataTypes.STRING(50), allowNull: false, unique: "uk_equipamentos_codigo" },
    nome: { type: DataTypes.STRING(150), allowNull: false },
    categoria: { type: DataTypes.STRING(80), allowNull: false },
    quantidadeTotal: {
      type: DataTypes.INTEGER.UNSIGNED,
      field: "quantidade_total",
      allowNull: false,
      defaultValue: 0,
    },
    descricao: { type: DataTypes.TEXT, allowNull: true },
    ativo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    imagem: { type: DataTypes.STRING(255), allowNull: true },
  },
  { sequelize, tableName: "itens", modelName: "Item" },
);
