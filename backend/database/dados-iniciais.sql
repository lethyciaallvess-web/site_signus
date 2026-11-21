SET NAMES utf8mb4;
USE signus;

INSERT INTO usuarios (nome, email, cpf, senha_hash, perfil) VALUES
('Administrador Signus', 'admin@signus.com', '52998224725', '$2b$10$dqmLsftGXcdNgeHEBOusk.xw5Pcpld57mK5mMfQIsyF2jpUc2RSLq', 'ADMIN'),
('Operador Signus', 'operador@signus.com', '11144477735', '$2b$10$dqmLsftGXcdNgeHEBOusk.xw5Pcpld57mK5mMfQIsyF2jpUc2RSLq', 'OPERADOR');

SET @admin = (SELECT id FROM usuarios WHERE email = 'admin@signus.com');

INSERT INTO clientes (tipo_pessoa, nome, documento, email, telefone, observacoes) VALUES
('FISICA', 'Mariana Souza', '11122233043', 'cliente01@exemplo.com', '44999000100', NULL),
('FISICA', 'Rafael Oliveira', '11123024928', 'cliente02@exemplo.com', '44999001103', NULL),
('FISICA', 'Juliana Costa', '11123816867', 'cliente03@exemplo.com', '44999002107', NULL),
('FISICA', 'Pedro Almeida', '11124608702', 'cliente04@exemplo.com', '44999003111', NULL),
('FISICA', 'Fernanda Lima', '11125400676', 'cliente05@exemplo.com', '44999004114', NULL),
('FISICA', 'Lucas Pereira', '11126192597', 'cliente06@exemplo.com', '44999005118', NULL),
('FISICA', 'Beatriz Rocha', '11126984426', 'cliente07@exemplo.com', '44999006122', NULL),
('FISICA', 'Gustavo Martins', '11127776363', 'cliente08@exemplo.com', '44999007125', NULL),
('JURIDICA', 'Buffet Sabor e Festa Ltda', '12345678010581', 'cliente09@exemplo.com', '44999008129', NULL),
('JURIDICA', 'Colegio Horizonte Ltda', '12345678011804', 'cliente10@exemplo.com', '44999009133', NULL);

INSERT INTO eventos (cliente_id, plano_id, criado_por_usuario_id, nome, data_inicio, data_fim, local_evento, status, valor_negociado, observacoes)
SELECT id, 3, @admin, 'Casamento Mariana e Joao', '2026-12-12 18:00:00', '2026-12-13 03:00:00', 'Espaco Jardim, Maringa', 'CONFIRMADO', 4800, NULL FROM clientes WHERE documento = '11122233043';
SET @ev1 = LAST_INSERT_ID();
INSERT INTO evento_itens (evento_id, itens_id, quantidade, valor_unitario, detalhes) VALUES
(@ev1, 1, 2, NULL, ''),
(@ev1, 4, 4, NULL, ''),
(@ev1, 3, 1, NULL, '');

INSERT INTO eventos (cliente_id, plano_id, criado_por_usuario_id, nome, data_inicio, data_fim, local_evento, status, valor_negociado, observacoes)
SELECT id, 4, @admin, 'Formatura Direito UEM', '2027-01-23 20:00:00', '2027-01-24 05:00:00', 'Clube Maringa', 'CONFIRMADO', 9200, NULL FROM clientes WHERE documento = '11123024928';
SET @ev2 = LAST_INSERT_ID();
INSERT INTO evento_itens (evento_id, itens_id, quantidade, valor_unitario, detalhes) VALUES
(@ev2, 5, 4, NULL, ''),
(@ev2, 6, 2, NULL, ''),
(@ev2, 7, 6, NULL, '');

INSERT INTO eventos (cliente_id, plano_id, criado_por_usuario_id, nome, data_inicio, data_fim, local_evento, status, valor_negociado, observacoes)
SELECT id, 2, @admin, 'Aniversario 15 anos Juliana', '2026-12-05 19:00:00', '2026-12-06 01:00:00', 'Salao Primavera', 'EM_PREPARACAO', 3100, NULL FROM clientes WHERE documento = '11123816867';
SET @ev3 = LAST_INSERT_ID();
INSERT INTO evento_itens (evento_id, itens_id, quantidade, valor_unitario, detalhes) VALUES
(@ev3, 1, 2, NULL, ''),
(@ev3, 4, 2, NULL, '');

INSERT INTO eventos (cliente_id, plano_id, criado_por_usuario_id, nome, data_inicio, data_fim, local_evento, status, valor_negociado, observacoes)
SELECT id, 1, @admin, 'Festa de fim de ano Buffet', '2026-12-19 20:00:00', '2026-12-20 02:00:00', 'Sede do Buffet Sabor e Festa', 'ORCAMENTO', NULL, NULL FROM clientes WHERE documento = '12345678010581';
SET @ev4 = LAST_INSERT_ID();
INSERT INTO evento_itens (evento_id, itens_id, quantidade, valor_unitario, detalhes) VALUES
(@ev4, 5, 2, NULL, '');

INSERT INTO eventos (cliente_id, plano_id, criado_por_usuario_id, nome, data_inicio, data_fim, local_evento, status, valor_negociado, observacoes)
SELECT id, 2, @admin, 'Feira de Ciencias Horizonte', '2026-11-28 08:00:00', '2026-11-28 17:00:00', 'Quadra do Colegio Horizonte', 'CONFIRMADO', 2500, NULL FROM clientes WHERE documento = '12345678011804';
SET @ev5 = LAST_INSERT_ID();
INSERT INTO evento_itens (evento_id, itens_id, quantidade, valor_unitario, detalhes) VALUES
(@ev5, 1, 1, NULL, ''),
(@ev5, 5, 2, NULL, '');

INSERT INTO eventos (cliente_id, plano_id, criado_por_usuario_id, nome, data_inicio, data_fim, local_evento, status, valor_negociado, observacoes)
SELECT id, 4, @admin, 'Show de Rock Pedro', '2026-10-03 21:00:00', '2026-10-04 02:00:00', 'Bar do Rock', 'CONCLUIDO', 6000, NULL FROM clientes WHERE documento = '11124608702';
SET @ev6 = LAST_INSERT_ID();
INSERT INTO evento_itens (evento_id, itens_id, quantidade, valor_unitario, detalhes) VALUES
(@ev6, 1, 4, NULL, ''),
(@ev6, 6, 2, NULL, ''),
(@ev6, 7, 4, NULL, '');

INSERT INTO eventos (cliente_id, plano_id, criado_por_usuario_id, nome, data_inicio, data_fim, local_evento, status, valor_negociado, observacoes)
SELECT id, 3, @admin, 'Casamento Fernanda e Caio', '2027-02-20 17:00:00', '2027-02-21 02:00:00', 'Chacara Bela Vista', 'ORCAMENTO', NULL, NULL FROM clientes WHERE documento = '11125400676';
SET @ev7 = LAST_INSERT_ID();
INSERT INTO evento_itens (evento_id, itens_id, quantidade, valor_unitario, detalhes) VALUES
(@ev7, 3, 2, NULL, ''),
(@ev7, 4, 4, NULL, '');

INSERT INTO eventos (cliente_id, plano_id, criado_por_usuario_id, nome, data_inicio, data_fim, local_evento, status, valor_negociado, observacoes)
SELECT id, 1, @admin, 'Aniversario 30 anos Lucas', '2026-11-14 20:00:00', '2026-11-15 02:00:00', 'Casa de Festas Central', 'CONCLUIDO', 1800, NULL FROM clientes WHERE documento = '11126192597';
SET @ev8 = LAST_INSERT_ID();
INSERT INTO evento_itens (evento_id, itens_id, quantidade, valor_unitario, detalhes) VALUES
(@ev8, 5, 2, NULL, '');

INSERT INTO eventos (cliente_id, plano_id, criado_por_usuario_id, nome, data_inicio, data_fim, local_evento, status, valor_negociado, observacoes)
SELECT id, 4, @admin, 'Baile de Debutantes', '2027-03-06 20:00:00', '2027-03-07 03:00:00', 'Clube Maringa', 'CONFIRMADO', 8700, NULL FROM clientes WHERE documento = '11126984426';
SET @ev9 = LAST_INSERT_ID();
INSERT INTO evento_itens (evento_id, itens_id, quantidade, valor_unitario, detalhes) VALUES
(@ev9, 1, 4, NULL, ''),
(@ev9, 3, 2, NULL, ''),
(@ev9, 4, 6, NULL, '');

INSERT INTO eventos (cliente_id, plano_id, criado_por_usuario_id, nome, data_inicio, data_fim, local_evento, status, valor_negociado, observacoes)
SELECT id, 2, @admin, 'Confraternizacao Empresa', '2026-12-11 19:00:00', '2026-12-12 01:00:00', 'Hotel Plaza', 'EM_PREPARACAO', 3400, NULL FROM clientes WHERE documento = '11127776363';
SET @ev10 = LAST_INSERT_ID();
INSERT INTO evento_itens (evento_id, itens_id, quantidade, valor_unitario, detalhes) VALUES
(@ev10, 1, 2, NULL, ''),
(@ev10, 7, 2, NULL, '');

INSERT INTO eventos (cliente_id, plano_id, criado_por_usuario_id, nome, data_inicio, data_fim, local_evento, status, valor_negociado, observacoes)
SELECT id, 1, @admin, 'Evento cancelado Buffet', '2026-09-20 18:00:00', '2026-09-20 23:00:00', 'Sede do Buffet', 'CANCELADO', NULL, NULL FROM clientes WHERE documento = '12345678010581';
SET @ev11 = LAST_INSERT_ID();
INSERT INTO evento_itens (evento_id, itens_id, quantidade, valor_unitario, detalhes) VALUES
(@ev11, 5, 2, NULL, '');

INSERT INTO eventos (cliente_id, plano_id, criado_por_usuario_id, nome, data_inicio, data_fim, local_evento, status, valor_negociado, observacoes)
SELECT id, 3, @admin, 'Colacao de Grau Horizonte', '2027-01-15 19:00:00', '2027-01-15 23:00:00', 'Teatro Municipal', 'ORCAMENTO', NULL, NULL FROM clientes WHERE documento = '12345678011804';
SET @ev12 = LAST_INSERT_ID();
INSERT INTO evento_itens (evento_id, itens_id, quantidade, valor_unitario, detalhes) VALUES
(@ev12, 1, 2, NULL, ''),
(@ev12, 3, 1, NULL, '');

