/*
  Warnings:

  - You are about to drop the `PollOption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PollVote` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `PollOption` DROP FOREIGN KEY `fk_polls_polloptions`;

-- DropForeignKey
ALTER TABLE `PollVote` DROP FOREIGN KEY `fk_polls_pollvotes`;

-- DropTable
DROP TABLE `PollOption`;

-- DropTable
DROP TABLE `PollVote`;

-- CreateTable
CREATE TABLE `poll_options` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pollId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `poll_votes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pollId` VARCHAR(191) NOT NULL,
    `voteTitle` VARCHAR(191) NOT NULL,
    `voterNumber` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `images` (
    `id` VARCHAR(191) NOT NULL,
    `create_time` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `authorNumber` TEXT NOT NULL,
    `authorName` TEXT NOT NULL,
    `deviceType` TEXT NOT NULL,
    `size` INTEGER NOT NULL,
    `hasQuoteMsg` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `poll_options` ADD CONSTRAINT `fk_polls_polloptions` FOREIGN KEY (`pollId`) REFERENCES `polls`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `poll_votes` ADD CONSTRAINT `fk_polls_pollvotes` FOREIGN KEY (`pollId`) REFERENCES `polls`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
