CREATE DATABASE `finance`

-- finance.korstock definition

CREATE TABLE `KorStock` (
  `date` date NOT NULL,
  `isin` varchar(32) NOT NULL,
  `code` varchar(16) NOT NULL,
  `marketType` enum('KOSPI','KOSDAQ','KONEX','KOSDAQ GLOBAL') NOT NULL,
  `name` varchar(32) NOT NULL,
  `adjClose` int unsigned NOT NULL,
  `openPrice` int unsigned DEFAULT NULL,
  `lowPrice` int unsigned DEFAULT NULL,
  `highPrice` int unsigned DEFAULT NULL,
  `change` int NOT NULL,
  `changeRate` float NOT NULL,
  `tradingVolume` bigint unsigned DEFAULT NULL,
  `tradingValue` bigint unsigned DEFAULT NULL,
  `marketCap` bigint unsigned DEFAULT NULL,
  `shareCount` bigint unsigned DEFAULT NULL,
  `companyCategory` varchar(32) DEFAULT NULL,
  `eps` double DEFAULT NULL,
  `per` double DEFAULT NULL,
  `bps` double DEFAULT NULL,
  `pbr` double DEFAULT NULL,
  `dps` double DEFAULT NULL,
  `dy` double DEFAULT NULL,
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
