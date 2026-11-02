const { test } = require('node:test');
const assert = require('node:assert/strict');
require('reflect-metadata');
const { DataSource } = require('typeorm');
const { Usuario, PerfilUsuario } = require('../dist/entidades/usuario');
const { Cliente, TipoPessoa } = require('../dist/entidades/cliente');
const { Item } = require('../dist/entidades/item');
const { Plano } = require('../dist/entidades/plano');
const { Evento, StatusEvento } = require('../dist/entidades/evento');
const { UsuarioServico } = require('../dist/servicos/usuario-servico');

test('Cliente oferece somente pessoa física', () => {
  assert.deepEqual(Object.values(TipoPessoa), ['FISICA']);
  const cliente = new Cliente({ nome: 'Cliente teste', email: 'teste@example.com', cpf: '52998224725' });
  assert.equal(cliente.tipoPessoa, TipoPessoa.FISICA);
  assert.throws(() => { cliente.documento = '11111111111'; });
});

test('Item inicializa os campos e valida quantidade e dados obrigatórios', () => {
  const item = new Item({ codigo: ' SOM01 ', nome: ' Caixa ativa ', categoria: ' Som ', quantidadeTotal: 2 });
  assert.equal(item.codigo, 'SOM01');
  assert.equal(item.nome, 'Caixa ativa');
  assert.equal(item.categoria, 'Som');
  assert.equal(item.quantidadeTotal, 2);
  assert.equal(item.ativo, true);
  assert.equal(new Item({ codigo: 'X', nome: 'Caixa', categoria: 'Som' }).quantidadeTotal, 0);
  assert.throws(() => new Item({ codigo: '', nome: 'Caixa', categoria: 'Som' }));
  assert.throws(() => new Item({ codigo: 'X', nome: 'Caixa', categoria: 'Som', quantidadeTotal: -1 }));
});

test('Plano inicializa nome e valor com validação', () => {
  assert.equal(new Plano({ nome: ' Básico ' }).nome, 'Básico');
  assert.equal(new Plano({ nome: 'Básico' }).valorBase, null);
  assert.equal(new Plano({ nome: 'Básico', valorBase: 100 }).valorBase, 100);
  assert.throws(() => new Plano({ nome: '' }));
  assert.throws(() => new Plano({ nome: 'Básico', valorBase: -1 }));
});

const dadosEvento = () => ({ cliente: Object.assign(new Cliente(), { id: 1 }), criadoPor: Object.assign(new Usuario(), { id: 2 }), nome: 'Festa',
  inicio: new Date('2026-11-02T12:00:00Z'), fim: new Date('2026-11-02T14:00:00Z'), localEvento: 'Salão' });

test('Evento inicializa campos obrigatórios e protege as datas recebidas', () => {
  const dados = dadosEvento();
  const evento = new Evento(dados);
  assert.equal(evento.clienteId, 1);
  assert.equal(evento.criadoPorUsuarioId, 2);
  assert.equal(evento.nome, 'Festa');
  assert.equal(evento.localEvento, 'Salão');
  assert.equal(evento.status, StatusEvento.ORCAMENTO);
  assert.equal(evento.planoId, null);
  dados.inicio.setFullYear(2000);
  assert.equal(evento.dataInicio.getUTCFullYear(), 2026);
  assert.throws(() => new Evento({ ...dadosEvento(), fim: new Date('2020-01-01') }));
  assert.throws(() => new Evento({ ...dadosEvento(), nome: '' }));
});

test('Usuario.criar aplica validações e mantém perfil de cliente', () => {
  const usuario = Usuario.criar(' Ana Teste ', ' ANA@EXAMPLE.COM ', '529.982.247-25', 'hash-teste');
  assert.equal(usuario.nome, 'Ana Teste');
  assert.equal(usuario.email, 'ana@example.com');
  assert.equal(usuario.cpf, '52998224725');
  assert.equal(usuario.perfil, PerfilUsuario.CLIENTE);
  assert.equal(usuario.clienteId, null);
  assert.throws(() => Usuario.criar('Ana', 'inválido', '52998224725', 'hash'));
  assert.throws(() => Usuario.criar('Ana', 'ana@example.com', '11111111111', 'hash'));
  assert.throws(() => Usuario.criar('Ana', 'ana@example.com', '52998224725', ''));
});

test('Cadastro pelo serviço usa a fábrica e gera um hash válido', async () => {
  let salvo;
  const servico = new UsuarioServico({ buscarPorEmail: async () => null, buscarPorCpf: async () => null,
    salvarNovoCliente: async (usuario) => { salvo = usuario; return usuario; } });
  const resposta = await servico.cadastrar({ nome: 'Ana Teste', email: 'ana@example.com', cpf: '52998224725', senha: 'SenhaForte123!' });
  assert.equal(resposta.nome, 'Ana Teste');
  assert.equal(await salvo.senhaConfere('SenhaForte123!'), true);
  assert.equal(await salvo.senhaConfere('outra'), false);
  assert.equal('senhaHash' in resposta, false);
});

test('TypeORM constrói metadados com os construtores sem argumentos', async () => {
  const entidades = [Usuario, Cliente, Item, Plano, Evento];
  for (const Entidade of entidades) assert.doesNotThrow(() => new Entidade());
  const fonte = new DataSource({ type: 'mysql', database: 'teste', entities: entidades });
  await fonte.buildMetadatas();
  assert.equal(fonte.entityMetadatas.length, 5);
  const coluna = fonte.getMetadata(Cliente).columns.find(c => c.databaseName === 'tipo_pessoa');
  assert.deepEqual(coluna.enum, ['FISICA']);
});
