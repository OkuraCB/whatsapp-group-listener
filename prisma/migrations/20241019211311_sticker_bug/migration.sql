/*
  Warnings:

  - You are about to alter the column `stickerSize` on the `stickers` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `stickers` MODIFY `stickerSize` INTEGER NOT NULL;
