/*
  Warnings:

  - You are about to drop the `adminstrators` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `adminstrators`;

-- CreateTable
CREATE TABLE `administrators` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pesel` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone_number` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(255) NOT NULL,
    `last_name` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `pesel`(`pesel`),
    UNIQUE INDEX `email`(`email`),
    UNIQUE INDEX `phone_number`(`phone_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
