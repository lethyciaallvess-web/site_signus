import {
  type CreationOptional,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../config/banco";
import { colunasBase } from "./colunas-base";

export class PlanoModelo extends Model<
  InferAttributes<PlanoModelo>,
  InferCreationAttributes<PlanoModelo>
> {
  declare id: CreationOptional<number>;
  declare nome: string;
  declare descricao: CreationOptional<string | null>;
  declare valorBase: CreationOptional<string | number | null>;
  declare ativo: CreationOptional<boolean>;
  declare criadoEm: CreationOptional<Date>;
  declare atualizadoEm: CreationOptional<Date>;
}

PlanoModelo.init(
  {
    ...colunasBase,
    nome: { type: DataTypes.STRING(80), allowNull: false, unique: "uk_planos_nome" },
    descricao: { type: DataTypes.TEXT, allowNull: true },
    valorBase: { type: DataTypes.DECIMAL(12, 2), field: "valor_base", allowNull: true },
    ativo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { sequelize, tableName: "planos", modelName: "Plano" },
);
