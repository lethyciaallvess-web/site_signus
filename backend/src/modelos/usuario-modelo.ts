import {
  type CreationOptional,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../config/banco";
import { PerfilUsuario } from "../entidades/usuario";
import { colunasBase } from "./colunas-base";

export class UsuarioModelo extends Model<
  InferAttributes<UsuarioModelo>,
  InferCreationAttributes<UsuarioModelo>
> {
  declare id: CreationOptional<number>;
  declare nome: string;
  declare email: string;
  declare cpf: string;
  declare cnpj: CreationOptional<string | null>;
  declare senhaHash: string;
  declare perfil: CreationOptional<PerfilUsuario>;
  declare clienteId: CreationOptional<number | null>;
  declare criadoEm: CreationOptional<Date>;
  declare atualizadoEm: CreationOptional<Date>;
}

UsuarioModelo.init(
  {
    ...colunasBase,
    nome: { type: DataTypes.STRING(150), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: "uk_usuarios_email" },
    cpf: { type: DataTypes.CHAR(11), allowNull: false, unique: "uk_usuarios_cpf" },
    cnpj: { type: DataTypes.CHAR(14), allowNull: true, unique: "uk_usuarios_cnpj" },
    senhaHash: { type: DataTypes.STRING(255), field: "senha_hash", allowNull: false },
    perfil: {
      type: DataTypes.ENUM(...Object.values(PerfilUsuario)),
      allowNull: false,
      defaultValue: PerfilUsuario.CLIENTE,
    },
    clienteId: {
      type: DataTypes.BIGINT.UNSIGNED,
      field: "cliente_id",
      allowNull: true,
      unique: "uk_usuarios_cliente",
    },
  },
  {
    sequelize,
    tableName: "usuarios",
    modelName: "Usuario",
    defaultScope: { attributes: { exclude: ["senhaHash"] } },
  },
);
