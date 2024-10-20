-- CreateTable
CREATE TABLE `revokeds` (
    `id` VARCHAR(191) NOT NULL,
    `create_time` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `authorNumber` TEXT NOT NULL,
    `authorName` TEXT NOT NULL,
    `deviceType` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
