CREATE DATABASE `finance`

-- finance.korstock definition

CREATE TABLE `KorStock` (
  `date` date NOT NULL,
  `isin` varchar(32) NOT NULL,
  `code` varchar(16) NOT NULL,
  `marketType` enum('KOSPI','KOSDAQ','KONEX','KOSDAQ GLOBAL') DEFAULT NULL,
  `name` varchar(32) NOT NULL,
  `adjClose` int unsigned NOT NULL,
  `openPrice` int unsigned NOT NULL,
  `lowPrice` int unsigned NOT NULL,
  `highPrice` int unsigned NOT NULL,
  `change` int NOT NULL,
  `changeRate` float NOT NULL,
  `tradingVolume` bigint unsigned NOT NULL,
  `tradingValue` bigint unsigned NOT NULL,
  `marketCap` bigint unsigned NOT NULL,
  `shareCount` bigint unsigned NOT NULL,
  `companyCategory` varchar(32) DEFAULT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`isin`,`date`),
  KEY `korStock_id` (`marketType`,`code`),
  KEY `korStock_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `KorStockInfo` (
  `isin` varchar(32) NOT NULL,
  `code` varchar(16) NOT NULL,
  `korName` varchar(256) NOT NULL,
  `korNameShorten` varchar(256) NOT NULL,
  `engName` varchar(256) NOT NULL,
  `listingDate` date NOT NULL,
  `marketType` enum('KOSPI','KOSDAQ','KONEX','KOSDAQ GLOBAL') NOT NULL,
  `securityType` varchar(64) DEFAULT NULL,
  `companyCategory` varchar(64) DEFAULT NULL,
  `stockType` varchar(64) DEFAULT NULL,
  `parValue` varchar(32) NOT NULL,
  `shareCount` bigint unsigned NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`code`,`marketType`),
  UNIQUE KEY `korStockInfo_isin` (`isin`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
