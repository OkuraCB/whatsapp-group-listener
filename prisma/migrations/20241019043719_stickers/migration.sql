/*
  Warnings:

  - You are about to drop the column `type` on the `messages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `messages` DROP COLUMN `type`;

-- CreateTable
CREATE TABLE `stickers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `create_time` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `authorNumber` TEXT NOT NULL,
    `authorName` TEXT NOT NULL,
    `deviceType` TEXT NOT NULL,
    `mediaKey` VARCHAR(191) NULL,
    `hasQuoteMsg` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
