/*
  Warnings:

  - A unique constraint covering the columns `[resetToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `course` ADD COLUMN `themeColor` VARCHAR(191) NULL DEFAULT '#10b981';

-- AlterTable
ALTER TABLE `user` ADD COLUMN `maxDevices` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `resetToken` VARCHAR(191) NULL,
    ADD COLUMN `resetTokenExpiry` DATETIME(3) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_resetToken_key` ON `User`(`resetToken`);
