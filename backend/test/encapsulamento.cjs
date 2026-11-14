const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Cliente } = require('../dist/entidades/cliente');
const { Evento } = require('../dist/entidades/evento');
const { Item } = require('../dist/entidades/item');
const { Plano } = require('../dist/entidades/plano');
const { Usuario } = require('../dist/entidades/usuario');

for (const [Entidade, campo] of [[Cliente, 'observacoes'], [Evento, 'observacoes'], [Item, 'descricao'], [Plano, 'descricao'], [Item, 'imagem']]) {
  test(`${Entidade.name}.${campo}: normalização, limites e preservação do estado`, () => {
    const objeto = new Entidade();
    const limite = campo === 'imagem' ? 255 : 2000;
    assert.equal(objeto[campo], null);
    objeto[campo] = ' texto ';
    assert.equal(objeto[campo], 'texto');
    assert.throws(() => { objeto[campo] = 42; });
    assert.equal(objeto[campo], 'texto');
    objeto[campo] = 'a'.repeat(limite);
    assert.equal(objeto[campo].length, limite);
    assert.throws(() => { objeto[campo] = 'a'.repeat(limite + 1); });
    assert.equal(objeto[campo].length, limite);
    objeto[campo] = '   ';
    assert.equal(objeto[campo], null);
    objeto[campo] = null;
    assert.equal(objeto[campo], null);
  });
}

for (const Entidade of [Item, Plano]) {
  test(`${Entidade.name}: ativação controlada e propriedade sem setter`, () => {
    const objeto = new Entidade();
    assert.equal(objeto.ativo, true);
    objeto.desativar();
    assert.equal(objeto.ativo, false);
    assert.equal(Reflect.set(objeto, 'ativo', true), false);
    assert.equal(objeto.ativo, false);
    objeto.ativar();
    assert.equal(objeto.ativo, true);
  });
}

test('Mapeamento Sequelize preserva os nomes de coluna e a hidratação das entidades', () => {
  Object.assign(process.env, { DB_HOST: process.env.DB_HOST || 'localhost', DB_USERNAME: process.env.DB_USERNAME || 'teste', DB_DATABASE: process.env.DB_DATABASE || 'teste', JWT_SECRET: process.env.JWT_SECRET || 'teste' });
  const { ClienteModelo, EventoModelo, ItemModelo, PlanoModelo } = require('../dist/modelos');
  const base = { id: 1, criadoEm: new Date(), atualizadoEm: new Date() };
  for (const [Entidade, Modelo, campos] of [[Cliente, ClienteModelo, ['observacoes']], [Evento, EventoModelo, ['observacoes']], [Plano, PlanoModelo, ['descricao', 'ativo']], [Item, ItemModelo, ['descricao', 'ativo', 'imagem']]]) {
    const original = new Entidade();
    for (const campo of campos) {
      assert.equal(Modelo.getAttributes()[campo].field, campo);
      const valor = campo === 'ativo' ? false : 'do banco';
      const estado = { ...original.paraPersistencia(), [campo]: valor };
      const objeto = Entidade.restaurar({ ...base, ...estado });
      assert.equal(objeto[campo], valor);
      assert.equal(objeto.paraPersistencia()[campo], valor);
    }
  }
});
