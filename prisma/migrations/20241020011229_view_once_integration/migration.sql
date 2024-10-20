/*
  Warnings:

  - You are about to drop the `view_once` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `isViewOnce` to the `images` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isViewOnce` to the `videos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isViewOnce` to the `voices` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `images` ADD COLUMN `isViewOnce` BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE `videos` ADD COLUMN `isViewOnce` BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE `voices` ADD COLUMN `isViewOnce` BOOLEAN NOT NULL;

-- DropTable
DROP TABLE `view_once`;
