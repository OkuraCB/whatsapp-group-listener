/*
  Warnings:

  - Made the column `body` on table `messages` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `stickerSize` to the `stickers` table without a default value. This is not possible if the table is not empty.
  - Made the column `mediaKey` on table `stickers` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `messages` MODIFY `body` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `stickers` ADD COLUMN `stickerSize` VARCHAR(191) NOT NULL,
    MODIFY `mediaKey` VARCHAR(191) NOT NULL;
