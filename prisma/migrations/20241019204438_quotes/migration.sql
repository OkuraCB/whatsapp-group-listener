/*
  Warnings:

  - You are about to drop the `messages` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `stickers` MODIFY `id` INTEGER NOT NULL;

-- DropTable
DROP TABLE `messages`;

-- CreateTable
CREATE TABLE `quotes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `messageQuotting` VARCHAR(191) NOT NULL,
    `messageQuotted` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `texts` (
    `id` VARCHAR(191) NOT NULL,
    `create_time` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `authorNumber` TEXT NOT NULL,
    `authorName` TEXT NOT NULL,
    `deviceType` TEXT NOT NULL,
    `body` VARCHAR(191) NOT NULL,
    `hasMedia` BOOLEAN NOT NULL,
    `hasQuoteMsg` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
