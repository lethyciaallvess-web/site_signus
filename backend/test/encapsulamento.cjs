const { test } = require('node:test');
const assert = require('node:assert/strict');
require('reflect-metadata');
const { DataSource } = require('typeorm');
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

test('Mapeamento preserva os nomes de coluna e a hidratação do TypeORM', async () => {
  const fonte = new DataSource({ type: 'mysql', database: 'teste', entities: [Cliente, Evento, Item, Plano, Usuario] });
  await fonte.buildMetadatas();
  for (const [Entidade, campos] of [[Cliente, ['observacoes']], [Evento, ['observacoes']], [Plano, ['descricao', 'ativo']], [Item, ['descricao', 'ativo', 'imagem']]]) {
    const metadata = fonte.getMetadata(Entidade);
    for (const campo of campos) {
      const colunas = metadata.columns.filter(c => c.databaseName === campo);
      assert.equal(colunas.length, 1);
      assert.equal(colunas[0].propertyName, '_' + campo);
      const objeto = metadata.create();
      colunas[0].setEntityValue(objeto, campo === 'ativo' ? false : 'do banco');
      assert.equal(objeto[campo], campo === 'ativo' ? false : 'do banco');
    }
  }
});
