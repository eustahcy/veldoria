/*
Navicat MySQL Data Transfer

Source Server         : tibia2.pl
Source Server Version : 50505
Source Host           : localhost:3306
Source Database       : oldmargonem

Target Server Type    : MYSQL
Target Server Version : 50505
File Encoding         : 65001

Date: 2016-03-19 08:29:17
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `blokadaprzejscia`
-- ----------------------------
DROP TABLE IF EXISTS `blokadaprzejscia`;
CREATE TABLE `blokadaprzejscia` (
  `mapa` int(11) NOT NULL DEFAULT '0',
  `x` int(11) NOT NULL DEFAULT '0',
  `y` int(11) NOT NULL DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci;

-- ----------------------------
-- Records of blokadaprzejscia
-- ----------------------------
INSERT INTO `blokadaprzejscia` VALUES ('1', '4', '11');
INSERT INTO `blokadaprzejscia` VALUES ('1', '5', '11');
INSERT INTO `blokadaprzejscia` VALUES ('1', '3', '11');
INSERT INTO `blokadaprzejscia` VALUES ('1', '3', '12');
INSERT INTO `blokadaprzejscia` VALUES ('1', '3', '10');
INSERT INTO `blokadaprzejscia` VALUES ('1', '6', '10');
INSERT INTO `blokadaprzejscia` VALUES ('1', '7', '10');
INSERT INTO `blokadaprzejscia` VALUES ('1', '8', '11');
INSERT INTO `blokadaprzejscia` VALUES ('1', '9', '10');
INSERT INTO `blokadaprzejscia` VALUES ('1', '10', '10');
INSERT INTO `blokadaprzejscia` VALUES ('1', '11', '10');
INSERT INTO `blokadaprzejscia` VALUES ('1', '12', '10');
INSERT INTO `blokadaprzejscia` VALUES ('1', '13', '10');
INSERT INTO `blokadaprzejscia` VALUES ('1', '14', '10');
INSERT INTO `blokadaprzejscia` VALUES ('1', '15', '10');
INSERT INTO `blokadaprzejscia` VALUES ('1', '16', '10');
INSERT INTO `blokadaprzejscia` VALUES ('1', '17', '10');
INSERT INTO `blokadaprzejscia` VALUES ('1', '18', '10');
INSERT INTO `blokadaprzejscia` VALUES ('1', '19', '10');
INSERT INTO `blokadaprzejscia` VALUES ('1', '20', '10');
INSERT INTO `blokadaprzejscia` VALUES ('1', '21', '10');
INSERT INTO `blokadaprzejscia` VALUES ('1', '22', '10');
INSERT INTO `blokadaprzejscia` VALUES ('1', '23', '11');
INSERT INTO `blokadaprzejscia` VALUES ('1', '24', '10');
INSERT INTO `blokadaprzejscia` VALUES ('1', '25', '10');
INSERT INTO `blokadaprzejscia` VALUES ('1', '26', '10');
INSERT INTO `blokadaprzejscia` VALUES ('1', '27', '10');
INSERT INTO `blokadaprzejscia` VALUES ('1', '28', '11');
INSERT INTO `blokadaprzejscia` VALUES ('1', '29', '8');
INSERT INTO `blokadaprzejscia` VALUES ('1', '29', '9');
INSERT INTO `blokadaprzejscia` VALUES ('1', '3', '13');
INSERT INTO `blokadaprzejscia` VALUES ('1', '3', '14');

-- ----------------------------
-- Table structure for `chat`
-- ----------------------------
DROP TABLE IF EXISTS `chat`;
CREATE TABLE `chat` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `kto` varchar(100) COLLATE utf8_polish_ci NOT NULL,
  `tresc` text COLLATE utf8_polish_ci NOT NULL,
  `mapa_id` int(11) NOT NULL DEFAULT '0',
  `postac_id` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=379 DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci;

-- ----------------------------
-- Records of chat
-- ----------------------------

-- ----------------------------
-- Table structure for `grupa`
-- ----------------------------
DROP TABLE IF EXISTS `grupa`;
CREATE TABLE `grupa` (
  `grupa_id` int(11) NOT NULL DEFAULT '0',
  `postac_id` int(11) NOT NULL DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci;

-- ----------------------------
-- Records of grupa
-- ----------------------------

-- ----------------------------
-- Table structure for `mapa`
-- ----------------------------
DROP TABLE IF EXISTS `mapa`;
CREATE TABLE `mapa` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nazwa` varchar(75) COLLATE utf8_polish_ci NOT NULL,
  `pvp` tinyint(1) NOT NULL DEFAULT '0',
  `obrazek` varchar(250) COLLATE utf8_polish_ci NOT NULL DEFAULT 'mapy/',
  `maks_x` int(11) NOT NULL DEFAULT '10',
  `maks_y` int(11) NOT NULL DEFAULT '10',
  `dead_map` int(11) NOT NULL DEFAULT '1',
  `dead_x` int(11) NOT NULL DEFAULT '35',
  `dead_y` int(11) NOT NULL DEFAULT '35',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=124 DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci;

-- ----------------------------
-- Records of mapa
-- ----------------------------
INSERT INTO `mapa` VALUES ('2', 'Dom Siostr', '0', 'mapy/ith-dom-huslin.png', '15', '15', '1', '35', '35');
INSERT INTO `mapa` VALUES ('1', 'Ithan', '0', 'mapy/stare-ithan.png', '63', '95', '1', '35', '35');
INSERT INTO `mapa` VALUES ('3', 'Ratusz Ithan p.1', '0', 'mapy/ithan-ratusz-p1.png', '29', '16', '1', '35', '35');
INSERT INTO `mapa` VALUES ('4', 'Baraki p.1', '0', 'mapy/ith-baraki1.2.png', '19', '31', '1', '35', '35');
INSERT INTO `mapa` VALUES ('5', 'Zniszczone Opactwo', '0', 'mapy/zniszczone-opactwo.2.png', '63', '63', '1', '35', '35');
INSERT INTO `mapa` VALUES ('6', 'Uroczysko', '0', 'mapy/uroczysko.3.png', '95', '63', '1', '35', '35');
INSERT INTO `mapa` VALUES ('7', 'Wichrowe Szczyty', '0', 'mapy/wichrowe-szczyty.3.png', '95', '63', '1', '35', '35');
INSERT INTO `mapa` VALUES ('8', 'Przelecz Dwoch Koron', '0', 'mapy/przelecz-dwoch-koron.2.png', '95', '63', '1', '35', '35');
INSERT INTO `mapa` VALUES ('9', 'Przedmiescia Karka-Han', '0', 'mapy/karka-han-przedm.4.png', '95', '63', '1', '35', '35');
INSERT INTO `mapa` VALUES ('10', 'Karka-Han', '0', 'mapy/karka-han-t.png', '95', '63', '1', '35', '35');
INSERT INTO `mapa` VALUES ('11', 'Prastara Puszcza', '1', 'mapy/prastara-puszcza.png', '95', '63', '1', '35', '35');
INSERT INTO `mapa` VALUES ('12', 'Tygrysia Granica', '1', 'mapy/tygrysia-granica.png', '95', '63', '1', '35', '35');
INSERT INTO `mapa` VALUES ('13', 'Osada Zulusow', '3', 'mapy/dzika-osada.2.png', '95', '63', '1', '35', '35');
INSERT INTO `mapa` VALUES ('14', 'Skalista Wyzyna', '0', 'mapy/skalista-wyzyna.3.png', '95', '63', '1', '35', '35');
INSERT INTO `mapa` VALUES ('15', 'Brama Polnocy', '0', 'mapy/brama-polnocy.2.png', '95', '63', '16', '34', '24');
INSERT INTO `mapa` VALUES ('16', 'Werbin', '0', 'mapy/werbin.5.png', '63', '95', '1', '35', '35');
INSERT INTO `mapa` VALUES ('17', 'Las Goblinow', '1', 'mapy/las-goblinow.2.png', '95', '63', '16', '34', '24');
INSERT INTO `mapa` VALUES ('18', 'Morwowe Przejscie', '1', 'mapy/morwowe-przejscie.png', '63', '63', '16', '34', '24');
INSERT INTO `mapa` VALUES ('19', 'Podmokla Dolina', '1', 'mapy/podmokla-dolina.png', '95', '63', '16', '34', '24');
INSERT INTO `mapa` VALUES ('20', 'Jaskinia Lowcow', '0', 'mapy/ith-jask-lowcow1.png', '19', '19', '1', '35', '35');
INSERT INTO `mapa` VALUES ('21', 'Jaskinia Lowcow p.2', '0', 'mapy/ith-jask-lowcow2.png', '19', '19', '1', '35', '35');
INSERT INTO `mapa` VALUES ('22', 'Stary Magazyn', '0', 'mapy/stary-magazyn-p0.png', '19', '15', '1', '35', '35');
INSERT INTO `mapa` VALUES ('23', 'Stary Magazyn - Piwnica', '0', 'mapy/stary-magazyn-piw.png', '19', '15', '1', '35', '35');
INSERT INTO `mapa` VALUES ('24', 'Pieczara Pajeczyn p.1', '0', 'mapy/ithan-mag-jask1.png', '31', '31', '1', '35', '35');
INSERT INTO `mapa` VALUES ('25', 'Pieczara Pajeczyn p.2', '0', 'mapy/ithan-mag-jask2.png', '63', '63', '1', '31', '37');
INSERT INTO `mapa` VALUES ('26', 'Pieczara Pajeczyn p.3', '0', 'mapy/ithan-mag-jask3.png', '47', '47', '1', '35', '35');
INSERT INTO `mapa` VALUES ('27', 'Pieczara Pajeczyn p.4', '0', 'mapy/ithan-mag-jask4.png', '63', '63', '1', '35', '35');
INSERT INTO `mapa` VALUES ('28', 'Dom Eldrika', '0', 'mapy/ithan-dom-eldrik.png', '15', '15', '1', '35', '35');
INSERT INTO `mapa` VALUES ('29', 'Opactwo', '0', 'mapy/opactwo.2.png', '15', '15', '1', '35', '35');
INSERT INTO `mapa` VALUES ('30', 'Opactwo - Piwnica', '0', 'mapy/opac-piwnica.2.png', '31', '31', '1', '35', '35');
INSERT INTO `mapa` VALUES ('31', 'Opactwo p.1', '0', 'mapy/opactwo1.2.png', '15', '15', '1', '35', '35');
INSERT INTO `mapa` VALUES ('32', 'Podmokła Grota', '1', 'mapy/zniszcz-opactwo-jaskinia.png', '63', '63', '1', '35', '35');
INSERT INTO `mapa` VALUES ('33', 'Podziemne Przejście p.1', '0', 'mapy/ws-przejscie-p1.2.png', '19', '15', '1', '35', '35');
INSERT INTO `mapa` VALUES ('34', 'Podziemne Przejście p.2', '0', 'mapy/ws-przejscie-p2.2.png', '19', '15', '1', '35', '35');
INSERT INTO `mapa` VALUES ('35', 'Podziemne Przejście p.3', '0', 'mapy/ws-przejscie-p3.2.png', '19', '15', '1', '35', '35');
INSERT INTO `mapa` VALUES ('36', 'Podziemne Przejście p.4', '0', 'mapy/ws-przejscie-p4.3.png', '19', '15', '1', '35', '35');
INSERT INTO `mapa` VALUES ('37', 'Podziemne Przejście p.4 - Sala 2', '0', 'mapy/ws-przejscie-p4-s2.3.png', '26', '15', '1', '35', '35');
INSERT INTO `mapa` VALUES ('38', 'Podziemne Przejście p.4 - Sala 3', '0', 'mapy/ws-przejscie-p4-s3.3.png', '19', '15', '1', '35', '35');
INSERT INTO `mapa` VALUES ('39', 'Podziemne Przejście p.5', '0', 'mapy/ws-przejscie-p5.2.png', '19', '15', '1', '35', '35');
INSERT INTO `mapa` VALUES ('40', 'Podziemne Przejście p.6 - Sala 1', '0', 'mapy/ws-przejscie-p6-sw.2.png', '19', '15', '1', '35', '35');
INSERT INTO `mapa` VALUES ('41', 'Podziemne Przejście p.6 - Sala 2', '0', 'mapy/ws-przejscie-p6-s2.2.png', '19', '15', '1', '35', '35');
INSERT INTO `mapa` VALUES ('42', 'Podziemne Przejście p.6 - Sala 3', '0', 'mapy/ws-przejscie-p6-s3.2.png', '19', '15', '1', '35', '35');
INSERT INTO `mapa` VALUES ('43', 'Podziemne Przejście p.6 - Sala 4', '0', 'mapy/ws-przejscie-p6-s4.2.png', '19', '15', '1', '35', '35');
INSERT INTO `mapa` VALUES ('44', 'Szczurza Siedziba', '0', 'mapy/ws-przejscie-sw.2.png', '15', '15', '1', '35', '35');
INSERT INTO `mapa` VALUES ('45', 'Góry Zrębowe', '0', 'mapy/gory-zrebowe.3.png', '63', '95', '16', '34', '24');
INSERT INTO `mapa` VALUES ('46', 'Solna Grota p.1', '1', 'mapy/solna_grota.p1.png', '16', '15', '16', '34', '24');
INSERT INTO `mapa` VALUES ('47', 'Solna Grota p.2', '1', 'mapy/solna_grota.p2.png', '31', '15', '16', '34', '24');
INSERT INTO `mapa` VALUES ('48', 'Zburzona Twierdza', '1', 'mapy/zburzona-twierdza.2.png', '63', '63', '1', '35', '37');
INSERT INTO `mapa` VALUES ('49', 'Świszcząca Grota p.1', '1', 'mapy/swiszczaca-grota-p1.2.png', '19', '15', '1', '35', '37');
INSERT INTO `mapa` VALUES ('50', 'Świszcząca Grota p.2', '1', 'mapy/swiszczaca-grota-p2.2.png', '19', '15', '1', '35', '37');
INSERT INTO `mapa` VALUES ('51', 'Świszcząca Grota p.3', '1', 'mapy/swiszczaca-grota-p3.2.png', '29', '31', '1', '35', '37');
INSERT INTO `mapa` VALUES ('52', 'Świszcząca Grota p.4', '1', 'mapy/swiszczaca-grota-p4.png', '19', '15', '1', '35', '37');
INSERT INTO `mapa` VALUES ('53', 'Dolina Yss', '0', 'mapy/dolina-yss.4.png', '63', '95', '1', '35', '37');

-- ----------------------------
-- Table structure for `mapa_przenies`
-- ----------------------------
DROP TABLE IF EXISTS `mapa_przenies`;
CREATE TABLE `mapa_przenies` (
  `nazwa_mapy` varchar(55) COLLATE utf8_polish_ci NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mapa` int(11) NOT NULL DEFAULT '0',
  `x` int(11) NOT NULL DEFAULT '0',
  `y` int(11) NOT NULL DEFAULT '0',
  `do_mapa` int(11) NOT NULL DEFAULT '0',
  `do_x` int(11) NOT NULL DEFAULT '0',
  `do_y` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=174 DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci;

-- ----------------------------
-- Records of mapa_przenies
-- ----------------------------
INSERT INTO `mapa_przenies` VALUES ('', '4', '1', '19', '11', '3', '14', '12');
INSERT INTO `mapa_przenies` VALUES ('ithan', '1', '2', '9', '11', '1', '8', '12');
INSERT INTO `mapa_przenies` VALUES ('', '2', '2', '8', '11', '1', '8', '12');
INSERT INTO `mapa_przenies` VALUES ('', '3', '1', '8', '12', '2', '8', '11');
INSERT INTO `mapa_przenies` VALUES ('', '5', '1', '20', '11', '3', '15', '12');
INSERT INTO `mapa_przenies` VALUES ('', '6', '3', '14', '12', '1', '19', '11');
INSERT INTO `mapa_przenies` VALUES ('', '7', '3', '15', '12', '1', '20', '11');
INSERT INTO `mapa_przenies` VALUES ('', '8', '1', '40', '16', '4', '5', '30');
INSERT INTO `mapa_przenies` VALUES ('', '9', '4', '5', '30', '1', '40', '16');
INSERT INTO `mapa_przenies` VALUES ('', '10', '1', '41', '16', '4', '6', '30');
INSERT INTO `mapa_przenies` VALUES ('', '11', '4', '6', '30', '1', '41', '16');
INSERT INTO `mapa_przenies` VALUES ('', '12', '1', '18', '95', '5', '35', '0');
INSERT INTO `mapa_przenies` VALUES ('', '13', '1', '19', '95', '5', '36', '0');
INSERT INTO `mapa_przenies` VALUES ('', '14', '1', '20', '95', '5', '37', '0');
INSERT INTO `mapa_przenies` VALUES ('', '15', '1', '21', '95', '5', '38', '0');
INSERT INTO `mapa_przenies` VALUES ('', '16', '1', '22', '95', '5', '39', '0');
INSERT INTO `mapa_przenies` VALUES ('', '17', '5', '35', '0', '1', '18', '95');
INSERT INTO `mapa_przenies` VALUES ('', '18', '5', '36', '0', '1', '19', '95');
INSERT INTO `mapa_przenies` VALUES ('', '19', '5', '37', '0', '1', '20', '95');
INSERT INTO `mapa_przenies` VALUES ('', '20', '5', '38', '0', '1', '21', '95');
INSERT INTO `mapa_przenies` VALUES ('', '21', '5', '39', '0', '1', '22', '95');
INSERT INTO `mapa_przenies` VALUES ('', '22', '5', '0', '38', '6', '95', '38');
INSERT INTO `mapa_przenies` VALUES ('', '23', '5', '0', '39', '6', '95', '39');
INSERT INTO `mapa_przenies` VALUES ('', '24', '6', '95', '38', '5', '0', '38');
INSERT INTO `mapa_przenies` VALUES ('', '25', '6', '95', '39', '5', '0', '39');
INSERT INTO `mapa_przenies` VALUES ('', '26', '6', '0', '37', '7', '95', '37');
INSERT INTO `mapa_przenies` VALUES ('', '27', '6', '0', '36', '7', '95', '36');
INSERT INTO `mapa_przenies` VALUES ('', '28', '7', '95', '37', '6', '0', '37');
INSERT INTO `mapa_przenies` VALUES ('', '29', '7', '0', '37', '8', '95', '37');
INSERT INTO `mapa_przenies` VALUES ('', '30', '7', '0', '38', '8', '95', '38');
INSERT INTO `mapa_przenies` VALUES ('', '31', '8', '95', '37', '7', '0', '37');
INSERT INTO `mapa_przenies` VALUES ('', '32', '8', '95', '38', '7', '0', '38');
INSERT INTO `mapa_przenies` VALUES ('', '33', '8', '38', '0', '9', '38', '63');
INSERT INTO `mapa_przenies` VALUES ('', '34', '8', '39', '0', '9', '39', '63');
INSERT INTO `mapa_przenies` VALUES ('', '35', '8', '40', '0', '9', '40', '63');
INSERT INTO `mapa_przenies` VALUES ('', '36', '8', '41', '0', '9', '41', '63');
INSERT INTO `mapa_przenies` VALUES ('', '37', '9', '38', '63', '8', '38', '0');
INSERT INTO `mapa_przenies` VALUES ('', '38', '9', '39', '63', '8', '39', '0');
INSERT INTO `mapa_przenies` VALUES ('', '39', '9', '40', '63', '8', '40', '0');
INSERT INTO `mapa_przenies` VALUES ('', '40', '9', '41', '63', '8', '41', '0');
INSERT INTO `mapa_przenies` VALUES ('', '41', '9', '57', '0', '10', '57', '63');
INSERT INTO `mapa_przenies` VALUES ('', '42', '9', '58', '0', '10', '58', '63');
INSERT INTO `mapa_przenies` VALUES ('', '43', '10', '57', '63', '9', '57', '0');
INSERT INTO `mapa_przenies` VALUES ('', '44', '10', '58', '63', '9', '58', '0');
INSERT INTO `mapa_przenies` VALUES ('', '45', '10', '59', '63', '9', '59', '0');
INSERT INTO `mapa_przenies` VALUES ('', '46', '10', '60', '63', '9', '60', '0');
INSERT INTO `mapa_przenies` VALUES ('', '47', '9', '59', '0', '10', '59', '63');
INSERT INTO `mapa_przenies` VALUES ('', '48', '9', '60', '0', '10', '60', '63');
INSERT INTO `mapa_przenies` VALUES ('', '49', '10', '26', '4', '11', '26', '63');
INSERT INTO `mapa_przenies` VALUES ('', '50', '10', '27', '4', '11', '27', '63');
INSERT INTO `mapa_przenies` VALUES ('', '51', '11', '26', '63', '10', '26', '4');
INSERT INTO `mapa_przenies` VALUES ('', '52', '11', '27', '63', '10', '27', '4');
INSERT INTO `mapa_przenies` VALUES ('', '53', '11', '0', '22', '12', '95', '22');
INSERT INTO `mapa_przenies` VALUES ('', '54', '12', '95', '22', '11', '0', '22');
INSERT INTO `mapa_przenies` VALUES ('', '55', '12', '47', '63', '13', '47', '0');
INSERT INTO `mapa_przenies` VALUES ('', '56', '12', '48', '63', '13', '48', '0');
INSERT INTO `mapa_przenies` VALUES ('', '57', '12', '49', '63', '13', '49', '0');
INSERT INTO `mapa_przenies` VALUES ('', '58', '13', '47', '0', '12', '47', '63');
INSERT INTO `mapa_przenies` VALUES ('', '59', '13', '48', '0', '12', '48', '63');
INSERT INTO `mapa_przenies` VALUES ('', '60', '13', '49', '0', '12', '49', '63');
INSERT INTO `mapa_przenies` VALUES ('', '61', '8', '0', '30', '14', '95', '30');
INSERT INTO `mapa_przenies` VALUES ('', '62', '8', '0', '31', '14', '95', '31');
INSERT INTO `mapa_przenies` VALUES ('', '63', '8', '0', '32', '14', '95', '32');
INSERT INTO `mapa_przenies` VALUES ('', '64', '8', '0', '33', '14', '95', '33');
INSERT INTO `mapa_przenies` VALUES ('', '65', '14', '95', '30', '8', '0', '30');
INSERT INTO `mapa_przenies` VALUES ('', '66', '14', '95', '31', '8', '0', '31');
INSERT INTO `mapa_przenies` VALUES ('', '67', '14', '95', '32', '8', '0', '32');
INSERT INTO `mapa_przenies` VALUES ('', '68', '14', '95', '33', '8', '0', '33');
INSERT INTO `mapa_przenies` VALUES ('', '69', '14', '0', '31', '15', '95', '31');
INSERT INTO `mapa_przenies` VALUES ('', '70', '14', '0', '32', '15', '95', '32');
INSERT INTO `mapa_przenies` VALUES ('', '71', '15', '95', '31', '14', '0', '31');
INSERT INTO `mapa_przenies` VALUES ('', '72', '15', '95', '32', '14', '0', '32');
INSERT INTO `mapa_przenies` VALUES ('', '73', '15', '0', '53', '16', '63', '85');
INSERT INTO `mapa_przenies` VALUES ('', '74', '15', '0', '54', '16', '63', '86');
INSERT INTO `mapa_przenies` VALUES ('', '75', '16', '63', '85', '15', '0', '53');
INSERT INTO `mapa_przenies` VALUES ('', '76', '16', '63', '86', '15', '0', '54');
INSERT INTO `mapa_przenies` VALUES ('', '77', '16', '0', '70', '17', '95', '38');
INSERT INTO `mapa_przenies` VALUES ('', '78', '17', '95', '38', '16', '0', '70');
INSERT INTO `mapa_przenies` VALUES ('', '79', '17', '20', '0', '18', '21', '63');
INSERT INTO `mapa_przenies` VALUES ('', '80', '17', '21', '0', '18', '22', '63');
INSERT INTO `mapa_przenies` VALUES ('', '81', '18', '21', '63', '17', '20', '0');
INSERT INTO `mapa_przenies` VALUES ('', '82', '18', '22', '63', '17', '21', '0');
INSERT INTO `mapa_przenies` VALUES ('', '83', '18', '4', '0', '19', '18', '63');
INSERT INTO `mapa_przenies` VALUES ('', '84', '18', '5', '0', '19', '19', '63');
INSERT INTO `mapa_przenies` VALUES ('', '85', '18', '6', '0', '19', '20', '63');
INSERT INTO `mapa_przenies` VALUES ('', '86', '19', '18', '63', '18', '4', '0');
INSERT INTO `mapa_przenies` VALUES ('', '87', '19', '19', '63', '18', '5', '0');
INSERT INTO `mapa_przenies` VALUES ('', '88', '19', '20', '63', '18', '6', '0');
INSERT INTO `mapa_przenies` VALUES ('', '89', '1', '60', '8', '20', '15', '18');
INSERT INTO `mapa_przenies` VALUES ('', '90', '20', '15', '18', '1', '60', '8');
INSERT INTO `mapa_przenies` VALUES ('', '91', '20', '16', '18', '1', '60', '8');
INSERT INTO `mapa_przenies` VALUES ('', '92', '20', '9', '14', '21', '9', '15');
INSERT INTO `mapa_przenies` VALUES ('', '93', '21', '9', '15', '20', '9', '14');
INSERT INTO `mapa_przenies` VALUES ('', '94', '1', '16', '51', '22', '7', '13');
INSERT INTO `mapa_przenies` VALUES ('', '95', '1', '15', '51', '22', '6', '13');
INSERT INTO `mapa_przenies` VALUES ('', '96', '22', '6', '13', '1', '15', '51');
INSERT INTO `mapa_przenies` VALUES ('', '97', '22', '7', '13', '1', '16', '51');
INSERT INTO `mapa_przenies` VALUES ('', '98', '22', '9', '5', '23', '10', '7');
INSERT INTO `mapa_przenies` VALUES ('', '99', '23', '10', '7', '22', '9', '5');
INSERT INTO `mapa_przenies` VALUES ('', '100', '24', '14', '28', '23', '16', '5');
INSERT INTO `mapa_przenies` VALUES ('', '101', '23', '16', '5', '24', '14', '28');
INSERT INTO `mapa_przenies` VALUES ('', '102', '24', '4', '10', '25', '29', '57');
INSERT INTO `mapa_przenies` VALUES ('', '103', '25', '29', '57', '24', '4', '10');
INSERT INTO `mapa_przenies` VALUES ('', '104', '25', '40', '9', '26', '35', '5');
INSERT INTO `mapa_przenies` VALUES ('', '105', '26', '35', '5', '25', '40', '9');
INSERT INTO `mapa_przenies` VALUES ('', '106', '26', '4', '6', '27', '26', '12');
INSERT INTO `mapa_przenies` VALUES ('', '107', '27', '26', '12', '26', '4', '6');
INSERT INTO `mapa_przenies` VALUES ('', '108', '1', '17', '41', '28', '10', '8');
INSERT INTO `mapa_przenies` VALUES ('', '109', '28', '10', '8', '1', '17', '41');
INSERT INTO `mapa_przenies` VALUES ('', '110', '28', '10', '9', '1', '17', '41');
INSERT INTO `mapa_przenies` VALUES ('', '111', '5', '14', '17', '29', '1', '9');
INSERT INTO `mapa_przenies` VALUES ('', '112', '29', '1', '9', '5', '14', '17');
INSERT INTO `mapa_przenies` VALUES ('', '113', '29', '3', '5', '31', '3', '6');
INSERT INTO `mapa_przenies` VALUES ('', '114', '31', '3', '6', '29', '3', '5');
INSERT INTO `mapa_przenies` VALUES ('', '115', '29', '5', '10', '30', '20', '23');
INSERT INTO `mapa_przenies` VALUES ('', '116', '30', '20', '23', '29', '5', '10');
INSERT INTO `mapa_przenies` VALUES ('', '117', '5', '2', '50', '32', '50', '62');
INSERT INTO `mapa_przenies` VALUES ('', '118', '32', '50', '62', '5', '2', '50');
INSERT INTO `mapa_przenies` VALUES ('', '119', '7', '5', '29', '33', '6', '11');
INSERT INTO `mapa_przenies` VALUES ('', '120', '33', '6', '11', '7', '5', '29');
INSERT INTO `mapa_przenies` VALUES ('', '121', '33', '7', '11', '7', '5', '29');
INSERT INTO `mapa_przenies` VALUES ('', '122', '33', '8', '11', '7', '5', '29');
INSERT INTO `mapa_przenies` VALUES ('', '123', '33', '9', '11', '7', '5', '29');
INSERT INTO `mapa_przenies` VALUES ('', '124', '33', '5', '6', '34', '5', '6');
INSERT INTO `mapa_przenies` VALUES ('', '125', '34', '5', '6', '33', '5', '6');
INSERT INTO `mapa_przenies` VALUES ('', '126', '34', '15', '10', '35', '15', '11');
INSERT INTO `mapa_przenies` VALUES ('', '127', '35', '15', '11', '34', '15', '10');
INSERT INTO `mapa_przenies` VALUES ('', '128', '35', '7', '8', '36', '7', '8');
INSERT INTO `mapa_przenies` VALUES ('', '129', '36', '7', '8', '35', '7', '8');
INSERT INTO `mapa_przenies` VALUES ('', '130', '36', '3', '2', '37', '2', '14');
INSERT INTO `mapa_przenies` VALUES ('', '131', '37', '2', '14', '36', '3', '2');
INSERT INTO `mapa_przenies` VALUES ('', '132', '37', '11', '4', '38', '16', '14');
INSERT INTO `mapa_przenies` VALUES ('', '133', '38', '16', '14', '37', '11', '4');
INSERT INTO `mapa_przenies` VALUES ('', '134', '38', '15', '12', '39', '8', '6');
INSERT INTO `mapa_przenies` VALUES ('', '135', '39', '8', '6', '38', '15', '12');
INSERT INTO `mapa_przenies` VALUES ('', '136', '39', '1', '8', '40', '1', '8');
INSERT INTO `mapa_przenies` VALUES ('', '137', '40', '1', '8', '39', '1', '8');
INSERT INTO `mapa_przenies` VALUES ('', '138', '40', '16', '5', '41', '13', '14');
INSERT INTO `mapa_przenies` VALUES ('', '139', '41', '13', '14', '40', '16', '5');
INSERT INTO `mapa_przenies` VALUES ('', '140', '41', '3', '2', '42', '14', '14');
INSERT INTO `mapa_przenies` VALUES ('', '141', '42', '14', '14', '41', '3', '2');
INSERT INTO `mapa_przenies` VALUES ('', '142', '42', '3', '2', '43', '15', '14');
INSERT INTO `mapa_przenies` VALUES ('', '143', '43', '15', '14', '42', '3', '2');
INSERT INTO `mapa_przenies` VALUES ('', '144', '43', '9', '2', '44', '6', '3');
INSERT INTO `mapa_przenies` VALUES ('', '145', '44', '6', '3', '43', '9', '2');
INSERT INTO `mapa_przenies` VALUES ('', '146', '15', '13', '63', '45', '13', '0');
INSERT INTO `mapa_przenies` VALUES ('', '147', '45', '13', '0', '15', '13', '63');
INSERT INTO `mapa_przenies` VALUES ('', '148', '45', '22', '6', '46', '3', '10');
INSERT INTO `mapa_przenies` VALUES ('', '149', '46', '3', '10', '45', '22', '6');
INSERT INTO `mapa_przenies` VALUES ('', '150', '46', '14', '4', '47', '26', '3');
INSERT INTO `mapa_przenies` VALUES ('', '151', '47', '26', '3', '46', '14', '4');
INSERT INTO `mapa_przenies` VALUES ('', '152', '5', '12', '63', '48', '12', '0');
INSERT INTO `mapa_przenies` VALUES ('', '153', '5', '11', '63', '48', '11', '0');
INSERT INTO `mapa_przenies` VALUES ('', '154', '5', '10', '63', '48', '10', '0');
INSERT INTO `mapa_przenies` VALUES ('', '155', '48', '10', '0', '5', '10', '63');
INSERT INTO `mapa_przenies` VALUES ('', '156', '48', '11', '0', '5', '11', '63');
INSERT INTO `mapa_przenies` VALUES ('', '157', '48', '12', '0', '5', '12', '63');
INSERT INTO `mapa_przenies` VALUES ('', '158', '48', '7', '6', '49', '7', '13');
INSERT INTO `mapa_przenies` VALUES ('', '159', '49', '7', '13', '48', '7', '6');
INSERT INTO `mapa_przenies` VALUES ('', '160', '49', '8', '5', '50', '6', '3');
INSERT INTO `mapa_przenies` VALUES ('', '161', '50', '6', '3', '49', '8', '5');
INSERT INTO `mapa_przenies` VALUES ('', '162', '50', '4', '11', '48', '4', '14');
INSERT INTO `mapa_przenies` VALUES ('', '163', '48', '4', '14', '50', '4', '11');
INSERT INTO `mapa_przenies` VALUES ('', '164', '50', '15', '12', '51', '11', '2');
INSERT INTO `mapa_przenies` VALUES ('', '165', '51', '11', '2', '50', '15', '12');
INSERT INTO `mapa_przenies` VALUES ('', '166', '51', '5', '27', '48', '2', '36');
INSERT INTO `mapa_przenies` VALUES ('', '167', '48', '2', '36', '51', '5', '27');
INSERT INTO `mapa_przenies` VALUES ('', '168', '51', '25', '14', '52', '7', '11');
INSERT INTO `mapa_przenies` VALUES ('', '169', '52', '7', '11', '51', '25', '14');
INSERT INTO `mapa_przenies` VALUES ('', '170', '1', '63', '87', '53', '0', '87');
INSERT INTO `mapa_przenies` VALUES ('', '171', '53', '0', '87', '1', '63', '87');
INSERT INTO `mapa_przenies` VALUES ('', '172', '1', '63', '88', '53', '0', '88');
INSERT INTO `mapa_przenies` VALUES ('', '173', '53', '0', '88', '1', '63', '88');

-- ----------------------------
-- Table structure for `mob`
-- ----------------------------
DROP TABLE IF EXISTS `mob`;
CREATE TABLE `mob` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `obrazek` varchar(500) COLLATE utf8_polish_ci NOT NULL DEFAULT 'mob/',
  `mapa` int(11) NOT NULL DEFAULT '0',
  `x` int(11) NOT NULL DEFAULT '0',
  `y` int(11) NOT NULL DEFAULT '0',
  `nazwa` varchar(100) COLLATE utf8_polish_ci NOT NULL,
  `poziom` int(11) NOT NULL DEFAULT '0',
  `typ` int(11) NOT NULL DEFAULT '0',
  `szerokosc` int(11) NOT NULL DEFAULT '32',
  `dlugosc` int(11) NOT NULL DEFAULT '48',
  `zycie` int(11) NOT NULL DEFAULT '0',
  `zycie_max` int(11) NOT NULL DEFAULT '0',
  `sa` int(11) NOT NULL DEFAULT '100',
  `ac` int(11) NOT NULL DEFAULT '0',
  `acm` int(11) NOT NULL DEFAULT '0',
  `acp` int(11) NOT NULL DEFAULT '0',
  `ck` int(11) NOT NULL DEFAULT '0',
  `ckf` int(11) NOT NULL DEFAULT '120',
  `ckm` int(11) NOT NULL DEFAULT '120',
  `przebicie` int(11) NOT NULL DEFAULT '0',
  `obr_min` int(11) NOT NULL DEFAULT '0',
  `obr_max` int(11) NOT NULL DEFAULT '0',
  `profesja` tinyint(1) NOT NULL DEFAULT '1',
  `obr_mag` int(11) NOT NULL DEFAULT '0',
  `obr_poi` int(11) NOT NULL DEFAULT '0',
  `sila` int(11) NOT NULL DEFAULT '1',
  `zrecznosc` int(11) NOT NULL DEFAULT '1',
  `intelekt` int(11) NOT NULL DEFAULT '1',
  `absorbcja` int(11) NOT NULL DEFAULT '0',
  `mabsorbcja` int(11) NOT NULL DEFAULT '0',
  `unik` smallint(3) NOT NULL DEFAULT '0',
  `blok` smallint(3) NOT NULL DEFAULT '0',
  `exp` int(11) NOT NULL DEFAULT '0',
  `respawn_time` int(11) NOT NULL DEFAULT '0',
  `respawn` double(20,0) NOT NULL DEFAULT '0',
  `grupa` int(11) NOT NULL DEFAULT '0',
  `obnizac` int(11) NOT NULL DEFAULT '0',
  `obnizacm` int(11) NOT NULL DEFAULT '0',
  `obnizsa` int(11) NOT NULL DEFAULT '0',
  `paczka` int(11) NOT NULL DEFAULT '0',
  `paczka2` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=545 DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci;

-- ----------------------------
-- Records of mob
-- ----------------------------
INSERT INTO `mob` VALUES ('2', 'mob/krolik.gif', '1', '58', '58', 'Krolik', '1', '0', '24', '16', '15', '15', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '5', '10', '1351259675', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('1', 'mob/krolik.gif', '1', '62', '59', 'Krolik', '1', '0', '24', '16', '15', '15', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '5', '10', '1351259663', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('3', 'mob/krolik.gif', '1', '59', '62', 'Krolik', '1', '0', '24', '16', '15', '15', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '5', '10', '1352043747', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('4', 'mob/krolik.gif', '1', '59', '65', 'Krolik', '1', '0', '24', '16', '15', '15', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '5', '10', '1352043735', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('5', 'mob/krolik.gif', '1', '50', '60', 'Krolik', '1', '0', '24', '16', '15', '15', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '5', '10', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('6', 'mob/krolik.gif', '1', '56', '66', 'Krolik', '1', '0', '24', '16', '15', '15', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '5', '10', '1352043729', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('7', 'mob/krolik.gif', '1', '62', '62', 'Krolik', '1', '0', '24', '16', '15', '15', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '5', '10', '1351259727', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('8', 'mob/zajac.gif', '1', '40', '93', 'Zajac', '1', '0', '18', '24', '15', '15', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '5', '10', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('9', 'mob/zajac.gif', '1', '59', '93', 'Zajac', '2', '0', '18', '24', '35', '35', '100', '1', '0', '0', '0', '120', '120', '0', '0', '3', '1', '0', '0', '2', '2', '2', '0', '0', '0', '0', '9', '20', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('10', 'mob/pajak.gif', '1', '1', '44', 'Pajak', '1', '0', '32', '32', '15', '15', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '5', '10', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('11', 'mob/pajak.gif', '1', '6', '39', 'Pajak', '1', '0', '32', '32', '15', '15', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '5', '10', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('12', 'mob/pajak.gif', '1', '42', '87', 'Pajak', '1', '0', '32', '32', '15', '15', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '5', '10', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('13', 'mob/pajak.gif', '1', '48', '93', 'Pajak', '1', '0', '32', '32', '15', '15', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '5', '10', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('14', 'mob/pancernik1.gif', '1', '51', '75', 'Mlody Pancernik', '10', '0', '32', '18', '375', '375', '111', '22', '11', '4', '0', '120', '120', '0', '5', '15', '1', '0', '0', '10', '10', '10', '0', '0', '0', '0', '80', '100', '1351325203', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('15', 'mob/pancernik2.gif', '1', '47', '73', 'Mlody Pancernik', '10', '0', '32', '18', '375', '375', '111', '22', '11', '4', '0', '120', '120', '0', '5', '15', '1', '0', '0', '10', '10', '10', '0', '0', '0', '0', '80', '100', '1351325192', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('16', 'mob/pancernik3.gif', '1', '47', '73', 'Pancernik Rogaty', '15', '0', '36', '22', '750', '750', '115', '52', '26', '10', '0', '120', '120', '0', '19', '27', '1', '0', '0', '15', '15', '15', '0', '0', '0', '0', '240', '150', '1351325238', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('17', 'mob/szczur1.gif', '1', '56', '23', 'Szczur Zbozowy', '14', '0', '32', '48', '665', '665', '114', '45', '22', '9', '0', '120', '120', '0', '19', '33', '1', '0', '0', '14', '14', '14', '0', '0', '0', '0', '70', '140', '1351789479', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('18', 'mob/szczur2.gif', '1', '50', '26', 'Szczurzy Krol', '17', '0', '32', '48', '935', '935', '117', '68', '34', '13', '0', '120', '120', '0', '29', '47', '1', '0', '0', '17', '17', '17', '0', '0', '0', '0', '85', '170', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('19', 'mob/szczur3.gif', '1', '56', '25', 'Szczurzy Wojownik', '16', '0', '32', '48', '840', '840', '116', '60', '30', '12', '0', '120', '120', '0', '30', '38', '1', '0', '0', '16', '16', '16', '0', '0', '0', '0', '80', '160', '1351789513', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('20', 'mob/szczur.gif', '1', '53', '26', 'Szczur Piwniczy', '15', '0', '32', '48', '750', '750', '115', '52', '26', '10', '0', '120', '120', '0', '20', '40', '1', '0', '0', '15', '15', '15', '0', '0', '0', '0', '75', '150', '1351789545', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('21', 'mob/szczur.gif', '20', '16', '14', 'Szczur Piwniczy', '13', '0', '32', '48', '585', '585', '113', '39', '19', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '13', '13', '13', '0', '0', '0', '0', '65', '130', '1351789204', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('22', 'mob/szczur.gif', '20', '4', '17', 'Szczur Piwniczy', '13', '0', '32', '48', '585', '585', '113', '39', '19', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '13', '13', '13', '0', '0', '0', '0', '65', '130', '1351789239', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('23', 'mob/szczur.gif', '21', '8', '4', 'Szczur Piwniczy', '13', '0', '32', '48', '585', '585', '113', '39', '19', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '13', '13', '13', '0', '0', '0', '0', '65', '130', '1351789132', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('24', 'mob/szczur.gif', '21', '1', '5', 'Szczur Piwniczy', '13', '0', '32', '48', '585', '585', '113', '39', '19', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '13', '13', '13', '0', '0', '0', '0', '65', '130', '1351789119', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('25', 'mob/szczur.gif', '21', '16', '6', 'Szczur Piwniczy', '13', '0', '32', '48', '585', '585', '113', '39', '19', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '13', '13', '13', '0', '0', '0', '0', '65', '130', '1351789148', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('26', 'mob/szczur.gif', '21', '12', '11', 'Szczur Piwniczy', '13', '0', '32', '48', '585', '585', '113', '39', '19', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '13', '13', '13', '0', '0', '0', '0', '65', '130', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('27', 'mob/szczur.gif', '21', '2', '18', 'Szczur Piwniczy', '13', '0', '32', '48', '585', '585', '113', '39', '19', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '13', '13', '13', '0', '0', '0', '0', '65', '130', '1351789038', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('28', 'mob/duzy-pajak.gif', '24', '8', '25', 'Duzy Pajak', '8', '0', '32', '32', '260', '260', '108', '28', '14', '5', '0', '120', '120', '0', '15', '21', '1', '0', '0', '8', '8', '8', '0', '0', '0', '0', '40', '80', '1351716448', '0', '0', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('29', 'mob/duzy-pajak.gif', '24', '16', '27', 'Duzy Pajak', '8', '0', '32', '32', '260', '260', '108', '28', '14', '5', '0', '120', '120', '0', '15', '21', '1', '0', '0', '8', '8', '8', '0', '0', '0', '0', '40', '80', '1351790320', '0', '0', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('30', 'mob/duzy-pajak.gif', '24', '4', '21', 'Duzy Pajak', '8', '0', '32', '32', '260', '260', '108', '28', '14', '5', '0', '120', '120', '0', '15', '21', '1', '0', '0', '8', '8', '8', '0', '0', '0', '0', '40', '80', '1351716435', '0', '0', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('31', 'mob/duzy-pajak.gif', '24', '8', '19', 'Duzy Pajak', '8', '0', '32', '32', '260', '260', '108', '28', '14', '5', '0', '120', '120', '0', '15', '21', '1', '0', '0', '8', '8', '8', '0', '0', '0', '0', '40', '80', '1351716424', '0', '0', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('32', 'mob/duzy-pajak.gif', '24', '11', '5', 'Duzy Pajak', '8', '0', '32', '32', '260', '260', '108', '28', '14', '5', '0', '120', '120', '0', '15', '21', '1', '0', '0', '8', '8', '8', '0', '0', '0', '0', '40', '80', '1351716399', '0', '0', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('33', 'mob/pajak-krzyzak.gif', '24', '22', '22', 'Pajak Krzyzak', '9', '0', '32', '32', '315', '315', '109', '36', '18', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '9', '9', '9', '0', '0', '0', '0', '45', '90', '1351790356', '0', '0', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('34', 'mob/pajak-krzyzak.gif', '24', '21', '14', 'Pajak Krzyzak', '9', '0', '32', '32', '315', '315', '109', '36', '18', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '9', '9', '9', '0', '0', '0', '0', '45', '90', '1351790381', '0', '0', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('35', 'mob/pajak-krzyzak.gif', '24', '24', '7', 'Pajak Krzyzak', '9', '0', '32', '32', '315', '315', '109', '36', '18', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '9', '9', '9', '0', '0', '0', '0', '45', '90', '1351716387', '0', '0', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('36', 'mob/pajak-krzyzak.gif', '24', '17', '8', 'Pajak Krzyzak', '9', '0', '32', '32', '315', '315', '109', '36', '18', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '9', '9', '9', '0', '0', '0', '0', '45', '90', '1351790399', '0', '0', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('37', 'mob/pajak.gif', '22', '5', '11', 'Pajak', '1', '0', '32', '32', '15', '15', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '5', '10', '1351786717', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('38', 'mob/pajak.gif', '22', '3', '7', 'Pajak', '1', '0', '32', '32', '15', '15', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '5', '10', '1351786781', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('39', 'mob/pajak.gif', '22', '5', '5', 'Pajak', '1', '0', '32', '32', '15', '15', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '5', '10', '1351786835', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('40', 'mob/pajak.gif', '22', '2', '3', 'Pajak', '1', '0', '32', '32', '15', '15', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '5', '10', '1351711794', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('41', 'mob/pajak.gif', '22', '13', '11', 'Pajak', '1', '0', '32', '32', '15', '15', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '5', '10', '1351787638', '22001', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('42', 'mob/pajak.gif', '22', '17', '8', 'Pajak', '1', '0', '32', '32', '15', '15', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '5', '10', '1351787638', '22001', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('43', 'mob/pajak.gif', '22', '16', '5', 'Pajak', '1', '0', '32', '32', '15', '15', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '5', '10', '1351787757', '22002', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('44', 'mob/pajak.gif', '22', '14', '4', 'Pajak', '1', '0', '32', '32', '15', '15', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '5', '10', '1351787757', '22002', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('45', 'mob/pajak.gif', '22', '14', '5', 'Pajak', '1', '0', '32', '32', '15', '15', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '5', '10', '1351787757', '22002', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('102', 'mob/heroes/zulek.gif', '27', '34', '4', 'Mietek Zul', '25', '4', '32', '64', '7500', '7500', '125', '250', '250', '50', '5', '125', '125', '0', '-42', '42', '1', '0', '0', '250', '125', '125', '0', '0', '5', '0', '1875', '7200', '0', '27001', '25', '0', '0', '3', '0');
INSERT INTO `mob` VALUES ('46', 'mob/nocny-pajak.gif', '25', '48', '11', 'Nocny Pajak', '4', '0', '32', '32', '90', '90', '104', '6', '3', '1', '0', '120', '120', '0', '4', '6', '1', '0', '0', '4', '4', '4', '0', '0', '0', '0', '20', '40', '0', '0', '0', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('47', 'mob/nocny-pajak.gif', '25', '44', '6', 'Nocny Pajak', '4', '0', '32', '32', '90', '90', '104', '6', '3', '1', '0', '120', '120', '0', '4', '6', '1', '0', '0', '4', '4', '4', '0', '0', '0', '0', '20', '40', '0', '0', '0', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('48', 'mob/c-pajak.gif', '25', '25', '55', 'Czerwony Pajak', '20', '0', '32', '32', '1000', '1000', '120', '47', '95', '19', '0', '120', '120', '0', '0', '0', '6', '105', '0', '0', '20', '20', '95', '47', '0', '0', '100', '200', '1351965902', '0', '0', '0', '10', '2', '0');
INSERT INTO `mob` VALUES ('49', 'mob/c-pajak.gif', '25', '17', '43', 'Czerwony Pajak', '20', '0', '32', '32', '1000', '1000', '120', '47', '95', '19', '0', '120', '120', '0', '0', '0', '6', '105', '0', '0', '20', '20', '95', '47', '0', '0', '100', '200', '0', '0', '0', '0', '10', '2', '0');
INSERT INTO `mob` VALUES ('50', 'mob/c-pajak.gif', '25', '39', '43', 'Czerwony Pajak', '20', '0', '32', '32', '1000', '1000', '120', '47', '95', '19', '0', '120', '120', '0', '0', '0', '6', '105', '0', '0', '20', '20', '95', '47', '0', '0', '100', '200', '0', '0', '0', '0', '10', '2', '0');
INSERT INTO `mob` VALUES ('51', 'mob/c-pajak.gif', '25', '3', '29', 'Czerwony Pajak', '20', '0', '32', '32', '1000', '1000', '120', '47', '95', '19', '0', '120', '120', '0', '0', '0', '6', '105', '0', '0', '20', '20', '95', '47', '0', '0', '100', '200', '0', '0', '0', '0', '10', '2', '0');
INSERT INTO `mob` VALUES ('52', 'mob/c-pajak.gif', '25', '15', '23', 'Czerwony Pajak', '20', '0', '32', '32', '1000', '1000', '120', '47', '95', '19', '0', '120', '120', '0', '0', '0', '6', '105', '0', '0', '20', '20', '95', '47', '0', '0', '100', '200', '0', '0', '0', '0', '10', '2', '0');
INSERT INTO `mob` VALUES ('53', 'mob/c-pajak.gif', '25', '5', '11', 'Czerwony Pajak', '20', '0', '32', '32', '1000', '1000', '120', '47', '95', '19', '0', '120', '120', '0', '0', '0', '6', '105', '0', '0', '20', '20', '95', '47', '0', '0', '100', '200', '0', '0', '0', '0', '10', '2', '0');
INSERT INTO `mob` VALUES ('54', 'mob/c-pajak.gif', '25', '38', '24', 'Czerwony Pajak', '20', '0', '32', '32', '1000', '1000', '120', '47', '95', '19', '0', '120', '120', '0', '0', '0', '6', '105', '0', '0', '20', '20', '95', '47', '0', '0', '100', '200', '0', '0', '0', '0', '10', '2', '0');
INSERT INTO `mob` VALUES ('55', 'mob/t-pajak.gif', '25', '32', '50', 'Trujacy Pajak', '22', '0', '32', '32', '1310', '1310', '144', '86', '86', '46', '0', '120', '120', '3', '63', '63', '4', '0', '63', '14', '38', '14', '0', '0', '2', '0', '110', '220', '0', '0', '11', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('56', 'mob/t-pajak.gif', '25', '4', '55', 'Trujacy Pajak', '22', '0', '32', '32', '1310', '1310', '144', '86', '86', '46', '0', '120', '120', '3', '63', '63', '4', '0', '63', '14', '38', '14', '0', '0', '2', '0', '110', '220', '0', '0', '11', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('57', 'mob/t-pajak.gif', '25', '3', '44', 'Trujacy Pajak', '22', '0', '32', '32', '1310', '1310', '144', '86', '86', '46', '0', '120', '120', '3', '63', '63', '4', '0', '63', '14', '38', '14', '0', '0', '2', '0', '110', '220', '0', '0', '11', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('58', 'mob/t-pajak.gif', '25', '56', '12', 'Trujacy Pajak', '22', '0', '32', '32', '1310', '1310', '144', '86', '86', '46', '0', '120', '120', '3', '63', '63', '4', '0', '63', '14', '38', '14', '0', '0', '2', '0', '110', '220', '0', '0', '11', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('59', 'mob/t-pajak.gif', '25', '29', '17', 'Trujacy Pajak', '22', '0', '32', '32', '1310', '1310', '144', '86', '86', '46', '0', '120', '120', '3', '63', '63', '4', '0', '63', '14', '38', '14', '0', '0', '2', '0', '110', '220', '0', '0', '11', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('60', 'mob/t-pajak.gif', '25', '40', '32', 'Trujacy Pajak', '22', '0', '32', '32', '1310', '1310', '144', '86', '86', '46', '0', '120', '120', '3', '63', '63', '4', '0', '63', '14', '38', '14', '0', '0', '2', '0', '110', '220', '0', '0', '11', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('61', 'mob/t-pajak.gif', '25', '52', '24', 'Trujacy Pajak', '22', '0', '32', '32', '1310', '1310', '144', '86', '86', '46', '0', '120', '120', '3', '63', '63', '4', '0', '63', '14', '38', '14', '0', '0', '2', '0', '110', '220', '0', '0', '11', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('62', 'mob/t-pajak.gif', '25', '44', '52', 'Trujacy Pajak', '22', '0', '32', '32', '1310', '1310', '144', '86', '86', '46', '0', '120', '120', '3', '63', '63', '4', '0', '63', '14', '38', '14', '0', '0', '2', '0', '110', '220', '0', '0', '11', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('63', 'mob/t-pajak.gif', '25', '31', '7', 'Trujacy Pajak', '22', '0', '32', '32', '1310', '1310', '144', '86', '86', '46', '0', '120', '120', '3', '63', '63', '4', '0', '63', '14', '38', '14', '0', '0', '2', '0', '110', '220', '0', '0', '11', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('101', 'mob/heroes/zulek.gif', '27', '31', '5', 'Mietek Zul', '25', '4', '32', '64', '7500', '7500', '125', '250', '250', '50', '5', '125', '125', '0', '-42', '42', '1', '0', '0', '250', '125', '125', '0', '0', '5', '0', '1875', '7200', '0', '27001', '25', '0', '0', '3', '0');
INSERT INTO `mob` VALUES ('64', 'mob/pajak-krzyzak.gif', '26', '39', '19', 'Pajak Krzyzak', '9', '0', '32', '32', '315', '315', '109', '36', '18', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '9', '9', '9', '0', '0', '0', '0', '45', '90', '0', '0', '0', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('65', 'mob/pajak-krzyzak.gif', '26', '39', '19', 'Pajak Krzyzak', '9', '0', '32', '32', '315', '315', '109', '36', '18', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '9', '9', '9', '0', '0', '0', '0', '45', '90', '0', '0', '0', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('66', 'mob/pajak-krzyzak.gif', '26', '17', '19', 'Pajak Krzyzak', '9', '0', '32', '32', '315', '315', '109', '36', '18', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '9', '9', '9', '0', '0', '0', '0', '45', '90', '0', '0', '0', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('67', 'mob/pajak-krzyzak.gif', '26', '28', '22', 'Pajak Krzyzak', '9', '0', '32', '32', '315', '315', '109', '36', '18', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '9', '9', '9', '0', '0', '0', '0', '45', '90', '0', '0', '0', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('68', 'mob/pajak-krzyzak.gif', '26', '38', '30', 'Pajak Krzyzak', '9', '0', '32', '32', '315', '315', '109', '36', '18', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '9', '9', '9', '0', '0', '0', '0', '45', '90', '0', '0', '0', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('69', 'mob/pajak-krzyzak.gif', '26', '6', '23', 'Pajak Krzyzak', '9', '0', '32', '32', '315', '315', '109', '36', '18', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '9', '9', '9', '0', '0', '0', '0', '45', '90', '0', '0', '0', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('70', 'mob/pajak-krzyzak.gif', '26', '4', '41', 'Pajak Krzyzak', '9', '0', '32', '32', '315', '315', '109', '36', '18', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '9', '9', '9', '0', '0', '0', '0', '45', '90', '0', '0', '0', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('71', 'mob/pajak-krzyzak.gif', '26', '17', '40', 'Pajak Krzyzak', '9', '0', '32', '32', '315', '315', '109', '36', '18', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '9', '9', '9', '0', '0', '0', '0', '45', '90', '0', '0', '0', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('72', 'mob/pajak-krzyzak.gif', '26', '9', '7', 'Pajak Krzyzak', '9', '0', '32', '32', '315', '315', '109', '36', '18', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '9', '9', '9', '0', '0', '0', '0', '45', '90', '0', '0', '0', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('73', 'mob/c-pajak.gif', '26', '20', '12', 'Czerwony Pajak', '20', '0', '32', '32', '1000', '1000', '120', '47', '95', '19', '0', '120', '120', '0', '0', '0', '6', '105', '0', '0', '20', '20', '95', '47', '0', '0', '100', '200', '0', '0', '0', '0', '10', '2', '0');
INSERT INTO `mob` VALUES ('74', 'mob/c-pajak.gif', '26', '27', '33', 'Czerwony Pajak', '20', '0', '32', '32', '1000', '1000', '120', '47', '95', '19', '0', '120', '120', '0', '0', '0', '6', '105', '0', '0', '20', '20', '95', '47', '0', '0', '100', '200', '0', '0', '0', '0', '10', '2', '0');
INSERT INTO `mob` VALUES ('75', 'mob/t-pajak.gif', '26', '22', '4', 'Trujacy Pajak', '22', '0', '32', '32', '1310', '1310', '144', '86', '86', '46', '0', '120', '120', '3', '63', '63', '4', '0', '63', '14', '38', '14', '0', '0', '2', '0', '110', '220', '0', '0', '11', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('76', 'mob/t-pajak.gif', '26', '27', '12', 'Trujacy Pajak', '22', '0', '32', '32', '1310', '1310', '144', '86', '86', '46', '0', '120', '120', '3', '63', '63', '4', '0', '63', '14', '38', '14', '0', '0', '2', '0', '110', '220', '0', '0', '11', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('77', 'mob/t-pajak.gif', '26', '40', '9', 'Trujacy Pajak', '22', '0', '32', '32', '1310', '1310', '144', '86', '86', '46', '0', '120', '120', '3', '63', '63', '4', '0', '63', '14', '38', '14', '0', '0', '2', '0', '110', '220', '0', '0', '11', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('78', 'mob/t-pajak.gif', '26', '33', '40', 'Trujacy Pajak', '22', '0', '32', '32', '1310', '1310', '144', '86', '86', '46', '0', '120', '120', '3', '63', '63', '4', '0', '63', '14', '38', '14', '0', '0', '2', '0', '110', '220', '0', '0', '11', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('79', 'mob/t-pajak.gif', '26', '18', '27', 'Trujacy Pajak', '22', '0', '32', '32', '1310', '1310', '144', '86', '86', '46', '0', '120', '120', '3', '63', '63', '4', '0', '63', '14', '38', '14', '0', '0', '2', '0', '110', '220', '0', '0', '11', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('80', 'mob/t-pajak.gif', '26', '15', '34', 'Trujacy Pajak', '22', '0', '32', '32', '1310', '1310', '144', '86', '86', '46', '0', '120', '120', '3', '63', '63', '4', '0', '63', '14', '38', '14', '0', '0', '2', '0', '110', '220', '0', '0', '11', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('81', 'mob/t-pajak.gif', '26', '7', '14', 'Trujacy Pajak', '22', '0', '32', '32', '1310', '1310', '144', '86', '86', '46', '0', '120', '120', '3', '63', '63', '4', '0', '63', '14', '38', '14', '0', '0', '2', '0', '110', '220', '0', '0', '11', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('82', 'mob/pajak-krzyzak.gif', '27', '30', '7', 'Pajak Krzyzak', '9', '0', '32', '32', '315', '315', '109', '36', '18', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '9', '9', '9', '0', '0', '0', '0', '45', '90', '0', '0', '0', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('83', 'mob/pajak-krzyzak.gif', '27', '16', '21', 'Pajak Krzyzak', '9', '0', '32', '32', '315', '315', '109', '36', '18', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '9', '9', '9', '0', '0', '0', '0', '45', '90', '0', '0', '0', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('84', 'mob/pajak-krzyzak.gif', '27', '43', '21', 'Pajak Krzyzak', '9', '0', '32', '32', '315', '315', '109', '36', '18', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '9', '9', '9', '0', '0', '0', '0', '45', '90', '0', '0', '0', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('85', 'mob/pajak-krzyzak.gif', '27', '45', '48', 'Pajak Krzyzak', '9', '0', '32', '32', '315', '315', '109', '36', '18', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '9', '9', '9', '0', '0', '0', '0', '45', '90', '0', '0', '0', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('86', 'mob/pajak-krzyzak.gif', '27', '37', '43', 'Pajak Krzyzak', '9', '0', '32', '32', '315', '315', '109', '36', '18', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '9', '9', '9', '0', '0', '0', '0', '45', '90', '0', '0', '0', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('87', 'mob/pajak-krzyzak.gif', '27', '28', '46', 'Pajak Krzyzak', '9', '0', '32', '32', '315', '315', '109', '36', '18', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '9', '9', '9', '0', '0', '0', '0', '45', '90', '0', '0', '0', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('88', 'mob/pajak-krzyzak.gif', '27', '17', '40', 'Pajak Krzyzak', '9', '0', '32', '32', '315', '315', '109', '36', '18', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '9', '9', '9', '0', '0', '0', '0', '45', '90', '0', '0', '0', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('89', 'mob/pajak-krzyzak.gif', '27', '34', '25', 'Pajak Krzyzak', '9', '0', '32', '32', '315', '315', '109', '36', '18', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '9', '9', '9', '0', '0', '0', '0', '45', '90', '0', '0', '0', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('90', 'mob/t-pajak.gif', '27', '30', '14', 'Trujacy Pajak', '22', '0', '32', '32', '1310', '1310', '144', '86', '86', '46', '0', '120', '120', '3', '63', '63', '4', '0', '63', '14', '38', '14', '0', '0', '2', '0', '110', '220', '0', '0', '11', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('91', 'mob/t-pajak.gif', '27', '39', '34', 'Trujacy Pajak', '22', '0', '32', '32', '1310', '1310', '144', '86', '86', '46', '0', '120', '120', '3', '63', '63', '4', '0', '63', '14', '38', '14', '0', '0', '2', '0', '110', '220', '0', '0', '11', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('92', 'mob/t-pajak.gif', '27', '47', '14', 'Trujacy Pajak', '22', '0', '32', '32', '1310', '1310', '144', '86', '86', '46', '0', '120', '120', '3', '63', '63', '4', '0', '63', '14', '38', '14', '0', '0', '2', '0', '110', '220', '0', '0', '11', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('93', 'mob/t-pajak.gif', '27', '51', '52', 'Trujacy Pajak', '22', '0', '32', '32', '1310', '1310', '144', '86', '86', '46', '0', '120', '120', '3', '63', '63', '4', '0', '63', '14', '38', '14', '0', '0', '2', '0', '110', '220', '0', '0', '11', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('94', 'mob/t-pajak.gif', '27', '8', '40', 'Trujacy Pajak', '22', '0', '32', '32', '1310', '1310', '144', '86', '86', '46', '0', '120', '120', '3', '63', '63', '4', '0', '63', '14', '38', '14', '0', '0', '2', '0', '110', '220', '0', '0', '11', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('95', 'mob/z-pajak.gif', '27', '24', '33', 'Zielony Pajak', '25', '0', '32', '32', '1430', '1430', '125', '75', '150', '30', '0', '120', '120', '0', '0', '0', '6', '162', '0', '0', '25', '25', '150', '75', '0', '0', '125', '250', '0', '0', '0', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('96', 'mob/z-pajak.gif', '27', '40', '60', 'Zielony Pajak', '25', '0', '32', '32', '1430', '1430', '125', '75', '150', '30', '0', '120', '120', '0', '0', '0', '6', '162', '0', '0', '25', '25', '150', '75', '0', '0', '125', '250', '0', '0', '0', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('97', 'mob/z-pajak.gif', '27', '40', '60', 'Zielony Pajak', '25', '0', '32', '32', '1430', '1430', '125', '75', '150', '30', '0', '120', '120', '0', '0', '0', '6', '162', '0', '0', '25', '25', '150', '75', '0', '0', '125', '250', '0', '0', '0', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('98', 'mob/z-pajak.gif', '27', '18', '55', 'Zielony Pajak', '25', '0', '32', '32', '1430', '1430', '125', '75', '150', '30', '0', '120', '120', '0', '0', '0', '6', '162', '0', '0', '25', '25', '150', '75', '0', '0', '125', '250', '0', '0', '0', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('99', 'mob/z-pajak.gif', '27', '9', '9', 'Zielony Pajak', '25', '0', '32', '32', '1430', '1430', '125', '75', '150', '30', '0', '120', '120', '0', '0', '0', '6', '162', '0', '0', '25', '25', '150', '75', '0', '0', '125', '250', '0', '0', '0', '0', '0', '2', '0');
INSERT INTO `mob` VALUES ('100', 'mob/heroes/zulek.gif', '1', '32', '38', 'Mietek Zul', '25', '4', '32', '64', '7500', '7500', '125', '250', '250', '50', '5', '125', '125', '0', '-42', '42', '1', '0', '0', '250', '125', '125', '0', '0', '5', '0', '1875', '7200', '1352035518', '0', '25', '0', '0', '3', '0');
INSERT INTO `mob` VALUES ('103', 'mob/heroes/zulek.gif', '27', '30', '3', 'Mietek Zul', '25', '4', '32', '64', '7500', '7500', '125', '250', '250', '50', '5', '125', '125', '0', '-42', '42', '1', '0', '0', '250', '125', '125', '0', '0', '5', '0', '1875', '7200', '1351713286', '27001', '25', '0', '0', '3', '0');
INSERT INTO `mob` VALUES ('104', 'mob/n-orzel.gif', '1', '34', '9', 'Turkusowy Orzel', '90', '0', '96', '50', '21375', '21375', '190', '445', '222', '89', '0', '120', '120', '0', '400', '510', '1', '0', '0', '90', '90', '90', '0', '0', '0', '0', '450', '900', '1351258069', '0', '0', '0', '0', '4', '0');
INSERT INTO `mob` VALUES ('105', 'mob/szary-wilk.gif', '5', '15', '52', 'Szary Wilk', '13', '0', '48', '44', '585', '585', '113', '39', '19', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '13', '13', '13', '0', '0', '0', '0', '65', '130', '1351839669', '5002', '0', '0', '0', '5', '0');
INSERT INTO `mob` VALUES ('106', 'mob/szary-wilk.gif', '5', '16', '55', 'Szary Wilk', '13', '0', '48', '44', '585', '585', '113', '39', '19', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '13', '13', '13', '0', '0', '0', '0', '65', '130', '1351839669', '5002', '0', '0', '0', '5', '0');
INSERT INTO `mob` VALUES ('107', 'mob/szary-wilk.gif', '5', '21', '45', 'Szary Wilk', '13', '0', '48', '44', '585', '585', '113', '39', '19', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '13', '13', '13', '0', '0', '0', '0', '65', '130', '0', '5004', '0', '0', '0', '5', '0');
INSERT INTO `mob` VALUES ('108', 'mob/szary-wilk.gif', '5', '43', '47', 'Szary Wilk', '13', '0', '48', '44', '585', '585', '113', '39', '19', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '13', '13', '13', '0', '0', '0', '0', '65', '130', '0', '0', '0', '0', '0', '5', '0');
INSERT INTO `mob` VALUES ('109', 'mob/szary-wilk.gif', '5', '5', '56', 'Szary Wilk', '13', '0', '48', '44', '585', '585', '113', '39', '19', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '13', '13', '13', '0', '0', '0', '0', '65', '130', '1351839709', '5003', '0', '0', '0', '5', '0');
INSERT INTO `mob` VALUES ('110', 'mob/szary-wilk.gif', '5', '7', '57', 'Szary Wilk', '13', '0', '48', '44', '585', '585', '113', '39', '19', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '13', '13', '13', '0', '0', '0', '0', '65', '130', '1351839709', '5003', '0', '0', '0', '5', '0');
INSERT INTO `mob` VALUES ('111', 'mob/szary-wilk.gif', '5', '9', '20', 'Szary Wilk', '13', '0', '48', '44', '585', '585', '113', '39', '19', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '13', '13', '13', '0', '0', '0', '0', '65', '130', '1351839598', '5001', '0', '0', '0', '5', '0');
INSERT INTO `mob` VALUES ('112', 'mob/szary-wilk.gif', '5', '8', '23', 'Szary Wilk', '13', '0', '48', '44', '585', '585', '113', '39', '19', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '13', '13', '13', '0', '0', '0', '0', '65', '130', '1351839598', '5001', '0', '0', '0', '5', '0');
INSERT INTO `mob` VALUES ('113', 'mob/szary-wilk.gif', '5', '48', '32', 'Szary Wilk', '13', '0', '48', '44', '585', '585', '113', '39', '19', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '13', '13', '13', '0', '0', '0', '0', '65', '130', '0', '0', '0', '0', '0', '5', '0');
INSERT INTO `mob` VALUES ('114', 'mob/heroes/bardzozlypatryk.gif', '5', '8', '18', 'Mroczny Patryk', '35', '4', '32', '48', '13000', '13000', '135', '350', '350', '70', '5', '128', '120', '0', '-60', '60', '1', '0', '0', '350', '175', '175', '0', '0', '5', '0', '2625', '12400', '0', '0', '35', '0', '0', '6', '0');
INSERT INTO `mob` VALUES ('115', 'mob/czarny-wilk.gif', '5', '23', '44', 'Czarny Wilk', '22', '0', '48', '44', '1485', '1485', '122', '82', '41', '19', '0', '120', '120', '0', '100', '108', '1', '0', '0', '22', '22', '22', '0', '0', '0', '0', '110', '220', '0', '5004', '0', '0', '0', '7', '0');
INSERT INTO `mob` VALUES ('116', 'mob/czarny-wilk.gif', '5', '2', '5', 'Czarny Wilk', '22', '0', '48', '44', '1485', '1485', '122', '82', '41', '19', '0', '120', '120', '0', '100', '108', '1', '0', '0', '22', '22', '22', '0', '0', '0', '0', '110', '220', '1351962399', '5005', '0', '0', '0', '7', '0');
INSERT INTO `mob` VALUES ('117', 'mob/czarny-wilk.gif', '5', '6', '5', 'Czarny Wilk', '22', '0', '48', '44', '1168', '1485', '122', '82', '41', '19', '0', '120', '120', '0', '100', '108', '1', '0', '0', '22', '22', '22', '0', '0', '0', '0', '110', '220', '0', '5005', '0', '0', '0', '7', '0');
INSERT INTO `mob` VALUES ('118', 'mob/czarny-wilk.gif', '5', '4', '4', 'Czarny Wilk', '22', '0', '48', '44', '1485', '1485', '122', '82', '41', '19', '0', '120', '120', '0', '100', '108', '1', '0', '0', '22', '22', '22', '0', '0', '0', '0', '110', '220', '0', '5005', '0', '0', '0', '7', '0');
INSERT INTO `mob` VALUES ('119', 'mob/gaunt1.gif', '32', '57', '45', 'Młody Gaunt', '15', '0', '32', '48', '450', '450', '115', '48', '24', '10', '0', '120', '120', '0', '0', '0', '6', '30', '0', '0', '25', '20', '104', '52', '0', '0', '75', '150', '1351839828', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('120', 'mob/gaunt1.gif', '32', '9', '52', 'Młody Gaunt', '15', '0', '32', '48', '450', '450', '115', '48', '24', '10', '0', '120', '120', '0', '0', '0', '6', '30', '0', '0', '25', '20', '104', '52', '0', '0', '75', '150', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('121', 'mob/gaunt1.gif', '32', '5', '36', 'Młody Gaunt', '15', '0', '32', '48', '450', '450', '115', '48', '24', '10', '0', '120', '120', '0', '0', '0', '6', '30', '0', '0', '25', '20', '104', '52', '0', '0', '75', '150', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('122', 'mob/gaunt1.gif', '32', '33', '33', 'Młody Gaunt', '15', '0', '32', '48', '450', '450', '115', '48', '24', '10', '0', '120', '120', '0', '0', '0', '6', '30', '0', '0', '25', '20', '104', '52', '0', '0', '75', '150', '1351840112', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('123', 'mob/gaunt1.gif', '32', '50', '61', 'Młody Gaunt', '15', '0', '32', '48', '450', '450', '115', '48', '24', '10', '0', '120', '120', '0', '0', '0', '6', '30', '0', '0', '25', '20', '104', '52', '0', '0', '75', '150', '1351839764', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('124', 'mob/gaunt1.gif', '32', '49', '5', 'Młody Gaunt', '15', '0', '32', '48', '450', '450', '115', '48', '24', '10', '0', '120', '120', '0', '0', '0', '6', '30', '0', '0', '25', '20', '104', '52', '0', '0', '75', '150', '1351840189', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('125', 'mob/gaunt1.gif', '32', '59', '5', 'Młody Gaunt', '15', '0', '32', '48', '450', '450', '115', '48', '24', '10', '0', '120', '120', '0', '0', '0', '6', '30', '0', '0', '25', '20', '104', '52', '0', '0', '75', '150', '1351840204', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('126', 'mob/gaunt1.gif', '32', '30', '6', 'Młody Gaunt', '15', '0', '32', '48', '450', '450', '115', '48', '24', '10', '0', '120', '120', '0', '0', '0', '6', '30', '0', '0', '25', '20', '104', '52', '0', '0', '75', '150', '1351840160', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('127', 'mob/gaunt1.gif', '32', '22', '10', 'Młody Gaunt', '15', '0', '32', '48', '450', '450', '115', '48', '24', '10', '0', '120', '120', '0', '0', '0', '6', '30', '0', '0', '25', '20', '104', '52', '0', '0', '75', '150', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('128', 'mob/gaunt1.gif', '32', '44', '28', 'Młody Gaunt', '15', '0', '32', '48', '450', '450', '115', '48', '24', '10', '0', '120', '120', '0', '0', '0', '6', '30', '0', '0', '25', '20', '104', '52', '0', '0', '75', '150', '1351840255', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('129', 'mob/szary-wilk.gif', '32', '37', '56', 'Szary Wilk', '13', '0', '48', '44', '585', '585', '113', '39', '19', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '13', '13', '13', '0', '0', '0', '0', '65', '130', '1351840286', '32001', '0', '0', '0', '5', '0');
INSERT INTO `mob` VALUES ('130', 'mob/szary-wilk.gif', '32', '41', '53', 'Szary Wilk', '13', '0', '48', '44', '585', '585', '113', '39', '19', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '13', '13', '13', '0', '0', '0', '0', '65', '130', '1351840286', '32001', '0', '0', '0', '5', '0');
INSERT INTO `mob` VALUES ('131', 'mob/szary-wilk.gif', '32', '39', '50', 'Szary Wilk', '13', '0', '48', '44', '585', '585', '113', '39', '19', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '13', '13', '13', '0', '0', '0', '0', '65', '130', '1351840286', '32001', '0', '0', '0', '5', '0');
INSERT INTO `mob` VALUES ('132', 'mob/szary-wilk.gif', '32', '35', '53', 'Szary Wilk', '13', '0', '48', '44', '585', '585', '113', '39', '19', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '13', '13', '13', '0', '0', '0', '0', '65', '130', '1351840286', '32001', '0', '0', '0', '5', '0');
INSERT INTO `mob` VALUES ('133', 'mob/czarny-wilk.gif', '32', '37', '52', 'Czarny Wilk', '18', '0', '48', '44', '935', '935', '118', '70', '35', '15', '0', '120', '120', '0', '61', '79', '1', '0', '0', '15', '15', '15', '0', '0', '0', '0', '90', '180', '1351840336', '32001', '0', '0', '0', '7', '0');
INSERT INTO `mob` VALUES ('134', 'mob/gaunt2.gif', '32', '4', '45', 'Gaunt', '21', '0', '32', '48', '750', '750', '121', '44', '88', '21', '0', '120', '120', '0', '0', '0', '6', '57', '0', '0', '36', '27', '176', '88', '0', '0', '105', '210', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('135', 'mob/gaunt2.gif', '32', '48', '42', 'Gaunt', '21', '0', '32', '48', '750', '750', '121', '44', '88', '21', '0', '120', '120', '0', '0', '0', '6', '57', '0', '0', '36', '27', '176', '88', '0', '0', '105', '210', '1351840342', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('136', 'mob/gaunt2.gif', '32', '11', '60', 'Gaunt', '21', '0', '32', '48', '750', '750', '121', '44', '88', '21', '0', '120', '120', '0', '0', '0', '6', '57', '0', '0', '36', '27', '176', '88', '0', '0', '105', '210', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('137', 'mob/gaunt2.gif', '32', '3', '27', 'Gaunt', '21', '0', '32', '48', '750', '750', '121', '44', '88', '21', '0', '120', '120', '0', '0', '0', '6', '57', '0', '0', '36', '27', '176', '88', '0', '0', '105', '210', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('138', 'mob/gaunt2.gif', '32', '10', '9', 'Gaunt', '21', '0', '32', '48', '750', '750', '121', '44', '88', '21', '0', '120', '120', '0', '0', '0', '6', '57', '0', '0', '36', '27', '176', '88', '0', '0', '105', '210', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('139', 'mob/gaunt2.gif', '32', '19', '22', 'Gaunt', '21', '0', '32', '48', '750', '750', '121', '44', '88', '21', '0', '120', '120', '0', '0', '0', '6', '57', '0', '0', '36', '27', '176', '88', '0', '0', '105', '210', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('140', 'mob/apostata.gif', '5', '61', '56', 'Paladyński Apostata', '25', '1', '32', '48', '2000', '2000', '130', '148', '74', '34', '2', '123', '123', '0', '124', '152', '1', '0', '0', '30', '30', '30', '0', '0', '0', '5', '125', '280', '1352028451', '0', '0', '0', '0', '8', '0');
INSERT INTO `mob` VALUES ('141', 'mob/astratus.gif', '30', '5', '9', 'Astratus', '22', '1', '96', '96', '750', '750', '124', '55', '110', '25', '2', '120', '120', '0', '0', '0', '6', '121', '0', '0', '36', '36', '220', '110', '0', '0', '110', '220', '1351965127', '0', '0', '0', '0', '9', '0');
INSERT INTO `mob` VALUES ('142', 'mob/szary-wilk.gif', '6', '50', '57', 'Szary Wilk', '13', '0', '48', '44', '585', '585', '113', '39', '19', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '13', '13', '13', '0', '0', '0', '0', '65', '130', '0', '0', '0', '0', '0', '5', '0');
INSERT INTO `mob` VALUES ('143', 'mob/kotolak.gif', '6', '36', '25', 'Kotolak Tropiciel', '23', '1', '42', '48', '1300', '1300', '135', '96', '96', '25', '2', '120', '120', '15', '84', '116', '4', '0', '0', '25', '51', '1', '0', '0', '23', '0', '115', '230', '1351965514', '0', '12', '0', '0', '10', '0');
INSERT INTO `mob` VALUES ('144', 'mob/zmija.gif', '7', '20', '32', 'Żmija Zygzakowata', '14', '0', '28', '30', '620', '620', '114', '43', '22', '9', '0', '120', '120', '0', '35', '41', '1', '0', '0', '14', '14', '14', '0', '0', '0', '0', '70', '140', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('145', 'mob/zmija.gif', '7', '76', '13', 'Żmija Zygzakowata', '14', '0', '28', '30', '620', '620', '114', '43', '22', '9', '0', '120', '120', '0', '35', '41', '1', '0', '0', '14', '14', '14', '0', '0', '0', '0', '70', '140', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('146', 'mob/zmija.gif', '7', '22', '22', 'Żmija Zygzakowata', '14', '0', '28', '30', '620', '620', '114', '43', '22', '9', '0', '120', '120', '0', '35', '41', '1', '0', '0', '14', '14', '14', '0', '0', '0', '0', '70', '140', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('147', 'mob/zmija.gif', '7', '14', '14', 'Żmija Zygzakowata', '14', '0', '28', '30', '620', '620', '114', '43', '22', '9', '0', '120', '120', '0', '35', '41', '1', '0', '0', '14', '14', '14', '0', '0', '0', '0', '70', '140', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('148', 'mob/zmija.gif', '7', '73', '62', 'Żmija Zygzakowata', '14', '0', '28', '30', '620', '620', '114', '43', '22', '9', '0', '120', '120', '0', '35', '41', '1', '0', '0', '14', '14', '14', '0', '0', '0', '0', '70', '140', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('149', 'mob/zmija.gif', '7', '10', '6', 'Żmija Zygzakowata', '14', '0', '28', '30', '620', '620', '114', '43', '22', '9', '0', '120', '120', '0', '35', '41', '1', '0', '0', '14', '14', '14', '0', '0', '0', '0', '70', '140', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('150', 'mob/zmija.gif', '7', '2', '47', 'Żmija Zygzakowata', '14', '0', '28', '30', '620', '620', '114', '43', '22', '9', '0', '120', '120', '0', '35', '41', '1', '0', '0', '14', '14', '14', '0', '0', '0', '0', '70', '140', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('151', 'mob/zmija.gif', '7', '65', '16', 'Żmija Zygzakowata', '14', '0', '28', '30', '620', '620', '114', '43', '22', '9', '0', '120', '120', '0', '35', '41', '1', '0', '0', '14', '14', '14', '0', '0', '0', '0', '70', '140', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('152', 'mob/zmija.gif', '7', '55', '26', 'Żmija Zygzakowata', '14', '0', '28', '30', '620', '620', '114', '43', '22', '9', '0', '120', '120', '0', '35', '41', '1', '0', '0', '14', '14', '14', '0', '0', '0', '0', '70', '140', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('153', 'mob/zmija.gif', '7', '70', '27', 'Żmija Zygzakowata', '14', '0', '28', '30', '620', '620', '114', '43', '22', '9', '0', '120', '120', '0', '35', '41', '1', '0', '0', '14', '14', '14', '0', '0', '0', '0', '70', '140', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('154', 'mob/czarny-wilk.gif', '7', '42', '16', 'Czarny Wilk', '18', '0', '48', '44', '935', '935', '118', '70', '35', '15', '0', '120', '120', '0', '61', '79', '1', '0', '0', '15', '15', '15', '0', '0', '0', '0', '90', '180', '0', '7001', '0', '0', '0', '7', '0');
INSERT INTO `mob` VALUES ('155', 'mob/czarny-wilk.gif', '7', '45', '17', 'Czarny Wilk', '18', '0', '48', '44', '935', '935', '118', '70', '35', '15', '0', '120', '120', '0', '61', '79', '1', '0', '0', '15', '15', '15', '0', '0', '0', '0', '90', '180', '0', '7001', '0', '0', '0', '7', '0');
INSERT INTO `mob` VALUES ('156', 'mob/czarny-wilk.gif', '7', '75', '54', 'Czarny Wilk', '18', '0', '48', '44', '935', '935', '118', '70', '35', '15', '0', '120', '120', '0', '61', '79', '1', '0', '0', '15', '15', '15', '0', '0', '0', '0', '90', '180', '0', '7002', '0', '0', '0', '7', '0');
INSERT INTO `mob` VALUES ('157', 'mob/czarny-wilk.gif', '7', '71', '53', 'Czarny Wilk', '18', '0', '48', '44', '935', '935', '118', '70', '35', '15', '0', '120', '120', '0', '61', '79', '1', '0', '0', '15', '15', '15', '0', '0', '0', '0', '90', '180', '0', '7002', '0', '0', '0', '7', '0');
INSERT INTO `mob` VALUES ('158', 'mob/skorpion.gif', '33', '6', '8', 'Skorpion', '5', '0', '24', '30', '118', '118', '105', '10', '5', '2', '0', '120', '120', '0', '9', '11', '1', '0', '0', '5', '5', '5', '0', '0', '0', '0', '25', '50', '1351958530', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('159', 'mob/pelzacz.gif', '34', '9', '14', 'Pełzacz', '3', '0', '32', '48', '60', '60', '103', '5', '3', '0', '0', '120', '120', '0', '5', '7', '1', '0', '0', '3', '3', '3', '0', '0', '0', '0', '15', '30', '1351958597', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('160', 'mob/pelzacz.gif', '34', '9', '11', 'Pełzacz', '3', '0', '32', '48', '60', '60', '103', '5', '3', '0', '0', '120', '120', '0', '5', '7', '1', '0', '0', '3', '3', '3', '0', '0', '0', '0', '15', '30', '1351958590', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('161', 'mob/pelzacz.gif', '34', '5', '12', 'Pełzacz', '3', '0', '32', '48', '60', '60', '103', '5', '3', '0', '0', '120', '120', '0', '5', '7', '1', '0', '0', '3', '3', '3', '0', '0', '0', '0', '15', '30', '1351958583', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('162', 'mob/pelzacz.gif', '34', '7', '8', 'Pełzacz', '3', '0', '32', '48', '60', '60', '103', '5', '3', '0', '0', '120', '120', '0', '5', '7', '1', '0', '0', '3', '3', '3', '0', '0', '0', '0', '15', '30', '1351958538', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('163', 'mob/pelzacz.gif', '34', '11', '8', 'Pełzacz', '3', '0', '32', '48', '60', '60', '103', '5', '3', '0', '0', '120', '120', '0', '5', '7', '1', '0', '0', '3', '3', '3', '0', '0', '0', '0', '15', '30', '1351958609', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('164', 'mob/pelzacz.gif', '34', '13', '5', 'Pełzacz', '3', '0', '32', '48', '60', '60', '103', '5', '3', '0', '0', '120', '120', '0', '5', '7', '1', '0', '0', '3', '3', '3', '0', '0', '0', '0', '15', '30', '0', '34002', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('165', 'mob/pelzacz.gif', '34', '17', '6', 'Pełzacz', '3', '0', '32', '48', '60', '60', '103', '5', '3', '0', '0', '120', '120', '0', '5', '7', '1', '0', '0', '3', '3', '3', '0', '0', '0', '0', '15', '30', '0', '34002', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('166', 'mob/pelzacz.gif', '34', '15', '10', 'Pełzacz', '3', '0', '32', '48', '60', '60', '103', '5', '3', '0', '0', '120', '120', '0', '5', '7', '1', '0', '0', '3', '3', '3', '0', '0', '0', '0', '15', '30', '1351958618', '34001', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('167', 'mob/pelzacz.gif', '34', '16', '9', 'Pełzacz', '3', '0', '32', '48', '60', '60', '103', '5', '3', '0', '0', '120', '120', '0', '5', '7', '1', '0', '0', '3', '3', '3', '0', '0', '0', '0', '15', '30', '1351958618', '34001', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('168', 'mob/pelzacz.gif', '34', '14', '9', 'Pełzacz', '3', '0', '32', '48', '60', '60', '103', '5', '3', '0', '0', '120', '120', '0', '5', '7', '1', '0', '0', '3', '3', '3', '0', '0', '0', '0', '15', '30', '1351958618', '34001', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('169', 'mob/pelzacz2.gif', '35', '15', '12', 'Pełzacz', '4', '0', '32', '48', '90', '90', '104', '8', '4', '1', '0', '120', '120', '0', '7', '10', '1', '0', '0', '4', '4', '4', '0', '0', '0', '0', '20', '40', '1351958663', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('170', 'mob/pelzacz2.gif', '35', '18', '14', 'Pełzacz', '4', '0', '32', '48', '90', '90', '104', '8', '4', '1', '0', '120', '120', '0', '7', '10', '1', '0', '0', '4', '4', '4', '0', '0', '0', '0', '20', '40', '1351958671', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('171', 'mob/pelzacz2.gif', '35', '9', '12', 'Pełzacz', '4', '0', '32', '48', '90', '90', '104', '8', '4', '1', '0', '120', '120', '0', '7', '10', '1', '0', '0', '4', '4', '4', '0', '0', '0', '0', '20', '40', '1351958684', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('172', 'mob/pelzacz2.gif', '35', '9', '4', 'Pełzacz', '4', '0', '32', '48', '90', '90', '104', '8', '4', '1', '0', '120', '120', '0', '7', '10', '1', '0', '0', '4', '4', '4', '0', '0', '0', '0', '20', '40', '1351958757', '35001', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('173', 'mob/pelzacz.gif', '35', '8', '6', 'Pełzacz', '3', '0', '32', '48', '60', '60', '103', '5', '3', '0', '0', '120', '120', '0', '5', '7', '1', '0', '0', '3', '3', '3', '0', '0', '0', '0', '15', '30', '1351958747', '35001', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('174', 'mob/pelzacz.gif', '35', '11', '5', 'Pełzacz', '3', '0', '32', '48', '60', '60', '103', '5', '3', '0', '0', '120', '120', '0', '5', '7', '1', '0', '0', '3', '3', '3', '0', '0', '0', '0', '15', '30', '1351958747', '35001', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('175', 'mob/pelzacz.gif', '35', '10', '7', 'Pełzacz', '3', '0', '32', '48', '60', '60', '103', '5', '3', '0', '0', '120', '120', '0', '5', '7', '1', '0', '0', '3', '3', '3', '0', '0', '0', '0', '15', '30', '1351958747', '35001', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('176', 'mob/pelzacz2.gif', '35', '5', '10', 'Pełzacz', '4', '0', '32', '48', '90', '90', '104', '8', '4', '1', '0', '120', '120', '0', '7', '10', '1', '0', '0', '4', '4', '4', '0', '0', '0', '0', '20', '40', '1351958696', '35002', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('177', 'mob/pelzacz2.gif', '35', '2', '11', 'Pełzacz', '4', '0', '32', '48', '90', '90', '104', '8', '4', '1', '0', '120', '120', '0', '7', '10', '1', '0', '0', '4', '4', '4', '0', '0', '0', '0', '20', '40', '1351958696', '35002', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('178', 'mob/pelzacz2.gif', '35', '4', '11', 'Pełzacz', '4', '0', '32', '48', '90', '90', '104', '8', '4', '1', '0', '120', '120', '0', '7', '10', '1', '0', '0', '4', '4', '4', '0', '0', '0', '0', '20', '40', '1351958713', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('179', 'mob/cerber.gif', '38', '4', '4', 'Cerber', '28', '1', '44', '56', '1115', '1115', '131', '91', '182', '37', '2', '120', '120', '0', '0', '0', '6', '112', '0', '0', '62', '31', '364', '182', '0', '0', '140', '280', '1351840660', '0', '0', '0', '0', '11', '0');
INSERT INTO `mob` VALUES ('267', 'mob/wywerna1.gif', '8', '57', '58', 'Młoda Wywerna', '23', '0', '48', '48', '1510', '1510', '123', '114', '57', '25', '0', '120', '120', '0', '81', '149', '1', '0', '0', '23', '23', '23', '0', '0', '0', '0', '115', '230', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('180', 'mob/skorpion.gif', '36', '7', '10', 'Skorpion', '7', '0', '24', '30', '190', '190', '107', '20', '10', '4', '0', '120', '120', '0', '18', '24', '1', '0', '0', '7', '7', '7', '0', '0', '0', '0', '35', '70', '1351958818', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('181', 'mob/skorpion.gif', '36', '13', '10', 'Skorpion', '7', '0', '24', '30', '190', '190', '107', '20', '10', '4', '0', '120', '120', '0', '18', '24', '1', '0', '0', '7', '7', '7', '0', '0', '0', '0', '35', '70', '1351958849', '36001', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('182', 'mob/skorpion.gif', '36', '14', '12', 'Skorpion', '7', '0', '24', '30', '190', '190', '107', '20', '10', '4', '0', '120', '120', '0', '18', '24', '1', '0', '0', '7', '7', '7', '0', '0', '0', '0', '35', '70', '1351958849', '36001', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('183', 'mob/skorpion.gif', '36', '3', '11', 'Skorpion', '7', '0', '24', '30', '190', '190', '107', '20', '10', '4', '0', '120', '120', '0', '18', '24', '1', '0', '0', '7', '7', '7', '0', '0', '0', '0', '35', '70', '1351958831', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('184', 'mob/skorpion.gif', '36', '2', '7', 'Skorpion', '7', '0', '24', '30', '190', '190', '107', '20', '10', '4', '0', '120', '120', '0', '18', '24', '1', '0', '0', '7', '7', '7', '0', '0', '0', '0', '35', '70', '1351958896', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('185', 'mob/skorpion.gif', '36', '3', '3', 'Skorpion', '7', '0', '24', '30', '190', '190', '107', '20', '10', '4', '0', '120', '120', '0', '18', '24', '1', '0', '0', '7', '7', '7', '0', '0', '0', '0', '35', '70', '1351958919', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('186', 'mob/skorpion.gif', '37', '2', '12', 'Skorpion', '7', '0', '24', '30', '190', '190', '107', '20', '10', '4', '0', '120', '120', '0', '18', '24', '1', '0', '0', '7', '7', '7', '0', '0', '0', '0', '35', '70', '1351958937', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('187', 'mob/skorpion.gif', '37', '1', '8', 'Skorpion', '7', '0', '24', '30', '190', '190', '107', '20', '10', '4', '0', '120', '120', '0', '18', '24', '1', '0', '0', '7', '7', '7', '0', '0', '0', '0', '35', '70', '1351958946', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('188', 'mob/skorpion.gif', '37', '10', '6', 'Skorpion', '7', '0', '24', '30', '190', '190', '107', '20', '10', '4', '0', '120', '120', '0', '18', '24', '1', '0', '0', '7', '7', '7', '0', '0', '0', '0', '35', '70', '1351958965', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('189', 'mob/skorpion.gif', '37', '15', '5', 'Skorpion', '7', '0', '24', '30', '190', '190', '107', '20', '10', '4', '0', '120', '120', '0', '18', '24', '1', '0', '0', '7', '7', '7', '0', '0', '0', '0', '35', '70', '1351958980', '37001', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('190', 'mob/skorpion.gif', '37', '16', '6', 'Skorpion', '7', '0', '24', '30', '190', '190', '107', '20', '10', '4', '0', '120', '120', '0', '18', '24', '1', '0', '0', '7', '7', '7', '0', '0', '0', '0', '35', '70', '1351958980', '37001', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('191', 'mob/skorpion.gif', '37', '17', '7', 'Skorpion', '7', '0', '24', '30', '190', '190', '107', '20', '10', '4', '0', '120', '120', '0', '18', '24', '1', '0', '0', '7', '7', '7', '0', '0', '0', '0', '35', '70', '1351791894', '37002', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('192', 'mob/skorpion.gif', '37', '18', '8', 'Skorpion', '7', '0', '24', '30', '190', '190', '107', '20', '10', '4', '0', '120', '120', '0', '18', '24', '1', '0', '0', '7', '7', '7', '0', '0', '0', '0', '35', '70', '1351791894', '37002', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('193', 'mob/skorpion.gif', '37', '19', '9', 'Skorpion', '7', '0', '24', '30', '190', '190', '107', '20', '10', '4', '0', '120', '120', '0', '18', '24', '1', '0', '0', '7', '7', '7', '0', '0', '0', '0', '35', '70', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('194', 'mob/skorpion.gif', '37', '19', '6', 'Skorpion', '7', '0', '24', '30', '190', '190', '107', '20', '10', '4', '0', '120', '120', '0', '18', '24', '1', '0', '0', '7', '7', '7', '0', '0', '0', '0', '35', '70', '1351959001', '37003', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('195', 'mob/skorpion.gif', '37', '21', '4', 'Skorpion', '7', '0', '24', '30', '190', '190', '107', '20', '10', '4', '0', '120', '120', '0', '18', '24', '1', '0', '0', '7', '7', '7', '0', '0', '0', '0', '35', '70', '1351959001', '37003', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('196', 'mob/skorpion.gif', '37', '22', '7', 'Skorpion', '7', '0', '24', '30', '190', '190', '107', '20', '10', '4', '0', '120', '120', '0', '18', '24', '1', '0', '0', '7', '7', '7', '0', '0', '0', '0', '35', '70', '1351959001', '37003', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('197', 'mob/skorpion.gif', '37', '21', '6', 'Skorpion', '7', '0', '24', '30', '190', '190', '107', '20', '10', '4', '0', '120', '120', '0', '18', '24', '1', '0', '0', '7', '7', '7', '0', '0', '0', '0', '35', '70', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('198', 'mob/skorpion.gif', '38', '15', '11', 'Skorpion', '7', '0', '24', '30', '190', '190', '107', '20', '10', '4', '0', '120', '120', '0', '18', '24', '1', '0', '0', '7', '7', '7', '0', '0', '0', '0', '35', '70', '1351791964', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('199', 'mob/skorpion.gif', '38', '12', '8', 'Skorpion', '7', '0', '24', '30', '190', '190', '107', '20', '10', '4', '0', '120', '120', '0', '18', '24', '1', '0', '0', '7', '7', '7', '0', '0', '0', '0', '35', '70', '1351792045', '38001', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('200', 'mob/skorpion.gif', '38', '11', '10', 'Skorpion', '7', '0', '24', '30', '190', '190', '107', '20', '10', '4', '0', '120', '120', '0', '18', '24', '1', '0', '0', '7', '7', '7', '0', '0', '0', '0', '35', '70', '1351792045', '38001', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('201', 'mob/skorpion.gif', '38', '7', '9', 'Skorpion', '7', '0', '24', '30', '190', '190', '107', '20', '10', '4', '0', '120', '120', '0', '18', '24', '1', '0', '0', '7', '7', '7', '0', '0', '0', '0', '35', '70', '1351792331', '38002', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('202', 'mob/skorpion.gif', '38', '8', '8', 'Skorpion', '7', '0', '24', '30', '190', '190', '107', '20', '10', '4', '0', '120', '120', '0', '18', '24', '1', '0', '0', '7', '7', '7', '0', '0', '0', '0', '35', '70', '1351792331', '38002', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('203', 'mob/skorpion.gif', '38', '7', '4', 'Skorpion', '7', '0', '24', '30', '190', '190', '107', '20', '10', '4', '0', '120', '120', '0', '18', '24', '1', '0', '0', '7', '7', '7', '0', '0', '0', '0', '35', '70', '1351792312', '38003', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('204', 'mob/skorpion.gif', '38', '6', '6', 'Skorpion', '7', '0', '24', '30', '190', '190', '107', '20', '10', '4', '0', '120', '120', '0', '18', '24', '1', '0', '0', '7', '7', '7', '0', '0', '0', '0', '35', '70', '1351792312', '38003', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('205', 'mob/skorpion.gif', '38', '9', '5', 'Skorpion', '7', '0', '24', '30', '190', '190', '107', '20', '10', '4', '0', '120', '120', '0', '18', '24', '1', '0', '0', '7', '7', '7', '0', '0', '0', '0', '35', '70', '1351792312', '38003', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('206', 'mob/skorpion.gif', '38', '5', '7', 'Skorpion', '7', '0', '24', '30', '190', '190', '107', '20', '10', '4', '0', '120', '120', '0', '18', '24', '1', '0', '0', '7', '7', '7', '0', '0', '0', '0', '35', '70', '1351792516', '38004', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('207', 'mob/skorpion.gif', '38', '4', '8', 'Skorpion', '7', '0', '24', '30', '190', '190', '107', '20', '10', '4', '0', '120', '120', '0', '18', '24', '1', '0', '0', '7', '7', '7', '0', '0', '0', '0', '35', '70', '1351792516', '38004', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('208', 'mob/skorpion.gif', '38', '3', '8', 'Skorpion', '7', '0', '24', '30', '190', '190', '107', '20', '10', '4', '0', '120', '120', '0', '18', '24', '1', '0', '0', '7', '7', '7', '0', '0', '0', '0', '35', '70', '1351792516', '38004', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('209', 'mob/skorpion.gif', '38', '2', '7', 'Skorpion', '7', '0', '24', '30', '190', '190', '107', '20', '10', '4', '0', '120', '120', '0', '18', '24', '1', '0', '0', '7', '7', '7', '0', '0', '0', '0', '35', '70', '1351792516', '38004', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('210', 'mob/skorpion.gif', '38', '4', '7', 'Skorpion', '7', '0', '24', '30', '190', '190', '107', '20', '10', '4', '0', '120', '120', '0', '18', '24', '1', '0', '0', '7', '7', '7', '0', '0', '0', '0', '35', '70', '1351792516', '38004', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('211', 'mob/skorpion.gif', '38', '2', '11', 'Skorpion', '7', '0', '24', '30', '190', '190', '107', '20', '10', '4', '0', '120', '120', '0', '18', '24', '1', '0', '0', '7', '7', '7', '0', '0', '0', '0', '35', '70', '1351792516', '38004', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('212', 'mob/skorpion.gif', '38', '4', '6', 'Skorpion', '7', '0', '24', '30', '190', '190', '107', '20', '10', '4', '0', '120', '120', '0', '18', '24', '1', '0', '0', '7', '7', '7', '0', '0', '0', '0', '35', '70', '1351792516', '38004', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('213', 'mob/szczur.gif', '39', '5', '8', 'Szczur', '13', '0', '32', '48', '540', '540', '113', '39', '19', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '13', '13', '13', '0', '0', '0', '0', '65', '130', '1351959876', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('214', 'mob/szczur.gif', '39', '1', '7', 'Szczur', '13', '0', '32', '48', '540', '540', '113', '39', '19', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '13', '13', '13', '0', '0', '0', '0', '65', '130', '1351959887', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('215', 'mob/szczur.gif', '40', '3', '12', 'Szczur', '13', '0', '32', '48', '540', '540', '113', '39', '19', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '13', '13', '13', '0', '0', '0', '0', '65', '130', '1351959920', '40001', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('216', 'mob/szczur.gif', '40', '5', '13', 'Szczur', '13', '0', '32', '48', '540', '540', '113', '39', '19', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '13', '13', '13', '0', '0', '0', '0', '65', '130', '1351959920', '40001', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('217', 'mob/szczur.gif', '40', '9', '13', 'Szczur', '13', '0', '32', '48', '540', '540', '113', '39', '19', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '13', '13', '13', '0', '0', '0', '0', '65', '130', '1351960109', '40002', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('218', 'mob/szczur.gif', '40', '12', '14', 'Szczur', '13', '0', '32', '48', '540', '540', '113', '39', '19', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '13', '13', '13', '0', '0', '0', '0', '65', '130', '1351960109', '40002', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('219', 'mob/szczur.gif', '40', '14', '12', 'Szczur', '13', '0', '32', '48', '540', '540', '113', '39', '19', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '13', '13', '13', '0', '0', '0', '0', '65', '130', '1351960126', '40003', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('220', 'mob/szczur.gif', '40', '15', '12', 'Szczur', '13', '0', '32', '48', '540', '540', '113', '39', '19', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '13', '13', '13', '0', '0', '0', '0', '65', '130', '1351960126', '40003', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('221', 'mob/szczur.gif', '40', '14', '8', 'Szczur', '13', '0', '32', '48', '540', '540', '113', '39', '19', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '13', '13', '13', '0', '0', '0', '0', '65', '130', '1351960143', '40004', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('222', 'mob/szczur.gif', '40', '17', '7', 'Szczur', '13', '0', '32', '48', '540', '540', '113', '39', '19', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '13', '13', '13', '0', '0', '0', '0', '65', '130', '1351960143', '40004', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('223', 'mob/szczur.gif', '40', '16', '6', 'Szczur', '13', '0', '32', '48', '540', '540', '113', '39', '19', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '13', '13', '13', '0', '0', '0', '0', '65', '130', '1351960143', '40004', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('224', 'mob/szczur1.gif', '41', '13', '11', 'Szczur Zbozowy', '14', '0', '32', '48', '665', '665', '114', '45', '22', '9', '0', '120', '120', '0', '19', '33', '1', '0', '0', '14', '14', '14', '0', '0', '0', '0', '70', '140', '1351960217', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('225', 'mob/szczur1.gif', '41', '12', '7', 'Szczur Zbozowy', '14', '0', '32', '48', '665', '665', '114', '45', '22', '9', '0', '120', '120', '0', '19', '33', '1', '0', '0', '14', '14', '14', '0', '0', '0', '0', '70', '140', '1351960225', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('226', 'mob/szczur1.gif', '41', '5', '6', 'Szczur Zbozowy', '14', '0', '32', '48', '665', '665', '114', '45', '22', '9', '0', '120', '120', '0', '19', '33', '1', '0', '0', '14', '14', '14', '0', '0', '0', '0', '70', '140', '1351960238', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('227', 'mob/szczur1.gif', '42', '12', '12', 'Szczur Zbozowy', '14', '0', '32', '48', '665', '665', '114', '45', '22', '9', '0', '120', '120', '0', '19', '33', '1', '0', '0', '14', '14', '14', '0', '0', '0', '0', '70', '140', '1351960259', '42001', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('228', 'mob/szczur1.gif', '42', '15', '11', 'Szczur Zbozowy', '14', '0', '32', '48', '665', '665', '114', '45', '22', '9', '0', '120', '120', '0', '19', '33', '1', '0', '0', '14', '14', '14', '0', '0', '0', '0', '70', '140', '1351960259', '42001', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('229', 'mob/szczur1.gif', '42', '13', '8', 'Szczur Zbozowy', '14', '0', '32', '48', '665', '665', '114', '45', '22', '9', '0', '120', '120', '0', '19', '33', '1', '0', '0', '14', '14', '14', '0', '0', '0', '0', '70', '140', '1351960327', '42002', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('230', 'mob/szczur1.gif', '42', '12', '7', 'Szczur Zbozowy', '14', '0', '32', '48', '665', '665', '114', '45', '22', '9', '0', '120', '120', '0', '19', '33', '1', '0', '0', '14', '14', '14', '0', '0', '0', '0', '70', '140', '1351960327', '42002', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('231', 'mob/szczur1.gif', '42', '8', '6', 'Szczur Zbozowy', '14', '0', '32', '48', '665', '665', '114', '45', '22', '9', '0', '120', '120', '0', '19', '33', '1', '0', '0', '14', '14', '14', '0', '0', '0', '0', '70', '140', '1351960354', '42003', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('232', 'mob/szczur1.gif', '42', '7', '5', 'Szczur Zbozowy', '14', '0', '32', '48', '665', '665', '114', '45', '22', '9', '0', '120', '120', '0', '19', '33', '1', '0', '0', '14', '14', '14', '0', '0', '0', '0', '70', '140', '1351960354', '42003', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('233', 'mob/szczur1.gif', '42', '5', '5', 'Szczur Zbozowy', '14', '0', '32', '48', '665', '665', '114', '45', '22', '9', '0', '120', '120', '0', '19', '33', '1', '0', '0', '14', '14', '14', '0', '0', '0', '0', '70', '140', '1351960767', '42004', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('234', 'mob/szczur1.gif', '42', '4', '3', 'Szczur Zbozowy', '14', '0', '32', '48', '665', '665', '114', '45', '22', '9', '0', '120', '120', '0', '19', '33', '1', '0', '0', '14', '14', '14', '0', '0', '0', '0', '70', '140', '1351960767', '42004', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('235', 'mob/szczur1.gif', '42', '2', '3', 'Szczur Zbozowy', '14', '0', '32', '48', '665', '665', '114', '45', '22', '9', '0', '120', '120', '0', '19', '33', '1', '0', '0', '14', '14', '14', '0', '0', '0', '0', '70', '140', '1351960767', '42004', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('236', 'mob/szczur3.gif', '42', '6', '7', 'Szczurzy Wojownik', '16', '0', '32', '48', '840', '840', '116', '60', '30', '12', '0', '120', '120', '0', '30', '38', '1', '0', '0', '16', '16', '16', '0', '0', '0', '0', '80', '160', '1351960781', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('237', 'mob/szczur3.gif', '42', '10', '5', 'Szczurzy Wojownik', '16', '0', '32', '48', '840', '840', '116', '60', '30', '12', '0', '120', '120', '0', '30', '38', '1', '0', '0', '16', '16', '16', '0', '0', '0', '0', '80', '160', '1351960364', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('238', 'mob/szczur3.gif', '42', '12', '10', 'Szczurzy Wojownik', '16', '0', '32', '48', '840', '840', '116', '60', '30', '12', '0', '120', '120', '0', '30', '38', '1', '0', '0', '16', '16', '16', '0', '0', '0', '0', '80', '160', '1351960338', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('239', 'mob/szczur3.gif', '43', '15', '12', 'Szczurzy Wojownik', '16', '0', '32', '48', '840', '840', '116', '60', '30', '12', '0', '120', '120', '0', '30', '38', '1', '0', '0', '16', '16', '16', '0', '0', '0', '0', '80', '160', '1351961732', '43001', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('240', 'mob/szczur3.gif', '43', '16', '11', 'Szczurzy Wojownik', '16', '0', '32', '48', '840', '840', '116', '60', '30', '12', '0', '120', '120', '0', '30', '38', '1', '0', '0', '16', '16', '16', '0', '0', '0', '0', '80', '160', '1351961732', '43001', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('241', 'mob/szczur3.gif', '43', '14', '8', 'Szczurzy Wojownik', '16', '0', '32', '48', '840', '840', '116', '60', '30', '12', '0', '120', '120', '0', '30', '38', '1', '0', '0', '16', '16', '16', '0', '0', '0', '0', '80', '160', '1351961708', '43002', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('242', 'mob/szczur3.gif', '43', '15', '7', 'Szczurzy Wojownik', '16', '0', '32', '48', '840', '840', '116', '60', '30', '12', '0', '120', '120', '0', '30', '38', '1', '0', '0', '16', '16', '16', '0', '0', '0', '0', '80', '160', '1351961708', '43002', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('243', 'mob/szczur3.gif', '43', '10', '8', 'Szczurzy Wojownik', '16', '0', '32', '48', '840', '840', '116', '60', '30', '12', '0', '120', '120', '0', '30', '38', '1', '0', '0', '16', '16', '16', '0', '0', '0', '0', '80', '160', '1351961693', '43003', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('244', 'mob/szczur3.gif', '43', '10', '6', 'Szczurzy Wojownik', '16', '0', '32', '48', '840', '840', '116', '60', '30', '12', '0', '120', '120', '0', '30', '38', '1', '0', '0', '16', '16', '16', '0', '0', '0', '0', '80', '160', '1351961693', '43003', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('245', 'mob/szczur3.gif', '43', '11', '7', 'Szczurzy Wojownik', '16', '0', '32', '48', '840', '840', '116', '60', '30', '12', '0', '120', '120', '0', '30', '38', '1', '0', '0', '16', '16', '16', '0', '0', '0', '0', '80', '160', '1351961693', '43003', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('246', 'mob/szczur2.gif', '43', '7', '6', 'Szczurzy Krol', '17', '0', '32', '48', '935', '935', '117', '68', '34', '13', '0', '120', '120', '0', '29', '47', '1', '0', '0', '17', '17', '17', '0', '0', '0', '0', '85', '170', '1351961698', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('247', 'mob/szczur2.gif', '43', '6', '3', 'Szczurzy Krol', '17', '0', '32', '48', '935', '935', '117', '68', '34', '13', '0', '120', '120', '0', '29', '47', '1', '0', '0', '17', '17', '17', '0', '0', '0', '0', '85', '170', '1351961694', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('248', 'mob/szczur2.gif', '43', '13', '4', 'Szczurzy Krol', '17', '0', '32', '48', '935', '935', '117', '68', '34', '13', '0', '120', '120', '0', '29', '47', '1', '0', '0', '17', '17', '17', '0', '0', '0', '0', '85', '170', '1351961733', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('249', 'mob/szczur2.gif', '43', '12', '8', 'Szczurzy Krol', '17', '0', '32', '48', '935', '935', '117', '68', '34', '13', '0', '120', '120', '0', '29', '47', '1', '0', '0', '17', '17', '17', '0', '0', '0', '0', '85', '170', '1351961714', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('250', 'mob/szczur2.gif', '43', '9', '3', 'Szczurzy Krol', '17', '0', '32', '48', '935', '935', '117', '68', '34', '13', '0', '120', '120', '0', '29', '47', '1', '0', '0', '17', '17', '17', '0', '0', '0', '0', '85', '170', '1351961688', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('251', 'mob/szczur2.gif', '44', '9', '3', 'Szczurzy Krol', '17', '0', '32', '48', '935', '935', '117', '68', '34', '13', '0', '120', '120', '0', '29', '47', '1', '0', '0', '17', '17', '17', '0', '0', '0', '0', '85', '170', '1351961585', '44001', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('252', 'mob/szczur2.gif', '44', '10', '4', 'Szczurzy Krol', '17', '0', '32', '48', '935', '935', '117', '68', '34', '13', '0', '120', '120', '0', '29', '47', '1', '0', '0', '17', '17', '17', '0', '0', '0', '0', '85', '170', '1351961585', '44001', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('253', 'mob/szczur2.gif', '44', '9', '5', 'Szczurzy Krol', '17', '0', '32', '48', '935', '935', '117', '68', '34', '13', '0', '120', '120', '0', '29', '47', '1', '0', '0', '17', '17', '17', '0', '0', '0', '0', '85', '170', '1351961574', '44002', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('254', 'mob/szczur2.gif', '44', '8', '6', 'Szczurzy Krol', '17', '0', '32', '48', '935', '935', '117', '68', '34', '13', '0', '120', '120', '0', '29', '47', '1', '0', '0', '17', '17', '17', '0', '0', '0', '0', '85', '170', '1351961574', '44002', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('255', 'mob/szczur2.gif', '44', '5', '5', 'Szczurzy Krol', '17', '0', '32', '48', '935', '935', '117', '68', '34', '13', '0', '120', '120', '0', '29', '47', '1', '0', '0', '17', '17', '17', '0', '0', '0', '0', '85', '170', '1351961564', '44003', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('256', 'mob/szczur2.gif', '44', '3', '5', 'Szczurzy Krol', '17', '0', '32', '48', '935', '935', '117', '68', '34', '13', '0', '120', '120', '0', '29', '47', '1', '0', '0', '17', '17', '17', '0', '0', '0', '0', '85', '170', '1351961564', '44003', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('257', 'mob/szczur2.gif', '44', '4', '3', 'Szczurzy Krol', '17', '0', '32', '48', '935', '935', '117', '68', '34', '13', '0', '120', '120', '0', '29', '47', '1', '0', '0', '17', '17', '17', '0', '0', '0', '0', '85', '170', '1351961564', '44003', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('258', 'mob/szczur2.gif', '44', '7', '10', 'Szczurzy Krol', '17', '0', '32', '48', '935', '935', '117', '68', '34', '13', '0', '120', '120', '0', '29', '47', '1', '0', '0', '17', '17', '17', '0', '0', '0', '0', '85', '170', '1351961600', '44004', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('259', 'mob/szczur1.gif', '44', '8', '10', 'Szczur Zbozowy', '14', '0', '32', '48', '665', '665', '114', '45', '22', '9', '0', '120', '120', '0', '19', '33', '1', '0', '0', '14', '14', '14', '0', '0', '0', '0', '70', '140', '1351961570', '44004', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('260', 'mob/szczur1.gif', '44', '7', '11', 'Szczur Zbozowy', '14', '0', '32', '48', '665', '665', '114', '45', '22', '9', '0', '120', '120', '0', '19', '33', '1', '0', '0', '14', '14', '14', '0', '0', '0', '0', '70', '140', '1351961570', '44004', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('261', 'mob/szczur3.gif', '44', '7', '12', 'Szczurzy Wojownik', '16', '0', '32', '48', '840', '840', '116', '60', '30', '12', '0', '120', '120', '0', '30', '38', '1', '0', '0', '16', '16', '16', '0', '0', '0', '0', '80', '160', '1351961590', '44004', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('262', 'mob/szczur3.gif', '44', '8', '12', 'Szczurzy Wojownik', '16', '0', '32', '48', '840', '840', '116', '60', '30', '12', '0', '120', '120', '0', '30', '38', '1', '0', '0', '16', '16', '16', '0', '0', '0', '0', '80', '160', '1351961590', '44004', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('263', 'mob/szczur.gif', '44', '9', '12', 'Szczur', '13', '0', '32', '48', '540', '540', '113', '39', '19', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '13', '13', '13', '0', '0', '0', '0', '65', '130', '1351961560', '44004', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('264', 'mob/szczur.gif', '44', '9', '11', 'Szczur', '13', '0', '32', '48', '540', '540', '113', '39', '19', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '13', '13', '13', '0', '0', '0', '0', '65', '130', '1351961560', '44004', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('265', 'mob/szczur.gif', '44', '9', '10', 'Szczur', '13', '0', '32', '48', '540', '540', '113', '39', '19', '7', '0', '120', '120', '0', '20', '25', '1', '0', '0', '13', '13', '13', '0', '0', '0', '0', '65', '130', '1351961560', '44004', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('266', 'mob/heroes/karmazyn.gif', '44', '8', '11', 'Karmazynowy Mściciel', '45', '4', '36', '44', '8900', '8900', '145', '275', '510', '75', '5', '120', '127', '0', '0', '0', '6', '600', '0', '0', '450', '450', '1100', '1020', '0', '0', '3375', '16200', '1351875908', '0', '0', '45', '0', '12', '0');
INSERT INTO `mob` VALUES ('268', 'mob/wywerna1.gif', '8', '80', '53', 'Młoda Wywerna', '23', '0', '48', '48', '1510', '1510', '123', '114', '57', '25', '0', '120', '120', '0', '81', '149', '1', '0', '0', '23', '23', '23', '0', '0', '0', '0', '115', '230', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('269', 'mob/wywerna1.gif', '8', '50', '51', 'Młoda Wywerna', '23', '0', '48', '48', '1510', '1510', '123', '114', '57', '25', '0', '120', '120', '0', '81', '149', '1', '0', '0', '23', '23', '23', '0', '0', '0', '0', '115', '230', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('270', 'mob/wywerna1.gif', '8', '84', '63', 'Młoda Wywerna', '23', '0', '48', '48', '1510', '1510', '123', '114', '57', '25', '0', '120', '120', '0', '81', '149', '1', '0', '0', '23', '23', '23', '0', '0', '0', '0', '115', '230', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('271', 'mob/wywerna2.gif', '8', '58', '49', 'Mała Wywerna', '25', '0', '48', '48', '1750', '1750', '125', '126', '63', '30', '0', '120', '120', '0', '106', '168', '1', '0', '0', '25', '25', '25', '0', '0', '0', '0', '125', '250', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('272', 'mob/wywerna2.gif', '8', '78', '52', 'Mała Wywerna', '25', '0', '48', '48', '1750', '1750', '125', '126', '63', '30', '0', '120', '120', '0', '106', '168', '1', '0', '0', '25', '25', '25', '0', '0', '0', '0', '125', '250', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('273', 'mob/wywerna2.gif', '8', '46', '54', 'Mała Wywerna', '25', '0', '48', '48', '1750', '1750', '125', '126', '63', '30', '0', '120', '120', '0', '106', '168', '1', '0', '0', '25', '25', '25', '0', '0', '0', '0', '125', '250', '1351860451', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('274', 'mob/jez.gif', '11', '30', '59', 'Jeż', '16', '0', '26', '16', '790', '790', '116', '60', '30', '12', '0', '120', '120', '0', '32', '72', '1', '0', '0', '16', '16', '16', '0', '0', '0', '0', '80', '160', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('275', 'mob/', '0', '0', '0', '', '0', '0', '32', '48', '0', '0', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('276', 'mob/jez.gif', '11', '25', '48', 'Jeż', '16', '0', '26', '16', '790', '790', '116', '60', '30', '12', '0', '120', '120', '0', '32', '72', '1', '0', '0', '16', '16', '16', '0', '0', '0', '0', '80', '160', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('277', 'mob/', '0', '0', '0', '', '0', '0', '32', '48', '0', '0', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('278', 'mob/jez.gif', '11', '51', '56', 'Jeż', '16', '0', '26', '16', '790', '790', '116', '60', '30', '12', '0', '120', '120', '0', '32', '72', '1', '0', '0', '16', '16', '16', '0', '0', '0', '0', '80', '160', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('279', 'mob/', '0', '0', '0', '', '0', '0', '32', '48', '0', '0', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('280', 'mob/jez.gif', '11', '69', '51', 'Jeż', '16', '0', '26', '16', '790', '790', '116', '60', '30', '12', '0', '120', '120', '0', '32', '72', '1', '0', '0', '16', '16', '16', '0', '0', '0', '0', '80', '160', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('281', 'mob/', '0', '0', '0', '', '0', '0', '32', '48', '0', '0', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('282', 'mob/jez.gif', '11', '68', '31', 'Jeż', '16', '0', '26', '16', '790', '790', '116', '60', '30', '12', '0', '120', '120', '0', '32', '72', '1', '0', '0', '16', '16', '16', '0', '0', '0', '0', '80', '160', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('283', 'mob/', '0', '0', '0', '', '0', '0', '32', '48', '0', '0', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('284', 'mob/jez.gif', '11', '61', '23', 'Jeż', '16', '0', '26', '16', '790', '790', '116', '60', '30', '12', '0', '120', '120', '0', '32', '72', '1', '0', '0', '16', '16', '16', '0', '0', '0', '0', '80', '160', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('285', 'mob/', '0', '0', '0', '', '0', '0', '32', '48', '0', '0', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('286', 'mob/jez.gif', '11', '72', '10', 'Jeż', '16', '0', '26', '16', '790', '790', '116', '60', '30', '12', '0', '120', '120', '0', '32', '72', '1', '0', '0', '16', '16', '16', '0', '0', '0', '0', '80', '160', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('287', 'mob/', '0', '0', '0', '', '0', '0', '32', '48', '0', '0', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('288', 'mob/jez.gif', '11', '63', '24', 'Jeż', '16', '0', '26', '16', '790', '790', '116', '60', '30', '12', '0', '120', '120', '0', '32', '72', '1', '0', '0', '16', '16', '16', '0', '0', '0', '0', '80', '160', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('289', 'mob/', '0', '0', '0', '', '0', '0', '32', '48', '0', '0', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('290', 'mob/jez.gif', '11', '18', '50', 'Jeż', '16', '0', '26', '16', '790', '790', '116', '60', '30', '12', '0', '120', '120', '0', '32', '72', '1', '0', '0', '16', '16', '16', '0', '0', '0', '0', '80', '160', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('291', 'mob/', '0', '0', '0', '', '0', '0', '32', '48', '0', '0', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('292', 'mob/jez.gif', '11', '41', '34', 'Jeż', '16', '0', '26', '16', '790', '790', '116', '60', '30', '12', '0', '120', '120', '0', '32', '72', '1', '0', '0', '16', '16', '16', '0', '0', '0', '0', '80', '160', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('293', 'mob/', '0', '0', '0', '', '0', '0', '32', '48', '0', '0', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('294', 'mob/jez.gif', '11', '59', '45', 'Jeż', '16', '0', '26', '16', '790', '790', '116', '60', '30', '12', '0', '120', '120', '0', '32', '72', '1', '0', '0', '16', '16', '16', '0', '0', '0', '0', '80', '160', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('295', 'mob/', '0', '0', '0', '', '0', '0', '32', '48', '0', '0', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('296', 'mob/jez.gif', '11', '84', '48', 'Jeż', '16', '0', '26', '16', '790', '790', '116', '60', '30', '12', '0', '120', '120', '0', '32', '72', '1', '0', '0', '16', '16', '16', '0', '0', '0', '0', '80', '160', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('297', 'mob/', '0', '0', '0', '', '0', '0', '32', '48', '0', '0', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('298', 'mob/jez.gif', '11', '92', '13', 'Jeż', '16', '0', '26', '16', '790', '790', '116', '60', '30', '12', '0', '120', '120', '0', '32', '72', '1', '0', '0', '16', '16', '16', '0', '0', '0', '0', '80', '160', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('299', 'mob/', '0', '0', '0', '', '0', '0', '32', '48', '0', '0', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('300', 'mob/jez.gif', '11', '37', '13', 'Jeż', '16', '0', '26', '16', '790', '790', '116', '60', '30', '12', '0', '120', '120', '0', '32', '72', '1', '0', '0', '16', '16', '16', '0', '0', '0', '0', '80', '160', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('301', 'mob/', '0', '0', '0', '', '0', '0', '32', '48', '0', '0', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('302', 'mob/jez.gif', '11', '43', '5', 'Jeż', '16', '0', '26', '16', '790', '790', '116', '60', '30', '12', '0', '120', '120', '0', '32', '72', '1', '0', '0', '16', '16', '16', '0', '0', '0', '0', '80', '160', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('303', 'mob/', '0', '0', '0', '', '0', '0', '32', '48', '0', '0', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('304', 'mob/jez.gif', '11', '45', '6', 'Jeż', '16', '0', '26', '16', '790', '790', '116', '60', '30', '12', '0', '120', '120', '0', '32', '72', '1', '0', '0', '16', '16', '16', '0', '0', '0', '0', '80', '160', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('305', 'mob/', '0', '0', '0', '', '0', '0', '32', '48', '0', '0', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('306', 'mob/jez.gif', '11', '26', '16', 'Jeż', '16', '0', '26', '16', '790', '790', '116', '60', '30', '12', '0', '120', '120', '0', '32', '72', '1', '0', '0', '16', '16', '16', '0', '0', '0', '0', '80', '160', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('307', 'mob/', '0', '0', '0', '', '0', '0', '32', '48', '0', '0', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('308', 'mob/jez.gif', '11', '4', '11', 'Jeż', '16', '0', '26', '16', '790', '790', '116', '60', '30', '12', '0', '120', '120', '0', '32', '72', '1', '0', '0', '16', '16', '16', '0', '0', '0', '0', '80', '160', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('309', 'mob/', '0', '0', '0', '', '0', '0', '32', '48', '0', '0', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('310', 'mob/jez.gif', '11', '7', '32', 'Jeż', '16', '0', '26', '16', '790', '790', '116', '60', '30', '12', '0', '120', '120', '0', '32', '72', '1', '0', '0', '16', '16', '16', '0', '0', '0', '0', '80', '160', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('311', 'mob/', '0', '0', '0', '', '0', '0', '32', '48', '0', '0', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('312', 'mob/jez.gif', '11', '15', '32', 'Jeż', '16', '0', '26', '16', '790', '790', '116', '60', '30', '12', '0', '120', '120', '0', '32', '72', '1', '0', '0', '16', '16', '16', '0', '0', '0', '0', '80', '160', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('313', 'mob/', '0', '0', '0', '', '0', '0', '32', '48', '0', '0', '100', '0', '0', '0', '0', '120', '120', '0', '0', '0', '1', '0', '0', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('314', 'mob/zubr.gif', '11', '46', '57', 'Żubr', '20', '0', '90', '56', '1166', '1166', '120', '87', '44', '19', '0', '120', '120', '0', '71', '99', '1', '0', '0', '20', '20', '20', '0', '0', '0', '0', '100', '200', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('315', 'mob/zubr.gif', '11', '57', '56', 'Żubr', '20', '0', '90', '56', '1166', '1166', '120', '87', '44', '19', '0', '120', '120', '0', '71', '99', '1', '0', '0', '20', '20', '20', '0', '0', '0', '0', '100', '200', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('316', 'mob/zubr.gif', '11', '27', '52', 'Żubr', '20', '0', '90', '56', '1166', '1166', '120', '87', '44', '19', '0', '120', '120', '0', '71', '99', '1', '0', '0', '20', '20', '20', '0', '0', '0', '0', '100', '200', '1351929075', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('317', 'mob/zubr.gif', '11', '84', '7', 'Żubr', '20', '0', '90', '56', '1166', '1166', '120', '87', '44', '19', '0', '120', '120', '0', '71', '99', '1', '0', '0', '20', '20', '20', '0', '0', '0', '0', '100', '200', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('318', 'mob/zubr.gif', '11', '81', '5', 'Żubr', '20', '0', '90', '56', '1166', '1166', '120', '87', '44', '19', '0', '120', '120', '0', '71', '99', '1', '0', '0', '20', '20', '20', '0', '0', '0', '0', '100', '200', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('319', 'mob/zubr.gif', '11', '40', '40', 'Żubr', '20', '0', '90', '56', '1166', '1166', '120', '87', '44', '19', '0', '120', '120', '0', '71', '99', '1', '0', '0', '20', '20', '20', '0', '0', '0', '0', '100', '200', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('320', 'mob/zubr.gif', '11', '16', '42', 'Żubr', '20', '0', '90', '56', '1166', '1166', '120', '87', '44', '19', '0', '120', '120', '0', '71', '99', '1', '0', '0', '20', '20', '20', '0', '0', '0', '0', '100', '200', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('321', 'mob/zubr.gif', '11', '51', '44', 'Żubr', '20', '0', '90', '56', '1166', '1166', '120', '87', '44', '19', '0', '120', '120', '0', '71', '99', '1', '0', '0', '20', '20', '20', '0', '0', '0', '0', '100', '200', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('322', 'mob/zubr.gif', '11', '56', '38', 'Żubr', '20', '0', '90', '56', '1166', '1166', '120', '87', '44', '19', '0', '120', '120', '0', '71', '99', '1', '0', '0', '20', '20', '20', '0', '0', '0', '0', '100', '200', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('323', 'mob/zubr.gif', '11', '69', '42', 'Żubr', '20', '0', '90', '56', '1166', '1166', '120', '87', '44', '19', '0', '120', '120', '0', '71', '99', '1', '0', '0', '20', '20', '20', '0', '0', '0', '0', '100', '200', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('324', 'mob/zubr.gif', '11', '91', '50', 'Żubr', '20', '0', '90', '56', '1166', '1166', '120', '87', '44', '19', '0', '120', '120', '0', '71', '99', '1', '0', '0', '20', '20', '20', '0', '0', '0', '0', '100', '200', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('325', 'mob/zubr.gif', '11', '75', '58', 'Żubr', '20', '0', '90', '56', '1166', '1166', '120', '87', '44', '19', '0', '120', '120', '0', '71', '99', '1', '0', '0', '20', '20', '20', '0', '0', '0', '0', '100', '200', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('326', 'mob/zubr.gif', '11', '76', '35', 'Żubr', '20', '0', '90', '56', '1166', '1166', '120', '87', '44', '19', '0', '120', '120', '0', '71', '99', '1', '0', '0', '20', '20', '20', '0', '0', '0', '0', '100', '200', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('327', 'mob/zubr.gif', '11', '4', '46', 'Żubr', '20', '0', '90', '56', '1166', '1166', '120', '87', '44', '19', '0', '120', '120', '0', '71', '99', '1', '0', '0', '20', '20', '20', '0', '0', '0', '0', '100', '200', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('328', 'mob/zubr.gif', '11', '38', '24', 'Żubr', '20', '0', '90', '56', '1166', '1166', '120', '87', '44', '19', '0', '120', '120', '0', '71', '99', '1', '0', '0', '20', '20', '20', '0', '0', '0', '0', '100', '200', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('329', 'mob/zubr.gif', '11', '49', '24', 'Żubr', '20', '0', '90', '56', '1166', '1166', '120', '87', '44', '19', '0', '120', '120', '0', '71', '99', '1', '0', '0', '20', '20', '20', '0', '0', '0', '0', '100', '200', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('330', 'mob/zubr.gif', '11', '25', '7', 'Żubr', '20', '0', '90', '56', '1166', '1166', '120', '87', '44', '19', '0', '120', '120', '0', '71', '99', '1', '0', '0', '20', '20', '20', '0', '0', '0', '0', '100', '200', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('331', 'mob/zubr.gif', '11', '16', '26', 'Żubr', '20', '0', '90', '56', '1166', '1166', '120', '87', '44', '19', '0', '120', '120', '0', '71', '99', '1', '0', '0', '20', '20', '20', '0', '0', '0', '0', '100', '200', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('332', 'mob/zubr.gif', '11', '22', '8', 'Żubr', '20', '0', '90', '56', '1166', '1166', '120', '87', '44', '19', '0', '120', '120', '0', '71', '99', '1', '0', '0', '20', '20', '20', '0', '0', '0', '0', '100', '200', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('333', 'mob/zubr.gif', '11', '27', '21', 'Żubr', '20', '0', '90', '56', '1166', '1166', '120', '87', '44', '19', '0', '120', '120', '0', '71', '99', '1', '0', '0', '20', '20', '20', '0', '0', '0', '0', '100', '200', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('334', 'mob/zubr.gif', '11', '11', '6', 'Żubr', '20', '0', '90', '56', '1166', '1166', '120', '87', '44', '19', '0', '120', '120', '0', '71', '99', '1', '0', '0', '20', '20', '20', '0', '0', '0', '0', '100', '200', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('335', 'mob/zubr.gif', '11', '11', '57', 'Żubr', '20', '0', '90', '56', '1166', '1166', '120', '87', '44', '19', '0', '120', '120', '0', '71', '99', '1', '0', '0', '20', '20', '20', '0', '0', '0', '0', '100', '200', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('336', 'mob/zubr.gif', '12', '78', '1', 'Żubr', '20', '0', '90', '56', '1166', '1166', '120', '87', '44', '19', '0', '120', '120', '0', '71', '99', '1', '0', '0', '20', '20', '20', '0', '0', '0', '0', '100', '200', '0', '0', '0', '0', '0', '1', '0');
INSERT INTO `mob` VALUES ('337', 'mob/zulus1.gif', '12', '90', '22', 'Fula Gula', '25', '0', '32', '42', '1750', '1750', '125', '126', '63', '30', '0', '120', '120', '0', '106', '168', '1', '0', '0', '25', '25', '25', '0', '0', '0', '0', '125', '250', '1351929215', '0', '0', '0', '0', '13', '0');
INSERT INTO `mob` VALUES ('338', 'mob/zulus1.gif', '12', '69', '34', 'Fula Gula', '25', '0', '32', '42', '1750', '1750', '125', '126', '63', '30', '0', '120', '120', '0', '106', '168', '1', '0', '0', '25', '25', '25', '0', '0', '0', '0', '125', '250', '1351929258', '0', '0', '0', '0', '13', '0');
INSERT INTO `mob` VALUES ('339', 'mob/zulus1.gif', '12', '51', '57', 'Fula Gula', '25', '0', '32', '42', '1750', '1750', '125', '126', '63', '30', '0', '120', '120', '0', '106', '168', '1', '0', '0', '25', '25', '25', '0', '0', '0', '0', '125', '250', '0', '0', '0', '0', '0', '13', '0');
INSERT INTO `mob` VALUES ('340', 'mob/goblin1.gif', '17', '87', '22', 'Leśny Goblin', '30', '1', '26', '34', '2500', '2500', '133', '135', '68', '32', '1', '122', '120', '0', '90', '160', '1', '0', '0', '33', '33', '33', '0', '0', '0', '0', '150', '300', '1352029096', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('341', 'mob/goblin1.gif', '17', '87', '33', 'Leśny Goblin', '30', '1', '26', '34', '2500', '2500', '133', '135', '68', '32', '1', '122', '120', '0', '90', '160', '1', '0', '0', '33', '33', '33', '0', '0', '0', '0', '150', '300', '1352029074', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('342', 'mob/goblin1.gif', '17', '9', '16', 'Leśny Goblin', '30', '1', '26', '34', '2500', '2500', '133', '135', '68', '32', '1', '122', '120', '0', '90', '160', '1', '0', '0', '33', '33', '33', '0', '0', '0', '0', '150', '300', '1352029541', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('343', 'mob/goblin1.gif', '17', '48', '18', 'Leśny Goblin', '30', '1', '26', '34', '2500', '2500', '133', '135', '68', '32', '1', '122', '120', '0', '90', '160', '1', '0', '0', '33', '33', '33', '0', '0', '0', '0', '150', '300', '1352030359', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('344', 'mob/goblin1.gif', '17', '63', '38', 'Leśny Goblin', '30', '1', '26', '34', '2500', '2500', '133', '135', '68', '32', '1', '122', '120', '0', '90', '160', '1', '0', '0', '33', '33', '33', '0', '0', '0', '0', '150', '300', '1352029319', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('345', 'mob/goblin1.gif', '17', '82', '41', 'Leśny Goblin', '30', '1', '26', '34', '2500', '2500', '133', '135', '68', '32', '1', '122', '120', '0', '90', '160', '1', '0', '0', '33', '33', '33', '0', '0', '0', '0', '150', '300', '1352029276', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('346', 'mob/goblin1.gif', '17', '73', '58', 'Leśny Goblin', '30', '1', '26', '34', '2500', '2500', '133', '135', '68', '32', '1', '122', '120', '0', '90', '160', '1', '0', '0', '33', '33', '33', '0', '0', '0', '0', '150', '300', '0', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('347', 'mob/goblin1.gif', '17', '45', '43', 'Leśny Goblin', '30', '1', '26', '34', '2500', '2500', '133', '135', '68', '32', '1', '122', '120', '0', '90', '160', '1', '0', '0', '33', '33', '33', '0', '0', '0', '0', '150', '300', '1352029348', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('348', 'mob/goblin1.gif', '17', '19', '12', 'Leśny Goblin', '30', '1', '26', '34', '2500', '2500', '133', '135', '68', '32', '1', '122', '120', '0', '90', '160', '1', '0', '0', '33', '33', '33', '0', '0', '0', '0', '150', '300', '1352030853', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('349', 'mob/goblin1.gif', '17', '36', '5', 'Leśny Goblin', '30', '1', '26', '34', '2500', '2500', '133', '135', '68', '32', '1', '122', '120', '0', '90', '160', '1', '0', '0', '33', '33', '33', '0', '0', '0', '0', '150', '300', '1352030770', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('350', 'mob/goblin1.gif', '17', '89', '62', 'Leśny Goblin', '30', '1', '26', '34', '2500', '2500', '133', '135', '68', '32', '1', '122', '120', '0', '90', '160', '1', '0', '0', '33', '33', '33', '0', '0', '0', '0', '150', '300', '1352029220', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('351', 'mob/goblin1.gif', '18', '8', '5', 'Leśny Goblin', '30', '1', '26', '34', '2500', '2500', '133', '135', '68', '32', '1', '122', '120', '0', '90', '160', '1', '0', '0', '33', '33', '33', '0', '0', '0', '0', '150', '300', '1352030977', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('352', 'mob/goblin1.gif', '18', '37', '52', 'Leśny Goblin', '30', '1', '26', '34', '2500', '2500', '133', '135', '68', '32', '1', '122', '120', '0', '90', '160', '1', '0', '0', '33', '33', '33', '0', '0', '0', '0', '150', '300', '1352029960', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('353', 'mob/goblin1.gif', '18', '10', '49', 'Leśny Goblin', '30', '1', '26', '34', '2500', '2500', '133', '135', '68', '32', '1', '122', '120', '0', '90', '160', '1', '0', '0', '33', '33', '33', '0', '0', '0', '0', '150', '300', '1352030921', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('354', 'mob/goblin1.gif', '18', '53', '61', 'Leśny Goblin', '30', '1', '26', '34', '2500', '2500', '133', '135', '68', '32', '1', '122', '120', '0', '90', '160', '1', '0', '0', '33', '33', '33', '0', '0', '0', '0', '150', '300', '1352029987', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('355', 'mob/goblin1.gif', '18', '41', '3', 'Leśny Goblin', '30', '1', '26', '34', '2500', '2500', '133', '135', '68', '32', '1', '122', '120', '0', '90', '160', '1', '0', '0', '33', '33', '33', '0', '0', '0', '0', '150', '300', '1352030125', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('356', 'mob/goblin1.gif', '19', '10', '12', 'Leśny Goblin', '30', '1', '26', '34', '2500', '2500', '133', '135', '68', '32', '1', '122', '120', '0', '90', '160', '1', '0', '0', '33', '33', '33', '0', '0', '0', '0', '150', '300', '0', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('357', 'mob/goblin1.gif', '19', '6', '32', 'Leśny Goblin', '30', '1', '26', '34', '2500', '2500', '133', '135', '68', '32', '1', '122', '120', '0', '90', '160', '1', '0', '0', '33', '33', '33', '0', '0', '0', '0', '150', '300', '1352031111', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('358', 'mob/goblin1.gif', '19', '55', '18', 'Leśny Goblin', '30', '1', '26', '34', '2500', '2500', '133', '135', '68', '32', '1', '122', '120', '0', '90', '160', '1', '0', '0', '33', '33', '33', '0', '0', '0', '0', '150', '300', '0', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('359', 'mob/goblin1.gif', '19', '13', '40', 'Leśny Goblin', '30', '1', '26', '34', '2500', '2500', '133', '135', '68', '32', '1', '122', '120', '0', '90', '160', '1', '0', '0', '33', '33', '33', '0', '0', '0', '0', '150', '300', '1352031147', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('360', 'mob/goblin1.gif', '19', '76', '9', 'Leśny Goblin', '30', '1', '26', '34', '2500', '2500', '133', '135', '68', '32', '1', '122', '120', '0', '90', '160', '1', '0', '0', '33', '33', '33', '0', '0', '0', '0', '150', '300', '0', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('361', 'mob/goblin1.gif', '19', '17', '55', 'Leśny Goblin', '30', '1', '26', '34', '2500', '2500', '133', '135', '68', '32', '1', '122', '120', '0', '90', '160', '1', '0', '0', '33', '33', '33', '0', '0', '0', '0', '150', '300', '1352031003', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('362', 'mob/goblin1.gif', '19', '30', '10', 'Leśny Goblin', '30', '1', '26', '34', '2500', '2500', '133', '135', '68', '32', '1', '122', '120', '0', '90', '160', '1', '0', '0', '33', '33', '33', '0', '0', '0', '0', '150', '300', '0', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('363', 'mob/goblin1.gif', '17', '19', '49', 'Zły Goblin', '31', '1', '26', '34', '2650', '2650', '134', '151', '76', '31', '1', '123', '120', '0', '100', '168', '1', '0', '0', '34', '34', '34', '0', '0', '0', '0', '155', '310', '1352029450', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('364', 'mob/goblin1.gif', '17', '57', '7', 'Zły Goblin', '31', '1', '26', '34', '2650', '2650', '134', '151', '76', '31', '1', '123', '120', '0', '100', '168', '1', '0', '0', '34', '34', '34', '0', '0', '0', '0', '155', '310', '1352030401', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('365', 'mob/goblin1.gif', '17', '68', '12', 'Zły Goblin', '31', '1', '26', '34', '2650', '2650', '134', '151', '76', '31', '1', '123', '120', '0', '100', '168', '1', '0', '0', '34', '34', '34', '0', '0', '0', '0', '155', '310', '1352030421', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('366', 'mob/goblin1.gif', '17', '68', '45', 'Zły Goblin', '31', '1', '26', '34', '2650', '2650', '134', '151', '76', '31', '1', '123', '120', '0', '100', '168', '1', '0', '0', '34', '34', '34', '0', '0', '0', '0', '155', '310', '1352029311', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('367', 'mob/goblin1.gif', '17', '87', '7', 'Zły Goblin', '31', '1', '26', '34', '2650', '2650', '134', '151', '76', '31', '1', '123', '120', '0', '100', '168', '1', '0', '0', '34', '34', '34', '0', '0', '0', '0', '155', '310', '1352029137', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('368', 'mob/goblin1.gif', '17', '39', '50', 'Zły Goblin', '31', '1', '26', '34', '2650', '2650', '134', '151', '76', '31', '1', '123', '120', '0', '100', '168', '1', '0', '0', '34', '34', '34', '0', '0', '0', '0', '155', '310', '1352029397', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('369', 'mob/goblin1.gif', '17', '36', '13', 'Zły Goblin', '31', '1', '26', '34', '2650', '2650', '134', '151', '76', '31', '1', '123', '120', '0', '100', '168', '1', '0', '0', '34', '34', '34', '0', '0', '0', '0', '155', '310', '1352030808', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('370', 'mob/goblin1.gif', '17', '91', '61', 'Zły Goblin', '31', '1', '26', '34', '2650', '2650', '134', '151', '76', '31', '1', '123', '120', '0', '100', '168', '1', '0', '0', '34', '34', '34', '0', '0', '0', '0', '155', '310', '1352029236', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('371', 'mob/goblin1.gif', '19', '82', '31', 'Zły Goblin', '31', '1', '26', '34', '2650', '2650', '134', '151', '76', '31', '1', '123', '120', '0', '100', '168', '1', '0', '0', '34', '34', '34', '0', '0', '0', '0', '155', '310', '0', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('372', 'mob/goblin1.gif', '19', '62', '9', 'Zły Goblin', '31', '1', '26', '34', '2650', '2650', '134', '151', '76', '31', '1', '123', '120', '0', '100', '168', '1', '0', '0', '34', '34', '34', '0', '0', '0', '0', '155', '310', '1352030108', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('373', 'mob/goblin1.gif', '19', '85', '57', 'Zły Goblin', '31', '1', '26', '34', '2650', '2650', '134', '151', '76', '31', '1', '123', '120', '0', '100', '168', '1', '0', '0', '34', '34', '34', '0', '0', '0', '0', '155', '310', '0', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('374', 'mob/goblin1.gif', '19', '85', '20', 'Zły Goblin', '31', '1', '26', '34', '2650', '2650', '134', '151', '76', '31', '1', '123', '120', '0', '100', '168', '1', '0', '0', '34', '34', '34', '0', '0', '0', '0', '155', '310', '0', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('375', 'mob/goblin1.gif', '19', '43', '55', 'Zły Goblin', '31', '1', '26', '34', '2650', '2650', '134', '151', '76', '31', '1', '123', '120', '0', '100', '168', '1', '0', '0', '34', '34', '34', '0', '0', '0', '0', '155', '310', '1352029981', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('376', 'mob/goblin1.gif', '19', '18', '54', 'Zły Goblin', '31', '1', '26', '34', '2650', '2650', '134', '151', '76', '31', '1', '123', '120', '0', '100', '168', '1', '0', '0', '34', '34', '34', '0', '0', '0', '0', '155', '310', '1352030911', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('377', 'mob/goblin1.gif', '19', '36', '28', 'Zły Goblin', '31', '1', '26', '34', '2650', '2650', '134', '151', '76', '31', '1', '123', '120', '0', '100', '168', '1', '0', '0', '34', '34', '34', '0', '0', '0', '0', '155', '310', '0', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('378', 'mob/goblin1.gif', '18', '38', '53', 'Zły Goblin', '31', '1', '26', '34', '2650', '2650', '134', '151', '76', '31', '1', '123', '120', '0', '100', '168', '1', '0', '0', '34', '34', '34', '0', '0', '0', '0', '155', '310', '0', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('379', 'mob/goblin1.gif', '18', '41', '27', 'Zły Goblin', '31', '1', '26', '34', '2650', '2650', '134', '151', '76', '31', '1', '123', '120', '0', '100', '168', '1', '0', '0', '34', '34', '34', '0', '0', '0', '0', '155', '310', '0', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('380', 'mob/goblin1.gif', '18', '48', '39', 'Zły Goblin', '31', '1', '26', '34', '2650', '2650', '134', '151', '76', '31', '1', '123', '120', '0', '100', '168', '1', '0', '0', '34', '34', '34', '0', '0', '0', '0', '155', '310', '1352031203', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('381', 'mob/goblin1.gif', '18', '54', '23', 'Zły Goblin', '31', '1', '26', '34', '2650', '2650', '134', '151', '76', '31', '1', '123', '120', '0', '100', '168', '1', '0', '0', '34', '34', '34', '0', '0', '0', '0', '155', '310', '0', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('382', 'mob/goblin1.gif', '18', '7', '21', 'Zły Goblin', '31', '1', '26', '34', '2650', '2650', '134', '151', '76', '31', '1', '123', '120', '0', '100', '168', '1', '0', '0', '34', '34', '34', '0', '0', '0', '0', '155', '310', '0', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('383', 'mob/goblin2.gif', '17', '75', '44', 'Goblin Traper', '32', '1', '40', '36', '1880', '1880', '170', '82', '82', '82', '1', '123', '120', '15', '118', '118', '1', '0', '0', '35', '70', '0', '0', '0', '4', '0', '160', '320', '1352029306', '0', '32', '0', '0', '14', '15');
INSERT INTO `mob` VALUES ('384', 'mob/goblin2.gif', '17', '91', '2', 'Goblin Traper', '32', '1', '40', '36', '1880', '1880', '170', '82', '82', '82', '1', '123', '120', '15', '118', '118', '1', '0', '0', '35', '70', '0', '0', '0', '4', '0', '160', '320', '1352029157', '0', '32', '0', '0', '14', '15');
INSERT INTO `mob` VALUES ('385', 'mob/goblin2.gif', '17', '8', '15', 'Goblin Traper', '32', '1', '40', '36', '1880', '1880', '170', '82', '82', '82', '1', '123', '120', '15', '118', '118', '1', '0', '0', '35', '70', '0', '0', '0', '4', '0', '160', '320', '1352029569', '0', '32', '0', '0', '14', '15');
INSERT INTO `mob` VALUES ('386', 'mob/goblin2.gif', '17', '18', '48', 'Goblin Traper', '32', '1', '40', '36', '1880', '1880', '170', '82', '82', '82', '1', '123', '120', '15', '118', '118', '1', '0', '0', '35', '70', '0', '0', '0', '4', '0', '160', '320', '1352029452', '0', '32', '0', '0', '14', '15');
INSERT INTO `mob` VALUES ('387', 'mob/goblin2.gif', '17', '8', '39', 'Goblin Traper', '32', '1', '40', '36', '1880', '1880', '170', '82', '82', '82', '1', '123', '120', '15', '118', '118', '1', '0', '0', '35', '70', '0', '0', '0', '4', '0', '160', '320', '1352029535', '0', '32', '0', '0', '14', '15');
INSERT INTO `mob` VALUES ('388', 'mob/goblin2.gif', '17', '58', '6', 'Goblin Traper', '32', '1', '40', '36', '1880', '1880', '170', '82', '82', '82', '1', '123', '120', '15', '118', '118', '1', '0', '0', '35', '70', '0', '0', '0', '4', '0', '160', '320', '1352030405', '0', '32', '0', '0', '14', '15');
INSERT INTO `mob` VALUES ('389', 'mob/goblin2.gif', '17', '27', '8', 'Goblin Traper', '32', '1', '40', '36', '1880', '1880', '170', '82', '82', '82', '1', '123', '120', '15', '118', '118', '1', '0', '0', '35', '70', '0', '0', '0', '4', '0', '160', '320', '1352030803', '0', '32', '0', '0', '14', '15');
INSERT INTO `mob` VALUES ('390', 'mob/goblin2.gif', '17', '19', '30', 'Goblin Traper', '32', '1', '40', '36', '1880', '1880', '170', '82', '82', '82', '1', '123', '120', '15', '118', '118', '1', '0', '0', '35', '70', '0', '0', '0', '4', '0', '160', '320', '1352029630', '0', '32', '0', '0', '14', '15');
INSERT INTO `mob` VALUES ('391', 'mob/goblin2.gif', '17', '18', '11', 'Goblin Traper', '32', '1', '40', '36', '1880', '1880', '170', '82', '82', '82', '1', '123', '120', '15', '118', '118', '1', '0', '0', '35', '70', '0', '0', '0', '4', '0', '160', '320', '1352030882', '0', '32', '0', '0', '14', '15');
INSERT INTO `mob` VALUES ('392', 'mob/goblin2.gif', '19', '12', '39', 'Goblin Traper', '32', '1', '40', '36', '1880', '1880', '170', '82', '82', '82', '1', '123', '120', '15', '118', '118', '1', '0', '0', '35', '70', '0', '0', '0', '4', '0', '160', '320', '1352030954', '0', '32', '0', '0', '14', '15');
INSERT INTO `mob` VALUES ('393', 'mob/goblin2.gif', '19', '26', '3', 'Goblin Traper', '32', '1', '40', '36', '1880', '1880', '170', '82', '82', '82', '1', '123', '120', '15', '118', '118', '1', '0', '0', '35', '70', '0', '0', '0', '4', '0', '160', '320', '0', '0', '32', '0', '0', '14', '15');
INSERT INTO `mob` VALUES ('394', 'mob/goblin2.gif', '19', '85', '3', 'Goblin Traper', '32', '1', '40', '36', '1880', '1880', '170', '82', '82', '82', '1', '123', '120', '15', '118', '118', '1', '0', '0', '35', '70', '0', '0', '0', '4', '0', '160', '320', '0', '0', '32', '0', '0', '14', '15');
INSERT INTO `mob` VALUES ('395', 'mob/goblin2.gif', '19', '86', '19', 'Goblin Traper', '32', '1', '40', '36', '1880', '1880', '170', '82', '82', '82', '1', '123', '120', '15', '118', '118', '1', '0', '0', '35', '70', '0', '0', '0', '4', '0', '160', '320', '0', '0', '32', '0', '0', '14', '15');
INSERT INTO `mob` VALUES ('396', 'mob/goblin2.gif', '19', '84', '56', 'Goblin Traper', '32', '1', '40', '36', '1880', '1880', '170', '82', '82', '82', '1', '123', '120', '15', '118', '118', '1', '0', '0', '35', '70', '0', '0', '0', '4', '0', '160', '320', '0', '0', '32', '0', '0', '14', '15');
INSERT INTO `mob` VALUES ('397', 'mob/goblin2.gif', '19', '42', '39', 'Goblin Traper', '32', '1', '40', '36', '1880', '1880', '170', '82', '82', '82', '1', '123', '120', '15', '118', '118', '1', '0', '0', '35', '70', '0', '0', '0', '4', '0', '160', '320', '0', '0', '32', '0', '0', '14', '15');
INSERT INTO `mob` VALUES ('398', 'mob/goblin2.gif', '18', '9', '48', 'Goblin Traper', '32', '1', '40', '36', '1880', '1880', '170', '82', '82', '82', '1', '123', '120', '15', '118', '118', '1', '0', '0', '35', '70', '0', '0', '0', '4', '0', '160', '320', '1352031055', '0', '32', '0', '0', '14', '15');
INSERT INTO `mob` VALUES ('399', 'mob/goblin2.gif', '18', '57', '47', 'Goblin Traper', '32', '1', '40', '36', '1880', '1880', '170', '82', '82', '82', '1', '123', '120', '15', '118', '118', '1', '0', '0', '35', '70', '0', '0', '0', '4', '0', '160', '320', '1352031230', '0', '32', '0', '0', '14', '15');
INSERT INTO `mob` VALUES ('400', 'mob/goblin2.gif', '18', '53', '22', 'Goblin Traper', '32', '1', '40', '36', '1880', '1880', '170', '82', '82', '82', '1', '123', '120', '15', '118', '118', '1', '0', '0', '35', '70', '0', '0', '0', '4', '0', '160', '320', '0', '0', '32', '0', '0', '14', '15');
INSERT INTO `mob` VALUES ('401', 'mob/goblin2.gif', '18', '39', '3', 'Goblin Traper', '32', '1', '40', '36', '1880', '1880', '170', '82', '82', '82', '1', '123', '120', '15', '118', '118', '1', '0', '0', '35', '70', '0', '0', '0', '4', '0', '160', '320', '0', '0', '32', '0', '0', '14', '15');
INSERT INTO `mob` VALUES ('402', 'mob/goblin3.gif', '17', '21', '45', 'Pancerny Goblin', '33', '1', '38', '34', '2970', '2970', '136', '159', '79', '35', '2', '127', '120', '0', '100', '208', '1', '0', '0', '36', '36', '36', '0', '0', '0', '0', '165', '330', '1352029445', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('403', 'mob/goblin3.gif', '19', '62', '41', 'Pancerny Goblin', '33', '1', '38', '34', '2970', '2970', '136', '159', '79', '35', '2', '127', '120', '0', '100', '208', '1', '0', '0', '36', '36', '36', '0', '0', '0', '0', '165', '330', '1352030054', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('404', 'mob/goblin3.gif', '19', '61', '54', 'Pancerny Goblin', '33', '1', '38', '34', '2970', '2970', '136', '159', '79', '35', '2', '127', '120', '0', '100', '208', '1', '0', '0', '36', '36', '36', '0', '0', '0', '0', '165', '330', '1352030038', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('405', 'mob/goblin3.gif', '19', '60', '53', 'Pancerny Goblin', '33', '1', '38', '34', '2970', '2970', '136', '159', '79', '35', '2', '127', '120', '0', '100', '208', '1', '0', '0', '36', '36', '36', '0', '0', '0', '0', '165', '330', '1352030033', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('406', 'mob/goblin3.gif', '19', '55', '41', 'Pancerny Goblin', '33', '1', '38', '34', '2970', '2970', '136', '159', '79', '35', '2', '127', '120', '0', '100', '208', '1', '0', '0', '36', '36', '36', '0', '0', '0', '0', '165', '330', '1352030071', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('407', 'mob/goblin3.gif', '18', '58', '48', 'Pancerny Goblin', '33', '1', '38', '34', '2970', '2970', '136', '159', '79', '35', '2', '127', '120', '0', '100', '208', '1', '0', '0', '36', '36', '36', '0', '0', '0', '0', '165', '330', '1352031250', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('408', 'mob/goblin4.gif', '17', '92', '1', 'Władca Krzewów', '34', '1', '38', '54', '1800', '1800', '137', '83', '166', '37', '2', '120', '125', '0', '0', '0', '6', '218', '0', '0', '74', '37', '664', '332', '0', '0', '170', '340', '1352029190', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('409', 'mob/goblin4.gif', '17', '23', '46', 'Władca Krzewów', '34', '1', '38', '54', '1800', '1800', '137', '83', '166', '37', '2', '120', '125', '0', '0', '0', '6', '218', '0', '0', '74', '37', '664', '332', '0', '0', '170', '340', '1352029448', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('410', 'mob/goblin4.gif', '19', '7', '31', 'Władca Krzewów', '34', '1', '38', '54', '1800', '1800', '137', '83', '166', '37', '2', '120', '125', '0', '0', '0', '6', '218', '0', '0', '74', '37', '664', '332', '0', '0', '170', '340', '1352030990', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('411', 'mob/goblin4.gif', '19', '24', '4', 'Władca Krzewów', '34', '1', '38', '54', '1800', '1800', '137', '83', '166', '37', '2', '120', '125', '0', '0', '0', '6', '218', '0', '0', '74', '37', '664', '332', '0', '0', '170', '340', '0', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('412', 'mob/goblin4.gif', '19', '77', '9', 'Władca Krzewów', '34', '1', '38', '54', '1800', '1800', '137', '83', '166', '37', '2', '120', '125', '0', '0', '0', '6', '218', '0', '0', '74', '37', '664', '332', '0', '0', '170', '340', '0', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('413', 'mob/goblin4.gif', '19', '86', '42', 'Władca Krzewów', '34', '1', '38', '54', '1800', '1800', '137', '83', '166', '37', '2', '120', '125', '0', '0', '0', '6', '218', '0', '0', '74', '37', '664', '332', '0', '0', '170', '340', '0', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('414', 'mob/goblin4.gif', '19', '56', '42', 'Władca Krzewów', '34', '1', '38', '54', '1800', '1800', '137', '83', '166', '37', '2', '120', '125', '0', '0', '0', '6', '218', '0', '0', '74', '37', '664', '332', '0', '0', '170', '340', '1352030075', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('415', 'mob/goblin4.gif', '18', '22', '6', 'Władca Krzewów', '34', '1', '38', '54', '1800', '1800', '137', '83', '166', '37', '2', '120', '125', '0', '0', '0', '6', '218', '0', '0', '74', '37', '664', '332', '0', '0', '170', '340', '0', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('416', 'mob/goblin4.gif', '18', '59', '46', 'Władca Krzewów', '34', '1', '38', '54', '1800', '1800', '137', '83', '166', '37', '2', '120', '125', '0', '0', '0', '6', '218', '0', '0', '74', '37', '664', '332', '0', '0', '170', '340', '1352031255', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('417', 'mob/goblin4.gif', '18', '4', '52', 'Władca Krzewów', '34', '1', '38', '54', '1800', '1800', '137', '83', '166', '37', '2', '120', '125', '0', '0', '0', '6', '218', '0', '0', '74', '37', '664', '332', '0', '0', '170', '340', '1352031128', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('418', 'mob/goblin5.gif', '17', '21', '55', 'Mistrz Fechtunku', '35', '1', '46', '38', '2650', '2650', '178', '145', '145', '105', '5', '133', '120', '0', '260', '260', '3', '0', '0', '39', '78', '0', '0', '0', '5', '0', '175', '350', '0', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('419', 'mob/goblin5.gif', '17', '83', '53', 'Mistrz Fechtunku', '35', '1', '46', '38', '2650', '2650', '178', '145', '145', '105', '5', '133', '120', '0', '260', '260', '3', '0', '0', '39', '78', '0', '0', '0', '5', '0', '175', '350', '0', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('420', 'mob/goblin5.gif', '17', '60', '25', 'Mistrz Fechtunku', '35', '1', '46', '38', '2650', '2650', '178', '145', '145', '105', '5', '133', '120', '0', '260', '260', '3', '0', '0', '39', '78', '0', '0', '0', '5', '0', '175', '350', '0', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('421', 'mob/goblin5.gif', '17', '38', '22', 'Mistrz Fechtunku', '35', '1', '46', '38', '2650', '2650', '178', '145', '145', '105', '5', '133', '120', '0', '260', '260', '3', '0', '0', '39', '78', '0', '0', '0', '5', '0', '175', '350', '1352030869', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('422', 'mob/goblin5.gif', '18', '57', '12', 'Mistrz Fechtunku', '35', '1', '46', '38', '2650', '2650', '178', '145', '145', '105', '5', '133', '120', '0', '260', '260', '3', '0', '0', '39', '78', '0', '0', '0', '5', '0', '175', '350', '1352030131', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('423', 'mob/goblin5.gif', '18', '58', '2', 'Mistrz Fechtunku', '35', '1', '46', '38', '2650', '2650', '178', '145', '145', '105', '5', '133', '120', '0', '260', '260', '3', '0', '0', '39', '78', '0', '0', '0', '5', '0', '175', '350', '0', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('424', 'mob/goblin5.gif', '18', '24', '7', 'Mistrz Fechtunku', '35', '1', '46', '38', '2650', '2650', '178', '145', '145', '105', '5', '133', '120', '0', '260', '260', '3', '0', '0', '39', '78', '0', '0', '0', '5', '0', '175', '350', '0', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('425', 'mob/goblin5.gif', '19', '8', '32', 'Mistrz Fechtunku', '35', '1', '46', '38', '2650', '2650', '178', '145', '145', '105', '5', '133', '120', '0', '260', '260', '3', '0', '0', '39', '78', '0', '0', '0', '5', '0', '175', '350', '1352031177', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('426', 'mob/goblin5.gif', '19', '45', '13', 'Mistrz Fechtunku', '35', '1', '46', '38', '2650', '2650', '178', '145', '145', '105', '5', '133', '120', '0', '260', '260', '3', '0', '0', '39', '78', '0', '0', '0', '5', '0', '175', '350', '0', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('427', 'mob/goblin5.gif', '19', '87', '43', 'Mistrz Fechtunku', '35', '1', '46', '38', '2650', '2650', '178', '145', '145', '105', '5', '133', '120', '0', '260', '260', '3', '0', '0', '39', '78', '0', '0', '0', '5', '0', '175', '350', '0', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('428', 'mob/goblin5.gif', '19', '54', '59', 'Mistrz Fechtunku', '35', '1', '46', '38', '2650', '2650', '178', '145', '145', '105', '5', '133', '120', '0', '260', '260', '3', '0', '0', '39', '78', '0', '0', '0', '5', '0', '175', '350', '0', '0', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('429', 'mob/goblin6.gif', '19', '67', '45', 'Zakuty Goblin', '36', '1', '28', '45', '1994', '3410', '140', '185', '93', '42', '2', '127', '120', '0', '165', '207', '1', '0', '0', '40', '40', '40', '0', '0', '0', '0', '180', '360', '1351935279', '19001', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('430', 'mob/goblin6.gif', '19', '70', '47', 'Zakuty Goblin', '36', '1', '28', '45', '3410', '3410', '140', '185', '93', '42', '2', '127', '120', '0', '165', '207', '1', '0', '0', '40', '40', '40', '0', '0', '0', '0', '180', '360', '1351935279', '19001', '0', '0', '0', '14', '0');
INSERT INTO `mob` VALUES ('431', 'mob/goblin7.gif', '19', '71', '45', 'Władca Rzek', '37', '2', '28', '48', '4900', '4900', '210', '175', '350', '44', '5', '120', '130', '0', '0', '0', '6', '468', '0', '0', '110', '220', '3500', '1750', '0', '0', '740', '555', '1351935474', '19001', '0', '37', '0', '14', '16');
INSERT INTO `mob` VALUES ('432', 'mob/bazyliszek1.gif', '45', '22', '67', 'Leśny Bazyliszek', '26', '0', '38', '50', '1950', '1950', '126', '149', '75', '32', '0', '120', '120', '0', '120', '178', '1', '0', '0', '26', '26', '26', '0', '0', '0', '0', '130', '260', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('433', 'mob/bazyliszek1.gif', '45', '34', '87', 'Leśny Bazyliszek', '26', '0', '38', '50', '1950', '1950', '126', '149', '75', '32', '0', '120', '120', '0', '120', '178', '1', '0', '0', '26', '26', '26', '0', '0', '0', '0', '130', '260', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('434', 'mob/bazyliszek1.gif', '45', '46', '25', 'Leśny Bazyliszek', '26', '0', '38', '50', '1950', '1950', '126', '149', '75', '32', '0', '120', '120', '0', '120', '178', '1', '0', '0', '26', '26', '26', '0', '0', '0', '0', '130', '260', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('435', 'mob/bazyliszek1.gif', '45', '38', '66', 'Leśny Bazyliszek', '26', '0', '38', '50', '1950', '1950', '126', '149', '75', '32', '0', '120', '120', '0', '120', '178', '1', '0', '0', '26', '26', '26', '0', '0', '0', '0', '130', '260', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('436', 'mob/bazyliszek1.gif', '45', '34', '30', 'Leśny Bazyliszek', '26', '0', '38', '50', '1950', '1950', '126', '149', '75', '32', '0', '120', '120', '0', '120', '178', '1', '0', '0', '26', '26', '26', '0', '0', '0', '0', '130', '260', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('437', 'mob/bazyliszek1.gif', '45', '23', '34', 'Leśny Bazyliszek', '26', '0', '38', '50', '1950', '1950', '126', '149', '75', '32', '0', '120', '120', '0', '120', '178', '1', '0', '0', '26', '26', '26', '0', '0', '0', '0', '130', '260', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('438', 'mob/bazyliszek1.gif', '45', '37', '23', 'Leśny Bazyliszek', '26', '0', '38', '50', '1950', '1950', '126', '149', '75', '32', '0', '120', '120', '0', '120', '178', '1', '0', '0', '26', '26', '26', '0', '0', '0', '0', '130', '260', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('439', 'mob/bazyliszek1.gif', '45', '42', '28', 'Leśny Bazyliszek', '26', '0', '38', '50', '1950', '1950', '126', '149', '75', '32', '0', '120', '120', '0', '120', '178', '1', '0', '0', '26', '26', '26', '0', '0', '0', '0', '130', '260', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('440', 'mob/bazyliszek1.gif', '45', '41', '70', 'Leśny Bazyliszek', '26', '0', '38', '50', '1950', '1950', '126', '149', '75', '32', '0', '120', '120', '0', '120', '178', '1', '0', '0', '26', '26', '26', '0', '0', '0', '0', '130', '260', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('441', 'mob/bazyliszek1.gif', '45', '13', '80', 'Leśny Bazyliszek', '26', '0', '38', '50', '1950', '1950', '126', '149', '75', '32', '0', '120', '120', '0', '120', '178', '1', '0', '0', '26', '26', '26', '0', '0', '0', '0', '130', '260', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('442', 'mob/bazyliszek1.gif', '45', '59', '3', 'Leśny Bazyliszek', '26', '0', '38', '50', '1950', '1950', '126', '149', '75', '32', '0', '120', '120', '0', '120', '178', '1', '0', '0', '26', '26', '26', '0', '0', '0', '0', '130', '260', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('443', 'mob/bazyliszek1.gif', '45', '45', '3', 'Leśny Bazyliszek', '26', '0', '38', '50', '1950', '1950', '126', '149', '75', '32', '0', '120', '120', '0', '120', '178', '1', '0', '0', '26', '26', '26', '0', '0', '0', '0', '130', '260', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('444', 'mob/bazyliszek1.gif', '45', '23', '2', 'Leśny Bazyliszek', '26', '0', '38', '50', '1950', '1950', '126', '149', '75', '32', '0', '120', '120', '0', '120', '178', '1', '0', '0', '26', '26', '26', '0', '0', '0', '0', '130', '260', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('445', 'mob/bazyliszek1.gif', '45', '14', '17', 'Leśny Bazyliszek', '26', '0', '38', '50', '1950', '1950', '126', '149', '75', '32', '0', '120', '120', '0', '120', '178', '1', '0', '0', '26', '26', '26', '0', '0', '0', '0', '130', '260', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('446', 'mob/bazyliszek1.gif', '45', '25', '18', 'Leśny Bazyliszek', '26', '0', '38', '50', '1950', '1950', '126', '149', '75', '32', '0', '120', '120', '0', '120', '178', '1', '0', '0', '26', '26', '26', '0', '0', '0', '0', '130', '260', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('447', 'mob/bazyliszek1.gif', '45', '4', '84', 'Leśny Bazyliszek', '26', '0', '38', '50', '1950', '1950', '126', '149', '75', '32', '0', '120', '120', '0', '120', '178', '1', '0', '0', '26', '26', '26', '0', '0', '0', '0', '130', '260', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('448', 'mob/heroes/karmazyn.gif', '45', '22', '2', 'Karmazynowy Mściciel', '45', '4', '36', '44', '8900', '8900', '145', '275', '510', '75', '5', '120', '127', '0', '0', '0', '6', '600', '0', '0', '450', '450', '1100', '1020', '0', '0', '3375', '16200', '1352057227', '0', '0', '45', '0', '12', '0');
INSERT INTO `mob` VALUES ('449', 'mob/bazyliszek2.gif', '45', '27', '64', 'Bazyliszek Ziemny', '28', '0', '38', '50', '2200', '2200', '128', '156', '78', '37', '0', '120', '120', '0', '161', '189', '1', '0', '0', '28', '28', '28', '0', '0', '0', '0', '140', '280', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('450', 'mob/bazyliszek2.gif', '45', '39', '51', 'Bazyliszek Ziemny', '28', '0', '38', '50', '2200', '2200', '128', '156', '78', '37', '0', '120', '120', '0', '161', '189', '1', '0', '0', '28', '28', '28', '0', '0', '0', '0', '140', '280', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('451', 'mob/bazyliszek2.gif', '45', '40', '59', 'Bazyliszek Ziemny', '28', '0', '38', '50', '2200', '2200', '128', '156', '78', '37', '0', '120', '120', '0', '161', '189', '1', '0', '0', '28', '28', '28', '0', '0', '0', '0', '140', '280', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('452', 'mob/bazyliszek2.gif', '45', '61', '72', 'Bazyliszek Ziemny', '28', '0', '38', '50', '2200', '2200', '128', '156', '78', '37', '0', '120', '120', '0', '161', '189', '1', '0', '0', '28', '28', '28', '0', '0', '0', '0', '140', '280', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('453', 'mob/bazyliszek2.gif', '45', '58', '83', 'Bazyliszek Ziemny', '28', '0', '38', '50', '2200', '2200', '128', '156', '78', '37', '0', '120', '120', '0', '161', '189', '1', '0', '0', '28', '28', '28', '0', '0', '0', '0', '140', '280', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('454', 'mob/bazyliszek2.gif', '45', '51', '58', 'Bazyliszek Ziemny', '28', '0', '38', '50', '2200', '2200', '128', '156', '78', '37', '0', '120', '120', '0', '161', '189', '1', '0', '0', '28', '28', '28', '0', '0', '0', '0', '140', '280', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('455', 'mob/bazyliszek3.gif', '46', '4', '6', 'Bazyliszek Jaskiniowy', '29', '0', '38', '50', '2340', '2340', '129', '165', '83', '40', '0', '120', '120', '0', '170', '206', '1', '0', '0', '29', '29', '29', '0', '0', '0', '0', '145', '290', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('456', 'mob/bazyliszek3.gif', '46', '7', '3', 'Bazyliszek Jaskiniowy', '29', '0', '38', '50', '2340', '2340', '129', '165', '83', '40', '0', '120', '120', '0', '170', '206', '1', '0', '0', '29', '29', '29', '0', '0', '0', '0', '145', '290', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('457', 'mob/bazyliszek3.gif', '47', '13', '3', 'Bazyliszek Jaskiniowy', '29', '0', '38', '50', '2340', '2340', '129', '165', '83', '40', '0', '120', '120', '0', '170', '206', '1', '0', '0', '29', '29', '29', '0', '0', '0', '0', '145', '290', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('458', 'mob/bazyliszek3.gif', '47', '13', '7', 'Bazyliszek Jaskiniowy', '29', '0', '38', '50', '2340', '2340', '129', '165', '83', '40', '0', '120', '120', '0', '170', '206', '1', '0', '0', '29', '29', '29', '0', '0', '0', '0', '145', '290', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('459', 'mob/bazyliszek3.gif', '47', '27', '11', 'Bazyliszek Jaskiniowy', '29', '0', '38', '50', '2340', '2340', '129', '165', '83', '40', '0', '120', '120', '0', '170', '206', '1', '0', '0', '29', '29', '29', '0', '0', '0', '0', '145', '290', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('460', 'mob/bazyliszek3.gif', '47', '4', '10', 'Bazyliszek Jaskiniowy', '29', '0', '38', '50', '2340', '2340', '129', '165', '83', '40', '0', '120', '120', '0', '170', '206', '1', '0', '0', '29', '29', '29', '0', '0', '0', '0', '145', '290', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('461', 'mob/bazyliszek3.gif', '47', '1', '8', 'Bazyliszek Jaskiniowy', '29', '0', '38', '50', '2340', '2340', '129', '165', '83', '40', '0', '120', '120', '0', '170', '206', '1', '0', '0', '29', '29', '29', '0', '0', '0', '0', '145', '290', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('462', 'mob/bazyliszek3.gif', '47', '24', '9', 'Bazyliszek Jaskiniowy', '29', '0', '38', '50', '2340', '2340', '129', '165', '83', '40', '0', '120', '120', '0', '170', '206', '1', '0', '0', '29', '29', '29', '0', '0', '0', '0', '145', '290', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('463', 'mob/bazyliszek3.gif', '47', '5', '5', 'Bazyliszek Jaskiniowy', '29', '0', '38', '50', '2340', '2340', '129', '165', '83', '40', '0', '120', '120', '0', '170', '206', '1', '0', '0', '29', '29', '29', '0', '0', '0', '0', '145', '290', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('464', 'mob/bazyliszek3.gif', '47', '12', '13', 'Bazyliszek Jaskiniowy', '29', '0', '38', '50', '2340', '2340', '129', '165', '83', '40', '0', '120', '120', '0', '170', '206', '1', '0', '0', '29', '29', '29', '0', '0', '0', '0', '145', '290', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('465', 'mob/z-ork1.gif', '48', '8', '7', 'Ork Bashwooz', '41', '0', '40', '48', '4120', '4120', '141', '172', '86', '41', '0', '120', '120', '0', '140', '208', '1', '0', '0', '41', '41', '41', '0', '0', '0', '0', '205', '410', '0', '0', '0', '0', '0', '17', '0');
INSERT INTO `mob` VALUES ('466', 'mob/z-ork1.gif', '48', '6', '7', 'Ork Bashwooz', '41', '0', '40', '48', '4120', '4120', '141', '172', '86', '41', '0', '120', '120', '0', '140', '208', '1', '0', '0', '41', '41', '41', '0', '0', '0', '0', '205', '410', '0', '0', '0', '0', '0', '17', '0');
INSERT INTO `mob` VALUES ('467', 'mob/z-ork1.gif', '48', '54', '19', 'Ork Bashwooz', '41', '0', '40', '48', '4120', '4120', '141', '172', '86', '41', '0', '120', '120', '0', '140', '208', '1', '0', '0', '41', '41', '41', '0', '0', '0', '0', '205', '410', '0', '0', '0', '0', '0', '17', '0');
INSERT INTO `mob` VALUES ('468', 'mob/z-ork1.gif', '48', '60', '48', 'Ork Bashwooz', '41', '0', '40', '48', '4120', '4120', '141', '172', '86', '41', '0', '120', '120', '0', '140', '208', '1', '0', '0', '41', '41', '41', '0', '0', '0', '0', '205', '410', '0', '0', '0', '0', '0', '17', '0');
INSERT INTO `mob` VALUES ('469', 'mob/z-ork1.gif', '48', '38', '56', 'Ork Bashwooz', '41', '0', '40', '48', '4120', '4120', '141', '172', '86', '41', '0', '120', '120', '0', '140', '208', '1', '0', '0', '41', '41', '41', '0', '0', '0', '0', '205', '410', '0', '0', '0', '0', '0', '17', '0');
INSERT INTO `mob` VALUES ('470', 'mob/z-ork1.gif', '48', '29', '50', 'Ork Bashwooz', '41', '0', '40', '48', '4120', '4120', '141', '172', '86', '41', '0', '120', '120', '0', '140', '208', '1', '0', '0', '41', '41', '41', '0', '0', '0', '0', '205', '410', '0', '0', '0', '0', '0', '17', '0');
INSERT INTO `mob` VALUES ('471', 'mob/z-ork1.gif', '48', '22', '39', 'Ork Bashwooz', '41', '0', '40', '48', '4120', '4120', '141', '172', '86', '41', '0', '120', '120', '0', '140', '208', '1', '0', '0', '41', '41', '41', '0', '0', '0', '0', '205', '410', '0', '0', '0', '0', '0', '17', '0');
INSERT INTO `mob` VALUES ('472', 'mob/z-ork1.gif', '48', '17', '43', 'Ork Bashwooz', '41', '0', '40', '48', '4120', '4120', '141', '172', '86', '41', '0', '120', '120', '0', '140', '208', '1', '0', '0', '41', '41', '41', '0', '0', '0', '0', '205', '410', '0', '0', '0', '0', '0', '17', '0');
INSERT INTO `mob` VALUES ('473', 'mob/z-ork1.gif', '48', '10', '47', 'Ork Bashwooz', '41', '0', '40', '48', '4120', '4120', '141', '172', '86', '41', '0', '120', '120', '0', '140', '208', '1', '0', '0', '41', '41', '41', '0', '0', '0', '0', '205', '410', '0', '0', '0', '0', '0', '17', '0');
INSERT INTO `mob` VALUES ('474', 'mob/z-ork1.gif', '48', '9', '35', 'Ork Bashwooz', '41', '0', '40', '48', '4120', '4120', '141', '172', '86', '41', '0', '120', '120', '0', '140', '208', '1', '0', '0', '41', '41', '41', '0', '0', '0', '0', '205', '410', '0', '0', '0', '0', '0', '17', '0');
INSERT INTO `mob` VALUES ('475', 'mob/z-ork1.gif', '48', '7', '56', 'Ork Bashwooz', '41', '0', '40', '48', '4120', '4120', '141', '172', '86', '41', '0', '120', '120', '0', '140', '208', '1', '0', '0', '41', '41', '41', '0', '0', '0', '0', '205', '410', '0', '0', '0', '0', '0', '17', '0');
INSERT INTO `mob` VALUES ('476', 'mob/z-ork1.gif', '49', '8', '10', 'Ork Bashwooz', '41', '0', '40', '48', '4120', '4120', '141', '172', '86', '41', '0', '120', '120', '0', '140', '208', '1', '0', '0', '41', '41', '41', '0', '0', '0', '0', '205', '410', '0', '0', '0', '0', '0', '17', '0');
INSERT INTO `mob` VALUES ('477', 'mob/z-ork1.gif', '51', '13', '14', 'Ork Bashwooz', '41', '0', '40', '48', '4120', '4120', '141', '172', '86', '41', '0', '120', '120', '0', '140', '208', '1', '0', '0', '41', '41', '41', '0', '0', '0', '0', '205', '410', '0', '0', '0', '0', '0', '17', '0');
INSERT INTO `mob` VALUES ('478', 'mob/z-ork1.gif', '51', '12', '22', 'Ork Bashwooz', '41', '0', '40', '48', '4120', '4120', '141', '172', '86', '41', '0', '120', '120', '0', '140', '208', '1', '0', '0', '41', '41', '41', '0', '0', '0', '0', '205', '410', '0', '0', '0', '0', '0', '17', '0');
INSERT INTO `mob` VALUES ('479', 'mob/z-ork2.gif', '48', '24', '9', 'Ork Zhaghokk', '42', '0', '32', '48', '4230', '4230', '142', '184', '92', '43', '0', '120', '120', '0', '161', '205', '1', '0', '0', '42', '42', '42', '0', '0', '0', '0', '210', '420', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('480', 'mob/z-ork2.gif', '48', '4', '10', 'Ork Zhaghokk', '42', '0', '32', '48', '4230', '4230', '142', '184', '92', '43', '0', '120', '120', '0', '161', '205', '1', '0', '0', '42', '42', '42', '0', '0', '0', '0', '210', '420', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('481', 'mob/z-ork2.gif', '48', '23', '17', 'Ork Zhaghokk', '42', '0', '32', '48', '4230', '4230', '142', '184', '92', '43', '0', '120', '120', '0', '161', '205', '1', '0', '0', '42', '42', '42', '0', '0', '0', '0', '210', '420', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('482', 'mob/z-ork2.gif', '48', '47', '12', 'Ork Zhaghokk', '42', '0', '32', '48', '4230', '4230', '142', '184', '92', '43', '0', '120', '120', '0', '161', '205', '1', '0', '0', '42', '42', '42', '0', '0', '0', '0', '210', '420', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('483', 'mob/z-ork2.gif', '48', '54', '7', 'Ork Zhaghokk', '42', '0', '32', '48', '4230', '4230', '142', '184', '92', '43', '0', '120', '120', '0', '161', '205', '1', '0', '0', '42', '42', '42', '0', '0', '0', '0', '210', '420', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('484', 'mob/z-ork2.gif', '48', '57', '9', 'Ork Zhaghokk', '42', '0', '32', '48', '4230', '4230', '142', '184', '92', '43', '0', '120', '120', '0', '161', '205', '1', '0', '0', '42', '42', '42', '0', '0', '0', '0', '210', '420', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('485', 'mob/z-ork2.gif', '48', '39', '27', 'Ork Zhaghokk', '42', '0', '32', '48', '4230', '4230', '142', '184', '92', '43', '0', '120', '120', '0', '161', '205', '1', '0', '0', '42', '42', '42', '0', '0', '0', '0', '210', '420', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('486', 'mob/z-ork2.gif', '48', '32', '45', 'Ork Zhaghokk', '42', '0', '32', '48', '4230', '4230', '142', '184', '92', '43', '0', '120', '120', '0', '161', '205', '1', '0', '0', '42', '42', '42', '0', '0', '0', '0', '210', '420', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('487', 'mob/z-ork2.gif', '48', '51', '46', 'Ork Zhaghokk', '42', '0', '32', '48', '4230', '4230', '142', '184', '92', '43', '0', '120', '120', '0', '161', '205', '1', '0', '0', '42', '42', '42', '0', '0', '0', '0', '210', '420', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('488', 'mob/z-ork2.gif', '48', '54', '48', 'Ork Zhaghokk', '42', '0', '32', '48', '4230', '4230', '142', '184', '92', '43', '0', '120', '120', '0', '161', '205', '1', '0', '0', '42', '42', '42', '0', '0', '0', '0', '210', '420', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('489', 'mob/z-ork2.gif', '51', '11', '5', 'Ork Zhaghokk', '42', '0', '32', '48', '4230', '4230', '142', '184', '92', '43', '0', '120', '120', '0', '161', '205', '1', '0', '0', '42', '42', '42', '0', '0', '0', '0', '210', '420', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('490', 'mob/z-ork2.gif', '51', '2', '8', 'Ork Zhaghokk', '42', '0', '32', '48', '4230', '4230', '142', '184', '92', '43', '0', '120', '120', '0', '161', '205', '1', '0', '0', '42', '42', '42', '0', '0', '0', '0', '210', '420', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('491', 'mob/z-ork3.gif', '48', '37', '24', 'Ork Kuurgh', '43', '0', '37', '48', '4490', '4490', '143', '196', '98', '45', '0', '120', '120', '0', '179', '207', '1', '0', '0', '43', '43', '43', '0', '0', '0', '0', '215', '430', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('492', 'mob/z-ork3.gif', '48', '48', '26', 'Ork Kuurgh', '43', '0', '37', '48', '4490', '4490', '143', '196', '98', '45', '0', '120', '120', '0', '179', '207', '1', '0', '0', '43', '43', '43', '0', '0', '0', '0', '215', '430', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('493', 'mob/z-ork3.gif', '48', '56', '39', 'Ork Kuurgh', '43', '0', '37', '48', '4490', '4490', '143', '196', '98', '45', '0', '120', '120', '0', '179', '207', '1', '0', '0', '43', '43', '43', '0', '0', '0', '0', '215', '430', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('494', 'mob/z-ork3.gif', '48', '59', '41', 'Ork Kuurgh', '43', '0', '37', '48', '4490', '4490', '143', '196', '98', '45', '0', '120', '120', '0', '179', '207', '1', '0', '0', '43', '43', '43', '0', '0', '0', '0', '215', '430', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('495', 'mob/z-ork3.gif', '48', '35', '55', 'Ork Kuurgh', '43', '0', '37', '48', '4490', '4490', '143', '196', '98', '45', '0', '120', '120', '0', '179', '207', '1', '0', '0', '43', '43', '43', '0', '0', '0', '0', '215', '430', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('496', 'mob/z-ork3.gif', '48', '40', '60', 'Ork Kuurgh', '43', '0', '37', '48', '4490', '4490', '143', '196', '98', '45', '0', '120', '120', '0', '179', '207', '1', '0', '0', '43', '43', '43', '0', '0', '0', '0', '215', '430', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('497', 'mob/z-ork3.gif', '48', '20', '54', 'Ork Kuurgh', '43', '0', '37', '48', '4490', '4490', '143', '196', '98', '45', '0', '120', '120', '0', '179', '207', '1', '0', '0', '43', '43', '43', '0', '0', '0', '0', '215', '430', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('498', 'mob/z-ork3.gif', '48', '11', '25', 'Ork Kuurgh', '43', '0', '37', '48', '4490', '4490', '143', '196', '98', '45', '0', '120', '120', '0', '179', '207', '1', '0', '0', '43', '43', '43', '0', '0', '0', '0', '215', '430', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('499', 'mob/z-ork3.gif', '49', '11', '11', 'Ork Kuurgh', '43', '0', '37', '48', '4490', '4490', '143', '196', '98', '45', '0', '120', '120', '0', '179', '207', '1', '0', '0', '43', '43', '43', '0', '0', '0', '0', '215', '430', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('500', 'mob/z-ork3.gif', '49', '2', '7', 'Ork Kuurgh', '43', '0', '37', '48', '4490', '4490', '143', '196', '98', '45', '0', '120', '120', '0', '179', '207', '1', '0', '0', '43', '43', '43', '0', '0', '0', '0', '215', '430', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('506', 'mob/z-ork4.gif', '48', '5', '15', 'Ork Tarroll', '45', '0', '38', '48', '3000', '3000', '145', '101', '202', '49', '0', '120', '120', '0', '0', '0', '1', '220', '0', '0', '90', '45', '808', '404', '0', '0', '225', '450', '0', '0', '0', '0', '0', '18', '0');
INSERT INTO `mob` VALUES ('502', 'mob/z-ork3.gif', '50', '3', '9', 'Ork Kuurgh', '43', '0', '37', '48', '4490', '4490', '143', '196', '98', '45', '0', '120', '120', '0', '179', '207', '1', '0', '0', '43', '43', '43', '0', '0', '0', '0', '215', '430', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('503', 'mob/z-ork3.gif', '50', '15', '10', 'Ork Kuurgh', '43', '0', '37', '48', '4490', '4490', '143', '196', '98', '45', '0', '120', '120', '0', '179', '207', '1', '0', '0', '43', '43', '43', '0', '0', '0', '0', '215', '430', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('504', 'mob/z-ork3.gif', '51', '12', '14', 'Ork Kuurgh', '43', '0', '37', '48', '4490', '4490', '143', '196', '98', '45', '0', '120', '120', '0', '179', '207', '1', '0', '0', '43', '43', '43', '0', '0', '0', '0', '215', '430', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('505', 'mob/z-ork3.gif', '51', '7', '25', 'Ork Kuurgh', '43', '0', '37', '48', '4490', '4490', '143', '196', '98', '45', '0', '120', '120', '0', '179', '207', '1', '0', '0', '43', '43', '43', '0', '0', '0', '0', '215', '430', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `mob` VALUES ('507', 'mob/z-ork4.gif', '48', '32', '3', 'Ork Tarroll', '45', '0', '38', '48', '3000', '3000', '145', '101', '202', '49', '0', '120', '120', '0', '0', '0', '1', '220', '0', '0', '90', '45', '808', '404', '0', '0', '225', '450', '0', '0', '0', '0', '0', '18', '0');
INSERT INTO `mob` VALUES ('508', 'mob/z-ork4.gif', '48', '49', '20', 'Ork Tarroll', '45', '0', '38', '48', '3000', '3000', '145', '101', '202', '49', '0', '120', '120', '0', '0', '0', '1', '220', '0', '0', '90', '45', '808', '404', '0', '0', '225', '450', '0', '0', '0', '0', '0', '18', '0');
INSERT INTO `mob` VALUES ('509', 'mob/z-ork4.gif', '48', '33', '28', 'Ork Tarroll', '45', '0', '38', '48', '3000', '3000', '145', '101', '202', '49', '0', '120', '120', '0', '0', '0', '1', '220', '0', '0', '90', '45', '808', '404', '0', '0', '225', '450', '0', '0', '0', '0', '0', '18', '0');
INSERT INTO `mob` VALUES ('510', 'mob/z-ork4.gif', '48', '38', '41', 'Ork Tarroll', '45', '0', '38', '48', '3000', '3000', '145', '101', '202', '49', '0', '120', '120', '0', '0', '0', '1', '220', '0', '0', '90', '45', '808', '404', '0', '0', '225', '450', '0', '0', '0', '0', '0', '18', '0');
INSERT INTO `mob` VALUES ('511', 'mob/z-ork4.gif', '48', '3', '25', 'Ork Tarroll', '45', '0', '38', '48', '3000', '3000', '145', '101', '202', '49', '0', '120', '120', '0', '0', '0', '1', '220', '0', '0', '90', '45', '808', '404', '0', '0', '225', '450', '0', '0', '0', '0', '0', '18', '0');
INSERT INTO `mob` VALUES ('512', 'mob/z-ork4.gif', '48', '58', '57', 'Ork Tarroll', '45', '0', '38', '48', '3000', '3000', '145', '101', '202', '49', '0', '120', '120', '0', '0', '0', '1', '220', '0', '0', '90', '45', '808', '404', '0', '0', '225', '450', '0', '0', '0', '0', '0', '18', '0');
INSERT INTO `mob` VALUES ('513', 'mob/z-ork4.gif', '50', '12', '4', 'Ork Tarroll', '45', '0', '38', '48', '3000', '3000', '145', '101', '202', '49', '0', '120', '120', '0', '0', '0', '1', '220', '0', '0', '90', '45', '808', '404', '0', '0', '225', '450', '0', '0', '0', '0', '0', '18', '0');
INSERT INTO `mob` VALUES ('514', 'mob/z-ork4.gif', '51', '5', '6', 'Ork Tarroll', '45', '0', '38', '48', '3000', '3000', '145', '101', '202', '49', '0', '120', '120', '0', '0', '0', '1', '220', '0', '0', '90', '45', '808', '404', '0', '0', '225', '450', '0', '0', '0', '0', '0', '18', '0');
INSERT INTO `mob` VALUES ('515', 'mob/z-ork4.gif', '51', '9', '6', 'Ork Tarroll', '45', '0', '38', '48', '3000', '3000', '145', '101', '202', '49', '0', '120', '120', '0', '0', '0', '1', '220', '0', '0', '90', '45', '808', '404', '0', '0', '225', '450', '0', '0', '0', '0', '0', '18', '0');
INSERT INTO `mob` VALUES ('516', 'mob/z-ork4.gif', '51', '21', '6', 'Ork Tarroll', '45', '0', '38', '48', '3000', '3000', '145', '101', '202', '49', '0', '120', '120', '0', '0', '0', '1', '220', '0', '0', '90', '45', '808', '404', '0', '0', '225', '450', '0', '0', '0', '0', '0', '18', '0');
INSERT INTO `mob` VALUES ('517', 'mob/z-ork4.gif', '51', '7', '11', 'Ork Tarroll', '45', '0', '38', '48', '3000', '3000', '145', '101', '202', '49', '0', '120', '120', '0', '0', '0', '1', '220', '0', '0', '90', '45', '808', '404', '0', '0', '225', '450', '0', '0', '0', '0', '0', '18', '0');
INSERT INTO `mob` VALUES ('518', 'mob/z-ork4.gif', '51', '4', '23', 'Ork Tarroll', '45', '0', '38', '48', '3000', '3000', '145', '101', '202', '49', '0', '120', '120', '0', '0', '0', '1', '220', '0', '0', '90', '45', '808', '404', '0', '0', '225', '450', '0', '0', '0', '0', '0', '18', '0');
INSERT INTO `mob` VALUES ('519', 'mob/z-ork4.gif', '52', '4', '9', 'Ork Tarroll', '45', '0', '38', '48', '3000', '3000', '145', '101', '202', '49', '0', '120', '120', '0', '0', '0', '1', '220', '0', '0', '90', '45', '808', '404', '0', '0', '225', '450', '0', '0', '0', '0', '0', '18', '0');
INSERT INTO `mob` VALUES ('520', 'mob/z-ork4.gif', '52', '10', '9', 'Ork Tarroll', '45', '0', '38', '48', '3000', '3000', '145', '101', '202', '49', '0', '120', '120', '0', '0', '0', '1', '220', '0', '0', '90', '45', '808', '404', '0', '0', '225', '450', '0', '0', '0', '0', '0', '18', '0');
INSERT INTO `mob` VALUES ('521', 'mob/z-ork5.gif', '48', '7', '19', 'Ork Wuakl', '46', '0', '32', '48', '4100', '4100', '192', '150', '150', '102', '1', '120', '120', '0', '300', '372', '3', '0', '0', '69', '69', '0', '0', '0', '2', '0', '230', '460', '0', '0', '0', '0', '0', '17', '19');
INSERT INTO `mob` VALUES ('522', 'mob/z-ork5.gif', '48', '32', '13', 'Ork Wuakl', '46', '0', '32', '48', '4100', '4100', '192', '150', '150', '102', '1', '120', '120', '0', '300', '372', '3', '0', '0', '69', '69', '0', '0', '0', '2', '0', '230', '460', '0', '0', '0', '0', '0', '17', '19');
INSERT INTO `mob` VALUES ('523', 'mob/z-ork5.gif', '48', '58', '29', 'Ork Wuakl', '46', '0', '32', '48', '4100', '4100', '192', '150', '150', '102', '1', '120', '120', '0', '300', '372', '3', '0', '0', '69', '69', '0', '0', '0', '2', '0', '230', '460', '0', '0', '0', '0', '0', '17', '19');
INSERT INTO `mob` VALUES ('524', 'mob/z-ork5.gif', '48', '46', '30', 'Ork Wuakl', '46', '0', '32', '48', '4100', '4100', '192', '150', '150', '102', '1', '120', '120', '0', '300', '372', '3', '0', '0', '69', '69', '0', '0', '0', '2', '0', '230', '460', '0', '0', '0', '0', '0', '17', '19');
INSERT INTO `mob` VALUES ('525', 'mob/z-ork5.gif', '48', '37', '32', 'Ork Wuakl', '46', '0', '32', '48', '4100', '4100', '192', '150', '150', '102', '1', '120', '120', '0', '300', '372', '3', '0', '0', '69', '69', '0', '0', '0', '2', '0', '230', '460', '0', '0', '0', '0', '0', '17', '19');
INSERT INTO `mob` VALUES ('526', 'mob/z-ork5.gif', '48', '53', '35', 'Ork Wuakl', '46', '0', '32', '48', '4100', '4100', '192', '150', '150', '102', '1', '120', '120', '0', '300', '372', '3', '0', '0', '69', '69', '0', '0', '0', '2', '0', '230', '460', '0', '0', '0', '0', '0', '17', '19');
INSERT INTO `mob` VALUES ('527', 'mob/z-ork5.gif', '48', '32', '36', 'Ork Wuakl', '46', '0', '32', '48', '4100', '4100', '192', '150', '150', '102', '1', '120', '120', '0', '300', '372', '3', '0', '0', '69', '69', '0', '0', '0', '2', '0', '230', '460', '0', '0', '0', '0', '0', '17', '19');
INSERT INTO `mob` VALUES ('528', 'mob/z-ork5.gif', '48', '26', '29', 'Ork Wuakl', '46', '0', '32', '48', '4100', '4100', '192', '150', '150', '102', '1', '120', '120', '0', '300', '372', '3', '0', '0', '69', '69', '0', '0', '0', '2', '0', '230', '460', '0', '0', '0', '0', '0', '17', '19');
INSERT INTO `mob` VALUES ('529', 'mob/z-ork5.gif', '48', '38', '44', 'Ork Wuakl', '46', '0', '32', '48', '4100', '4100', '192', '150', '150', '102', '1', '120', '120', '0', '300', '372', '3', '0', '0', '69', '69', '0', '0', '0', '2', '0', '230', '460', '0', '0', '0', '0', '0', '17', '19');
INSERT INTO `mob` VALUES ('530', 'mob/z-ork5.gif', '48', '40', '47', 'Ork Wuakl', '46', '0', '32', '48', '4100', '4100', '192', '150', '150', '102', '1', '120', '120', '0', '300', '372', '3', '0', '0', '69', '69', '0', '0', '0', '2', '0', '230', '460', '0', '0', '0', '0', '0', '17', '19');
INSERT INTO `mob` VALUES ('531', 'mob/z-ork5.gif', '48', '30', '60', 'Ork Wuakl', '46', '0', '32', '48', '4100', '4100', '192', '150', '150', '102', '1', '120', '120', '0', '300', '372', '3', '0', '0', '69', '69', '0', '0', '0', '2', '0', '230', '460', '0', '0', '0', '0', '0', '17', '19');
INSERT INTO `mob` VALUES ('532', 'mob/z-ork5.gif', '48', '12', '61', 'Ork Wuakl', '46', '0', '32', '48', '4100', '4100', '192', '150', '150', '102', '1', '120', '120', '0', '300', '372', '3', '0', '0', '69', '69', '0', '0', '0', '2', '0', '230', '460', '0', '0', '0', '0', '0', '17', '19');
INSERT INTO `mob` VALUES ('533', 'mob/z-ork5.gif', '48', '4', '35', 'Ork Wuakl', '46', '0', '32', '48', '4100', '4100', '192', '150', '150', '102', '1', '120', '120', '0', '300', '372', '3', '0', '0', '69', '69', '0', '0', '0', '2', '0', '230', '460', '0', '0', '0', '0', '0', '17', '19');
INSERT INTO `mob` VALUES ('534', 'mob/z-ork5.gif', '48', '3', '37', 'Ork Wuakl', '46', '0', '32', '48', '4100', '4100', '192', '150', '150', '102', '1', '120', '120', '0', '300', '372', '3', '0', '0', '69', '69', '0', '0', '0', '2', '0', '230', '460', '0', '0', '0', '0', '0', '17', '19');
INSERT INTO `mob` VALUES ('535', 'mob/z-ork5.gif', '48', '15', '33', 'Ork Wuakl', '46', '0', '32', '48', '4100', '4100', '192', '150', '150', '102', '1', '120', '120', '0', '300', '372', '3', '0', '0', '69', '69', '0', '0', '0', '2', '0', '230', '460', '0', '0', '0', '0', '0', '17', '19');
INSERT INTO `mob` VALUES ('536', 'mob/z-ork5.gif', '48', '12', '31', 'Ork Wuakl', '46', '0', '32', '48', '4100', '4100', '192', '150', '150', '102', '1', '120', '120', '0', '300', '372', '3', '0', '0', '69', '69', '0', '0', '0', '2', '0', '230', '460', '0', '0', '0', '0', '0', '17', '19');
INSERT INTO `mob` VALUES ('537', 'mob/z-ork5.gif', '50', '8', '5', 'Ork Wuakl', '46', '0', '32', '48', '4100', '4100', '192', '150', '150', '102', '1', '120', '120', '0', '300', '372', '3', '0', '0', '69', '69', '0', '0', '0', '2', '0', '230', '460', '0', '0', '0', '0', '0', '17', '19');
INSERT INTO `mob` VALUES ('538', 'mob/z-ork5.gif', '51', '3', '14', 'Ork Wuakl', '46', '0', '32', '48', '4100', '4100', '192', '150', '150', '102', '1', '120', '120', '0', '300', '372', '3', '0', '0', '69', '69', '0', '0', '0', '2', '0', '230', '460', '0', '0', '0', '0', '0', '17', '19');
INSERT INTO `mob` VALUES ('539', 'mob/z-ork5.gif', '51', '24', '15', 'Ork Wuakl', '46', '0', '32', '48', '4100', '4100', '192', '150', '150', '102', '1', '120', '120', '0', '300', '372', '3', '0', '0', '69', '69', '0', '0', '0', '2', '0', '230', '460', '0', '0', '0', '0', '0', '17', '19');
INSERT INTO `mob` VALUES ('540', 'mob/z-ork5.gif', '51', '26', '15', 'Ork Wuakl', '46', '0', '32', '48', '4100', '4100', '192', '150', '150', '102', '1', '120', '120', '0', '300', '372', '3', '0', '0', '69', '69', '0', '0', '0', '2', '0', '230', '460', '0', '0', '0', '0', '0', '17', '19');
INSERT INTO `mob` VALUES ('541', 'mob/z-ork5.gif', '52', '6', '8', 'Ork Wuakl', '46', '0', '32', '48', '4100', '4100', '192', '150', '150', '102', '1', '120', '120', '0', '300', '372', '3', '0', '0', '69', '69', '0', '0', '0', '2', '0', '230', '460', '0', '0', '0', '0', '0', '17', '19');
INSERT INTO `mob` VALUES ('542', 'mob/z-ork5.gif', '52', '8', '8', 'Ork Wuakl', '46', '0', '32', '48', '4100', '4100', '192', '150', '150', '102', '1', '120', '120', '0', '300', '372', '3', '0', '0', '69', '69', '0', '0', '0', '2', '0', '230', '460', '0', '0', '0', '0', '0', '17', '19');
INSERT INTO `mob` VALUES ('543', 'mob/thowar.gif', '52', '7', '6', 'Thowar', '47', '1', '38', '53', '5750', '5750', '152', '250', '125', '59', '2', '124', '120', '0', '221', '295', '1', '0', '0', '52', '52', '52', '0', '0', '0', '0', '235', '470', '0', '0', '0', '0', '0', '20', '0');
INSERT INTO `mob` VALUES ('544', 'mob/heroes/mnich-zly.gif', '48', '12', '5', 'Zły Przewodnik', '63', '4', '48', '48', '17000', '17000', '350', '325', '325', '325', '5', '130', '120', '0', '800', '900', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '4500', '22680', '1352079198', '0', '0', '0', '0', '21', '0');

-- ----------------------------
-- Table structure for `npc`
-- ----------------------------
DROP TABLE IF EXISTS `npc`;
CREATE TABLE `npc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `obrazek` varchar(500) COLLATE utf8_polish_ci NOT NULL DEFAULT 'npc/',
  `mapa` int(11) NOT NULL DEFAULT '0',
  `x` int(11) NOT NULL DEFAULT '0',
  `y` int(11) NOT NULL DEFAULT '0',
  `shop` int(11) NOT NULL DEFAULT '0',
  `nazwa` varchar(100) COLLATE utf8_polish_ci NOT NULL,
  `poziom` int(11) NOT NULL DEFAULT '0',
  `typ` int(11) NOT NULL DEFAULT '0',
  `procentodsprzedazy` smallint(3) NOT NULL DEFAULT '100',
  `szerokosc` int(11) NOT NULL DEFAULT '32',
  `dlugosc` int(11) NOT NULL DEFAULT '48',
  `cena` mediumint(4) NOT NULL DEFAULT '100',
  `max_sprzedaz` double(20,0) NOT NULL DEFAULT '15000',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=27 DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci;

-- ----------------------------
-- Records of npc
-- ----------------------------
INSERT INTO `npc` VALUES ('1', 'npc/makatara.gif', '1', '7', '11', '1', 'Makatara', '18', '0', '100', '32', '48', '75', '5000');
INSERT INTO `npc` VALUES ('2', 'npc/niel.gif', '1', '15', '13', '6', 'Niel', '34', '0', '100', '32', '48', '100', '15000');
INSERT INTO `npc` VALUES ('3', 'npc/teleporter.gif', '1', '11', '16', '0', 'Zakon Planu Astralnego', '50', '0', '100', '27', '47', '100', '15000');
INSERT INTO `npc` VALUES ('4', 'npc/bard.gif', '1', '25', '12', '0', 'Bard Grant', '37', '0', '100', '32', '48', '100', '15000');
INSERT INTO `npc` VALUES ('5', 'npc/obwolywacz.gif', '1', '24', '14', '0', 'Obwolywacz', '28', '0', '100', '48', '48', '100', '15000');
INSERT INTO `npc` VALUES ('6', 'npc/garus.gif', '1', '25', '32', '7', 'Garus Tyrrak', '100', '0', '0', '36', '48', '140', '0');
INSERT INTO `npc` VALUES ('7', 'npc/psorkajarenia.gif', '1', '32', '36', '10', 'Psorka Jarenia', '43', '0', '100', '32', '48', '100', '15000');
INSERT INTO `npc` VALUES ('8', 'npc/roan.gif', '1', '19', '39', '2', 'Roan', '15', '0', '75', '32', '48', '95', '20000');
INSERT INTO `npc` VALUES ('9', 'npc/huslin.gif', '1', '5', '79', '3', 'Huslin', '56', '0', '90', '32', '48', '80', '40000');
INSERT INTO `npc` VALUES ('10', 'npc/nadzorca-barakow.gif', '4', '4', '5', '4', 'Nadzorca Barakow', '19', '0', '0', '32', '48', '100', '0');
INSERT INTO `npc` VALUES ('11', 'npc/straznik.gif', '1', '21', '11', '5', 'Straznik', '40', '0', '0', '32', '48', '85', '0');
INSERT INTO `npc` VALUES ('12', 'npc/straznik.gif', '1', '18', '11', '0', 'Straznik', '40', '0', '0', '32', '48', '85', '0');
INSERT INTO `npc` VALUES ('13', 'npc/straznik.gif', '1', '36', '57', '0', 'Straznik', '40', '0', '0', '32', '48', '85', '0');
INSERT INTO `npc` VALUES ('14', 'npc/straznik.gif', '3', '7', '7', '0', 'Straznik', '40', '0', '0', '32', '48', '85', '0');
INSERT INTO `npc` VALUES ('15', 'npc/straznik.gif', '3', '26', '12', '0', 'Straznik', '40', '0', '0', '32', '48', '85', '0');
INSERT INTO `npc` VALUES ('16', 'npc/straznik.gif', '3', '18', '6', '0', 'Straznik', '40', '0', '0', '32', '48', '85', '0');
INSERT INTO `npc` VALUES ('17', 'npc/straznik.gif', '3', '11', '6', '0', 'Straznik', '40', '0', '0', '32', '48', '85', '0');
INSERT INTO `npc` VALUES ('18', 'npc/straznik-bramy.gif', '1', '33', '61', '8', 'Straznik Bramy', '45', '0', '50', '35', '77', '100', '35000');
INSERT INTO `npc` VALUES ('19', 'npc/straznik-bramy.gif', '1', '29', '61', '8', 'Straznik Bramy', '45', '0', '50', '35', '77', '100', '35000');
INSERT INTO `npc` VALUES ('20', 'npc/unil.gif', '1', '56', '36', '9', 'Unil', '24', '0', '100', '51', '64', '107', '9500');
INSERT INTO `npc` VALUES ('21', 'npc/sir-galien.gif', '1', '20', '51', '100001', 'Sir Galien', '41', '0', '0', '32', '48', '130', '0');
INSERT INTO `npc` VALUES ('22', 'npc/eldrik.gif', '28', '7', '8', '22', 'Eldrik', '25', '0', '70', '32', '48', '100', '35000');
INSERT INTO `npc` VALUES ('23', 'npc/Jaren.gif', '1', '42', '16', '23', 'Jaren', '57', '0', '60', '32', '48', '96', '60000');
INSERT INTO `npc` VALUES ('24', 'npc/jubiler.gif', '29', '12', '7', '24', 'Jubiler', '20', '1', '90', '32', '48', '95', '5000');
INSERT INTO `npc` VALUES ('25', 'mob/apostata.gif', '1', '34', '37', '25', 'Smoczy Handlarz', '20', '3', '100', '32', '48', '100', '15000');
INSERT INTO `npc` VALUES ('26', 'mob/apostata.gif', '53', '2', '82', '26', 'Linard', '32', '0', '100', '32', '48', '100', '15000');

-- ----------------------------
-- Table structure for `paczka_przedmiot`
-- ----------------------------
DROP TABLE IF EXISTS `paczka_przedmiot`;
CREATE TABLE `paczka_przedmiot` (
  `paczka_id` int(11) NOT NULL,
  `przedmiot_id` int(11) NOT NULL DEFAULT '0',
  `szansa` int(11) NOT NULL DEFAULT '1000'
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci;

-- ----------------------------
-- Records of paczka_przedmiot
-- ----------------------------
INSERT INTO `paczka_przedmiot` VALUES ('1', '1', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('2', '2', '800');
INSERT INTO `paczka_przedmiot` VALUES ('3', '3', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('3', '4', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('3', '5', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('3', '6', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('3', '7', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('3', '8', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('3', '9', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('3', '10', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('3', '11', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('3', '12', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('3', '13', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('7', '14', '900');
INSERT INTO `paczka_przedmiot` VALUES ('3', '15', '750');
INSERT INTO `paczka_przedmiot` VALUES ('3', '16', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('3', '17', '750');
INSERT INTO `paczka_przedmiot` VALUES ('3', '18', '750');
INSERT INTO `paczka_przedmiot` VALUES ('3', '19', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('4', '20', '630');
INSERT INTO `paczka_przedmiot` VALUES ('5', '21', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('5', '22', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('5', '23', '900');
INSERT INTO `paczka_przedmiot` VALUES ('6', '24', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('6', '25', '100');
INSERT INTO `paczka_przedmiot` VALUES ('6', '26', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('6', '27', '600');
INSERT INTO `paczka_przedmiot` VALUES ('6', '28', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('6', '29', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('6', '30', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('6', '31', '600');
INSERT INTO `paczka_przedmiot` VALUES ('6', '32', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('6', '33', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('6', '34', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('6', '35', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('6', '36', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('6', '37', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('6', '38', '100');
INSERT INTO `paczka_przedmiot` VALUES ('6', '39', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('6', '40', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('6', '41', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('6', '42', '600');
INSERT INTO `paczka_przedmiot` VALUES ('6', '43', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('6', '44', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('6', '45', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('6', '46', '600');
INSERT INTO `paczka_przedmiot` VALUES ('6', '47', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('6', '48', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('6', '49', '600');
INSERT INTO `paczka_przedmiot` VALUES ('6', '50', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('6', '51', '600');
INSERT INTO `paczka_przedmiot` VALUES ('6', '52', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('7', '21', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('7', '22', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('8', '53', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('8', '54', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('8', '55', '250');
INSERT INTO `paczka_przedmiot` VALUES ('8', '56', '250');
INSERT INTO `paczka_przedmiot` VALUES ('8', '57', '750');
INSERT INTO `paczka_przedmiot` VALUES ('8', '58', '750');
INSERT INTO `paczka_przedmiot` VALUES ('8', '59', '750');
INSERT INTO `paczka_przedmiot` VALUES ('8', '60', '750');
INSERT INTO `paczka_przedmiot` VALUES ('8', '61', '750');
INSERT INTO `paczka_przedmiot` VALUES ('8', '62', '250');
INSERT INTO `paczka_przedmiot` VALUES ('8', '63', '750');
INSERT INTO `paczka_przedmiot` VALUES ('9', '64', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('9', '65', '750');
INSERT INTO `paczka_przedmiot` VALUES ('9', '66', '750');
INSERT INTO `paczka_przedmiot` VALUES ('9', '67', '750');
INSERT INTO `paczka_przedmiot` VALUES ('9', '68', '330');
INSERT INTO `paczka_przedmiot` VALUES ('9', '69', '750');
INSERT INTO `paczka_przedmiot` VALUES ('9', '69', '750');
INSERT INTO `paczka_przedmiot` VALUES ('9', '70', '750');
INSERT INTO `paczka_przedmiot` VALUES ('9', '71', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('10', '72', '750');
INSERT INTO `paczka_przedmiot` VALUES ('10', '73', '330');
INSERT INTO `paczka_przedmiot` VALUES ('10', '74', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('10', '75', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('10', '76', '100');
INSERT INTO `paczka_przedmiot` VALUES ('10', '77', '330');
INSERT INTO `paczka_przedmiot` VALUES ('10', '78', '750');
INSERT INTO `paczka_przedmiot` VALUES ('10', '79', '750');
INSERT INTO `paczka_przedmiot` VALUES ('10', '80', '750');
INSERT INTO `paczka_przedmiot` VALUES ('10', '81', '330');
INSERT INTO `paczka_przedmiot` VALUES ('10', '82', '330');
INSERT INTO `paczka_przedmiot` VALUES ('10', '83', '330');
INSERT INTO `paczka_przedmiot` VALUES ('11', '84', '400');
INSERT INTO `paczka_przedmiot` VALUES ('11', '64', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('11', '85', '400');
INSERT INTO `paczka_przedmiot` VALUES ('11', '86', '400');
INSERT INTO `paczka_przedmiot` VALUES ('12', '87', '600');
INSERT INTO `paczka_przedmiot` VALUES ('12', '88', '100');
INSERT INTO `paczka_przedmiot` VALUES ('12', '89', '600');
INSERT INTO `paczka_przedmiot` VALUES ('12', '90', '600');
INSERT INTO `paczka_przedmiot` VALUES ('12', '91', '600');
INSERT INTO `paczka_przedmiot` VALUES ('12', '92', '600');
INSERT INTO `paczka_przedmiot` VALUES ('12', '93', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('12', '94', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('12', '95', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('12', '96', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('12', '98', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('12', '99', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('12', '100', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('12', '101', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('12', '102', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('12', '103', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('12', '104', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('12', '105', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('12', '106', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('12', '107', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('12', '108', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('12', '110', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('12', '109', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('12', '111', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('12', '112', '100');
INSERT INTO `paczka_przedmiot` VALUES ('14', '113', '500');
INSERT INTO `paczka_przedmiot` VALUES ('14', '114', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('16', '115', '100');
INSERT INTO `paczka_przedmiot` VALUES ('16', '116', '100');
INSERT INTO `paczka_przedmiot` VALUES ('14', '117', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('14', '118', '500');
INSERT INTO `paczka_przedmiot` VALUES ('14', '119', '500');
INSERT INTO `paczka_przedmiot` VALUES ('14', '120', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('14', '121', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('14', '122', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('14', '123', '500');
INSERT INTO `paczka_przedmiot` VALUES ('14', '124', '500');
INSERT INTO `paczka_przedmiot` VALUES ('14', '125', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('14', '126', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('14', '127', '500');
INSERT INTO `paczka_przedmiot` VALUES ('14', '128', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('14', '129', '500');
INSERT INTO `paczka_przedmiot` VALUES ('14', '130', '500');
INSERT INTO `paczka_przedmiot` VALUES ('14', '131', '500');
INSERT INTO `paczka_przedmiot` VALUES ('14', '132', '500');
INSERT INTO `paczka_przedmiot` VALUES ('14', '133', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('14', '134', '500');
INSERT INTO `paczka_przedmiot` VALUES ('14', '135', '500');
INSERT INTO `paczka_przedmiot` VALUES ('14', '136', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('14', '137', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('14', '138', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('14', '139', '500');
INSERT INTO `paczka_przedmiot` VALUES ('14', '140', '500');
INSERT INTO `paczka_przedmiot` VALUES ('14', '141', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('15', '142', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('15', '143', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('15', '144', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('14', '145', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('14', '146', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('17', '147', '330');
INSERT INTO `paczka_przedmiot` VALUES ('18', '148', '330');
INSERT INTO `paczka_przedmiot` VALUES ('19', '149', '100');
INSERT INTO `paczka_przedmiot` VALUES ('20', '150', '100');
INSERT INTO `paczka_przedmiot` VALUES ('20', '151', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('20', '152', '900');
INSERT INTO `paczka_przedmiot` VALUES ('20', '153', '900');
INSERT INTO `paczka_przedmiot` VALUES ('20', '154', '330');
INSERT INTO `paczka_przedmiot` VALUES ('20', '155', '330');
INSERT INTO `paczka_przedmiot` VALUES ('20', '156', '330');
INSERT INTO `paczka_przedmiot` VALUES ('21', '157', '600');
INSERT INTO `paczka_przedmiot` VALUES ('21', '158', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('21', '159', '600');
INSERT INTO `paczka_przedmiot` VALUES ('21', '160', '100');
INSERT INTO `paczka_przedmiot` VALUES ('21', '161', '600');
INSERT INTO `paczka_przedmiot` VALUES ('21', '162', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('21', '163', '600');
INSERT INTO `paczka_przedmiot` VALUES ('21', '164', '600');
INSERT INTO `paczka_przedmiot` VALUES ('21', '165', '600');
INSERT INTO `paczka_przedmiot` VALUES ('21', '166', '600');
INSERT INTO `paczka_przedmiot` VALUES ('21', '167', '600');
INSERT INTO `paczka_przedmiot` VALUES ('21', '168', '600');
INSERT INTO `paczka_przedmiot` VALUES ('21', '169', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('21', '170', '600');
INSERT INTO `paczka_przedmiot` VALUES ('21', '171', '600');
INSERT INTO `paczka_przedmiot` VALUES ('21', '172', '600');
INSERT INTO `paczka_przedmiot` VALUES ('21', '173', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('21', '174', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('21', '175', '1000');
INSERT INTO `paczka_przedmiot` VALUES ('21', '176', '600');
INSERT INTO `paczka_przedmiot` VALUES ('21', '177', '600');
INSERT INTO `paczka_przedmiot` VALUES ('21', '178', '1000');

-- ----------------------------
-- Table structure for `postac`
-- ----------------------------
DROP TABLE IF EXISTS `postac`;
CREATE TABLE `postac` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `haslo` varchar(25) COLLATE utf8_polish_ci NOT NULL,
  `nazwa` varchar(50) COLLATE utf8_polish_ci NOT NULL,
  `poziom` int(11) NOT NULL DEFAULT '1',
  `zycie` int(11) NOT NULL DEFAULT '40',
  `zycie_max` int(11) NOT NULL DEFAULT '20',
  `zloto` double(21,0) NOT NULL DEFAULT '0',
  `exp` double(60,0) NOT NULL DEFAULT '0',
  `sila` int(11) NOT NULL DEFAULT '4',
  `zrecznosc` int(11) NOT NULL DEFAULT '3',
  `intelekt` int(11) NOT NULL DEFAULT '3',
  `obrazenia_min` int(11) NOT NULL DEFAULT '0',
  `obrazenia_max` int(11) NOT NULL DEFAULT '2',
  `mapa` int(11) NOT NULL DEFAULT '1',
  `x` int(11) NOT NULL DEFAULT '35',
  `y` int(11) NOT NULL DEFAULT '37',
  `sa` int(11) NOT NULL DEFAULT '100',
  `ac` int(11) NOT NULL DEFAULT '0',
  `acm` int(11) NOT NULL DEFAULT '0',
  `ph` int(11) NOT NULL DEFAULT '0',
  `sl` int(11) NOT NULL DEFAULT '0',
  `ckf` int(11) NOT NULL DEFAULT '120',
  `ckm` int(11) NOT NULL DEFAULT '120',
  `profesja` varchar(50) COLLATE utf8_polish_ci NOT NULL DEFAULT 'none',
  `obrazek` varchar(500) COLLATE utf8_polish_ci NOT NULL DEFAULT 'avatar/m_bd28.gif',
  `respawn` double(20,0) NOT NULL DEFAULT '0',
  `wybrana_mapa` int(11) NOT NULL DEFAULT '1',
  `wybrane_x` int(11) NOT NULL DEFAULT '35',
  `wybrane_y` int(11) NOT NULL DEFAULT '37',
  `zalogowany` tinyint(1) NOT NULL DEFAULT '0',
  `zablokowany_chat` double(25,0) NOT NULL DEFAULT '0',
  `ban` tinyint(1) NOT NULL DEFAULT '0',
  `um` int(11) NOT NULL DEFAULT '0',
  `grupa` int(11) NOT NULL DEFAULT '0',
  `pvp` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci;

-- ----------------------------
-- Records of postac
-- ----------------------------
INSERT INTO `postac` VALUES ('3', '1', 'ProbZ', '100', '3746', '20', '25098051', '99106506', '4', '102', '399', '0', '2', '53', '2', '83', '100', '0', '0', '0', '0', '120', '120', 'Mag', 'avatar/m_magmrozu.gif', '0', '45', '22', '2', '0', '0', '0', '45', '0', '0');
INSERT INTO `postac` VALUES ('1', '1', 'WerdiZ', '18', '589', '20', '76099', '91201', '55', '34', '3', '0', '2', '1', '56', '1', '100', '0', '0', '0', '0', '120', '120', 'Tancerz Ostrzy', 'avatar/m_bd06.gif', '1351965941', '44', '11', '8', '1', '0', '0', '0', '0', '0');
INSERT INTO `postac` VALUES ('2', '1', 'Mafia', '28', '1', '20', '210836', '552479', '115', '72', '99', '0', '2', '16', '34', '24', '100', '0', '0', '0', '25', '120', '120', 'Paladyn', 'avatar/m_pal24.gif', '1352031229', '5', '5', '5', '0', '0', '0', '4', '0', '0');
INSERT INTO `postac` VALUES ('4', '1', 'Pogromca Noobów', '4', '70', '20', '2940', '206', '7', '9', '9', '0', '2', '1', '58', '62', '100', '0', '0', '0', '84', '120', '120', 'Tropiciel', 'avatar/m_tr17.gif', '0', '5', '10', '10', '0', '0', '0', '0', '0', '0');

-- ----------------------------
-- Table structure for `przedmiot_loot`
-- ----------------------------
DROP TABLE IF EXISTS `przedmiot_loot`;
CREATE TABLE `przedmiot_loot` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nazwa` varchar(200) COLLATE utf8_polish_ci NOT NULL,
  `klasa` varchar(30) COLLATE utf8_polish_ci NOT NULL,
  `typ` varchar(30) COLLATE utf8_polish_ci NOT NULL,
  `obrazek` varchar(200) COLLATE utf8_polish_ci NOT NULL DEFAULT 'przedmiot/',
  `wym_poziom` int(11) NOT NULL DEFAULT '0',
  `prof1` tinyint(1) NOT NULL DEFAULT '0',
  `prof2` tinyint(1) NOT NULL DEFAULT '0',
  `prof3` tinyint(1) NOT NULL DEFAULT '0',
  `prof4` tinyint(1) NOT NULL DEFAULT '0',
  `prof5` tinyint(1) NOT NULL DEFAULT '0',
  `prof6` tinyint(1) NOT NULL DEFAULT '0',
  `wartosc_sprzedazy` int(11) NOT NULL DEFAULT '0',
  `zalozony` tinyint(1) NOT NULL DEFAULT '0',
  `zycie` int(11) NOT NULL DEFAULT '0',
  `sa` int(11) NOT NULL DEFAULT '0',
  `ac` int(11) NOT NULL DEFAULT '0',
  `acm` int(11) NOT NULL DEFAULT '0',
  `obr_min` int(11) NOT NULL DEFAULT '0',
  `obr_max` int(11) NOT NULL DEFAULT '0',
  `mnoznik` int(3) NOT NULL DEFAULT '0',
  `mnoznik_typ` tinyint(1) NOT NULL DEFAULT '0',
  `sila` int(11) NOT NULL DEFAULT '0',
  `zrecznosc` int(11) NOT NULL DEFAULT '0',
  `intelekt` int(11) NOT NULL DEFAULT '0',
  `wszystkie_cechy` int(11) NOT NULL DEFAULT '0',
  `ck` int(11) NOT NULL DEFAULT '0',
  `ckf` int(11) NOT NULL DEFAULT '0',
  `ckm` int(11) NOT NULL DEFAULT '0',
  `acp` int(11) NOT NULL DEFAULT '0',
  `absorbcja` int(11) NOT NULL DEFAULT '0',
  `mabsorbcja` int(11) NOT NULL DEFAULT '0',
  `leczenie` int(11) NOT NULL DEFAULT '0',
  `unik` int(11) NOT NULL DEFAULT '0',
  `blok` int(11) NOT NULL DEFAULT '0',
  `obr_mag` int(11) NOT NULL DEFAULT '0',
  `przebicie` smallint(3) NOT NULL DEFAULT '0',
  `obr_poi` int(11) NOT NULL DEFAULT '0',
  `glebokarana` smallint(3) NOT NULL DEFAULT '0',
  `atak_gr` int(11) NOT NULL DEFAULT '0',
  `ilosc` int(5) NOT NULL DEFAULT '0',
  `mikstura_leczenie` int(11) NOT NULL DEFAULT '0',
  `kontra` smallint(3) NOT NULL DEFAULT '0',
  `wartosc_kupna` int(11) NOT NULL DEFAULT '0',
  `obnizac` int(11) NOT NULL DEFAULT '0',
  `obnizacm` int(11) NOT NULL DEFAULT '0',
  `obnizsa` int(11) NOT NULL DEFAULT '0',
  `zycie_za_sile` int(11) NOT NULL DEFAULT '0',
  `pelne_leczenie` int(11) NOT NULL DEFAULT '0',
  `opis` text COLLATE utf8_polish_ci NOT NULL,
  `mana` int(11) NOT NULL DEFAULT '0',
  `energia` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=179 DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci;

-- ----------------------------
-- Records of przedmiot_loot
-- ----------------------------
INSERT INTO `przedmiot_loot` VALUES ('1', 'Mieso', 'normal', 'Konsupcyjne', 'przedmiot/mieso.gif', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '13', '0', '7', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('2', 'Pajeczyna', '', 'Neutralne', 'przedmiot/neu/pajeczyna.gif', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '7', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('3', 'Wino Owocowe', 'unique', 'Neutralne', 'przedmiot/her/neu/1.gif', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '100', '0', '0', '0', '0', '0', 'Slowackie Wino 9,5%', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('4', 'Kielich Cytrusowy', 'unique', 'Neutralne', 'przedmiot/her/neu/2.gif', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '100', '0', '0', '0', '0', '0', 'Etykieta wybornego wina 11%.', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('5', 'Smaki Lasu', 'unique', 'Neutralne', 'przedmiot/her/neu/3.gif', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '100', '0', '0', '0', '0', '0', 'Czerwone Wino 12%.', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('6', 'Wisniowka Sadecka', 'unique', 'Neutralne', 'przedmiot/her/neu/4.gif', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '100', '0', '0', '0', '0', '0', 'Nalewka 16%.', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('7', 'Kielich Jablkowy', 'unique', 'Neutralne', 'przedmiot/her/neu/5.gif', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '100', '0', '0', '0', '0', '0', 'Etykieta wybornego wina 12%.', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('8', 'Komandos Czerwony', 'unique', 'Neutralne', 'przedmiot/her/neu/6.gif', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '100', '0', '0', '0', '0', '0', 'Wisniowe Wino dla twardzieli 10%.', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('9', 'Wino Patyk', 'unique', 'Neutralne', 'przedmiot/her/neu/7.gif', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '100', '0', '0', '0', '0', '0', 'Owocowe, Biale, Slodkie 13%.', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('10', 'Cherry Wisniowe', 'unique', 'Neutralne', 'przedmiot/her/neu/8.gif', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '100', '0', '0', '0', '0', '0', 'Nalewka 18%.', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('11', 'Komandos Strong', 'unique', 'Neutralne', 'przedmiot/her/neu/9.gif', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '100', '0', '0', '0', '0', '0', 'Wino koloru słomkowego,<br>dla prawdziwych twardzieli 10%.', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('12', 'Kielich Sliwkowy', 'unique', 'Neutralne', 'przedmiot/her/neu/10.gif', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '100', '0', '0', '0', '0', '0', 'Etykieta wybornego wina 13%.', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('13', 'Kielich owocow lesnych', 'unique', 'Neutralne', 'przedmiot/her/neu/11.gif', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '100', '0', '0', '0', '0', '0', 'Etykieta wybornego wina 15%.', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('14', 'Skora Czarnego Wilka', '', 'Neutralne', 'przedmiot/neu/skora-czarnego-wilka.gif', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '30', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('15', 'Plaszcz Mietka', 'unique', 'Zbroja', 'przedmiot/her/arm/25_1.gif', '25', '0', '0', '1', '1', '1', '0', '0', '0', '0', '29', '90', '90', '0', '0', '0', '0', '0', '0', '0', '14', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '4876', '0', '0', '0', '0', '0', 'Mietkowi bez tego plaszcza<br>bedzie zimno w nocy.', '0', '6');
INSERT INTO `przedmiot_loot` VALUES ('16', 'Wino Mietka', '', 'Konsupcyjne', 'przedmiot/her/pot/25_1.gif', '18', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '10', '50', '0', '105', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('17', 'Tulipan Mietka', 'unique', 'BronPomocnicza', 'przedmiot/her/pom/25_1.gif', '25', '0', '0', '1', '0', '0', '0', '0', '0', '0', '21', '0', '0', '83', '91', '100', '1', '0', '17', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '4643', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('18', 'Skarpetki Mietka', 'unique', 'Buty', 'przedmiot/her/but/25_1.gif', '25', '0', '0', '0', '0', '0', '0', '0', '0', '0', '21', '27', '27', '0', '0', '0', '0', '0', '0', '0', '21', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '2580', '0', '0', '0', '0', '0', 'Mietkowi teraz bedzie zimno<br>w nogi bez tych skarpetek.', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('19', 'Kubek Mietka', 'unique', 'Konsupcyjne', 'przedmiot/her/pot/25_2.gif', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1133', '0', '0', '0', '0', '5000', 'Czuc Alkoholem', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('20', 'Turkusowe Pióro Orła', '', 'Neutralne', 'przedmiot/neu/pioro-no.gif', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '6000', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('21', 'Pazury', '', 'Neutralne', 'przedmiot/neu/pazury.gif', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '5', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('22', 'Kly', '', 'Neutralne', 'przedmiot/neu/kly.gif', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '10', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('23', 'Skora Szarego Wilka', '', 'Neutralne', 'przedmiot/neu/skora-szarego-wilka.gif', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '20', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('24', 'Posępne Sabre Patryka', 'unique', 'BronJednoreczna', 'przedmiot/her/lhand/35_1.gif', '31', '1', '1', '1', '0', '0', '0', '0', '0', '165', '16', '0', '0', '130', '158', '120', '1', '0', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '7365', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('25', 'Skarpetki Mrocznego Patryka', 'legendary', 'Buty', 'przedmiot/her/but/35_1.gif', '31', '0', '0', '0', '0', '0', '0', '0', '0', '0', '39', '37', '33', '0', '0', '0', '0', '0', '0', '0', '31', '2', '5', '0', '0', '0', '0', '0', '6', '0', '0', '0', '0', '0', '0', '0', '0', '0', '7460', '0', '0', '0', '0', '0', 'Te Skarpetki nosil Mroczny Patryk.<br>\r\nSa troche przetarte i niemilo pachna,<br>\r\nale za to sa cieple i wygodne.', '12', '0');
INSERT INTO `przedmiot_loot` VALUES ('26', 'Kostur otchlani Patryka', 'unique', 'Laska', 'przedmiot/her/roz/35_1.gif', '31', '0', '0', '0', '0', '0', '1', '0', '0', '308', '0', '0', '0', '0', '0', '200', '3', '0', '0', '0', '0', '0', '0', '5', '0', '0', '0', '0', '0', '0', '468', '0', '0', '0', '0', '0', '0', '0', '7014', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('27', 'Bransolety Bardzo Mrocznego Patryka', 'heroic', 'Rekawice', 'przedmiot/her/rek/35_1.gif', '31', '0', '0', '0', '0', '0', '0', '0', '0', '0', '24', '31', '31', '0', '0', '0', '0', '0', '0', '0', '24', '3', '5', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '5114', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('28', 'Ponury Napiersnik Patryka', 'unique', 'Zbroja', 'przedmiot/her/arm/35_1.gif', '31', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '90', '90', '0', '0', '0', '0', '0', '0', '0', '0', '2', '0', '0', '90', '0', '0', '0', '10', '0', '0', '0', '0', '0', '0', '0', '0', '0', '8952', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('29', 'Kapelusz Mrocznego Patryka', 'unique', 'Helm', 'przedmiot/her/cap/35_1.gif', '31', '0', '0', '0', '0', '0', '0', '0', '0', '0', '24', '37', '33', '0', '0', '0', '0', '0', '0', '0', '24', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '3711', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('30', 'Mroczny Kapelusz', 'unique', 'Helm', 'przedmiot/her/cap/35_2.gif', '31', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '37', '33', '0', '0', '0', '0', '0', '0', '0', '24', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '2783', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('31', 'Kapelusz Bardzo Mrocznego Patryka', 'heroic', 'Helm', 'przedmiot/her/cap/35_1.gif', '31', '0', '0', '0', '0', '0', '0', '0', '0', '128', '31', '40', '36', '0', '0', '0', '0', '0', '0', '0', '31', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '5114', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('32', 'Cienista Karacena Patryka', 'unique', 'Zbroja', 'przedmiot/her/arm/35_2.gif', '31', '0', '0', '0', '0', '1', '0', '0', '0', '165', '8', '68', '86', '0', '0', '0', '0', '0', '0', '0', '0', '2', '0', '0', '90', '254', '186', '0', '3', '0', '0', '0', '0', '0', '0', '0', '0', '0', '10422', '0', '0', '0', '0', '0', '', '8', '0');
INSERT INTO `przedmiot_loot` VALUES ('33', 'Fatalny Wams Patryka', 'unique', 'Zbroja', 'przedmiot/her/arm/35_3.gif', '31', '0', '0', '0', '1', '0', '0', '0', '0', '165', '16', '79', '79', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '113', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '8120', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('34', 'Bransolety Mrocznego Patryka', 'unique', 'Rekawice', 'przedmiot/her/rek/35_1.gif', '31', '0', '0', '0', '0', '0', '0', '0', '0', '0', '16', '28', '28', '0', '0', '0', '0', '0', '0', '0', '16', '0', '5', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '4092', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('35', 'Przeklęta Zasłona Patryka', 'unique', 'Tarcza', 'przedmiot/her/rhand/35_1.gif', '31', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '97', '65', '0', '0', '0', '0', '0', '0', '0', '0', '4', '0', '0', '0', '0', '0', '0', '0', '31', '0', '0', '0', '0', '0', '0', '0', '0', '6015', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('36', 'Katastroficzny Płaszcz Patryka', 'unique', 'Zbroja', 'przedmiot/her/arm/35_4.gif', '31', '0', '0', '0', '0', '0', '1', '0', '0', '165', '0', '34', '78', '0', '0', '0', '0', '0', '0', '0', '0', '2', '0', '0', '0', '338', '169', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '8526', '0', '0', '0', '0', '0', '', '8', '0');
INSERT INTO `przedmiot_loot` VALUES ('37', 'Buty Mrocznego Patryka', 'unique', 'Buty', 'przedmiot/her/but/35_2.gif', '31', '0', '0', '0', '0', '0', '0', '0', '0', '0', '24', '34', '34', '0', '0', '0', '0', '0', '0', '0', '16', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '3897', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('38', 'Bransolety Potęgi Patryka', 'legendary', 'Rekawice', 'przedmiot/her/rek/35_2.gif', '31', '0', '0', '0', '0', '0', '0', '0', '0', '0', '24', '33', '33', '0', '0', '0', '0', '0', '0', '0', '24', '3', '5', '0', '0', '0', '0', '0', '3', '0', '0', '0', '0', '0', '0', '0', '0', '0', '8225', '0', '0', '17', '0', '0', 'Mroczny Patryk bardzo lubil te blyskotke,<br>gdyz dawala mu wiele sily nie tylko w walce,<br>ale rowniez pomagala mu w mrocznych rytualach.', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('39', 'Złowieszczy Łęczar Patryka', 'unique', 'BronDystansowa', 'przedmiot/her/luk/35_1.gif', '31', '0', '0', '0', '0', '1', '0', '0', '0', '165', '16', '0', '0', '91', '111', '120', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '205', '10', '0', '0', '0', '0', '0', '0', '7733', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('40', 'Złowrogi naciąg Patryka', 'unique', 'BronDystansowa', 'przedmiot/her/luk/35_2.gif', '31', '0', '0', '0', '1', '0', '0', '0', '0', '165', '16', '0', '0', '115', '140', '120', '2', '0', '0', '0', '0', '0', '0', '0', '101', '0', '0', '0', '0', '0', '0', '10', '0', '0', '0', '0', '0', '0', '7733', '0', '0', '14', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('41', 'Siekacz Mrocznego Patryka', 'unique', 'BronDwureczna', 'przedmiot/her/lhand/35_2.gif', '31', '1', '0', '0', '0', '0', '0', '0', '0', '165', '16', '0', '0', '160', '192', '200', '1', '0', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '22', '118', '0', '0', '0', '7733', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('42', 'Buty Bardzo Mrocznego Patryka', 'heroic', 'Buty', 'przedmiot/her/but/35_2.gif', '31', '0', '0', '0', '0', '0', '0', '0', '0', '0', '31', '34', '34', '0', '0', '0', '0', '0', '0', '0', '24', '1', '5', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '5639', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('43', 'Naszyjnik Mrocznego Patryka', 'unique', 'Naszyjnik', 'przedmiot/her/nas/35_1.gif', '31', '0', '0', '0', '0', '0', '0', '0', '0', '308', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '24', '0', '0', '0', '0', '0', '0', '0', '3', '0', '0', '0', '0', '0', '0', '0', '0', '0', '3897', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('44', 'Podstępne Cięcie Patryka', 'unique', 'BronPomocnicza', 'przedmiot/her/pom/35_1.gif', '31', '0', '0', '1', '0', '0', '0', '0', '0', '165', '16', '0', '0', '81', '90', '100', '1', '0', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '22', '33', '0', '0', '0', '7733', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('45', 'Mroczna Ochrona Patryka', 'unique', 'Zbroja', 'przedmiot/her/arm/35_5.gif', '31', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '158', '63', '0', '0', '0', '0', '0', '0', '0', '0', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '7365', '0', '0', '0', '3', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('46', 'Złowieszczy Chód Wrogów Patryka', 'heroic', 'Buty', 'przedmiot/her/but/35_3.gif', '31', '0', '0', '0', '0', '0', '0', '0', '0', '0', '24', '37', '37', '0', '0', '0', '0', '0', '0', '0', '24', '0', '5', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '5639', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('47', 'Mroczny Pancerz Patryka', 'unique', 'Zbroja', 'przedmiot/her/arm/35_6.gif', '31', '0', '1', '0', '0', '0', '0', '0', '0', '308', '16', '101', '101', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '7733', '0', '0', '0', '3', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('48', 'Nieszczęsny Sygnet Patryka', 'unique', 'Pierscien', 'przedmiot/her/pie/35_1.gif', '31', '0', '0', '0', '0', '0', '0', '0', '0', '165', '16', '0', '0', '0', '0', '0', '0', '0', '0', '0', '16', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '4092', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('49', 'Naszyjnik Bardzo Mrocznego Patryka', 'heroic', 'Naszyjnik', 'przedmiot/her/nas/35_2.gif', '31', '0', '0', '0', '0', '0', '0', '0', '0', '308', '16', '0', '0', '0', '0', '0', '0', '0', '0', '0', '31', '1', '0', '0', '0', '0', '0', '0', '3', '0', '0', '0', '0', '0', '0', '0', '0', '0', '5370', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('50', 'Runiczny Miecz Patryka', 'unique', 'BronJednoreczna', 'przedmiot/her/lhand/35_3.gif', '31', '0', '1', '0', '0', '0', '0', '0', '0', '165', '0', '0', '0', '117', '143', '120', '1', '0', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '144', '0', '0', '0', '0', '0', '0', '25', '9870', '0', '31', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('51', 'Bezgwiezdny Sygnet Patryka', 'heroic', 'Pierscien', 'przedmiot/her/pie/35_1.gif', '31', '0', '0', '0', '0', '0', '0', '0', '0', '165', '24', '0', '0', '0', '0', '0', '0', '0', '0', '0', '16', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '5921', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('52', 'Mroczny Pierścień', 'unique', 'Pierscien', 'przedmiot/her/pie/35_2.gif', '31', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '24', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '2651', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('53', 'Mniejszy Eliksir Zdrowia', '', 'Konsupcyjne', 'przedmiot/pot/mikstura1.gif', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '75', '0', '22', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('54', 'Mocny Eliksir Zdrowia', '', 'Konsupcyjne', 'przedmiot/pot/mikstura3.gif', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '500', '0', '105', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('55', 'Złoty Hełm Paladyna', 'unique', 'Helm', 'przedmiot/elite/apostata/helm.gif', '22', '0', '1', '0', '0', '0', '0', '0', '0', '95', '14', '23', '23', '0', '0', '0', '0', '0', '0', '0', '19', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '2230', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('56', 'Dobrej jakości szabla paladyna', 'unique', 'BronJednoreczna', 'przedmiot/elite/apostata/miecz.gif', '22', '0', '1', '0', '0', '0', '0', '0', '0', '0', '14', '0', '0', '82', '100', '120', '1', '0', '0', '0', '14', '0', '5', '0', '0', '0', '0', '0', '0', '0', '101', '0', '0', '0', '0', '0', '0', '0', '4214', '0', '22', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('57', 'Mała szabla paladyna', '', 'BronJednoreczna', 'przedmiot/elite/apostata/miecz.gif', '22', '1', '1', '1', '0', '0', '0', '0', '0', '0', '14', '0', '0', '77', '94', '120', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '2476', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('58', 'Pierścień Apostaty', '', 'Pierscien', 'przedmiot/elite/apostata/ring.gif', '22', '0', '0', '0', '0', '0', '0', '0', '0', '0', '14', '0', '0', '0', '0', '0', '0', '0', '0', '0', '14', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1310', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('59', 'Kolczuga Młodego Paladyna', '', 'Zbroja', 'przedmiot/elite/apostata/armor1.gif', '22', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '60', '60', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '2600', '0', '0', '0', '2', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('60', 'Tarcza Młodego Paladyna', '', 'Tarcza', 'przedmiot/elite/apostata/shield.gif', '22', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '58', '32', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '22', '0', '0', '0', '0', '0', '0', '0', '0', '1926', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('61', 'Rękawice Młodego Paladyna', '', 'Rekawice', 'przedmiot/elite/apostata/hand.gif', '22', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '17', '17', '0', '0', '0', '0', '0', '0', '0', '14', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1672', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('62', 'Stalowa Kolczuga Paladyna', 'unique', 'Zbroja', 'przedmiot/elite/apostata/armor2.gif', '22', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '79', '79', '0', '0', '0', '0', '0', '0', '0', '19', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '3822', '0', '0', '0', '2', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('63', 'Uszkodzona Zbroja Młodego Paladyna', '', 'Zbroja', 'przedmiot/elite/apostata/armor1.gif', '22', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '77', '43', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '2600', '0', '0', '0', '2', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('64', 'Zniszczona Księga', '', 'Neutralne', 'przedmiot/elite/astratus/z-ksiega.gif', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '50', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('65', 'Sztylet Astratusa', '', 'BronJednoreczna', 'przedmiot/elite/astratus/lhand1.gif', '20', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '62', '76', '120', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '77', '0', '0', '0', '0', '0', '0', '0', '2068', '0', '20', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('66', 'Naszyjnik Astratusa', '', 'Naszyjnik', 'przedmiot/elite/astratus/naszyjnik.gif', '20', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '14', '14', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1094', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('67', 'Pierścień Astratusa', '', 'Pierscien', 'przedmiot/elite/astratus/pierscien.gif', '20', '0', '0', '0', '0', '0', '0', '0', '0', '0', '13', '0', '0', '0', '0', '0', '0', '0', '0', '0', '13', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1094', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('68', 'Potęga Astratusa', 'unique', 'Rozdzka', 'przedmiot/elite/astratus/rozdzka.gif', '17', '0', '0', '0', '0', '0', '1', '0', '0', '89', '12', '0', '0', '0', '0', '120', '3', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '189', '0', '0', '0', '0', '0', '0', '0', '2239', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('69', 'Rozdzka Astratusa', '', 'Rozdzka', 'przedmiot/elite/astratus/rozdzka.gif', '16', '0', '0', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '120', '3', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '125', '0', '0', '0', '0', '0', '0', '0', '1295', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('70', 'Płaszcz Astratusa', '', 'Zbroja', 'przedmiot/elite/astratus/zbroja.gif', '20', '0', '0', '0', '0', '0', '1', '0', '0', '112', '0', '18', '33', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '180', '90', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '2280', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('71', 'Cyrkon', '', 'Neutralne', 'przedmiot/elite/astratus/kamien.gif', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '30', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('72', 'Kaptur Kotołaka', '', 'Helm', 'przedmiot/elite/kotolak/kaptur1.gif', '20', '0', '0', '1', '1', '1', '0', '0', '0', '0', '0', '20', '20', '0', '0', '0', '0', '0', '0', '0', '13', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1149', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('73', 'Magiczny Kaptur Kotołaka', 'unique', 'Helm', 'przedmiot/elite/kotolak/kaptur2.gif', '20', '0', '0', '0', '0', '1', '1', '0', '0', '156', '13', '14', '28', '0', '0', '0', '0', '0', '0', '14', '0', '0', '0', '0', '0', '36', '24', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '2052', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('74', 'Strzały Kotołaka', '', 'Strzaly', 'przedmiot/elite/kotolak/arrow1.gif', '20', '0', '0', '0', '1', '1', '0', '0', '0', '0', '0', '0', '0', '15', '15', '100', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '200', '0', '0', '184', '20', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('75', 'Lodowe Strzały Kotołaka', '', 'Strzaly', 'przedmiot/elite/kotolak/arrow2.gif', '20', '0', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '100', '3', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '21', '0', '0', '0', '0', '200', '0', '0', '184', '0', '20', '15', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('76', 'Nocny Łuk Kotołaka', 'heroic', 'BronDystansowa', 'przedmiot/elite/kotolak/luk2.gif', '21', '0', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '75', '92', '120', '2', '0', '0', '0', '0', '3', '0', '0', '0', '0', '0', '0', '0', '0', '153', '35', '0', '0', '0', '0', '0', '0', '7976', '0', '0', '15', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('77', 'Nocny Kaftan Kotołaka', 'unique', 'Zbroja', 'przedmiot/elite/kotolak/kaftan2.gif', '20', '0', '0', '0', '0', '1', '0', '0', '0', '0', '23', '43', '63', '0', '0', '0', '0', '0', '0', '0', '13', '0', '0', '0', '0', '162', '119', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '4277', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('78', 'Zielony Kaftan Kotołaka', '', 'Zbroja', 'przedmiot/elite/kotolak/kaftan1.gif', '20', '0', '0', '1', '1', '1', '0', '0', '0', '0', '7', '60', '60', '0', '0', '0', '0', '0', '14', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '2171', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('79', 'Przebijak Kotołaka', '', 'BronDystansowa', 'przedmiot/elite/kotolak/luk1.gif', '20', '0', '0', '0', '1', '1', '0', '0', '0', '0', '0', '0', '0', '79', '96', '120', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '20', '0', '0', '0', '0', '0', '0', '2068', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('80', 'Sztylet Kotołaka', '', 'BronPomocnicza', 'przedmiot/elite/kotolak/sztylet.gif', '20', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '55', '61', '100', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1969', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('81', 'Zatruty Sztylet Kotołaka', 'unique', 'BronPomocnicza', 'przedmiot/elite/kotolak/sztylet.gif', '20', '0', '0', '1', '0', '0', '0', '0', '0', '0', '13', '0', '0', '59', '65', '100', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '46', '0', '0', '0', '0', '0', '3191', '0', '0', '15', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('82', 'Magiczny Płaszcz Kotołaka', 'unique', 'Zbroja', 'przedmiot/elite/kotolak/plaszcz.gif', '20', '0', '0', '0', '0', '1', '1', '0', '0', '201', '13', '43', '77', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '108', '72', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '3518', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('83', 'Mocny Przebijak Kotołaka', 'unique', 'BronDystansowa', 'przedmiot/elite/kotolak/luk1.gif', '20', '0', '0', '0', '1', '1', '0', '0', '0', '0', '0', '0', '0', '94', '115', '120', '2', '0', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '35', '0', '0', '0', '0', '0', '0', '3518', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('84', 'Obroża Środkowego Łba Cerbera', 'unique', 'Naszyjnik', 'przedmiot/elite/cerber/obroza1.gif', '28', '1', '0', '1', '1', '1', '0', '0', '0', '0', '22', '0', '0', '0', '0', '0', '0', '0', '46', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '3204', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('85', 'Obroża Lewego Łba Cerbera', 'unique', 'Naszyjnik', 'przedmiot/elite/cerber/obroza2.gif', '28', '1', '1', '1', '0', '0', '0', '0', '0', '0', '22', '0', '0', '0', '0', '0', '0', '46', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '3204', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('86', 'Obroża Prawego Łba Cerbera', 'unique', 'Naszyjnik', 'przedmiot/elite/cerber/obroza3.gif', '28', '0', '1', '0', '0', '1', '1', '0', '0', '0', '22', '0', '0', '0', '0', '0', '0', '0', '0', '46', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '3204', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('87', 'Karmazynowa Mądrość', 'heroic', 'Helm', 'przedmiot/her/cap/45_1.gif', '40', '0', '1', '0', '0', '1', '1', '0', '0', '296', '18', '26', '48', '0', '0', '0', '0', '0', '0', '0', '18', '5', '0', '5', '39', '53', '53', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '12400', '0', '0', '0', '0', '0', '', '10', '0');
INSERT INTO `przedmiot_loot` VALUES ('88', 'Bransolety Karmazynowego Mściciela', 'legendary', 'Rekawice', 'przedmiot/her/rek/45_1.gif', '40', '0', '0', '0', '0', '0', '0', '0', '0', '0', '48', '43', '43', '0', '0', '0', '0', '0', '0', '0', '38', '9', '5', '5', '0', '0', '0', '0', '4', '0', '0', '0', '0', '0', '0', '0', '0', '0', '16500', '0', '0', '0', '0', '0', 'Dzięki tym bransoletom Karmazynowemu<br>Mścicielowi udało się pokonać Toudiego,<br>kiedy ten próbował się pod niego podszyć.', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('89', 'Rękawice Karmazynowego Mściciela', 'heroic', 'Rekawice', 'przedmiot/her/rek/45_2.gif', '40', '0', '0', '0', '0', '0', '0', '0', '0', '0', '28', '37', '37', '0', '0', '0', '0', '0', '0', '0', '38', '5', '5', '5', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '10700', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('90', 'Buty Karmazynowego Mściciela', 'heroic', 'Buty', 'przedmiot/her/but/45_1.gif', '40', '0', '0', '0', '0', '0', '0', '0', '0', '0', '38', '45', '45', '0', '0', '0', '0', '0', '0', '0', '28', '3', '5', '5', '0', '0', '0', '0', '4', '0', '0', '0', '0', '0', '0', '0', '0', '0', '11200', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('91', 'Naszyjnik Karmazynowego Mściciela', 'heroic', 'Naszyjnik', 'przedmiot/her/nas/45_1.gif', '40', '0', '0', '0', '0', '0', '0', '0', '0', '0', '48', '0', '0', '0', '0', '0', '0', '0', '0', '0', '48', '5', '0', '0', '20', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '9230', '0', '0', '0', '0', '0', '', '10', '0');
INSERT INTO `przedmiot_loot` VALUES ('92', 'Karmazynowa Siła', 'heroic', 'Helm', 'przedmiot/her/cap/45_2.gif', '40', '1', '0', '1', '1', '0', '0', '0', '0', '0', '18', '53', '28', '0', '0', '0', '0', '0', '0', '0', '28', '3', '5', '0', '0', '0', '0', '0', '4', '0', '0', '0', '0', '0', '0', '0', '0', '0', '10200', '0', '0', '0', '0', '0', '', '0', '13');
INSERT INTO `przedmiot_loot` VALUES ('93', 'Kris Czerwonej Rękojeściunique', 'unique', 'BronJednoreczna', 'przedmiot/her/lhand/45_1.gif', '40', '0', '1', '0', '0', '0', '0', '0', '0', '0', '18', '0', '0', '155', '189', '120', '1', '0', '0', '0', '0', '3', '0', '0', '0', '0', '0', '0', '0', '0', '191', '0', '0', '0', '0', '0', '0', '0', '12700', '0', '40', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('94', 'Karmazynowa Laska', 'unique', 'Laska', 'przedmiot/her/roz/45_1.gif', '40', '0', '0', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '200', '3', '0', '0', '0', '0', '2', '0', '5', '0', '0', '0', '0', '0', '0', '621', '0', '0', '0', '0', '0', '0', '0', '12100', '0', '0', '0', '0', '0', '', '10', '0');
INSERT INTO `przedmiot_loot` VALUES ('95', 'Klinga Krwawych Porachunków', 'unique', 'BronJednoreczna', 'przedmiot/her/lhand/45_2.gif', '40', '1', '0', '1', '0', '0', '0', '0', '0', '0', '18', '0', '0', '142', '173', '120', '1', '0', '0', '0', '0', '3', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '23', '104', '0', '0', '0', '12100', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('96', 'Kirys Czerwonego Oka', 'unique', 'Zbroja', 'przedmiot/her/arm/45_1.gif', '40', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '120', '120', '0', '0', '0', '0', '0', '0', '0', '0', '0', '5', '0', '24', '0', '0', '0', '13', '0', '0', '0', '0', '0', '0', '0', '0', '0', '13300', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('97', 'Wiśniowa Czapka', 'unique', 'Helm', 'przedmiot/her/cap/45_3.gif', '40', '0', '0', '0', '0', '0', '0', '0', '0', '0', '18', '49', '47', '0', '0', '0', '0', '0', '0', '0', '18', '3', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '6698', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('98', 'Twarda Wytrwałość Mściciela', 'unique', 'Zbroja', 'przedmiot/her/arm/45_2.gif', '40', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '209', '103', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '4', '0', '0', '0', '0', '0', '0', '0', '0', '0', '12100', '0', '0', '0', '4', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('99', 'Karmazynowy Łuk', 'unique', 'BronDystansowa', 'przedmiot/her/luk/45_1.gif', '40', '0', '0', '0', '1', '0', '0', '0', '0', '0', '18', '0', '0', '157', '192', '120', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '15', '0', '15', '114', '0', '0', '0', '12700', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('100', 'Cynobrowy Wams Wendety', 'unique', 'Zbroja', 'przedmiot/her/arm/45_3.gif', '40', '0', '0', '0', '0', '1', '0', '0', '0', '210', '10', '90', '112', '0', '0', '0', '0', '0', '0', '0', '18', '0', '0', '0', '60', '337', '247', '0', '4', '0', '0', '0', '0', '0', '0', '0', '0', '0', '16200', '0', '0', '0', '0', '0', '', '7', '0');
INSERT INTO `przedmiot_loot` VALUES ('101', 'Karmazynowy Sztylet', 'unique', 'BronPomocnicza', 'przedmiot/her/rhand/45_1.gif', '40', '0', '0', '1', '0', '0', '0', '0', '0', '0', '18', '0', '0', '137', '152', '100', '1', '0', '0', '0', '0', '3', '0', '0', '0', '0', '0', '0', '4', '0', '0', '0', '0', '0', '0', '0', '0', '0', '12100', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('102', 'Karmazynowe Rękawice', 'unique', 'Rekawice', 'przedmiot/her/rek/45_3.gif', '40', '0', '0', '0', '0', '0', '0', '0', '0', '0', '28', '34', '34', '0', '0', '0', '0', '0', '0', '0', '28', '4', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '6379', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('103', 'Karmazynowa Kusza', 'unique', 'BronDystansowa', 'przedmiot/her/luk/45_2.gif', '40', '0', '0', '0', '0', '1', '0', '0', '0', '0', '18', '0', '0', '120', '147', '120', '2', '0', '0', '0', '0', '0', '0', '5', '0', '0', '0', '0', '0', '0', '271', '20', '0', '0', '0', '0', '0', '0', '12700', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('104', 'Cynobrowe Cięcie Zemsty', 'unique', 'BronDwureczna', 'przedmiot/her/lhand/45_3.gif', '40', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '223', '260', '200', '1', '0', '0', '0', '18', '3', '0', '0', '0', '0', '0', '0', '4', '0', '0', '0', '0', '22', '156', '0', '0', '0', '12700', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('105', 'Kolczuga Gniewnej Pożogi', 'unique', 'Zbroja', 'przedmiot/her/arm/45_4.gif', '40', '0', '0', '0', '1', '0', '0', '0', '0', '0', '20', '105', '105', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '80', '0', '0', '0', '4', '0', '0', '0', '0', '0', '0', '0', '0', '0', '13300', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('106', 'Karmazynowe Buty', 'unique', 'Buty', 'przedmiot/her/but/45_1.gif', '40', '0', '0', '0', '0', '0', '0', '0', '0', '0', '18', '41', '41', '0', '0', '0', '0', '0', '0', '0', '28', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '6379', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('107', 'Tarcza Mściwej Czerwieni', 'unique', 'Tarcza', 'przedmiot/her/rhand/45_2.gif', '40', '1', '1', '0', '0', '0', '0', '0', '0', '0', '18', '129', '78', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '40', '0', '0', '0', '0', '0', '0', '0', '0', '12600', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('108', 'Gniewny Szał Żelaza', 'unique', 'Zbroja', 'przedmiot/her/arm/45_5.gif', '40', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '135', '135', '0', '0', '0', '0', '0', '0', '0', '28', '0', '0', '0', '0', '0', '0', '0', '4', '0', '0', '0', '0', '0', '0', '0', '0', '0', '12700', '0', '0', '0', '4', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('109', 'Karmazynowy Naszyjnik', 'unique', 'Naszyjnik', 'przedmiot/her/nas/45_1.gif', '40', '0', '0', '0', '0', '0', '0', '0', '0', '0', '38', '0', '0', '0', '0', '0', '0', '0', '0', '0', '38', '3', '0', '0', '20', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '6379', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('110', 'Pierścień Karmazynowego Mściciela', 'unique', 'Pierscien', 'przedmiot/her/pie/45_1.gif', '40', '0', '0', '0', '0', '0', '0', '0', '0', '0', '18', '0', '0', '0', '0', '0', '0', '0', '0', '0', '18', '4', '5', '5', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '6698', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('111', 'Zbroczona Szata Zemsty', 'unique', 'Zbroja', 'przedmiot/her/arm/45_6.gif', '40', '0', '0', '0', '0', '0', '1', '0', '0', '0', '18', '45', '86', '0', '0', '0', '0', '0', '0', '0', '18', '0', '0', '0', '0', '449', '224', '0', '4', '0', '0', '0', '0', '0', '0', '0', '0', '0', '14700', '0', '0', '0', '0', '0', '', '13', '0');
INSERT INTO `przedmiot_loot` VALUES ('112', 'Karmazynowa Zguba', 'legendary', 'Naszyjnik', 'przedmiot/her/nas/45_2.gif', '40', '0', '0', '0', '0', '0', '0', '0', '0', '210', '48', '0', '24', '0', '0', '0', '0', '0', '0', '0', '48', '11', '5', '5', '20', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '12800', '0', '0', '0', '0', '0', 'Ten niezwykły naszyjnik składa się z trzech<br>karmazynowych kryształów, które<br>przypadkiem się zgubiły pewnemu<br>nieostrożnemu magowi.', '10', '10');
INSERT INTO `przedmiot_loot` VALUES ('113', 'Czapka Mocy Żywiołów', 'unique', 'Helm', 'przedmiot/cap/gob1.gif', '28', '0', '0', '0', '0', '1', '1', '0', '0', '117', '15', '20', '30', '0', '0', '0', '0', '0', '0', '18', '0', '0', '0', '0', '0', '50', '33', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '4090', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('114', 'Gobliński Topór Dwuręczny', '', 'BronDwureczna', 'przedmiot/lhand/gob1.gif', '28', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '159', '194', '200', '1', '19', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '4197', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('115', 'Czaoka Żywiołu Wody', 'heroic', 'Helm', 'przedmiot/cap/gob_hero.gif', '28', '0', '0', '0', '0', '1', '1', '0', '0', '212', '22', '22', '33', '0', '0', '0', '0', '0', '0', '0', '22', '0', '0', '5', '0', '55', '36', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '5368', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('116', 'Kaptur Sprytnego Goblina', 'heroic', 'Helm', 'przedmiot/cap/gob_hero2.gif', '28', '0', '0', '1', '1', '0', '0', '0', '0', '117', '15', '29', '29', '0', '0', '0', '0', '0', '0', '0', '22', '7', '5', '0', '42', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '5112', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('117', 'Gobliński Kaptur', '', 'Helm', 'przedmiot/cap/gob2.gif', '28', '0', '0', '1', '1', '0', '0', '0', '0', '0', '0', '23', '23', '0', '0', '0', '0', '0', '18', '0', '0', '0', '0', '0', '42', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '2403', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('118', 'Gobliński Kaptur Zwinności', 'unique', 'Helm', 'przedmiot/cap/gob2.gif', '28', '0', '0', '1', '1', '0', '0', '0', '0', '117', '0', '27', '27', '0', '0', '0', '0', '0', '32', '0', '0', '0', '0', '0', '42', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '3533', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('119', 'Lekki Szyszak Goblina', 'unique', 'Helm', 'przedmiot/cap/gob3.gif', '28', '1', '0', '0', '0', '0', '0', '0', '0', '0', '15', '47', '23', '0', '0', '0', '0', '32', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '3365', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('120', 'Zamknięty Hełm Goblina', '', 'Helm', 'przedmiot/cap/gob4.gif', '28', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '26', '26', '0', '0', '0', '0', '18', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '2289', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('121', 'Buty Szybkiego Goblina', '', 'Buty', 'przedmiot/but/gob1.gif', '29', '0', '0', '1', '1', '0', '0', '0', '0', '0', '0', '22', '22', '0', '0', '0', '0', '0', '19', '0', '0', '0', '0', '0', '44', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '2571', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('122', 'Zakrwawione Buty Goblina', '', 'Buty', 'przedmiot/but/gob2.gif', '29', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '32', '18', '0', '0', '0', '0', '19', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '2448', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('123', 'Dobra Goblińska Zbroja', 'unique', 'Zbroja', 'przedmiot/armor/gob1.gif', '29', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '147', '74', '0', '0', '0', '0', '33', '19', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '6478', '0', '0', '0', '3', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('124', 'Lodowe Ostrze Goblina', 'unique', 'BronJednoreczna', 'przedmiot/lhand/gob2.gif', '29', '0', '1', '0', '0', '0', '0', '0', '0', '0', '15', '0', '0', '109', '133', '120', '1', '33', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '120', '0', '0', '0', '0', '0', '0', '0', '6802', '0', '29', '28', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('125', 'Buty Magii Natury', '', 'Buty', 'przedmiot/but/gob3.gif', '29', '0', '0', '0', '0', '1', '1', '0', '0', '0', '0', '17', '34', '0', '0', '0', '0', '0', '0', '19', '0', '0', '0', '0', '0', '41', '28', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '2699', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('126', 'Lekka Ochrona Goblina', '', 'Zbroja', 'przedmiot/armor/gob2.gif', '29', '0', '0', '1', '1', '0', '0', '0', '0', '0', '10', '74', '74', '0', '0', '0', '0', '0', '19', '0', '0', '0', '0', '0', '44', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '5625', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('127', 'Moc Magii Wody', 'unique', 'Laska', 'przedmiot/roz/gob1.gif', '29', '0', '0', '0', '0', '0', '1', '0', '0', '0', '15', '0', '0', '0', '0', '200', '3', '0', '0', '0', '23', '0', '0', '0', '0', '0', '0', '0', '0', '0', '436', '0', '0', '0', '0', '0', '0', '0', '6170', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('128', 'Moc Dzikich Krzewów', '', 'Laska', 'przedmiot/roz/gob2.gif', '29', '0', '0', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '200', '3', '0', '0', '0', '15', '0', '0', '0', '0', '0', '0', '0', '0', '0', '383', '0', '0', '0', '0', '0', '0', '0', '4197', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('129', 'Mocny Gobliński Topór', 'unique', 'BronDwureczna', 'przedmiot/lhand/gob1.gif', '29', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '181', '221', '200', '1', '33', '19', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '6170', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('130', 'Buty Siły Żywiołów', 'unique', 'Buty', 'przedmiot/but/gob3.gif', '29', '0', '0', '0', '0', '1', '1', '0', '0', '120', '15', '19', '38', '0', '0', '0', '0', '0', '0', '19', '0', '0', '0', '0', '0', '47', '31', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '4375', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('131', 'Ochrona Zwinności Goblina', 'unique', 'Zbroja', 'przedmiot/armor/gob2.gif', '29', '0', '0', '1', '1', '0', '0', '0', '0', '154', '10', '84', '84', '0', '0', '0', '0', '0', '33', '0', '0', '0', '0', '0', '44', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '7142', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('132', 'Płaszcz Mocy Natury', 'unique', 'Zbroja', 'przedmiot/armor/gob3.gif', '29', '0', '0', '0', '0', '1', '1', '0', '0', '288', '0', '63', '126', '0', '0', '0', '0', '0', '0', '19', '0', '0', '0', '0', '0', '157', '105', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '7499', '0', '0', '0', '0', '0', '', '5', '0');
INSERT INTO `przedmiot_loot` VALUES ('133', 'Szyszak Goblina', '', 'Helm', 'przedmiot/cap/gob3.gif', '28', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '41', '21', '0', '0', '0', '0', '18', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '2180', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('134', 'Goblińskie Buty Zwinności', 'unique', 'Buty', 'przedmiot/but/gob1.gif', '29', '0', '0', '1', '1', '0', '0', '0', '0', '0', '15', '25', '25', '0', '0', '0', '0', '0', '33', '0', '0', '0', '0', '0', '44', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '3968', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('135', 'Zbroja Dobrego Goblina', 'unique', 'Zbroja', 'przedmiot/armor/gob4.gif', '29', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '94', '94', '0', '0', '0', '0', '33', '0', '19', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '6802', '0', '0', '0', '3', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('136', 'Gobliński Płaszcz Natury', '', 'Zbroja', 'przedmiot/armor/gob3.gif', '29', '0', '0', '0', '0', '1', '1', '0', '0', '154', '0', '55', '110', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '138', '92', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '5102', '0', '0', '0', '0', '0', '', '5', '0');
INSERT INTO `przedmiot_loot` VALUES ('137', 'Goblińska Zbroja', '', 'Zbroja', 'przedmiot/armor/gob1.gif', '29', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '129', '65', '0', '0', '0', '0', '19', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '4407', '0', '0', '0', '3', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('138', 'Zbroja Złego Goblina', '', 'Zbroja', 'przedmiot/armor/gob4.gif', '29', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '83', '83', '0', '0', '0', '0', '19', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '4627', '0', '0', '0', '3', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('139', 'Goblińskie Krwawe Buty', 'unique', 'Buty', 'przedmiot/but/gob2.gif', '29', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '36', '18', '0', '0', '0', '0', '33', '19', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '3779', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('140', 'Hełm Mądrego Goblina', 'unique', 'Helm', 'przedmiot/cap/gob4.gif', '28', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '30', '30', '0', '0', '0', '0', '32', '0', '18', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '3533', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('141', 'Czapka Magii Natury', '', 'Helm', 'przedmiot/cap/gob1.gif', '28', '0', '0', '0', '0', '1', '1', '0', '0', '0', '0', '18', '34', '0', '0', '0', '0', '0', '0', '18', '0', '0', '0', '0', '0', '44', '29', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '2523', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('142', 'Łuk Trapera', '', 'BronDystansowa', 'przedmiot/luk/gob1.gif', '29', '0', '0', '0', '1', '1', '0', '0', '0', '0', '0', '0', '0', '121', '148', '120', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '12', '0', '0', '0', '0', '0', '0', '4627', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('143', 'Łuk Nocnego Trapera', '', 'BronDystansowa', 'przedmiot/luk/gob1.gif', '29', '0', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '74', '96', '120', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '150', '12', '0', '0', '0', '0', '0', '0', '4197', '0', '0', '21', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('144', 'Strzały Trapera', '', 'Strzaly', 'przedmiot/rhand/gob_arr.gif', '29', '0', '0', '0', '1', '1', '0', '0', '0', '0', '0', '0', '0', '22', '22', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '200', '0', '0', '364', '29', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('145', 'Prosty Miecz Goblina', '', 'BronJednoreczna', 'przedmiot/lhand/gob3.gif', '29', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '106', '130', '120', '1', '19', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '4197', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('146', 'Ognisty Miecz Goblina', '', 'BronJednoreczna', 'przedmiot/lhand/gob4.gif', '29', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '96', '117', '120', '1', '19', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '118', '0', '0', '0', '0', '0', '0', '0', '4627', '0', '29', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('147', 'Kolczuga Orczego Tancerza', '', 'Zbroja', 'przedmiot/z-ork-zbr.gif', '40', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '109', '109', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '24', '0', '0', '0', '13', '0', '0', '0', '0', '0', '0', '0', '0', '0', '8611', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('148', 'Różdżka Orka', '', 'Rozdzka', 'przedmiot/roz/ork-roz.gif', '30', '0', '0', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '120', '3', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '257', '0', '0', '0', '0', '0', '0', '0', '4063', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('149', 'Orcza Kolczuga Tancerza', 'unique', 'Zbroja', 'przedmiot/armor/z-ork-zbr.gif', '40', '0', '0', '1', '0', '0', '0', '0', '0', '0', '18', '120', '120', '0', '0', '0', '0', '0', '0', '0', '28', '0', '0', '0', '24', '0', '0', '0', '13', '0', '0', '0', '0', '0', '0', '0', '0', '0', '13314', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('150', 'Topór Thowara', 'heroic', 'BronDwureczna', 'przedmiot/elite/thowar/topor.gif', '31', '1', '0', '0', '0', '0', '0', '0', '0', '0', '16', '0', '0', '211', '258', '200', '1', '35', '0', '0', '0', '7', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '9206', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('151', 'Uszkodzone Buty Thowara', '', 'Buty', 'przedmiot/but/3.gif', '20', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '21', '13', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1094', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('152', 'Hełm Thowara', '', 'Helm', 'przedmiot/elite/thowar/helm.gif', '40', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '52', '26', '0', '0', '0', '0', '24', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '4339', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('153', 'Rękawice Thowara', '', 'Rekawice', 'przedmiot/rek/6.gif', '35', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '29', '29', '0', '0', '0', '0', '22', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '3039', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('154', 'Lekki Topór Thowara', 'unique', 'BronDwureczna', 'przedmiot/elite/thowar/topor.gif', '31', '1', '0', '0', '0', '0', '0', '0', '0', '0', '16', '0', '0', '194', '237', '200', '1', '20', '0', '0', '0', '3', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '7365', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('155', 'Buty Thowara', 'unique', 'Buty', 'przedmiot/but/3.gif', '47', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '54', '38', '0', '0', '0', '0', '51', '51', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '8730', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('156', 'Łuskowa Zbroja Thowara', 'unique', 'Zbroja', 'przedmiot/armor/8.gif', '42', '0', '0', '1', '1', '1', '0', '0', '0', '221', '14', '158', '158', '0', '0', '0', '0', '0', '46', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '13314', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('157', 'Floret Podejrzanego Przewodnictwa', 'heroic', 'BronJednoreczna', 'przedmiot/her/lhand/63_1.gif', '60', '0', '0', '1', '0', '0', '0', '0', '0', '0', '38', '0', '0', '312', '345', '120', '1', '0', '64', '0', '0', '4', '5', '0', '0', '0', '0', '0', '6', '0', '0', '0', '0', '0', '0', '0', '0', '0', '36700', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('158', 'Naszyjnik Złego Przewodnika', 'unique', 'Naszyjnik', 'przedmiot/her/nas/63_1.gif', '60', '0', '0', '0', '0', '0', '0', '0', '0', '613', '53', '0', '0', '0', '0', '0', '0', '0', '0', '0', '53', '4', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '14100', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('159', 'Buty Bardzo Złego Przewodnika', 'heroic', 'Buty', 'przedmiot/her/but/63_1.gif', '58', '0', '0', '0', '0', '0', '0', '0', '0', '0', '66', '73', '73', '0', '0', '0', '0', '0', '0', '0', '52', '0', '0', '0', '0', '0', '0', '0', '6', '0', '0', '0', '0', '0', '0', '0', '0', '0', '16500', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('160', 'Szata Złego Przewodnika', 'legendary', 'Zbroja', 'przedmiot/her/arm/63_1.gif', '61', '1', '0', '1', '1', '0', '0', '0', '0', '0', '54', '236', '236', '0', '0', '0', '0', '0', '0', '0', '43', '8', '13', '0', '0', '0', '0', '0', '8', '0', '0', '0', '0', '0', '0', '0', '0', '0', '74600', '0', '0', '0', '0', '0', '', '0', '14');
INSERT INTO `przedmiot_loot` VALUES ('161', 'Naszyjnik Bardzo Złego Przewodnika', 'heroic', 'Naszyjnik', 'przedmiot/her/nas/63_1.gif', '60', '0', '0', '0', '0', '0', '0', '0', '0', '613', '53', '0', '0', '0', '0', '0', '0', '0', '0', '0', '53', '6', '0', '0', '30', '0', '0', '0', '6', '0', '0', '0', '0', '0', '0', '0', '0', '0', '22400', '0', '0', '0', '0', '0', '', '15', '0');
INSERT INTO `przedmiot_loot` VALUES ('162', 'Sygnet Złego Przewodnika', 'unique', 'Pierscien', 'przedmiot/her/pie/63_1.gif', '60', '0', '0', '0', '0', '0', '0', '0', '0', '319', '0', '0', '18', '0', '0', '0', '0', '0', '0', '0', '23', '5', '5', '5', '30', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '16300', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('163', 'Kubrak Zwodniczych Świateł', 'heroic', 'Zbroja', 'przedmiot/her/arm/63_2.gif', '60', '0', '0', '0', '0', '0', '1', '0', '0', '0', '38', '76', '152', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '5', '0', '764', '382', '114', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '44500', '0', '0', '0', '0', '0', '', '50', '0');
INSERT INTO `przedmiot_loot` VALUES ('164', 'Kaftan Fałszywej Małpy', 'heroic', 'Zbroja', 'przedmiot/her/arm/63_3.gif', '60', '0', '0', '0', '0', '1', '0', '0', '0', '0', '53', '146', '146', '0', '0', '0', '0', '0', '0', '0', '0', '0', '5', '5', '90', '547', '401', '0', '6', '0', '0', '0', '0', '0', '0', '0', '0', '0', '46800', '0', '0', '0', '0', '0', '', '25', '0');
INSERT INTO `przedmiot_loot` VALUES ('165', 'Bransolety Bardzo Złego Przewodnika', 'heroic', 'Rekawice', 'przedmiot/her/rek/63_1.gif', '60', '0', '0', '0', '0', '0', '0', '0', '0', '0', '53', '64', '64', '0', '0', '0', '0', '0', '0', '0', '68', '0', '0', '0', '0', '0', '0', '0', '6', '0', '0', '0', '0', '0', '0', '0', '0', '0', '17600', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('166', 'Sztylet z Cholewy Buta', 'heroic', 'BronPomocnicza', 'przedmiot/her/pom/63_1.gif', '60', '0', '0', '1', '0', '0', '0', '0', '0', '0', '38', '0', '0', '233', '258', '100', '1', '0', '34', '0', '0', '0', '0', '0', '0', '0', '0', '0', '6', '0', '0', '0', '0', '0', '0', '0', '0', '0', '36700', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('167', 'Przebicie Ślepego Wąwozu', 'heroic', 'BronDystansowa', 'przedmiot/her/luk/63_1.gif', '60', '0', '0', '0', '1', '0', '0', '0', '0', '0', '53', '0', '0', '247', '302', '120', '2', '0', '34', '0', '0', '0', '5', '0', '0', '0', '0', '0', '0', '0', '0', '20', '217', '0', '0', '0', '0', '0', '38500', '0', '0', '27', '0', '0', '', '0', '14');
INSERT INTO `przedmiot_loot` VALUES ('168', 'Tarcza Bezgwiezdnej Nocy', 'heroic', 'Tarcza', 'przedmiot/her/rhand/63_1.gif', '60', '1', '1', '0', '0', '0', '0', '0', '0', '0', '38', '220', '110', '0', '0', '0', '0', '0', '0', '0', '0', '0', '5', '0', '0', '0', '0', '0', '0', '60', '0', '0', '0', '0', '0', '0', '0', '0', '31400', '0', '0', '0', '0', '0', '', '0', '14');
INSERT INTO `przedmiot_loot` VALUES ('169', 'Napierśnik Wyboistego Traktu', 'unique', 'Zbroja', 'przedmiot/her/arm/63_4.gif', '60', '0', '0', '1', '0', '0', '0', '0', '0', '0', '23', '195', '195', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '36', '0', '0', '0', '26', '0', '0', '0', '0', '0', '0', '0', '0', '0', '30800', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('170', 'Miecz Samotnej Gardy', 'heroic', 'BronJednoreczna', 'przedmiot/her/lhand/63_2.gif', '60', '0', '1', '0', '0', '0', '0', '0', '0', '0', '23', '0', '0', '263', '322', '120', '1', '34', '0', '0', '0', '0', '5', '5', '0', '0', '0', '0', '0', '0', '325', '0', '0', '0', '0', '0', '0', '50', '44500', '0', '60', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('171', 'Łuk Nieznanych Meandrów', 'heroic', 'BronDystansowa', 'przedmiot/her/luk/63_2.gif', '60', '0', '0', '0', '0', '1', '0', '0', '0', '0', '38', '0', '0', '196', '239', '120', '2', '0', '34', '0', '0', '0', '5', '5', '0', '0', '0', '0', '0', '0', '440', '20', '0', '0', '0', '0', '0', '0', '40400', '0', '0', '0', '0', '0', '', '15', '0');
INSERT INTO `przedmiot_loot` VALUES ('172', 'Kij Złego Przewodnika', 'heroic', 'BronDwureczna', 'przedmiot/her/lhand/63_3.gif', '60', '1', '0', '0', '0', '0', '0', '0', '0', '0', '38', '0', '0', '438', '536', '200', '1', '0', '0', '0', '23', '7', '5', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '38500', '0', '0', '0', '0', '0', 'Wygląda jak zwykły mnisi kij. Zmienisz<br>zdanie,  kiedy nim dostaniesz.', '14', '0');
INSERT INTO `przedmiot_loot` VALUES ('173', 'Buty Złego Przewodnika', 'unique', 'Buty', 'przedmiot/her/but/63_1.gif', '58', '0', '0', '0', '0', '0', '0', '0', '0', '0', '37', '70', '70', '0', '0', '0', '0', '0', '0', '0', '37', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '12500', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('174', 'Bransolety Złego Przewodnika', 'unique', 'Rekawice', 'przedmiot/her/rek/63_1.gif', '60', '0', '0', '0', '0', '0', '0', '0', '0', '0', '38', '61', '61', '0', '0', '0', '0', '0', '0', '0', '38', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '13400', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('175', 'Krawędzie Opustoszałego Cięcia', 'unique', 'BronDwureczna', 'przedmiot/her/lhand/63_4.gif', '60', '1', '0', '0', '0', '0', '0', '0', '0', '0', '23', '0', '0', '393', '430', '200', '1', '0', '0', '0', '0', '0', '10', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '26600', '0', '0', '25', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('176', 'Płyta Cienistych Bezdroży', 'heroic', 'Zbroja', 'przedmiot/her/arm/63_5.gif', '60', '0', '1', '0', '0', '0', '0', '0', '0', '0', '23', '229', '229', '0', '0', '0', '0', '34', '0', '0', '0', '0', '5', '5', '0', '0', '0', '114', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '46800', '0', '0', '0', '6', '0', '', '0', '14');
INSERT INTO `przedmiot_loot` VALUES ('177', 'Sygnet Bardzo Złego Przewodnika', 'heroic', 'Pierscien', 'przedmiot/her/pie/63_1.gif', '60', '0', '0', '0', '0', '0', '0', '0', '0', '613', '23', '0', '0', '0', '0', '0', '0', '0', '0', '0', '38', '7', '5', '5', '30', '0', '0', '0', '6', '0', '0', '0', '0', '0', '0', '0', '0', '0', '24700', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_loot` VALUES ('178', 'Zielona Stal Manowców', 'unique', 'Zbroja', 'przedmiot/her/arm/63_6.gif', '60', '1', '0', '0', '0', '0', '0', '0', '0', '319', '23', '340', '170', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '29300', '0', '0', '0', '6', '0', '', '0', '0');

-- ----------------------------
-- Table structure for `przedmiot_postac`
-- ----------------------------
DROP TABLE IF EXISTS `przedmiot_postac`;
CREATE TABLE `przedmiot_postac` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `postac` int(11) NOT NULL DEFAULT '0',
  `nazwa` varchar(200) COLLATE utf8_polish_ci NOT NULL,
  `klasa` varchar(30) COLLATE utf8_polish_ci NOT NULL,
  `typ` varchar(30) COLLATE utf8_polish_ci NOT NULL,
  `obrazek` varchar(200) COLLATE utf8_polish_ci NOT NULL DEFAULT 'przedmiot/',
  `wym_poziom` int(11) NOT NULL DEFAULT '0',
  `prof1` tinyint(1) NOT NULL DEFAULT '0',
  `prof2` tinyint(1) NOT NULL DEFAULT '0',
  `prof3` tinyint(1) NOT NULL DEFAULT '0',
  `prof4` tinyint(1) NOT NULL DEFAULT '0',
  `prof5` tinyint(1) NOT NULL DEFAULT '0',
  `prof6` tinyint(1) NOT NULL DEFAULT '0',
  `wartosc_sprzedazy` int(11) NOT NULL DEFAULT '0',
  `zalozony` tinyint(1) NOT NULL DEFAULT '0',
  `zycie` int(11) NOT NULL DEFAULT '0',
  `sa` int(11) NOT NULL DEFAULT '0',
  `ac` int(11) NOT NULL DEFAULT '0',
  `acm` int(11) NOT NULL DEFAULT '0',
  `obr_min` int(11) NOT NULL DEFAULT '0',
  `obr_max` int(11) NOT NULL DEFAULT '0',
  `mnoznik` int(3) NOT NULL DEFAULT '0',
  `mnoznik_typ` tinyint(1) NOT NULL DEFAULT '0',
  `sila` int(11) NOT NULL DEFAULT '0',
  `zrecznosc` int(11) NOT NULL DEFAULT '0',
  `intelekt` int(11) NOT NULL DEFAULT '0',
  `wszystkie_cechy` int(11) NOT NULL DEFAULT '0',
  `ck` int(11) NOT NULL DEFAULT '0',
  `ckf` int(11) NOT NULL DEFAULT '0',
  `ckm` int(11) NOT NULL DEFAULT '0',
  `acp` int(11) NOT NULL DEFAULT '0',
  `absorbcja` int(11) NOT NULL DEFAULT '0',
  `mabsorbcja` int(11) NOT NULL DEFAULT '0',
  `leczenie` int(11) NOT NULL DEFAULT '0',
  `unik` int(11) NOT NULL DEFAULT '0',
  `blok` int(11) NOT NULL DEFAULT '0',
  `obr_mag` int(11) NOT NULL DEFAULT '0',
  `przebicie` smallint(3) NOT NULL DEFAULT '0',
  `obr_poi` int(11) NOT NULL DEFAULT '0',
  `glebokarana` smallint(3) NOT NULL DEFAULT '0',
  `atak_gr` int(11) NOT NULL DEFAULT '0',
  `ilosc` int(5) NOT NULL DEFAULT '0',
  `mikstura_leczenie` int(11) NOT NULL DEFAULT '0',
  `kontra` smallint(3) NOT NULL DEFAULT '0',
  `obnizac` int(11) NOT NULL DEFAULT '0',
  `obnizacm` int(11) NOT NULL DEFAULT '0',
  `obnizsa` int(11) NOT NULL DEFAULT '0',
  `zycie_za_sile` int(11) NOT NULL DEFAULT '0',
  `pelne_leczenie` int(11) NOT NULL DEFAULT '0',
  `opis` text COLLATE utf8_polish_ci NOT NULL,
  `mana` int(11) NOT NULL DEFAULT '0',
  `energia` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=679 DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci;

-- ----------------------------
-- Records of przedmiot_postac
-- ----------------------------
INSERT INTO `przedmiot_postac` VALUES ('72', '3', 'Obro?a Prawego ?ba Cerbera', 'unique', 'Naszyjnik', 'przedmiot/elite/cerber/obroza3.gif', '28', '0', '1', '0', '0', '1', '1', '3204', '1', '0', '22', '0', '0', '0', '0', '0', '0', '0', '0', '46', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('377', '1', 'Amulet Boga Wojny', '', 'Naszyjnik', 'przedmiot/nas/1.gif', '20', '0', '0', '0', '0', '0', '0', '1209', '0', '0', '0', '0', '0', '0', '0', '0', '0', '24', '14', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('68', '3', 'Magiczny Puklerz', '', 'Tarcza', 'przedmiot/rhand/mtarcza1.gif', '15', '0', '1', '0', '0', '0', '1', '2280', '1', '0', '0', '16', '31', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '5', '0', '33', '33', '0', '0', '15', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('635', '4', 'Mniejszy Eliksir Zdrowia', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura2.gif', '0', '0', '0', '0', '0', '0', '0', '22', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '75', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('67', '3', 'Pierscien Madrosci Valii', 'heroic', 'Pierscien', 'przedmiot/pie/2.gif', '100', '0', '0', '0', '0', '0', '1', '142000', '1', '0', '58', '0', '0', '0', '0', '0', '0', '0', '104', '54', '0', '2', '6', '6', '0', '0', '0', '0', '20', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('641', '4', 'Mniejszy Eliksir Zdrowia', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura2.gif', '0', '0', '0', '0', '0', '0', '0', '22', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '75', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('62', '3', 'Nar Furia', '', 'Rozdzka', 'przedmiot/roz/4.gif', '34', '0', '0', '0', '0', '0', '1', '10344', '1', '0', '0', '0', '0', '0', '0', '120', '3', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '334', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('627', '4', 'Szyszak', '', 'Helm', 'przedmiot/cap/szyszak.gif', '4', '0', '0', '0', '0', '0', '0', '57', '1', '0', '0', '4', '3', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('360', '1', 'Dobre Skórzane Buty', '', 'Buty', 'przedmiot/but/4.gif', '20', '0', '0', '0', '0', '0', '0', '575', '0', '0', '13', '18', '18', '0', '0', '0', '0', '0', '0', '0', '13', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('359', '1', 'Czapka Kartografa', '', 'Helm', 'przedmiot/cap/czapka-kartografa.gif', '15', '0', '0', '0', '0', '0', '0', '670', '1', '0', '0', '14', '14', '0', '0', '0', '0', '0', '0', '0', '12', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('358', '1', 'Rekawice Szarego Niedzwiedzia', '', 'Rekawice', 'przedmiot/rek/8.gif', '20', '0', '0', '0', '0', '0', '0', '1149', '0', '0', '13', '15', '15', '0', '0', '0', '0', '0', '0', '0', '13', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('642', '4', 'Mniejszy Eliksir Zdrowia', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura2.gif', '0', '0', '0', '0', '0', '0', '0', '22', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '75', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('643', '4', 'Mniejszy Eliksir Zdrowia', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura2.gif', '0', '0', '0', '0', '0', '0', '0', '22', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '75', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('638', '4', 'Mniejszy Eliksir Zdrowia', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura2.gif', '0', '0', '0', '0', '0', '0', '0', '22', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '75', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('362', '1', 'Prosty Korbacz Pomocniczy', 'upgraded', 'BronPomocnicza', 'przedmiot/rhand/pom4.gif', '18', '0', '0', '1', '0', '0', '0', '2614', '1', '0', '0', '0', '0', '56', '62', '115', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('364', '1', 'Rapier', '', 'BronJednoreczna', 'przedmiot/lhand/bj5.gif', '18', '1', '1', '1', '0', '0', '0', '1538', '1', '0', '0', '0', '0', '61', '75', '120', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('365', '1', 'Buty Rycerskie', '', 'Buty', 'przedmiot/but/3.gif', '10', '0', '0', '0', '0', '0', '0', '289', '0', '0', '11', '8', '7', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('637', '4', 'Mniejszy Eliksir Zdrowia', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura2.gif', '0', '0', '0', '0', '0', '0', '0', '22', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '75', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('497', '1', 'Sztylet Koto?aka', '', 'BronPomocnicza', 'przedmiot/elite/kotolak/sztylet.gif', '20', '0', '0', '1', '0', '0', '0', '1969', '0', '0', '0', '0', '0', '55', '61', '100', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('647', '4', 'Mniejszy Eliksir Zdrowia', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura2.gif', '0', '0', '0', '0', '0', '0', '0', '22', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '75', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('369', '1', 'Kolczuga Tancerza', '', 'Zbroja', 'przedmiot/armor/tancek-kolczuga.gif', '15', '0', '0', '1', '1', '0', '0', '1899', '1', '0', '5', '35', '35', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '25', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('481', '2', 'Tarcza M?odego Paladyna', '', 'Tarcza', 'przedmiot/elite/apostata/shield.gif', '22', '1', '1', '0', '0', '0', '0', '1926', '1', '0', '0', '58', '32', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '22', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('640', '4', 'Mniejszy Eliksir Zdrowia', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura2.gif', '0', '0', '0', '0', '0', '0', '0', '22', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '75', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('357', '1', 'Zlociste Rekawice', '', 'Rekawice', 'przedmiot/rek/7.gif', '12', '0', '0', '0', '0', '0', '0', '490', '1', '0', '0', '9', '9', '0', '0', '0', '0', '10', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('599', '2', 'Gobli?ski Kaptur Zwinno?ci', 'unique', 'Helm', 'przedmiot/cap/gob2.gif', '28', '0', '0', '1', '1', '0', '0', '3533', '0', '117', '0', '27', '27', '0', '0', '0', '0', '0', '32', '0', '0', '0', '0', '0', '42', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('577', '2', 'Lodowe Ostrze Goblina', 'upgraded', 'BronJednoreczna', 'przedmiot/lhand/gob2.gif', '29', '0', '1', '0', '0', '0', '0', '7962', '0', '0', '17', '0', '0', '120', '146', '130', '1', '36', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '132', '0', '0', '0', '0', '0', '0', '0', '0', '32', '31', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('588', '2', 'Zakrwawione Buty Goblina', '', 'Buty', 'przedmiot/but/gob2.gif', '29', '1', '1', '0', '0', '0', '0', '2448', '0', '0', '0', '32', '18', '0', '0', '0', '0', '19', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('233', '2', 'Naszyjnik Wielkiej Wiary II', 'unique', 'Naszyjnik', 'przedmiot/nas/24_8.gif', '18', '0', '1', '0', '0', '0', '0', '1603', '1', '0', '13', '0', '0', '0', '0', '0', '0', '22', '0', '13', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('370', '1', 'Oslona Ostrzy', '', 'Zbroja', 'przedmiot/armor/6.gif', '19', '0', '0', '1', '0', '0', '0', '2957', '0', '0', '0', '45', '45', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '14', '0', '0', '0', '6', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('636', '4', 'Mniejszy Eliksir Zdrowia', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura2.gif', '0', '0', '0', '0', '0', '0', '0', '22', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '75', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('337', '2', 'R?kawice M?odego Paladyna', '', 'Rekawice', 'przedmiot/elite/apostata/hand.gif', '22', '1', '1', '1', '0', '0', '0', '1672', '1', '0', '0', '17', '17', '0', '0', '0', '0', '0', '0', '0', '14', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('338', '2', 'Pier?cie? Apostaty', '', 'Pierscien', 'przedmiot/elite/apostata/ring.gif', '22', '0', '0', '0', '0', '0', '0', '1310', '1', '0', '14', '0', '0', '0', '0', '0', '0', '0', '0', '0', '14', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('229', '3', 'Bransolety Karmazynowego M?ciciela', 'legendary', 'Rekawice', 'przedmiot/her/rek/45_1.gif', '40', '0', '0', '0', '0', '0', '0', '16500', '1', '0', '48', '43', '43', '0', '0', '0', '0', '0', '0', '0', '38', '9', '5', '5', '0', '0', '0', '0', '4', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', 'Dzi?ki tym bransoletom Karmazynowemu<br>M?cicielowi uda?o si? pokona? Toudiego,<br>kiedy ten próbowa? si? pod niego podszy?.', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('374', '1', 'Naszyjnik Wielkiej Wiary', '', 'Naszyjnik', 'przedmiot/nas/24_8.gif', '15', '0', '0', '0', '0', '0', '0', '608', '1', '0', '0', '0', '0', '0', '0', '0', '0', '19', '0', '12', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('639', '4', 'Mniejszy Eliksir Zdrowia', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura2.gif', '0', '0', '0', '0', '0', '0', '0', '22', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '75', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('376', '1', 'Nszyjnik Uniku', '', 'Naszyjnik', 'przedmiot/nas/2.gif', '35', '0', '0', '0', '0', '0', '0', '3350', '0', '0', '17', '0', '0', '0', '0', '0', '0', '0', '0', '0', '17', '0', '0', '0', '0', '0', '0', '0', '7', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('301', '2', 'Mikstura Makatary', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura4.gif', '0', '0', '0', '0', '0', '0', '0', '1133', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '10', '500', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('302', '2', 'Mikstura Makatary', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura4.gif', '0', '0', '0', '0', '0', '0', '0', '1133', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '3', '500', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('546', '2', 'Dobre Skórzane Buty', '', 'Buty', 'przedmiot/but/4.gif', '20', '0', '0', '0', '0', '0', '0', '575', '1', '0', '13', '18', '18', '0', '0', '0', '0', '0', '0', '0', '13', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('328', '2', 'Kolczuga M?odego Paladyna', '', 'Zbroja', 'przedmiot/elite/apostata/armor1.gif', '22', '0', '1', '0', '0', '0', '0', '2600', '0', '0', '0', '60', '60', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '2', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('215', '3', 'Karmazynowa M?dro??', 'heroic', 'Helm', 'przedmiot/her/cap/45_1.gif', '40', '0', '1', '0', '0', '1', '1', '12400', '1', '296', '18', '26', '48', '0', '0', '0', '0', '0', '0', '0', '18', '5', '0', '5', '39', '53', '53', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '10', '0');
INSERT INTO `przedmiot_postac` VALUES ('344', '1', 'Mikstura Makatary', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura4.gif', '0', '0', '0', '0', '0', '0', '0', '1133', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '10', '500', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('345', '1', 'Mikstura Makatary', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura4.gif', '0', '0', '0', '0', '0', '0', '0', '1133', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '10', '500', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('346', '1', 'Mikstura Makatary', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura4.gif', '0', '0', '0', '0', '0', '0', '0', '1133', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '10', '500', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('347', '1', 'Mikstura Makatary', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura4.gif', '0', '0', '0', '0', '0', '0', '0', '1133', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '10', '500', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('348', '1', 'Mikstura Makatary', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura4.gif', '0', '0', '0', '0', '0', '0', '0', '1133', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '10', '500', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('349', '1', 'Mikstura Makatary', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura4.gif', '0', '0', '0', '0', '0', '0', '0', '1133', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '10', '500', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('350', '1', 'Mikstura Makatary', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura4.gif', '0', '0', '0', '0', '0', '0', '0', '1133', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '10', '500', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('351', '1', 'Mikstura Makatary', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura4.gif', '0', '0', '0', '0', '0', '0', '0', '1133', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '10', '500', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('352', '1', 'Mikstura Makatary', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura4.gif', '0', '0', '0', '0', '0', '0', '0', '1133', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '10', '500', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('353', '1', 'Mikstura Makatary', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura4.gif', '0', '0', '0', '0', '0', '0', '0', '1133', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '10', '500', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('354', '1', 'Mikstura Makatary', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura4.gif', '0', '0', '0', '0', '0', '0', '0', '1133', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '6', '500', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('648', '4', 'Mniejszy Eliksir Zdrowia', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura2.gif', '0', '0', '0', '0', '0', '0', '0', '22', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '75', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('649', '4', 'Mniejszy Eliksir Zdrowia', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura2.gif', '0', '0', '0', '0', '0', '0', '0', '22', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '75', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('549', '2', 'Mikstura Makatary', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura4.gif', '0', '0', '0', '0', '0', '0', '0', '1133', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '10', '500', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('550', '2', 'Mikstura Makatary', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura4.gif', '0', '0', '0', '0', '0', '0', '0', '1133', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '10', '500', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('552', '2', 'Mikstura Makatary', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura4.gif', '0', '0', '0', '0', '0', '0', '0', '1133', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '6', '500', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('646', '4', 'Mniejszy Eliksir Zdrowia', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura2.gif', '0', '0', '0', '0', '0', '0', '0', '22', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '75', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('551', '2', 'Mikstura Makatary', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura4.gif', '0', '0', '0', '0', '0', '0', '0', '1133', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '10', '500', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('548', '2', 'Mikstura Makatary', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura4.gif', '0', '0', '0', '0', '0', '0', '0', '1133', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '10', '500', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('300', '2', 'Mikstura Makatary', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura4.gif', '0', '0', '0', '0', '0', '0', '0', '1133', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '10', '500', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('629', '4', 'Skorzane Buty', '', 'Buty', 'przedmiot/but/1.gif', '1', '0', '0', '0', '0', '0', '0', '11', '1', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('630', '4', 'Wzmocnione Buty', '', 'Buty', 'przedmiot/but/2.gif', '5', '0', '0', '0', '0', '0', '0', '83', '0', '0', '0', '4', '4', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('632', '4', 'Cwierkowana Zbroja Zrecznosci', '', 'Zbroja', 'przedmiot/armor/3-2.gif', '5', '0', '0', '1', '1', '1', '0', '172', '0', '0', '2', '14', '10', '0', '0', '0', '0', '0', '7', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('633', '4', 'Smoczy Talizman I', 'upgraded', 'Talizman', 'przedmiot/tal/1.gif', '1', '0', '0', '0', '0', '0', '0', '3', '1', '0', '3', '0', '0', '0', '0', '0', '0', '0', '0', '0', '3', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('617', '4', 'Proca', '', 'BronDystansowa', 'przedmiot/lhand/proca.gif', '1', '0', '0', '0', '1', '1', '0', '23', '0', '0', '0', '0', '0', '3', '4', '120', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('618', '4', 'Krotki Luk', '', 'BronDystansowa', 'przedmiot/lhand/luk1.gif', '3', '0', '0', '0', '1', '1', '0', '72', '1', '0', '0', '0', '0', '11', '13', '120', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('411', '1', 'Pierscien Lowcy', '', 'Pierscien', 'przedmiot/pie/pierscien1.gif', '15', '0', '0', '0', '0', '0', '0', '739', '1', '89', '12', '0', '0', '0', '0', '0', '0', '0', '12', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('483', '2', 'Dobrej jako?ci szabla paladyna', 'upgraded', 'BronJednoreczna', 'przedmiot/elite/apostata/miecz.gif', '22', '0', '1', '0', '0', '0', '0', '5097', '1', '0', '16', '0', '0', '90', '110', '130', '1', '0', '0', '0', '16', '0', '6', '0', '0', '0', '0', '0', '0', '0', '112', '0', '0', '0', '0', '0', '0', '0', '0', '24', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('628', '4', 'Helm Otwarty', '', 'Helm', 'przedmiot/cap/5.gif', '5', '0', '0', '0', '0', '0', '0', '87', '0', '0', '0', '4', '3', '0', '0', '0', '0', '0', '0', '0', '9', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('608', '2', 'Gobli?ski Kaptur Zwinno?ci', 'unique', 'Helm', 'przedmiot/cap/gob2.gif', '28', '0', '0', '1', '1', '0', '0', '3533', '0', '117', '0', '27', '27', '0', '0', '0', '0', '0', '32', '0', '0', '0', '0', '0', '42', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('610', '4', 'Skorzane Rekawice', '', 'Rekawice', 'przedmiot/rek/2.gif', '2', '0', '0', '0', '0', '0', '0', '20', '0', '0', '0', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('613', '4', 'Wzmocnione Rekawice', '', 'Rekawice', 'przedmiot/rek/3.gif', '4', '0', '0', '0', '0', '0', '0', '86', '1', '0', '0', '3', '3', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('614', '4', 'Rekawice Jezdzieckie', '', 'Rekawice', 'przedmiot/rek/4.gif', '5', '0', '0', '0', '0', '0', '0', '87', '0', '0', '0', '3', '3', '0', '0', '0', '0', '0', '7', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('615', '4', 'Zlociste Rekawice', '', 'Rekawice', 'przedmiot/rek/7.gif', '12', '0', '0', '0', '0', '0', '0', '490', '0', '0', '0', '9', '9', '0', '0', '0', '0', '10', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('616', '4', 'Rekawice Szarego Niedzwiedzia', '', 'Rekawice', 'przedmiot/rek/8.gif', '20', '0', '0', '0', '0', '0', '0', '1149', '0', '0', '13', '15', '15', '0', '0', '0', '0', '0', '0', '0', '13', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('566', '2', 'Zbroja Dobrego Goblina', 'upgraded', 'Zbroja', 'przedmiot/armor/gob4.gif', '27', '0', '1', '0', '0', '0', '0', '6802', '1', '0', '0', '94', '94', '0', '0', '0', '0', '33', '0', '19', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '3', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('606', '2', 'Gobli?ski Topór Dwur?czny', '', 'BronDwureczna', 'przedmiot/lhand/gob1.gif', '28', '1', '0', '0', '0', '0', '0', '4197', '0', '0', '0', '0', '0', '159', '194', '200', '1', '19', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('607', '2', 'Zakrwawione Buty Goblina', '', 'Buty', 'przedmiot/but/gob2.gif', '29', '1', '1', '0', '0', '0', '0', '2448', '0', '0', '0', '32', '18', '0', '0', '0', '0', '19', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('487', '2', 'Z?oty He?m Paladyna', 'unique', 'Helm', 'przedmiot/elite/apostata/helm.gif', '22', '0', '1', '0', '0', '0', '0', '2230', '1', '95', '14', '23', '23', '0', '0', '0', '0', '0', '0', '0', '19', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('644', '4', 'Mniejszy Eliksir Zdrowia', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura2.gif', '0', '0', '0', '0', '0', '0', '0', '22', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '75', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('645', '4', 'Mniejszy Eliksir Zdrowia', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura2.gif', '0', '0', '0', '0', '0', '0', '0', '22', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '75', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('528', '1', 'Miecz Sir Galiena', '', 'BronJednoreczna', 'przedmiot/que/bj1.gif', '21', '1', '1', '1', '0', '0', '0', '2381', '0', '0', '13', '0', '0', '73', '89', '120', '1', '15', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('501', '1', 'Kaptur Koto?aka', '', 'Helm', 'przedmiot/elite/kotolak/kaptur1.gif', '20', '0', '0', '1', '1', '1', '0', '1149', '0', '0', '0', '20', '20', '0', '0', '0', '0', '0', '0', '0', '13', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('605', '2', 'Gobli?skie Krwawe Buty', 'unique', 'Buty', 'przedmiot/but/gob2.gif', '29', '1', '1', '0', '0', '0', '0', '3779', '0', '0', '0', '36', '18', '0', '0', '0', '0', '33', '19', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('530', '1', 'Pajeczyna', '', 'Neutralne', 'przedmiot/neu/pajeczyna.gif', '0', '0', '0', '0', '0', '0', '0', '7', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('531', '3', 'Zbroczona Szata Zemsty', 'unique', 'Zbroja', 'przedmiot/her/arm/45_6.gif', '40', '0', '0', '0', '0', '0', '1', '14700', '1', '0', '18', '45', '86', '0', '0', '0', '0', '0', '0', '0', '18', '0', '0', '0', '0', '449', '224', '0', '4', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '13', '0');
INSERT INTO `przedmiot_postac` VALUES ('619', '4', 'Krotkie Strzaly', '', 'Strzaly', 'przedmiot/rhand/strzala1.gif', '0', '0', '0', '0', '1', '1', '0', '9', '1', '0', '0', '0', '0', '1', '1', '100', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '90', '0', '0', '1', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('620', '4', 'Lepsze Krotkie Strzaly', '', 'Strzaly', 'przedmiot/rhand/strzala1.gif', '5', '0', '0', '0', '1', '1', '0', '20', '0', '0', '0', '0', '0', '3', '3', '100', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '100', '0', '0', '5', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('621', '4', 'Czerwone Strzaly', '', 'Strzaly', 'przedmiot/rhand/strzala2.gif', '10', '0', '0', '0', '1', '1', '0', '47', '0', '0', '0', '0', '0', '7', '7', '100', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '100', '0', '0', '10', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('622', '4', 'Krotki Refleksyjny Luk', '', 'BronDystansowa', 'przedmiot/lhand/luk2.gif', '10', '0', '0', '0', '1', '1', '0', '574', '0', '0', '11', '0', '0', '37', '45', '120', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('589', '2', 'Prosty Miecz Goblina', '', 'BronJednoreczna', 'przedmiot/lhand/gob3.gif', '29', '1', '1', '1', '0', '0', '0', '4197', '0', '0', '0', '0', '0', '106', '130', '120', '1', '19', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('574', '2', 'Gobli?skie Krwawe Buty', 'unique', 'Buty', 'przedmiot/but/gob2.gif', '29', '1', '1', '0', '0', '0', '0', '3779', '0', '0', '0', '36', '18', '0', '0', '0', '0', '33', '19', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('623', '4', 'Skorzana Czapka', '', 'Helm', 'przedmiot/cap/1.gif', '1', '0', '0', '0', '0', '0', '0', '7', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('624', '4', 'Skorzany Helm', '', 'Helm', 'przedmiot/cap/2.gif', '2', '0', '0', '0', '0', '0', '0', '20', '0', '0', '0', '2', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('625', '4', 'Wzmocniony Skorzany Helm', '', 'Helm', 'przedmiot/cap/3.gif', '3', '0', '0', '0', '0', '0', '0', '36', '0', '0', '0', '3', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('590', '2', 'Gobli?ski P?aszcz Natury', '', 'Zbroja', 'przedmiot/armor/gob3.gif', '29', '0', '0', '0', '0', '1', '1', '5102', '0', '154', '0', '55', '110', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '138', '92', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '5', '0');
INSERT INTO `przedmiot_postac` VALUES ('591', '2', 'Gobli?ski P?aszcz Natury', '', 'Zbroja', 'przedmiot/armor/gob3.gif', '29', '0', '0', '0', '0', '1', '1', '5102', '0', '154', '0', '55', '110', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '138', '92', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '5', '0');
INSERT INTO `przedmiot_postac` VALUES ('592', '2', 'Zakrwawione Buty Goblina', '', 'Buty', 'przedmiot/but/gob2.gif', '29', '1', '1', '0', '0', '0', '0', '2448', '0', '0', '0', '32', '18', '0', '0', '0', '0', '19', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('593', '2', 'Moc Magii Wody', 'unique', 'Laska', 'przedmiot/roz/gob1.gif', '29', '0', '0', '0', '0', '0', '1', '6170', '0', '0', '15', '0', '0', '0', '0', '200', '3', '0', '0', '0', '23', '0', '0', '0', '0', '0', '0', '0', '0', '0', '436', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('594', '2', 'Lekka Ochrona Goblina', '', 'Zbroja', 'przedmiot/armor/gob2.gif', '29', '0', '0', '1', '1', '0', '0', '5625', '0', '0', '10', '74', '74', '0', '0', '0', '0', '0', '19', '0', '0', '0', '0', '0', '44', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('595', '2', 'Prosty Miecz Goblina', '', 'BronJednoreczna', 'przedmiot/lhand/gob3.gif', '29', '1', '1', '1', '0', '0', '0', '4197', '0', '0', '0', '0', '0', '106', '130', '120', '1', '19', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('596', '2', 'Zbroja Dobrego Goblina', 'unique', 'Zbroja', 'przedmiot/armor/gob4.gif', '29', '0', '1', '0', '0', '0', '0', '6802', '0', '0', '0', '94', '94', '0', '0', '0', '0', '33', '0', '19', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '3', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('597', '2', 'Gobli?ski Topór Dwur?czny', '', 'BronDwureczna', 'przedmiot/lhand/gob1.gif', '28', '1', '0', '0', '0', '0', '0', '4197', '0', '0', '0', '0', '0', '159', '194', '200', '1', '19', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('598', '2', 'Buty Szybkiego Goblina', '', 'Buty', 'przedmiot/but/gob1.gif', '29', '0', '0', '1', '1', '0', '0', '2571', '0', '0', '0', '22', '22', '0', '0', '0', '0', '0', '19', '0', '0', '0', '0', '0', '44', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('600', '2', 'Gobli?ski Kaptur', '', 'Helm', 'przedmiot/cap/gob2.gif', '28', '0', '0', '1', '1', '0', '0', '2403', '0', '0', '0', '23', '23', '0', '0', '0', '0', '0', '18', '0', '0', '0', '0', '0', '42', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('601', '2', 'Gobli?ski Kaptur', '', 'Helm', 'przedmiot/cap/gob2.gif', '28', '0', '0', '1', '1', '0', '0', '2403', '0', '0', '0', '23', '23', '0', '0', '0', '0', '0', '18', '0', '0', '0', '0', '0', '42', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('602', '2', 'Mocny Gobli?ski Topór', 'unique', 'BronDwureczna', 'przedmiot/lhand/gob1.gif', '29', '1', '0', '0', '0', '0', '0', '6170', '0', '0', '0', '0', '0', '181', '221', '200', '1', '33', '19', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('603', '2', 'Ognisty Miecz Goblina', '', 'BronJednoreczna', 'przedmiot/lhand/gob4.gif', '29', '0', '1', '0', '0', '0', '0', '4627', '0', '0', '0', '0', '0', '96', '117', '120', '1', '19', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '118', '0', '0', '0', '0', '0', '0', '0', '0', '29', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('604', '2', 'P?aszcz Mocy Natury', 'unique', 'Zbroja', 'przedmiot/armor/gob3.gif', '29', '0', '0', '0', '0', '1', '1', '7499', '0', '288', '0', '63', '126', '0', '0', '0', '0', '0', '0', '19', '0', '0', '0', '0', '0', '157', '105', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '5', '0');
INSERT INTO `przedmiot_postac` VALUES ('650', '4', 'Mniejszy Eliksir Zdrowia', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura2.gif', '0', '0', '0', '0', '0', '0', '0', '22', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '75', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('651', '4', 'Mniejszy Eliksir Zdrowia', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura2.gif', '0', '0', '0', '0', '0', '0', '0', '22', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '75', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('652', '4', 'Mniejszy Eliksir Zdrowia', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura2.gif', '0', '0', '0', '0', '0', '0', '0', '22', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '75', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('653', '4', 'Mniejszy Eliksir Zdrowia', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura2.gif', '0', '0', '0', '0', '0', '0', '0', '22', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '75', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('654', '4', 'Mniejszy Eliksir Zdrowia', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura2.gif', '0', '0', '0', '0', '0', '0', '0', '22', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '75', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('655', '4', 'Mniejszy Eliksir Zdrowia', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura2.gif', '0', '0', '0', '0', '0', '0', '0', '22', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '75', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('656', '4', 'Mniejszy Eliksir Zdrowia', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura2.gif', '0', '0', '0', '0', '0', '0', '0', '22', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '75', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('657', '4', 'Mniejszy Eliksir Zdrowia', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura2.gif', '0', '0', '0', '0', '0', '0', '0', '22', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '75', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('658', '4', 'Mniejszy Eliksir Zdrowia', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura2.gif', '0', '0', '0', '0', '0', '0', '0', '22', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '75', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('659', '4', 'Mniejszy Eliksir Zdrowia', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura2.gif', '0', '0', '0', '0', '0', '0', '0', '22', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '75', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('660', '4', 'Mniejszy Eliksir Zdrowia', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura2.gif', '0', '0', '0', '0', '0', '0', '0', '22', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '75', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('666', '4', 'Mieso', 'normal', 'Konsupcyjne', 'przedmiot/mieso.gif', '0', '0', '0', '0', '0', '0', '0', '7', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '13', '0', '0', '0', '0', '0', '0', '', '0', '0');
INSERT INTO `przedmiot_postac` VALUES ('670', '3', 'Buty Bardzo Z?ego Przewodnika', 'heroic', 'Buty', 'przedmiot/her/but/63_1.gif', '58', '0', '0', '0', '0', '0', '0', '16500', '1', '0', '66', '73', '73', '0', '0', '0', '0', '0', '0', '0', '52', '0', '0', '0', '0', '0', '0', '0', '6', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0');

-- ----------------------------
-- Table structure for `przedmiot_sklep`
-- ----------------------------
DROP TABLE IF EXISTS `przedmiot_sklep`;
CREATE TABLE `przedmiot_sklep` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sklep` int(11) NOT NULL DEFAULT '0',
  `poz_x` int(11) NOT NULL DEFAULT '0',
  `poz_y` int(11) NOT NULL DEFAULT '0',
  `nazwa` varchar(200) COLLATE utf8_polish_ci NOT NULL,
  `klasa` varchar(30) COLLATE utf8_polish_ci NOT NULL,
  `typ` varchar(30) COLLATE utf8_polish_ci NOT NULL,
  `obrazek` varchar(200) COLLATE utf8_polish_ci NOT NULL DEFAULT 'przedmiot/',
  `wym_poziom` int(11) NOT NULL DEFAULT '0',
  `prof1` tinyint(1) NOT NULL DEFAULT '0',
  `prof2` tinyint(1) NOT NULL DEFAULT '0',
  `prof3` tinyint(1) NOT NULL DEFAULT '0',
  `prof4` tinyint(1) NOT NULL DEFAULT '0',
  `prof5` tinyint(1) NOT NULL DEFAULT '0',
  `prof6` tinyint(1) NOT NULL DEFAULT '0',
  `wartosc_sprzedazy` int(11) NOT NULL DEFAULT '0',
  `zalozony` tinyint(1) NOT NULL DEFAULT '0',
  `zycie` int(11) NOT NULL DEFAULT '0',
  `sa` int(11) NOT NULL DEFAULT '0',
  `ac` int(11) NOT NULL DEFAULT '0',
  `acm` int(11) NOT NULL DEFAULT '0',
  `obr_min` int(11) NOT NULL DEFAULT '0',
  `obr_max` int(11) NOT NULL DEFAULT '0',
  `mnoznik` int(3) NOT NULL DEFAULT '0',
  `mnoznik_typ` tinyint(1) NOT NULL DEFAULT '0',
  `sila` int(11) NOT NULL DEFAULT '0',
  `zrecznosc` int(11) NOT NULL DEFAULT '0',
  `intelekt` int(11) NOT NULL DEFAULT '0',
  `wszystkie_cechy` int(11) NOT NULL DEFAULT '0',
  `ck` int(11) NOT NULL DEFAULT '0',
  `ckf` int(11) NOT NULL DEFAULT '0',
  `ckm` int(11) NOT NULL DEFAULT '0',
  `acp` int(11) NOT NULL DEFAULT '0',
  `absorbcja` int(11) NOT NULL DEFAULT '0',
  `mabsorbcja` int(11) NOT NULL DEFAULT '0',
  `leczenie` int(11) NOT NULL DEFAULT '0',
  `unik` int(11) NOT NULL DEFAULT '0',
  `blok` int(11) NOT NULL DEFAULT '0',
  `obr_mag` int(11) NOT NULL DEFAULT '0',
  `przebicie` smallint(3) NOT NULL DEFAULT '0',
  `obr_poi` int(11) NOT NULL DEFAULT '0',
  `glebokarana` smallint(3) NOT NULL DEFAULT '0',
  `atak_gr` int(11) NOT NULL DEFAULT '0',
  `ilosc` int(5) NOT NULL DEFAULT '0',
  `mikstura_leczenie` int(11) NOT NULL DEFAULT '0',
  `kontra` smallint(3) NOT NULL DEFAULT '0',
  `wartosc_kupna` int(11) NOT NULL DEFAULT '0',
  `obnizac` int(11) NOT NULL DEFAULT '0',
  `obnizacm` int(11) NOT NULL DEFAULT '0',
  `obnizsa` int(11) NOT NULL DEFAULT '0',
  `zycie_za_sile` int(11) NOT NULL DEFAULT '0',
  `pelne_leczenie` int(11) NOT NULL DEFAULT '0',
  `opis` text COLLATE utf8_polish_ci NOT NULL,
  `mana` int(11) NOT NULL DEFAULT '0',
  `energia` int(11) NOT NULL DEFAULT '0',
  `sl` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=165 DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci;

-- ----------------------------
-- Records of przedmiot_sklep
-- ----------------------------
INSERT INTO `przedmiot_sklep` VALUES ('1', '1', '39', '7', 'Mniejszy Eliksir Zdrowia', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura2.gif', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '75', '0', '44', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('2', '1', '7', '7', 'Eliksir Zdrowia', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura1.gif', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '150', '0', '74', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('3', '1', '7', '39', 'Mocny Eliksir Zdrowia', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura3.gif', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '500', '0', '210', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('4', '2', '7', '7', 'Skorzana Czapka', '', 'Helm', 'przedmiot/cap/1.gif', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '14', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('5', '2', '39', '7', 'Skorzany Helm', '', 'Helm', 'przedmiot/cap/2.gif', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '2', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '40', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('6', '2', '71', '7', 'Wzmocniony Skorzany Helm', '', 'Helm', 'przedmiot/cap/3.gif', '3', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '3', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '72', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('7', '2', '7', '39', 'Sztylet', '', 'BronJednoreczna', 'przedmiot/lhand/bj1.gif', '2', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '5', '7', '120', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '76', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('8', '2', '39', '39', 'Krotki Miecz', '', 'BronJednoreczna', 'przedmiot/lhand/bj2.gif', '5', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '15', '18', '120', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '312', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('9', '2', '71', '39', 'Dlugi Miecz', '', 'BronJednoreczna', 'przedmiot/lhand/bj3.gif', '8', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '25', '31', '120', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '700', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('10', '2', '103', '39', 'Szeroki Miecz', '', 'BronJednoreczna', 'przedmiot/lhand/bj4.gif', '9', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '29', '35', '120', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '862', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('11', '2', '135', '39', 'Topor', '', 'BronJednoreczna', 'przedmiot/lhand/topor1.gif', '11', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '36', '44', '120', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1238', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('12', '2', '7', '71', 'Krotki Luk', '', 'BronDystansowa', 'przedmiot/lhand/luk1.gif', '3', '0', '0', '0', '1', '1', '0', '0', '0', '0', '0', '0', '0', '11', '13', '120', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '144', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('13', '2', '39', '71', 'Krotki Refleksyjny Luk', '', 'BronDystansowa', 'przedmiot/lhand/luk2.gif', '10', '0', '0', '0', '1', '1', '0', '0', '0', '0', '11', '0', '0', '37', '45', '120', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1148', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('14', '2', '7', '103', 'Lekka Skorzana Zbroja', '', 'Zbroja', 'przedmiot/armor/1.gif', '3', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '8', '7', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '130', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('15', '2', '39', '103', 'Ciezka Skorzana Zbroja', '', 'Zbroja', 'przedmiot/armor/2.gif', '4', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '11', '9', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '206', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('16', '2', '7', '135', 'Puklerz', '', 'Tarcza', 'przedmiot/rhand/tarcza1.gif', '3', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '7', '4', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '3', '0', '0', '0', '0', '0', '0', '0', '0', '124', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('17', '2', '39', '135', 'Pancerny Puklerz', '', 'Tarcza', 'przedmiot/rhand/tarcza2.gif', '5', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '12', '6', '0', '0', '0', '0', '0', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '5', '0', '0', '0', '0', '0', '0', '0', '0', '296', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('18', '2', '71', '135', 'Drewniana Tarcza', '', 'Tarcza', 'przedmiot/rhand/tarcza3.gif', '6', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '14', '7', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '6', '0', '0', '0', '0', '0', '0', '0', '0', '382', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('19', '3', '7', '7', 'Proca', '', 'BronDystansowa', 'przedmiot/lhand/proca.gif', '1', '0', '0', '0', '1', '1', '0', '0', '0', '0', '0', '0', '0', '3', '4', '120', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '46', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('20', '3', '39', '7', 'Krotki Luk', '', 'BronDystansowa', 'przedmiot/lhand/luk1.gif', '3', '0', '0', '0', '1', '1', '0', '0', '0', '0', '0', '0', '0', '11', '13', '120', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '144', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('21', '3', '71', '7', 'Krotki Refleksyjny Luk', '', 'BronDystansowa', 'przedmiot/lhand/luk2.gif', '10', '0', '0', '0', '1', '1', '0', '0', '0', '0', '11', '0', '0', '37', '45', '120', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1148', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('22', '3', '103', '7', 'Lekka Kusza', '', 'BronDystansowa', 'przedmiot/lhand/kusza1.gif', '10', '0', '0', '0', '1', '1', '0', '0', '0', '0', '0', '0', '0', '30', '36', '120', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '10', '21', '0', '0', '0', '1722', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('23', '3', '135', '7', 'Dlugi Luk', '', 'BronDystansowa', 'przedmiot/lhand/luk3.gif', '15', '0', '0', '0', '1', '1', '0', '0', '0', '0', '0', '0', '0', '57', '70', '120', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '10', '0', '0', '0', '0', '0', '0', '3618', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('24', '3', '167', '7', 'Kusza Ciezka', '', 'BronDystansowa', 'przedmiot/lhand/kusza2.gif', '18', '0', '0', '0', '1', '1', '0', '0', '0', '0', '0', '0', '0', '56', '68', '120', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '10', '41', '0', '0', '0', '5086', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('25', '3', '199', '7', 'Dlugi Luk Refleksyjny', '', 'BronDystansowa', 'przedmiot/lhand/luk4.gif', '22', '0', '0', '0', '1', '1', '0', '0', '0', '0', '0', '0', '0', '88', '107', '120', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '10', '0', '0', '0', '0', '0', '0', '7428', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('26', '3', '231', '7', 'Cisowy Luk Refleksyjny', '', 'BronDystansowa', 'przedmiot/lhand/luk5.gif', '28', '0', '0', '0', '1', '1', '0', '0', '0', '0', '15', '0', '0', '116', '142', '120', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '11772', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('27', '3', '7', '39', 'Solidny Luk Refleksyjny', '', 'BronDystansowa', 'przedmiot/lhand/luk6.gif', '35', '0', '0', '0', '1', '1', '0', '0', '0', '0', '0', '0', '0', '121', '148', '120', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '15', '0', '12', '88', '0', '0', '0', '18996', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('28', '3', '39', '71', 'Lepsze Krotkie Strzaly', '', 'Strzaly', 'przedmiot/rhand/strzala1.gif', '5', '0', '0', '0', '1', '1', '0', '0', '0', '0', '0', '0', '0', '3', '3', '100', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '100', '0', '0', '40', '5', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('29', '3', '7', '71', 'Krotkie Strzaly', '', 'Strzaly', 'przedmiot/rhand/strzala1.gif', '0', '0', '0', '0', '1', '1', '0', '0', '0', '0', '0', '0', '0', '1', '1', '100', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '100', '0', '0', '18', '1', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('30', '3', '71', '71', 'Czerwone Strzaly', '', 'Strzaly', 'przedmiot/rhand/strzala2.gif', '10', '0', '0', '0', '1', '1', '0', '0', '0', '0', '0', '0', '0', '7', '7', '100', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '100', '0', '0', '94', '10', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('31', '3', '103', '71', 'Mocne Krotkie Strzaly', '', 'Strzaly', 'przedmiot/rhand/strzala3.gif', '15', '0', '0', '0', '1', '1', '0', '0', '0', '0', '0', '0', '0', '11', '11', '100', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '100', '0', '0', '116', '15', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('32', '3', '135', '71', 'Wzmocnione Strzaly', '', 'Strzaly', 'przedmiot/rhand/strzala4.gif', '25', '0', '0', '0', '1', '1', '0', '0', '0', '0', '0', '0', '0', '19', '19', '100', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '200', '0', '0', '828', '25', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('33', '3', '167', '71', 'Swiszczace Strzaly', '', 'Strzaly', 'przedmiot/rhand/strzala5.gif', '30', '0', '0', '0', '1', '1', '0', '0', '0', '0', '16', '0', '0', '23', '23', '100', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '200', '0', '0', '814', '30', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('34', '3', '199', '71', 'Zatrute Strzaly', '', 'Strzaly', 'przedmiot/rhand/strzala6.gif', '40', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '30', '0', '0', '200', '0', '0', '2008', '40', '0', '18', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('35', '3', '231', '71', 'Niebieskie Strzaly', '', 'Strzaly', 'przedmiot/rhand/strzala7.gif', '50', '0', '0', '0', '1', '1', '0', '0', '0', '0', '0', '0', '0', '44', '44', '100', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '250', '0', '0', '2562', '50', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('36', '3', '7', '103', 'Cieciwa', '', 'Neutralne', 'przedmiot/neu/cieciwa1.gif', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '15000', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('37', '3', '39', '103', 'Jedwabna Cieciwa', '', 'Neutralne', 'przedmiot/neu/cieciwa2.gif', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '24000', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('38', '4', '7', '7', 'Pierscien Lowcy', '', 'Pierscien', 'przedmiot/pie/pierscien1.gif', '15', '0', '0', '0', '0', '0', '0', '0', '0', '89', '12', '0', '0', '0', '0', '0', '0', '0', '12', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1478', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('39', '1', '7', '71', 'Mikstura Makatary', 'normal', 'Konsupcyjne', 'przedmiot/pot/mikstura4.gif', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '10', '500', '0', '2266', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('40', '5', '7', '7', 'Amulet Boga Wojny', '', 'Naszyjnik', 'przedmiot/nas/1.gif', '20', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '24', '14', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '2418', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('41', '6', '7', '7', 'Czapka Lesnego Elfa', '', 'Helm', 'przedmiot/cap/4.gif', '9', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '8', '8', '0', '0', '0', '0', '0', '9', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '480', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('42', '7', '7', '7', 'Pierscien Zrecznosci Valii', 'heroic', 'Pierscien', 'przedmiot/pie/2.gif', '100', '0', '0', '1', '0', '0', '0', '0', '0', '0', '83', '0', '0', '0', '0', '0', '0', '104', '104', '0', '0', '2', '6', '0', '0', '0', '0', '0', '20', '0', '0', '0', '0', '0', '0', '0', '0', '0', '135200', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('43', '7', '39', '7', 'Pierscien Sily Valii', 'heroic', 'Pierscien', 'przedmiot/pie/2.gif', '100', '1', '0', '0', '0', '0', '0', '0', '0', '1097', '58', '0', '0', '0', '0', '0', '0', '154', '0', '0', '0', '3', '12', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '128800', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('44', '7', '71', '7', 'Pierscien Szybkosci Valii', 'heroic', 'Pierscien', 'przedmiot/pie/2.gif', '100', '0', '0', '0', '1', '0', '0', '0', '0', '0', '33', '0', '0', '0', '0', '0', '0', '0', '204', '0', '0', '3', '12', '0', '0', '0', '0', '0', '20', '0', '0', '0', '0', '0', '0', '0', '0', '0', '122800', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('45', '7', '103', '7', 'Pierscien Madrosci Valii', 'heroic', 'Pierscien', 'przedmiot/pie/2.gif', '100', '0', '0', '0', '0', '1', '0', '0', '0', '0', '58', '0', '0', '0', '0', '0', '0', '0', '104', '54', '0', '2', '6', '6', '0', '0', '0', '0', '20', '0', '0', '0', '0', '0', '0', '0', '0', '0', '142000', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('46', '2', '7', '167', 'Rapier', '', 'BronJednoreczna', 'przedmiot/lhand/bj5.gif', '18', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '61', '75', '120', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '3076', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('47', '8', '7', '7', 'Pierscien Szczurolapa', '', 'Pierscien', 'przedmiot/pie/szczurolap.gif', '11', '0', '0', '0', '0', '0', '0', '0', '0', '0', '11', '0', '0', '0', '0', '0', '0', '0', '0', '0', '11', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '722', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('48', '8', '7', '39', 'Miecz Poltorareczny', '', 'BronPoltorareczna', 'przedmiot/lhand/bp1.gif', '15', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '63', '77', '150', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '2188', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('49', '8', '7', '71', 'Nszyjnik Uniku', '', 'Naszyjnik', 'przedmiot/nas/2.gif', '35', '0', '0', '0', '0', '0', '0', '0', '0', '0', '17', '0', '0', '0', '0', '0', '0', '0', '0', '0', '17', '0', '0', '0', '0', '0', '0', '0', '7', '0', '0', '0', '0', '0', '0', '0', '0', '0', '6700', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('50', '9', '7', '7', 'Skorzana Czapka', '', 'Helm', 'przedmiot/cap/1.gif', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '14', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('51', '9', '39', '7', 'Skorzany Helm', '', 'Helm', 'przedmiot/cap/2.gif', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '2', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '40', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('52', '9', '71', '7', 'Wzmocniony Skorzany Helm', '', 'Helm', 'przedmiot/cap/3.gif', '3', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '3', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '72', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('53', '9', '103', '7', 'Szyszak', '', 'Helm', 'przedmiot/cap/szyszak.gif', '4', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '4', '3', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '114', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('54', '9', '135', '7', 'Helm Otwarty', '', 'Helm', 'przedmiot/cap/5.gif', '5', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '4', '3', '0', '0', '0', '0', '0', '0', '0', '9', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '174', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('55', '9', '7', '39', 'Skorzane Buty', '', 'Buty', 'przedmiot/but/1.gif', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '22', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('56', '9', '39', '39', 'Wzmocnione Buty', '', 'Buty', 'przedmiot/but/2.gif', '5', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '4', '4', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '166', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('57', '9', '7', '71', 'Lekka Skorzana Zbroja', '', 'Zbroja', 'przedmiot/armor/1.gif', '3', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '8', '7', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '130', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('58', '9', '39', '71', 'Ciezka Skorzana Zbroja', '', 'Zbroja', 'przedmiot/armor/2.gif', '4', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '11', '9', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '206', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('59', '9', '71', '71', 'Lekka Cwierkowana Zbroja', '', 'Zbroja', 'przedmiot/armor/3.gif', '5', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '14', '10', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '298', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('60', '9', '103', '71', 'Ciezka Cwierkowana Zbroja', '', 'Zbroja', 'przedmiot/armor/3-2.gif', '5', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '24', '17', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '468', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('61', '9', '7', '103', 'Zbroja Cwierkowana Lowcy', '', 'Zbroja', 'przedmiot/armor/3.gif', '5', '0', '0', '0', '1', '1', '0', '0', '0', '0', '2', '9', '8', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '9', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '398', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('62', '9', '39', '103', 'Cwierkowana Zbroja Zrecznosci', '', 'Zbroja', 'przedmiot/armor/3-2.gif', '5', '0', '0', '1', '1', '1', '0', '0', '0', '0', '2', '14', '10', '0', '0', '0', '0', '0', '7', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '344', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('63', '9', '71', '103', 'Ciezka Cwierkowa Zbroja Lowcy', '', 'Zbroja', 'przedmiot/armor/3-2.gif', '6', '0', '0', '1', '1', '1', '0', '0', '0', '0', '2', '16', '13', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '446', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('64', '9', '135', '71', 'Lekka Kolczuga', '', 'Zbroja', 'przedmiot/armor/4.gif', '9', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '25', '20', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '822', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('65', '9', '103', '103', 'Stara Kolczuga Lowcy', '', 'Zbroja', 'przedmiot/armor/zniszczona.gif', '8', '0', '0', '0', '1', '1', '0', '0', '0', '0', '3', '15', '15', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '15', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '810', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('66', '9', '135', '103', 'Uszkodzona Zbroja Paskowa Lowcy', '', 'Zbroja', 'przedmiot/armor/uszkodzona.gif', '10', '0', '0', '0', '1', '1', '0', '0', '0', '0', '3', '20', '20', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '20', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1910', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('67', '9', '167', '103', 'Iridianowa Kolczuga', '', 'Zbroja', 'przedmiot/armor/niebieska-kolczuga.gif', '11', '0', '0', '1', '1', '0', '0', '0', '0', '0', '4', '25', '25', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '20', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '2148', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('68', '9', '199', '103', 'Kolczuga Tancerza', '', 'Zbroja', 'przedmiot/armor/tancek-kolczuga.gif', '15', '0', '0', '1', '1', '0', '0', '0', '0', '0', '5', '35', '35', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '25', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '3798', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('69', '9', '231', '103', 'Zbroja Paskowa Lowcy', '', 'Zbroja', 'przedmiot/armor/5.gif', '20', '0', '0', '0', '1', '1', '0', '0', '0', '0', '7', '42', '42', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '42', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '4342', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('70', '9', '7', '295', 'Oslona Ostrzy', '', 'Zbroja', 'przedmiot/armor/6.gif', '19', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '45', '45', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '14', '0', '0', '0', '6', '0', '0', '0', '0', '0', '0', '0', '0', '0', '5914', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('71', '9', '7', '135', 'Zbroja Pierscieniowa', '', 'Zbroja', 'przedmiot/armor/7.gif', '8', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '25', '20', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '772', '0', '0', '0', '1', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('72', '9', '39', '135', 'Kolczuga', '', 'Zbroja', 'przedmiot/armor/kolczuga.gif', '9', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '29', '23', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '952', '0', '0', '0', '1', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('73', '9', '71', '135', 'Zbroja Paskowa', '', 'Zbroja', 'przedmiot/armor/5.gif', '10', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '32', '25', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1148', '0', '0', '0', '1', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('74', '9', '103', '135', 'Zbroja Luskowa', '', 'Zbroja', 'przedmiot/armor/8.gif', '13', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '43', '32', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1852', '0', '0', '0', '1', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('75', '9', '135', '135', 'Zbroja Segmentowa', '', 'Zbroja', 'przedmiot/armor/5-2.gif', '15', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '50', '35', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '3618', '0', '0', '0', '2', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('76', '9', '7', '167', 'Sztylet', '', 'BronJednoreczna', 'przedmiot/lhand/bj1.gif', '2', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '5', '7', '120', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '76', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('77', '9', '39', '167', 'Krotki Miecz', '', 'BronJednoreczna', 'przedmiot/lhand/bj2.gif', '5', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '15', '18', '120', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '312', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('78', '9', '103', '167', 'Dlugi Miecz', '', 'BronJednoreczna', 'przedmiot/lhand/bj3.gif', '8', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '25', '31', '120', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '700', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('79', '9', '135', '167', 'Szeroki Miecz', '', 'BronJednoreczna', 'przedmiot/lhand/bj4.gif', '9', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '29', '35', '120', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '862', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('80', '9', '199', '167', 'Topor', '', 'BronJednoreczna', 'przedmiot/lhand/topor1.gif', '11', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '36', '44', '120', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1238', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('81', '9', '71', '167', 'Bicz', '', 'BronJednoreczna', 'przedmiot/lhand/bicz.gif', '6', '1', '1', '1', '0', '0', '0', '0', '0', '0', '10', '0', '0', '19', '23', '120', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '758', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('82', '9', '167', '167', 'Szpada', '', 'BronJednoreczna', 'przedmiot/lhand/szpada.gif', '10', '1', '1', '1', '0', '0', '0', '0', '0', '0', '11', '0', '0', '32', '40', '120', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1642', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('83', '9', '231', '167', 'Mongersztern', '', 'BronJednoreczna', 'przedmiot/lhand/mongersztern.gif', '23', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '81', '99', '120', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '7332', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('84', '9', '39', '295', 'Cep Bojowy', '', 'BronJednoreczna', 'przedmiot/lhand/cep.gif', '25', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '89', '109', '120', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '8596', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('85', '9', '71', '199', 'Miecz Poltorareczny', '', 'BronPoltorareczna', 'przedmiot/lhand/bp1.gif', '15', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '63', '77', '150', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '2188', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('86', '9', '7', '199', 'Mlot Bojowy', '', 'BronPoltorareczna', 'przedmiot/lhand/bp2.gif', '12', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '49', '60', '150', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1450', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('87', '9', '39', '199', 'Wlocznia', '', 'BronPoltorareczna', 'przedmiot/lhand/bp3.gif', '13', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '54', '65', '150', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1680', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('88', '9', '7', '231', 'Halabarda', '', 'BronDwureczna', 'przedmiot/lhand/bd1.gif', '19', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '98', '119', '200', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '5106', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('89', '9', '39', '231', 'Miecz Dwureczny', '', 'BronDwureczna', 'przedmiot/lhand/bd2.gif', '22', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '115', '141', '200', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '6738', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('90', '9', '71', '231', 'Dwureczny Topor', '', 'BronDwureczna', 'przedmiot/lhand/bd3.gif', '23', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '121', '148', '200', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '7332', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('91', '9', '103', '231', 'Bojowy Mlot Dwureczny', '', 'BronDwureczna', 'przedmiot/lhand/bd4.gif', '25', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '134', '163', '200', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '8596', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('92', '100001', '7', '7', 'Kusza Sir Galiena', '', 'BronDystansowa', 'przedmiot/que/kusza1.gif', '21', '0', '0', '0', '1', '1', '0', '0', '0', '0', '13', '0', '0', '67', '81', '120', '2', '0', '15', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '10', '49', '0', '0', '0', '5000', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('93', '100001', '39', '7', 'Miecz Sir Galiena', '', 'BronJednoreczna', 'przedmiot/que/bj1.gif', '21', '1', '1', '1', '0', '0', '0', '0', '0', '0', '13', '0', '0', '73', '89', '120', '1', '15', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '4762', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('94', '100001', '71', '7', 'Rozdzka Sir Galiena', '', 'Rozdzka', 'przedmiot/que/roz1.gif', '21', '0', '0', '0', '0', '0', '1', '0', '0', '0', '13', '0', '0', '0', '0', '120', '3', '0', '0', '15', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '170', '0', '0', '0', '0', '0', '0', '0', '4762', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('95', '22', '7', '7', 'Rozdzka Czarnoksieznika', '', 'Rozdzka', 'przedmiot/roz/1.gif', '20', '0', '0', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '120', '3', '0', '0', '0', '0', '0', '0', '4', '0', '0', '0', '0', '0', '0', '161', '0', '0', '0', '0', '0', '0', '0', '5908', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('96', '22', '39', '7', 'Rozdzka Mistrza', '', 'Rozdzka', 'przedmiot/roz/2.gif', '15', '0', '0', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '120', '3', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '116', '0', '0', '0', '0', '0', '0', '0', '3282', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('97', '22', '71', '7', 'Rozdzka Druida', '', 'Rozdzka', 'przedmiot/roz/3.gif', '8', '0', '0', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '120', '3', '0', '0', '8', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '59', '0', '0', '0', '0', '0', '0', '0', '1104', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('98', '22', '7', '39', 'Czapka Lesnego Elfa', '', 'Helm', 'przedmiot/cap/4.gif', '9', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '8', '8', '0', '0', '0', '0', '0', '9', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '480', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('99', '22', '39', '39', 'Helm Rycerski', '', 'Helm', 'przedmiot/cap/6.gif', '13', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '12', '10', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1332', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('100', '22', '7', '71', 'Buty Rycerskie', '', 'Buty', 'przedmiot/but/3.gif', '10', '0', '0', '0', '0', '0', '0', '0', '0', '0', '11', '8', '7', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '578', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('101', '22', '7', '103', 'Zbroja Luskowa', '', 'Zbroja', 'przedmiot/armor/8.gif', '13', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '43', '32', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1852', '0', '0', '0', '1', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('102', '22', '39', '103', 'Zbroja Segmentowa', '', 'Zbroja', 'przedmiot/armor/5-2.gif', '15', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '50', '35', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '3618', '0', '0', '0', '2', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('103', '22', '71', '103', 'Stalowy Napiersnik', '', 'Zbroja', 'przedmiot/armor/9.gif', '18', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '61', '41', '0', '0', '0', '0', '13', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '5340', '0', '0', '0', '2', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('104', '22', '7', '135', 'Plaszcz Mistrza Magii', '', 'Zbroja', 'przedmiot/armor/m1.gif', '20', '0', '0', '0', '0', '0', '1', '0', '0', '0', '0', '18', '31', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '180', '90', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '6514', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('105', '22', '39', '135', 'Plaszcz Czarnoksieznika', '', 'Zbroja', 'przedmiot/armor/m2.gif', '25', '0', '0', '0', '0', '0', '1', '0', '0', '0', '0', '23', '42', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '233', '116', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '10450', '0', '0', '0', '0', '0', '', '5', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('106', '22', '71', '135', 'Plaszcz Slonca', '', 'Zbroja', 'przedmiot/armor/m3.gif', '40', '0', '0', '0', '0', '0', '1', '0', '0', '0', '0', '41', '74', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '408', '204', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '25800', '0', '0', '0', '0', '0', '', '17', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('107', '22', '103', '7', 'Nar Furia', '', 'Rozdzka', 'przedmiot/roz/4.gif', '34', '0', '0', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '120', '3', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '334', '0', '0', '0', '0', '0', '0', '0', '10344', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('108', '22', '7', '167', 'Diamentowy Sztylet', '', 'BronJednoreczna', 'przedmiot/lhand/bj1-2.gif', '5', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '16', '19', '120', '1', '0', '7', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '328', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('109', '22', '39', '167', 'Sztylet Skrytobojcy', '', 'BronJednoreczna', 'przedmiot/lhand/bj1-3.gif', '7', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '22', '27', '120', '1', '0', '8', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '582', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('110', '22', '71', '199', 'Miecz Dwureczny', '', 'BronDwureczna', 'przedmiot/lhand/bd2.gif', '22', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '115', '141', '200', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '6738', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('111', '22', '7', '199', 'Kij Bojowy', '', 'BronDwureczna', 'przedmiot/lhand/bd5.gif', '15', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '75', '82', '200', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '3282', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('112', '22', '39', '199', 'Halabarda', '', 'BronDwureczna', 'przedmiot/lhand/bd6.gif', '16', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '98', '119', '200', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '5106', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('113', '22', '7', '231', 'Katana', '', 'BronPoltorareczna', 'przedmiot/lhand/bp4.gif', '25', '1', '1', '0', '0', '0', '0', '0', '0', '0', '14', '0', '0', '111', '136', '150', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '9024', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('114', '22', '103', '135', 'Plaszcz Kaplana', '', 'Zbroja', 'przedmiot/armor/m4.gif', '8', '0', '0', '0', '0', '0', '1', '0', '0', '0', '0', '7', '12', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '66', '33', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '810', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('115', '22', '39', '231', 'Wzmocniona Srednia Tarcza', '', 'Tarcza', 'przedmiot/rhand/tarcza4.gif', '12', '1', '1', '0', '0', '0', '0', '0', '0', '70', '0', '29', '16', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '12', '0', '0', '0', '0', '0', '0', '0', '0', '1372', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('116', '22', '7', '263', 'Skorzane Rekawice Gibkosci', '', 'Rekawice', 'przedmiot/rek/1.gif', '30', '0', '0', '0', '1', '1', '1', '0', '0', '0', '16', '24', '14', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '4740', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('117', '23', '7', '7', 'Rozdzka Ucznia', '', 'Rozdzka', 'przedmiot/roz/5.gif', '2', '0', '0', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '120', '3', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '14', '0', '0', '0', '0', '0', '0', '0', '92', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('118', '23', '39', '7', 'Rozdzka Kaplana', '', 'Rozdzka', 'przedmiot/roz/6.gif', '3', '0', '0', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '120', '3', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '21', '0', '0', '0', '0', '0', '0', '0', '166', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('119', '23', '71', '7', 'Rozdzka Adepta', '', 'Rozdzka', 'przedmiot/roz/7.gif', '5', '0', '0', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '120', '3', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '36', '0', '0', '0', '0', '0', '0', '0', '374', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('120', '23', '135', '7', 'Rozdzka Maga', '', 'Rozdzka', 'przedmiot/roz/8.gif', '10', '0', '0', '0', '0', '0', '1', '0', '0', '0', '10', '0', '0', '0', '0', '120', '3', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '75', '0', '0', '0', '0', '0', '0', '0', '1642', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('121', '23', '103', '7', 'Rozdzka Druida', '', 'Rozdzka', 'przedmiot/roz/3.gif', '8', '0', '0', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '120', '3', '0', '0', '8', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '59', '0', '0', '0', '0', '0', '0', '0', '1104', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('122', '23', '167', '7', 'Rozdzka Mistrza', '', 'Rozdzka', 'przedmiot/roz/2.gif', '15', '0', '0', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '120', '3', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '116', '0', '0', '0', '0', '0', '0', '0', '3282', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('123', '23', '7', '39', 'Plaszcz Ucznia', '', 'Zbroja', 'przedmiot/armor/m5.gif', '0', '0', '0', '0', '0', '0', '1', '0', '0', '0', '0', '1', '2', '0', '0', '0', '0', '0', '0', '5', '0', '0', '0', '0', '0', '8', '4', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '40', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('124', '23', '39', '39', 'Plaszcz Adepta', '', 'Zbroja', 'przedmiot/armor/m6.gif', '5', '0', '0', '0', '0', '0', '1', '0', '0', '0', '0', '4', '7', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '41', '20', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '544', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('125', '23', '103', '39', 'Plaszcz Maga', '', 'Zbroja', 'przedmiot/armor/m7.gif', '10', '0', '0', '0', '0', '0', '1', '0', '0', '0', '0', '8', '14', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '84', '42', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1206', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('126', '23', '71', '39', 'Plaszcz Kaplana', '', 'Zbroja', 'przedmiot/armor/m4.gif', '8', '0', '0', '0', '0', '0', '1', '0', '0', '0', '0', '7', '12', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '66', '33', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '810', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('127', '23', '7', '71', 'Magiczny Puklerz', '', 'Tarcza', 'przedmiot/rhand/mtarcza1.gif', '15', '0', '1', '0', '0', '0', '1', '0', '0', '0', '0', '16', '31', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '5', '0', '33', '33', '0', '0', '15', '0', '0', '0', '0', '0', '0', '0', '0', '2280', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('128', '10', '7', '7', 'Skorzane Rekawice', '', 'Rekawice', 'przedmiot/rek/2.gif', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '40', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('129', '10', '39', '7', 'Wzmocnione Rekawice', '', 'Rekawice', 'przedmiot/rek/3.gif', '4', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '3', '3', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '172', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('130', '10', '71', '7', 'Rekawice Jezdzieckie', '', 'Rekawice', 'przedmiot/rek/4.gif', '5', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '3', '3', '0', '0', '0', '0', '0', '7', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '174', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('131', '10', '103', '7', 'Rekawice Kolcze', '', 'Rekawice', 'przedmiot/rek/5.gif', '5', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '3', '3', '0', '0', '0', '0', '7', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '174', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('132', '10', '135', '7', 'Rekawice Rycerskie', '', 'Rekawice', 'przedmiot/rek/6.gif', '11', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '8', '8', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '654', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('133', '10', '167', '7', 'Zlociste Rekawice', '', 'Rekawice', 'przedmiot/rek/7.gif', '12', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '9', '9', '0', '0', '0', '0', '10', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '980', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('134', '10', '199', '7', 'Rekawice Szarego Niedzwiedzia', '', 'Rekawice', 'przedmiot/rek/8.gif', '20', '0', '0', '0', '0', '0', '0', '0', '0', '0', '13', '15', '15', '0', '0', '0', '0', '0', '0', '0', '13', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '2298', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('135', '10', '231', '7', 'Zatrute Rekawice Lowcy', '', 'Rekawice', 'przedmiot/rek/9.gif', '20', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '11', '11', '0', '0', '0', '0', '0', '14', '0', '0', '0', '0', '0', '20', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '3798', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('136', '2', '7', '199', 'Nóż do Oprawiania Skóry', '', 'BronPomocnicza', 'przedmiot/rhand/pom1.gif', '5', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '13', '14', '100', '1', '0', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '344', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('137', '2', '39', '199', 'Prosty Nóż', '', 'BronPomocnicza', 'przedmiot/rhand/pom2.gif', '8', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '20', '23', '100', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '700', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('138', '2', '71', '199', 'Miecz Pomocniczy', '', 'BronPomocnicza', 'przedmiot/rhand/pom3.gif', '12', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '31', '35', '100', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1740', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('139', '2', '103', '199', 'Prosty Korbacz Pomocniczy', '', 'BronPomocnicza', 'przedmiot/rhand/pom4.gif', '18', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '49', '54', '100', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '4614', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('140', '24', '7', '7', 'Pierścień Gibkości', '', 'Pierscien', 'przedmiot/pie/24_1.gif', '5', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '7', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '166', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('141', '24', '39', '7', 'Pierścień Mądrości', '', 'Pierscien', 'przedmiot/pie/24_2.gif', '5', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '7', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '200', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('142', '24', '71', '7', 'Pierścień Obrony', '', 'Pierscien', 'przedmiot/pie/24_3.gif', '5', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '9', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '166', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('143', '24', '103', '7', 'Pierścień Siły', '', 'Pierscien', 'przedmiot/pie/24_4.gif', '5', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '7', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '250', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('144', '24', '135', '7', 'Pierścień Wiatru', '', 'Pierscien', 'przedmiot/pie/24_5.gif', '5', '0', '0', '0', '0', '0', '0', '0', '0', '0', '9', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '166', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('145', '24', '167', '7', 'Pierścień Zdrowia', '', 'Pierscien', 'przedmiot/pie/24_6.gif', '5', '0', '0', '0', '0', '0', '0', '0', '0', '44', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '166', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('146', '24', '199', '7', 'Pierścień Olbrzyma', '', 'Pierscien', 'przedmiot/pie/24_7.gif', '20', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '24', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '3960', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('147', '24', '7', '39', 'Naszyjnik Mocy', '', 'Naszyjnik', 'przedmiot/nas/24_1.gif', '5', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '7', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '250', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('148', '24', '39', '39', 'Naszyjnik Ochrony', '', 'Naszyjnik', 'przedmiot/nas/24_2.gif', '5', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '4', '4', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '166', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('149', '24', '71', '39', 'Naszyjnik Szybkości', '', 'Naszyjnik', 'przedmiot/nas/24_3.gif', '5', '0', '0', '0', '0', '0', '0', '0', '0', '0', '9', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '250', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('150', '24', '103', '39', 'Naszyjnik Wiedzy', '', 'Naszyjnik', 'przedmiot/nas/24_4.gif', '5', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '7', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '166', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('151', '24', '135', '39', 'Naszyjnik Zwinności', '', 'Naszyjnik', 'przedmiot/nas/24_5.gif', '5', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '7', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '166', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('152', '24', '167', '39', 'Naszyjnik Życia', '', 'Naszyjnik', 'przedmiot/nas/24_6.gif', '5', '0', '0', '0', '0', '0', '0', '0', '0', '44', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '166', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('153', '24', '199', '39', 'Naszyjnik Szczurzego Pogromcy', '', 'Naszyjnik', 'przedmiot/nas/24_7.gif', '10', '0', '0', '0', '0', '0', '0', '0', '0', '67', '11', '0', '0', '0', '0', '0', '0', '0', '0', '0', '11', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '319', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('154', '24', '231', '39', 'Naszyjnik Wielkiej Wiary', '', 'Naszyjnik', 'przedmiot/nas/24_8.gif', '15', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '19', '0', '12', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1216', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('155', '24', '7', '71', 'Naszyjnik Wielkiej Wiary II', 'unique', 'Naszyjnik', 'przedmiot/nas/24_8.gif', '18', '0', '1', '0', '0', '0', '0', '0', '0', '0', '13', '0', '0', '0', '0', '0', '0', '22', '0', '13', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '3206', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('156', '10', '7', '135', 'Czapka Kartografa', '', 'Helm', 'przedmiot/cap/czapka-kartografa.gif', '15', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '14', '14', '0', '0', '0', '0', '0', '0', '0', '12', '2', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1340', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('157', '10', '7', '263', 'Dobre Skórzane Buty', '', 'Buty', 'przedmiot/but/4.gif', '20', '0', '0', '0', '0', '0', '0', '0', '0', '0', '13', '18', '18', '0', '0', '0', '0', '0', '0', '0', '13', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1149', '0', '0', '0', '0', '0', '', '0', '0', '0');
INSERT INTO `przedmiot_sklep` VALUES ('158', '25', '7', '7', 'Smoczy Talizman I', 'upgraded', 'Talizman', 'przedmiot/tal/1.gif', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '3', '0', '0', '0', '0', '0', '0', '0', '0', '0', '3', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0', '3');
INSERT INTO `przedmiot_sklep` VALUES ('159', '25', '39', '7', 'Smoczy Talizman II', 'upgraded', 'Talizman', 'przedmiot/tal/1.gif', '10', '0', '0', '0', '0', '0', '0', '0', '0', '0', '15', '0', '0', '0', '0', '0', '0', '0', '0', '0', '15', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0', '10');
INSERT INTO `przedmiot_sklep` VALUES ('160', '25', '71', '7', 'Smoczy Talizman II', 'upgraded', 'Talizman', 'przedmiot/tal/1.gif', '20', '0', '0', '0', '0', '0', '0', '0', '0', '0', '40', '0', '0', '0', '0', '0', '0', '0', '0', '0', '40', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0', '20');
INSERT INTO `przedmiot_sklep` VALUES ('161', '26', '7', '7', 'Korbacz Żywiołów', 'unique', 'BronJednoreczna', 'przedmiot/lhand/zywiol1.gif', '25', '0', '0', '1', '0', '0', '0', '0', '0', '0', '21', '0', '0', '127', '142', '100', '1', '0', '0', '0', '14', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0', '10');
INSERT INTO `przedmiot_sklep` VALUES ('162', '26', '39', '7', 'Łuk Żywiołów', 'unique', 'BronDystansowa', 'przedmiot/luk/zywiol1.gif', '25', '0', '0', '0', '1', '1', '0', '0', '0', '0', '14', '0', '0', '94', '115', '120', '2', '17', '17', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '20', '0', '10', '69', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0', '10');
INSERT INTO `przedmiot_sklep` VALUES ('163', '26', '71', '7', 'Miecz Żywiołów', 'unique', 'BronPoltorareczna', 'przedmiot/lhand/zywiol2.gif', '25', '1', '1', '0', '0', '0', '0', '0', '0', '0', '21', '0', '0', '129', '158', '150', '1', '29', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', '0', '0', '10');
INSERT INTO `przedmiot_sklep` VALUES ('164', '26', '103', '7', 'Różdżka Żywiołów', 'unique', 'Rozdzka', 'przedmiot/roz/zywiol1.gif', '25', '0', '0', '0', '0', '0', '1', '0', '0', '226', '14', '0', '0', '0', '0', '120', '3', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '217', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '27', '0', '0', '', '0', '0', '10');

-- ----------------------------
-- Table structure for `przyjaciele`
-- ----------------------------
DROP TABLE IF EXISTS `przyjaciele`;
CREATE TABLE `przyjaciele` (
  `postac` int(11) NOT NULL DEFAULT '0',
  `przyjaciel` int(11) NOT NULL DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci;

-- ----------------------------
-- Records of przyjaciele
-- ----------------------------

-- ----------------------------
-- Table structure for `system`
-- ----------------------------
DROP TABLE IF EXISTS `system`;
CREATE TABLE `system` (
  `funkcja` varchar(100) COLLATE utf8_polish_ci NOT NULL,
  `czas` double(20,0) NOT NULL DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci;

-- ----------------------------
-- Records of system
-- ----------------------------
INSERT INTO `system` VALUES ('czysc_czat', '1458372804');

-- ----------------------------
-- Table structure for `umiejetnosci`
-- ----------------------------
DROP TABLE IF EXISTS `umiejetnosci`;
CREATE TABLE `umiejetnosci` (
  `postac_id` int(11) NOT NULL DEFAULT '0',
  `u1` smallint(2) NOT NULL DEFAULT '0',
  `u2` smallint(2) NOT NULL DEFAULT '0',
  `u3` smallint(2) NOT NULL DEFAULT '0',
  `u4` smallint(2) NOT NULL DEFAULT '0',
  `u5` smallint(2) NOT NULL DEFAULT '0',
  `u6` smallint(2) NOT NULL DEFAULT '0',
  `u7` smallint(2) NOT NULL DEFAULT '0',
  `u8` smallint(2) NOT NULL DEFAULT '0',
  `u9` smallint(2) NOT NULL DEFAULT '0',
  `u10` smallint(2) NOT NULL DEFAULT '0',
  `u11` smallint(2) NOT NULL DEFAULT '0',
  `u12` smallint(2) NOT NULL DEFAULT '0',
  `u13` smallint(2) NOT NULL DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci;

-- ----------------------------
-- Records of umiejetnosci
-- ----------------------------
INSERT INTO `umiejetnosci` VALUES ('1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `umiejetnosci` VALUES ('0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0');
INSERT INTO `umiejetnosci` VALUES ('0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0');

-- ----------------------------
-- Table structure for `zapro_grupa`
-- ----------------------------
DROP TABLE IF EXISTS `zapro_grupa`;
CREATE TABLE `zapro_grupa` (
  `grupa` int(11) NOT NULL DEFAULT '0',
  `postac_id` int(11) NOT NULL DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci;

-- ----------------------------
-- Records of zapro_grupa
-- ----------------------------

-- ----------------------------
-- Table structure for `zapro_przyjaciel`
-- ----------------------------
DROP TABLE IF EXISTS `zapro_przyjaciel`;
CREATE TABLE `zapro_przyjaciel` (
  `postac_id` int(11) NOT NULL DEFAULT '0',
  `postac2_id` int(11) NOT NULL DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci;

-- ----------------------------
-- Records of zapro_przyjaciel
-- ----------------------------
