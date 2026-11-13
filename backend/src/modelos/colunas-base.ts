import { DataTypes, literal, type ModelAttributes } from "sequelize";

export const colunasBase = {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  criadoEm: {
    type: DataTypes.DATE,
    field: "criado_em",
    allowNull: false,
    defaultValue: literal("CURRENT_TIMESTAMP"),
  },
  atualizadoEm: {
    type: DataTypes.DATE,
    field: "atualizado_em",
    allowNull: false,
    defaultValue: literal("CURRENT_TIMESTAMP"),
  },
} satisfies ModelAttributes;
