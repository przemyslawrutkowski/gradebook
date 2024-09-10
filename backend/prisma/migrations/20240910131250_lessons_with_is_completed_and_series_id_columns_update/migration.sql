/*
  Warnings:

  - You are about to alter the column `was_present` on the `attendances` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `Bit(1)`.
  - You are about to alter the column `was_read` on the `messages` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `Bit(1)`.
  - Added the required column `series_id` to the `lessons` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `attendances` MODIFY `was_present` BIT(1) NOT NULL DEFAULT b'0';

-- AlterTable
ALTER TABLE `lessons` ADD COLUMN `is_completed` BIT(1) NOT NULL DEFAULT b'0',
    ADD COLUMN `series_id` VARCHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE `messages` MODIFY `was_read` BIT(1) NOT NULL DEFAULT b'0';
