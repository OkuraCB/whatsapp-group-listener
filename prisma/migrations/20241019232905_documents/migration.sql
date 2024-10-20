-- AlterTable
ALTER TABLE `videos` MODIFY `duration` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `documents` (
    `id` VARCHAR(191) NOT NULL,
    `create_time` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `authorNumber` TEXT NOT NULL,
    `authorName` TEXT NOT NULL,
    `deviceType` TEXT NOT NULL,
    `size` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `hasQuoteMsg` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
