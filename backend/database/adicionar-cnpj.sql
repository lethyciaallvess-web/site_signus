ALTER TABLE `clientes`
  MODIFY `tipo_pessoa` enum('FISICA','JURIDICA') NOT NULL DEFAULT 'FISICA';

ALTER TABLE `usuarios`
  ADD COLUMN `cnpj` char(14) DEFAULT NULL AFTER `cpf`,
  ADD UNIQUE KEY `uk_usuarios_cnpj` (`cnpj`);
