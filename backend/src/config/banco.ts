import { Sequelize, type Options } from "sequelize";
import { ambiente } from "./ambiente";

const fusoLocal = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

const opcoes: Options & { keepDefaultTimezone: boolean } = {
  dialect: "mysql",
  host: ambiente.banco.host,
  port: ambiente.banco.porta,
  username: ambiente.banco.usuario,
  password: ambiente.banco.senha,
  database: ambiente.banco.nome,

  timezone: fusoLocal,
  keepDefaultTimezone: true,
  dialectOptions: {
    supportBigNumbers: true,
    bigNumberStrings: false,
    timezone: "local",
  },
  logging: false,
  define: {
    freezeTableName: true,
    timestamps: false,
  },
};

export const sequelize = new Sequelize(opcoes);
