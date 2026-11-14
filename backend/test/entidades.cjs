const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Usuario, PerfilUsuario } = require('../dist/entidades/usuario');
const { Cliente, TipoPessoa } = require('../dist/entidades/cliente');
const { Item } = require('../dist/entidades/item');
const { Plano } = require('../dist/entidades/plano');
const { Evento, StatusEvento } = require('../dist/entidades/evento');
const { UsuarioServico } = require('../dist/servicos/usuario-servico');

test('Cliente aceita pessoa física com CPF e jurídica com CNPJ', () => {
  assert.deepEqual(Object.values(TipoPessoa), ['FISICA', 'JURIDICA']);
  const cliente = new Cliente({ nome: 'Cliente teste', email: 'teste@example.com', documento: '52998224725' });
  assert.equal(cliente.tipoPessoa, TipoPessoa.FISICA);
  const empresa = new Cliente({ nome: 'Empresa teste', email: 'empresa@example.com', documento: '11.222.333/0001-81' });
  assert.equal(empresa.tipoPessoa, TipoPessoa.JURIDICA);
  assert.equal(empresa.documento, '11222333000181');
  assert.throws(() => { empresa.documento = '11.222.333/0001-80'; });
  assert.equal(empresa.documento, '11222333000181');
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

test('Usuario aceita CNPJ opcional e valida os dígitos', () => {
  const usuario = Usuario.criar('Ana Teste', 'ana@example.com', '52998224725', 'hash', '11.222.333/0001-81');
  assert.equal(usuario.cnpj, '11222333000181');
  assert.equal(Usuario.criar('Ana Teste', 'ana@example.com', '52998224725', 'hash').cnpj, null);
  assert.throws(() => Usuario.criar('Ana Teste', 'ana@example.com', '52998224725', 'hash', '11111111111111'));
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

test('Models Sequelize carregam com os construtores sem argumentos e as relações', () => {
  Object.assign(process.env, { DB_HOST: process.env.DB_HOST || 'localhost', DB_USERNAME: process.env.DB_USERNAME || 'teste', DB_DATABASE: process.env.DB_DATABASE || 'teste', JWT_SECRET: process.env.JWT_SECRET || 'teste' });
  const entidades = [Usuario, Cliente, Item, Plano, Evento];
  for (const Entidade of entidades) assert.doesNotThrow(() => new Entidade());
  const modelos = require('../dist/modelos');
  const { sequelize } = require('../dist/config/banco');
  assert.equal(Object.keys(sequelize.models).length, 7);
  assert.deepEqual(modelos.ClienteModelo.getAttributes().tipoPessoa.values, ['FISICA', 'JURIDICA']);
  assert.equal(modelos.UsuarioModelo.getAttributes().cnpj.field, 'cnpj');
  assert.equal(modelos.ClienteModelo.getAttributes().tipoPessoa.field, 'tipo_pessoa');
  assert.equal(modelos.ClienteModelo.tableName, 'clientes');
  assert.equal(modelos.EventoModelo.associations.cliente.foreignKey, 'clienteId');
  assert.equal(modelos.EventoModelo.associations.plano.foreignKey, 'planoId');
  assert.equal(modelos.PlanoModelo.associations.itens.options.onDelete, 'CASCADE');
  assert.equal(modelos.PlanoItemModelo.getAttributes().itemId.field, 'itens_id');
  assert.deepEqual(modelos.UsuarioModelo.options.defaultScope, { attributes: { exclude: ['senhaHash'] } });
});

test('Usuario.restaurar/paraPersistencia preservam o estado sem expor o hash ausente', async () => {
  const base = { id: 7, criadoEm: new Date(), atualizadoEm: new Date() };
  const semHash = Usuario.restaurar({ ...base, nome: 'Ana', email: 'ana@example.com', cpf: '52998224725', perfil: PerfilUsuario.ADMIN, clienteId: null });
  assert.equal(semHash.id, 7);
  assert.equal(semHash.perfil, PerfilUsuario.ADMIN);
  assert.equal('senhaHash' in semHash.paraPersistencia(), false);
  const comHash = Usuario.restaurar({ ...base, nome: 'Ana', email: 'ana@example.com', cpf: '52998224725', senhaHash: await require('bcrypt').hash('Senha123!', 4), perfil: PerfilUsuario.CLIENTE, clienteId: 3 });
  assert.equal(await comHash.senhaConfere('Senha123!'), true);
  assert.equal(comHash.clienteId, 3);
});
