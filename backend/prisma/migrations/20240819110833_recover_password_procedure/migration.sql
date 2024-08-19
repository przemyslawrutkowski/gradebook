/*
  Warnings:

  - A unique constraint covering the columns `[reset_password_token]` on the table `administrators` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reset_password_token]` on the table `parents` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reset_password_token]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reset_password_token]` on the table `teachers` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `administrators` ADD COLUMN `reset_password_expires` TIMESTAMP(0) NULL,
    ADD COLUMN `reset_password_token` VARCHAR(256) NULL;

-- AlterTable
ALTER TABLE `parents` ADD COLUMN `reset_password_expires` TIMESTAMP(0) NULL,
    ADD COLUMN `reset_password_token` VARCHAR(256) NULL;

-- AlterTable
ALTER TABLE `students` ADD COLUMN `reset_password_expires` TIMESTAMP(0) NULL,
    ADD COLUMN `reset_password_token` VARCHAR(256) NULL;

-- AlterTable
ALTER TABLE `teachers` ADD COLUMN `reset_password_expires` TIMESTAMP(0) NULL,
    ADD COLUMN `reset_password_token` VARCHAR(256) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `reset_password_token` ON `administrators`(`reset_password_token`);

-- CreateIndex
CREATE UNIQUE INDEX `reset_password_token` ON `parents`(`reset_password_token`);

-- CreateIndex
CREATE UNIQUE INDEX `reset_password_token` ON `students`(`reset_password_token`);

-- CreateIndex
CREATE UNIQUE INDEX `reset_password_token` ON `teachers`(`reset_password_token`);
