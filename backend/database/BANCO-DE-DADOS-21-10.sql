/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.7.2-MariaDB, for Win64 (AMD64)
--
-- Host: 127.0.0.1    Database: signus
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tipo_pessoa` enum('FISICA','JURIDICA') NOT NULL DEFAULT 'FISICA',
  `nome` varchar(180) NOT NULL,
  `documento` varchar(14) NOT NULL,
  `email` varchar(255) NOT NULL,
  `telefone` varchar(20) NOT NULL,
  `observacoes` text DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_clientes_documento` (`documento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes`
--

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evento_itens`
--

DROP TABLE IF EXISTS `evento_itens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `evento_itens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `evento_id` bigint(20) unsigned NOT NULL,
  `itens_id` bigint(20) unsigned DEFAULT NULL,
  `quantidade` int(10) unsigned NOT NULL,
  `valor_unitario` decimal(12,2) DEFAULT NULL,
  `detalhes` varchar(255) NOT NULL DEFAULT '',
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_evento_item` (`evento_id`,`itens_id`,`detalhes`),
  KEY `fk_evento_itens_equipamento` (`itens_id`),
  CONSTRAINT `fk_evento_itens_equipamento` FOREIGN KEY (`itens_id`) REFERENCES `itens` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_evento_itens_evento` FOREIGN KEY (`evento_id`) REFERENCES `eventos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ck_evento_itens_quantidade` CHECK (`quantidade` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evento_itens`
--

LOCK TABLES `evento_itens` WRITE;
/*!40000 ALTER TABLE `evento_itens` DISABLE KEYS */;
/*!40000 ALTER TABLE `evento_itens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `eventos`
--

DROP TABLE IF EXISTS `eventos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `eventos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `cliente_id` bigint(20) unsigned NOT NULL,
  `plano_id` bigint(20) unsigned DEFAULT NULL,
  `criado_por_usuario_id` bigint(20) unsigned NOT NULL,
  `nome` varchar(180) NOT NULL,
  `data_inicio` datetime NOT NULL,
  `data_fim` datetime NOT NULL,
  `local_evento` varchar(255) NOT NULL,
  `status` enum('ORCAMENTO','CONFIRMADO','EM_PREPARACAO','CONCLUIDO','CANCELADO') NOT NULL DEFAULT 'ORCAMENTO',
  `valor_negociado` decimal(12,2) DEFAULT NULL,
  `observacoes` text DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_eventos_cliente` (`cliente_id`),
  KEY `fk_eventos_plano` (`plano_id`),
  KEY `fk_eventos_usuario` (`criado_por_usuario_id`),
  KEY `idx_eventos_periodo` (`data_inicio`,`data_fim`),
  KEY `idx_eventos_status` (`status`),
  CONSTRAINT `fk_eventos_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_eventos_plano` FOREIGN KEY (`plano_id`) REFERENCES `planos` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_eventos_usuario` FOREIGN KEY (`criado_por_usuario_id`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `ck_eventos_periodo` CHECK (`data_fim` >= `data_inicio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eventos`
--

LOCK TABLES `eventos` WRITE;
/*!40000 ALTER TABLE `eventos` DISABLE KEYS */;
/*!40000 ALTER TABLE `eventos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `itens`
--

DROP TABLE IF EXISTS `itens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `itens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) NOT NULL,
  `nome` varchar(150) NOT NULL,
  `categoria` varchar(80) NOT NULL,
  `quantidade_total` int(10) unsigned NOT NULL DEFAULT 0,
  `descricao` text DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `imagem` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_equipamentos_codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `itens`
--

LOCK TABLES `itens` WRITE;
/*!40000 ALTER TABLE `itens` DISABLE KEYS */;
INSERT INTO `itens` VALUES
(1,'CAIXA_MACKIE','Caixa Mackie','Som',0,'Caixa Mackie para o sistema de som',1,'2026-10-05 23:05:04','2026-10-12 19:56:14','caixa-mackie.png'),
(2,'GRAVE_PEQUENO','Grave pequeno','Som',0,'Subgrave de menor porte',1,'2026-10-05 23:05:04','2026-10-12 19:57:13','caixa-grave.png'),
(3,'PAINEL_P5','Painel de LED P5','Painel de LED',0,'Painel P5 configurável conforme a montagem',1,'2026-10-05 23:05:04','2026-10-12 19:57:13','placa-de-painel-de-led-p5.png'),
(4,'BEAM','Beam','Iluminação',0,'Moving head do tipo beam',1,'2026-10-05 23:05:04','2026-10-12 19:56:14','beam.png'),
(5,'CAIXA_ATIVA','Caixa ativa','Som',0,'Caixa de som ativa',1,'2026-10-05 23:05:04','2026-10-12 19:56:14','caixa-ativa.png'),
(6,'GRAVE','Grave','Som',0,'Subgrave do sistema principal',1,'2026-10-05 23:05:04','2026-10-12 19:57:13','caixa-grave.png'),
(7,'ESTROBO','Estrobo','Iluminação',0,'Iluminador estroboscópico',1,'2026-10-05 23:05:04','2026-10-12 19:57:13','estrobos.png'),
(8,'PLACA_PALCO','Placa de palco','Estrutura',0,'Placa modular para montagem do palco',1,'2026-10-05 23:05:04','2026-10-12 19:56:14','placa-de-palco.png'),
(9,'PAINEL_P3','Painel de LED P3','Painel de LED',0,'Painel P3 configurável conforme a montagem',1,'2026-10-05 23:05:04','2026-10-12 19:57:13','placa-de-painel-de-led-p3.png'),
(10,'MAC_AURA','MAC Aura','Iluminação',0,'Moving head do tipo MAC Aura',1,'2026-10-05 23:05:04','2026-10-12 19:56:14','mac-aura.png'),
(11,'BANCADA_DJ','Bancada para DJ','Estrutura',0,'Bancada para montagem do DJ',1,'2026-10-05 23:05:04','2026-10-05 23:05:04',NULL),
(12,'LINE_ARRAY','Line array','Som',0,'Caixa line array do sistema principal',1,'2026-10-05 23:05:04','2026-10-12 19:57:13','line.png'),
(15,'COB','Refletor COB','Iluminação',0,'Refletor de LED do tipo COB',1,'2026-10-05 23:05:04','2026-10-12 19:57:13','cob-light.png'),
(16,'SOM_BANDA_COMPLETO','Sistema de som para banda','Serviço',0,'Sistema completo para apresentação de banda',1,'2026-10-05 23:05:04','2026-10-05 23:05:04',NULL);
/*!40000 ALTER TABLE `itens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plano_itens`
--

DROP TABLE IF EXISTS `plano_itens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `plano_itens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `plano_id` bigint(20) unsigned NOT NULL,
  `itens_id` bigint(20) unsigned DEFAULT NULL,
  `quantidade` int(10) unsigned NOT NULL,
  `detalhes` varchar(255) NOT NULL DEFAULT '',
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_plano_item` (`plano_id`,`itens_id`,`detalhes`),
  KEY `fk_plano_itens_equipamento` (`itens_id`),
  CONSTRAINT `fk_plano_itens_equipamento` FOREIGN KEY (`itens_id`) REFERENCES `itens` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_plano_itens_plano` FOREIGN KEY (`plano_id`) REFERENCES `planos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ck_plano_itens_quantidade` CHECK (`quantidade` > 0)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plano_itens`
--

LOCK TABLES `plano_itens` WRITE;
/*!40000 ALTER TABLE `plano_itens` DISABLE KEYS */;
INSERT INTO `plano_itens` VALUES
(1,1,1,2,'','2026-10-05 23:05:04'),
(2,1,2,2,'','2026-10-05 23:05:04'),
(3,1,3,1,'Montagem 4x2; confirmar unidade da medida','2026-10-05 23:05:04'),
(4,1,4,4,'','2026-10-05 23:05:04'),
(8,2,5,4,'','2026-10-05 23:05:04'),
(9,2,6,4,'','2026-10-05 23:05:04'),
(10,2,4,4,'','2026-10-05 23:05:04'),
(11,2,7,4,'','2026-10-05 23:05:04'),
(12,2,3,1,'Montagem 3x4; confirmar unidade da medida','2026-10-05 23:05:04'),
(15,3,8,10,'Palco 5x4; confirmar unidade da medida','2026-10-05 23:05:04'),
(16,3,9,1,'Montagem principal 4x3; confirmar unidade da medida','2026-10-05 23:05:04'),
(17,3,4,4,'','2026-10-05 23:05:04'),
(18,3,7,4,'','2026-10-05 23:05:04'),
(19,3,10,4,'','2026-10-05 23:05:04'),
(20,3,11,1,'','2026-10-05 23:05:04'),
(21,3,9,1,'Montagem 1x2 para a bancada do DJ; confirmar unidade da medida','2026-10-05 23:05:04'),
(22,3,6,4,'','2026-10-05 23:05:04'),
(23,3,12,4,'','2026-10-05 23:05:04'),
(31,4,3,18,'3 tiras com 6 placas de painel P5','2026-10-05 23:05:04'),
(32,4,9,1,'Montagem principal 3x4; confirmar unidade da medida','2026-10-05 23:05:04'),
(33,4,4,16,'','2026-10-05 23:05:04'),
(34,4,10,12,'','2026-10-05 23:05:04'),
(35,4,7,14,'','2026-10-05 23:05:04'),
(36,4,15,4,'','2026-10-05 23:05:04'),
(37,4,11,1,'','2026-10-05 23:05:04'),
(38,4,9,1,'Montagem 1x2 para a bancada do DJ; confirmar unidade da medida','2026-10-05 23:05:04'),
(39,4,16,1,'Sistema completo','2026-10-05 23:05:04');
/*!40000 ALTER TABLE `plano_itens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `planos`
--

DROP TABLE IF EXISTS `planos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `planos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(80) NOT NULL,
  `descricao` text DEFAULT NULL,
  `valor_base` decimal(12,2) DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_planos_nome` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `planos`
--

LOCK TABLES `planos` WRITE;
/*!40000 ALTER TABLE `planos` DISABLE KEYS */;
INSERT INTO `planos` VALUES
(1,'Bronze','Pacote inicial para eventos de menor porte',NULL,1,'2026-10-05 23:05:04','2026-10-05 23:05:04'),
(2,'Prata','Pacote intermediário com reforço de som, iluminação e painel',NULL,1,'2026-10-05 23:05:04','2026-10-05 23:05:04'),
(3,'Ouro','Pacote avançado com palco, painel P3, bancada para DJ e sistema de som',NULL,1,'2026-10-05 23:05:04','2026-10-05 23:05:04'),
(4,'Diamante','Pacote completo com pista, painéis, iluminação ampliada e som para banda',NULL,1,'2026-10-05 23:05:04','2026-10-05 23:05:04');
/*!40000 ALTER TABLE `planos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(150) NOT NULL,
  `email` varchar(255) NOT NULL,
  `cpf` char(11) NOT NULL,
  `senha_hash` varchar(255) NOT NULL,
  `perfil` enum('ADMIN','OPERADOR') NOT NULL DEFAULT 'OPERADOR',
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_usuarios_email` (`email`),
  UNIQUE KEY `uk_usuarios_cpf` (`cpf`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

--
-- Dumping routines for database 'signus'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-10-21 20:11:20
