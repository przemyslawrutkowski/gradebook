/*
  Warnings:

  - You are about to alter the column `series_id` on the `lessons` table. The data in that column could be lost. The data in that column will be cast from `VarChar(36)` to `Int`.

*/
-- DropForeignKey
ALTER TABLE `lessons` DROP FOREIGN KEY `lessons_ibfk_1`;

-- DropForeignKey
ALTER TABLE `lessons` DROP FOREIGN KEY `lessons_ibfk_2`;

-- DropForeignKey
ALTER TABLE `lessons` DROP FOREIGN KEY `lessons_ibfk_3`;

-- AlterTable
ALTER TABLE `lessons` MODIFY `series_id` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `lessons_series` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(255) NOT NULL,
    `date_time` TIMESTAMP(0) NOT NULL DEFAULT (now()),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `series_id` ON `lessons`(`series_id`);

-- AddForeignKey
ALTER TABLE `lessons` ADD CONSTRAINT `lessons_ibfk_1` FOREIGN KEY (`series_id`) REFERENCES `lessons_series`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `lessons` ADD CONSTRAINT `lessons_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `lessons` ADD CONSTRAINT `lessons_ibfk_3` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `lessons` ADD CONSTRAINT `lessons_ibfk_4` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
