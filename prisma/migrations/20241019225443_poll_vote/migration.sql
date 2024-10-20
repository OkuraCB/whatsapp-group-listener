/*
  Warnings:

  - You are about to drop the column `name` on the `PollVote` table. All the data in the column will be lost.
  - You are about to drop the column `number` on the `PollVote` table. All the data in the column will be lost.
  - Added the required column `voterNumber` to the `PollVote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `PollVote` DROP COLUMN `name`,
    DROP COLUMN `number`,
    ADD COLUMN `voterNumber` VARCHAR(191) NOT NULL;
