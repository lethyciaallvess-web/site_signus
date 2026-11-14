
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(150) NOT NULL,
  `email` varchar(255) NOT NULL,
  `cpf` char(11) NOT NULL,
  `cnpj` char(14) DEFAULT NULL,
  `senha_hash` varchar(255) NOT NULL,
  `perfil` enum('ADMIN','OPERADOR','CLIENTE') NOT NULL DEFAULT 'CLIENTE',
  `cliente_id` bigint(20) unsigned DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_usuarios_email` (`email`),
  UNIQUE KEY `uk_usuarios_cpf` (`cpf`),
  UNIQUE KEY `uk_usuarios_cnpj` (`cnpj`),
  UNIQUE KEY `uk_usuarios_cliente` (`cliente_id`),
  CONSTRAINT `fk_usuarios_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;