/*
  Warnings:

  - You are about to drop the column `date_time` on the `lessons` table. All the data in the column will be lost.
  - Added the required column `date` to the `lessons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_time` to the `lessons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `lessons` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `lessons` DROP COLUMN `date_time`,
    ADD COLUMN `date` DATE NOT NULL,
    ADD COLUMN `end_time` TIME(0) NOT NULL,
    ADD COLUMN `start_time` TIME(0) NOT NULL;
