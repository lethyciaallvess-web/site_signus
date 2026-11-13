import { criarApp } from "./app";
import { ambiente } from "./config/ambiente";
import { sequelize } from "./config/banco";
import "./modelos";

const TENTATIVAS = 15;
const ESPERA_MS = 3000;

const esperar = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

async function conectarAoBanco(): Promise<void> {
  for (let tentativa = 1; tentativa <= TENTATIVAS; tentativa++) {
    try {
      await sequelize.authenticate();
      console.log("Banco de dados conectado.");
      return;
    } catch (erro) {
      console.error(
        `Falha ao conectar ao banco (tentativa ${tentativa}/${TENTATIVAS}).`,
      );
      if (tentativa === TENTATIVAS) {
        throw erro;
      }
      await esperar(ESPERA_MS);
    }
  }
}

async function iniciar(): Promise<void> {
  await conectarAoBanco();
  criarApp().listen(ambiente.porta, () => {
    console.log(`API rodando na porta ${ambiente.porta}`);
  });
}

iniciar().catch((erro) => {
  console.error(erro);
  process.exit(1);
});