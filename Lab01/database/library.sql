-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: library
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `books`
--

DROP TABLE IF EXISTS `books`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `books` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(45) NOT NULL,
  `author` varchar(45) NOT NULL DEFAULT 'Updating',
  `category` varchar(45) NOT NULL,
  `quantity` varchar(45) NOT NULL DEFAULT '0',
  `available_quantity` varchar(45) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `books`
--

LOCK TABLES `books` WRITE;
/*!40000 ALTER TABLE `books` DISABLE KEYS */;
INSERT INTO `books` VALUES (2,'Kingdom','Hara Yasuhisa','History','20','14'),(11,'One Piece','Oda Eiichiro','Shounen','10','19'),(12,'Chainsaw Man','Tatsuki Fujimoto','Shounen','10','10'),(13,'MY DRESS UP DARLING','Fukuda Shinichi','Romance','20','10'),(14,'TIỀN ĐẺ RA TIỀN','Duncan Bannatyne','Business','15','14'),(15,' NAMAIKIZAKARI','Miyuki Mitsubachi','Romance','1','1'),(16,'CẬU BÉ ĐẾ VƯƠNG','Max Lai','Action','2','2'),(17,'BLACK JOKE','Koike Rintaro','Action','4','4'),(18,'BILLY BAT','Urasawa Naoki','Sci-Fi','1','1'),(19,'BARTENDER - NGƯỜI PHA CHẾ RƯỢU','Araki Joh','Slice Of Life','5','5'),(20,'ANH HÙNG: ONE-PUNCH MAN','Yusuke Murata','Action','100','100'),(21,'HOA SƠN TÁI KHỞI','L. C. D','Action','1','1'),(22,'THE FRAGRANT FLOWER BLOOMS WITH DIGNITY','Saka Mikami','Romance','1','1'),(23,'GACHA VÔ HẠN - PICK ME UP! INFINITE GACHA','Nicesun','Action','1','1'),(24,'BLUE LOCK','Muneyuki Kaneshiro','Sports','1','1');
/*!40000 ALTER TABLE `books` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `borrows`
--

DROP TABLE IF EXISTS `borrows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `borrows` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `book_id` int DEFAULT NULL,
  `borrow_date` datetime NOT NULL,
  `return_date` datetime DEFAULT NULL,
  `status` enum('processing','borrowed','processing_return','returned') NOT NULL DEFAULT 'processing',
  PRIMARY KEY (`id`),
  KEY `fk_user` (`user_id`),
  KEY `fk_book` (`book_id`),
  CONSTRAINT `fk_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `borrows`
--

LOCK TABLES `borrows` WRITE;
/*!40000 ALTER TABLE `borrows` DISABLE KEYS */;
INSERT INTO `borrows` VALUES (5,13,2,'2025-09-25 12:06:16','2025-09-25 12:06:38','returned'),(6,13,2,'2025-09-25 12:06:43','2025-09-25 12:08:16','returned'),(7,13,2,'2025-09-25 12:08:23','2025-09-25 12:12:22','returned'),(9,18,2,'2025-09-27 21:37:50',NULL,'borrowed'),(10,18,2,'2025-09-27 21:39:18',NULL,'borrowed'),(11,14,2,'2025-09-27 21:53:07','2025-09-27 23:13:29','returned'),(12,2,2,'2025-09-27 22:39:14',NULL,'borrowed'),(13,13,2,'2025-09-27 22:57:23',NULL,'borrowed'),(14,14,2,'2025-09-27 23:14:27','2025-09-27 23:14:49','returned'),(15,14,2,'2025-09-27 23:19:25','2025-09-27 23:20:06','returned'),(18,14,2,'2025-09-28 00:21:21','2025-09-28 00:21:35','returned'),(19,14,11,'2025-09-28 01:00:04','2025-09-28 01:00:57','returned'),(20,14,13,'2025-09-28 01:03:00',NULL,'borrowed'),(21,19,12,'2025-09-28 22:13:56','2025-09-28 22:14:31','returned'),(22,30,15,'2025-09-28 23:19:40','2025-09-28 23:55:23','returned'),(23,30,20,'2025-09-28 23:19:41','2025-09-28 23:55:23','returned'),(24,30,19,'2025-09-28 23:19:42','2025-09-28 23:55:22','returned'),(25,30,18,'2025-09-28 23:19:50','2025-09-28 23:55:22','returned'),(26,30,17,'2025-09-28 23:19:51','2025-09-28 23:55:20','returned'),(27,30,16,'2025-09-28 23:19:53','2025-09-28 23:55:20','returned'),(28,30,24,'2025-09-28 23:19:54','2025-09-28 23:55:19','returned'),(29,30,23,'2025-09-28 23:19:55','2025-09-28 23:55:19','returned'),(30,30,12,'2025-09-28 23:19:56','2025-09-28 23:55:18','returned'),(31,30,13,'2025-09-28 23:19:58','2025-09-28 23:55:18','returned'),(32,30,2,'2025-09-28 23:19:59','2025-09-28 23:55:17','returned'),(33,30,21,'2025-09-28 23:20:00','2025-09-28 23:55:16','returned'),(34,30,14,'2025-09-28 23:20:02','2025-09-28 23:55:15','returned'),(35,30,22,'2025-09-28 23:20:03','2025-09-28 23:55:15','returned'),(36,30,11,'2025-09-28 23:20:04','2025-09-28 23:55:14','returned'),(37,31,20,'2025-09-28 23:53:56','2025-09-29 00:01:54','returned'),(38,31,19,'2025-09-28 23:53:57','2025-09-29 00:01:54','returned'),(39,31,17,'2025-09-28 23:53:57','2025-09-29 00:01:54','returned'),(40,31,12,'2025-09-28 23:53:58','2025-09-29 00:01:53','returned'),(41,31,16,'2025-09-28 23:53:58','2025-09-29 00:01:54','returned'),(42,31,2,'2025-09-28 23:54:00','2025-09-29 00:01:53','returned'),(43,31,13,'2025-09-28 23:54:01','2025-09-29 00:01:52','returned'),(44,31,11,'2025-09-28 23:54:02',NULL,'borrowed'),(45,31,14,'2025-09-28 23:54:02',NULL,'borrowed'),(46,30,15,'2025-09-28 23:58:42','2025-09-29 00:01:52','returned'),(47,30,20,'2025-09-28 23:58:43','2025-09-29 00:01:52','returned'),(48,30,19,'2025-09-28 23:58:44','2025-09-29 00:03:19','returned'),(49,30,24,'2025-09-28 23:58:44','2025-09-29 00:03:18','returned'),(50,30,18,'2025-09-28 23:58:45','2025-09-29 00:01:51','returned'),(51,30,17,'2025-09-28 23:58:46','2025-09-29 00:01:50','returned'),(52,30,16,'2025-09-28 23:58:46','2025-09-29 00:03:18','returned'),(53,30,12,'2025-09-28 23:58:47','2025-09-29 00:03:18','returned'),(54,30,23,'2025-09-28 23:58:47','2025-09-29 00:03:18','returned'),(55,30,21,'2025-09-28 23:58:49','2025-09-29 00:03:17','returned'),(56,30,2,'2025-09-28 23:58:50','2025-09-29 00:03:17','returned'),(57,30,13,'2025-09-28 23:58:50','2025-09-29 00:03:17','returned'),(58,30,14,'2025-09-28 23:58:51','2025-09-29 00:03:17','returned'),(59,30,22,'2025-09-28 23:58:52','2025-09-29 00:03:17','returned'),(60,30,11,'2025-09-28 23:58:52','2025-09-29 00:03:17','returned');
/*!40000 ALTER TABLE `borrows` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_name` varchar(45) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('admin','user') DEFAULT 'user',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_name_UNIQUE` (`user_name`),
  UNIQUE KEY `password_UNIQUE` (`password`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'sono','$2b$10$lbI3y6Brs2eH0wIp2HLbMuV7g.Hv0Y.VdbUKzYRM73VnXyCHLa/k.','admin'),(3,'sonopro','$2b$10$QKnfMvEmkALC4kk/69Lm2uoM7FzU89QxsXgkMWKy9hXl5p/WIoLfm','user'),(8,'sonodesu','$2b$10$dIIGhcY8eYZ3uQC0.BS50ermVVBYLSx.JG0t5PhU.wPZRGS/Sgt1m','user'),(9,'sono123','$2b$10$UHOcvLXAUFIEdOLb2gL8p.hFu0JXWOsyFQFsXGEQKXZmWTsZKs2.a','user'),(10,'sonone','$2b$10$1aKgj4tZCjL2wuTODJEdF.luK3iO9Y5jnOO4mSPFaMHd8Yocx1xx.','user'),(11,'khanh','$2b$10$qojqtGVpyWcc223wrwDIkOfYBLzw/dQY4TMYcX3XXelW4WVtFwJRW','user'),(12,'nene','$2b$10$lDQu2dMF2fOmOezM9LFmruvPdgZvMTYsMpr1Q8D6NjCfO5hL.YzcO','user'),(13,'1','$2b$10$rH7QERiRzTQLzmhCGWdaLOdk/vGCLFDcNcjwdfnfrE6BI5GO55g/u','user'),(14,'2','$2b$10$l3QoUbQnMT.Rc6g7y7vk1.cAhkvlEdCU/ww5R6/ZUDpvC40s/H1nG','admin'),(15,'sonose','$2b$10$nb//QZ94t.fd.me47bOQGuaIWsqI1WIwbBe7TE64b9ibWfVPT3pc6','user'),(16,'sonos','$2b$10$bLZaV64oB0.KfBCtPxDuBOzox2gim5byqD/MaPVWpc58Bn/5okWSu','user'),(17,'123','$2b$10$lUHvfl7wGLdrBKwn3spp.OdoqZ.e6yTHKXadaNgnOld54VTUi6Vqe','user'),(18,'12','$2b$10$5G0w4Qd7X4kQE3EqOqK9KubkO4PY72c/MvmojeoymZOr06J6Ye3z.','user'),(19,'12345','$2b$10$nVn73QMHPyHlA44yYhHa.OL.v0e7GELeF2AzB1TsISIyNrtRiy1dq','user'),(20,'123456','$2b$10$gr5iHK7uHGTCxqv/TzhJv.3zYO3KgUyrsgcz9/oL7Y0FJxuF0dk/C','user'),(21,'1234567','$2b$10$ppGLs11Khfdsv5VZi00gye/8COal0PURICYxflqPbuWpQxeqx0Qme','user'),(22,'12345678','$2b$10$.u4rq4EcDlmgNFFIk1QRf.UFtDify.rIhkGQQ1LyQviXsnsVw4Nv2','user'),(23,'abc','$2b$10$Kh0w.aE4Js5XeHOzCQiI0uCyjhdkrXxncUa/kiy1H2f.8u7iBQ4I6','user'),(24,'12a','$2b$10$Ev6aRBbODjHV1MZpPuCAounHhUiCD5J/SoAWfSWiYu4tuBbvpohbu','user'),(25,'sonopro123','$2b$10$uvcu4EHWt1xkgpeAhtWg1.Kc.SLfQAW0sPEIB7XIlKOYmPMoILom2','user'),(26,'sonopro1234','$2b$10$5uFtBcUHbr06ytTDTjUx5.F8MPjxYsxTdbspSHJkcYx.DZoJL80Je','user'),(27,'123456789','$2b$10$Ze5o62T8a5sICDatgv7Ajezu0EI1fVnDAB6FPYMxJtU869OdUGQFe','user'),(28,'12345678910','$2b$10$dwAwc8ZjrsyYEZtjFsC/4u1L34U/rY0C3p4UDzb5WdNCn5j5OwQ.e','user'),(29,'1234567891011','$2b$10$fMSJAB8.oNsJaibZd3Ssx.1QxytpDWIj914Y7GBI08lL/wLLbkxSe','user'),(30,'adminLiba','$2b$10$KowiS8cwj3F0qQOWnOkpRumhSupNBwu6O4.xeuhLdvSd/jWNxRMLW','admin'),(31,'luonghongson','$2b$10$SjyaMKrkTAMbBX0nXE1J7OjyGxNZJv3t/WVzaQiZJ/jkj/Bc3ej1a','user');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-29  0:25:49
