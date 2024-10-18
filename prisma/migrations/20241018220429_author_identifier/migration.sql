/*
  Warnings:

  - You are about to drop the column `author` on the `messages` table. All the data in the column will be lost.
  - Added the required column `authorName` to the `messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorNumber` to the `messages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `messages` DROP COLUMN `author`,
    ADD COLUMN `authorName` TEXT NOT NULL,
    ADD COLUMN `authorNumber` TEXT NOT NULL;
