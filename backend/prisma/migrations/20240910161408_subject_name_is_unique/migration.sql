/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `subjects` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `name` ON `subjects`(`name`);
