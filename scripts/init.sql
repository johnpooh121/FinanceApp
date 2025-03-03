CREATE DATABASE `finance`

-- finance.korstock definition

CREATE TABLE `korstock` (
  `date` date NOT NULL,
  `id` varchar(16) NOT NULL,
  `marketType` enum('KOSPI','KOSDAQ','KONEX','KOSDAQ GLOBAL') NOT NULL,
  `name` varchar(32) NOT NULL,
  `openPrice` int unsigned NOT NULL,
  `closePrice` int unsigned NOT NULL,
  `lowPrice` int unsigned NOT NULL,
  `highPrice` int unsigned NOT NULL,
  `change` int unsigned NOT NULL,
  `tradingVolume` bigint unsigned NOT NULL,
  `tradingValue` bigint unsigned NOT NULL,
  `marketCap` bigint unsigned NOT NULL,
  `shareCount` bigint unsigned NOT NULL,
  `companyCategory` varchar(32) NULL,
  `updatedAt` DATETIME NOT null,
  PRIMARY KEY (`id`,`date`),
  KEY `korStock_id` (`id`),
  KEY `korStock_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

