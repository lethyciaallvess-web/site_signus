import {
  type CreationOptional,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../config/banco";
import { TipoPessoa } from "../entidades/cliente";
import { colunasBase } from "./colunas-base";

export class ClienteModelo extends Model<
  InferAttributes<ClienteModelo>,
  InferCreationAttributes<ClienteModelo>
> {
  declare id: CreationOptional<number>;
  declare tipoPessoa: CreationOptional<TipoPessoa>;
  declare nome: string;
  declare documento: string;
  declare email: string;
  declare telefone: string;
  declare observacoes: CreationOptional<string | null>;
  declare criadoEm: CreationOptional<Date>;
  declare atualizadoEm: CreationOptional<Date>;
}

ClienteModelo.init(
  {
    ...colunasBase,
    tipoPessoa: {
      type: DataTypes.ENUM(...Object.values(TipoPessoa)),
      field: "tipo_pessoa",
      allowNull: false,
      defaultValue: TipoPessoa.FISICA,
    },
    nome: { type: DataTypes.STRING(180), allowNull: false },
    documento: { type: DataTypes.STRING(14), allowNull: false, unique: "uk_clientes_documento" },
    email: { type: DataTypes.STRING(255), allowNull: false },
    telefone: { type: DataTypes.STRING(20), allowNull: false },
    observacoes: { type: DataTypes.TEXT, allowNull: true },
  },
  { sequelize, tableName: "clientes", modelName: "Cliente" },
);
