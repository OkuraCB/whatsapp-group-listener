/*
  Warnings:

  - You are about to drop the column `create_time` on the `revokeds` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `revokeds` DROP COLUMN `create_time`,
    ADD COLUMN `delete_time` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- CreateTable
CREATE TABLE `view_once` (
    `id` VARCHAR(191) NOT NULL,
    `create_time` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `authorNumber` TEXT NOT NULL,
    `authorName` TEXT NOT NULL,
    `deviceType` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
