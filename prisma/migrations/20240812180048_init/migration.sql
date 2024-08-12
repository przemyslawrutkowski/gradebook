-- CreateTable
CREATE TABLE `attendances` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date_time` TIMESTAMP(0) NOT NULL DEFAULT (now()),
    `was_present` BOOLEAN NOT NULL,
    `student_id` INTEGER NOT NULL,
    `lesson_id` INTEGER NOT NULL,

    INDEX `lesson_id`(`lesson_id`),
    INDEX `student_id`(`student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `badges` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `category_id` INTEGER NOT NULL,

    INDEX `category_id`(`category_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `badges_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `badges_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date_awarder` TIMESTAMP(0) NOT NULL DEFAULT (now()),
    `student_id` INTEGER NOT NULL,
    `badge_id` INTEGER NOT NULL,

    INDEX `badge_id`(`badge_id`),
    INDEX `student_id`(`student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `classes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `yearbook` YEAR NOT NULL,
    `teacher_id` INTEGER NULL,

    INDEX `teacher_id`(`teacher_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_types` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `grades_gradebook` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(255) NOT NULL,
    `grade` TINYINT NOT NULL,
    `date_given` TIMESTAMP(0) NOT NULL DEFAULT (now()),
    `student_id` INTEGER NOT NULL,
    `subject_id` INTEGER NOT NULL,
    `teacher_id` INTEGER NOT NULL,

    INDEX `student_id`(`student_id`),
    INDEX `subject_id`(`subject_id`),
    INDEX `teacher_id`(`teacher_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `homeworks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(255) NOT NULL,
    `deadline` TIMESTAMP(0) NOT NULL,
    `lesson_id` INTEGER NOT NULL,
    `teacher_id` INTEGER NOT NULL,

    INDEX `lesson_id`(`lesson_id`),
    INDEX `teacher_id`(`teacher_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lessons` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(255) NOT NULL,
    `date_time` TIMESTAMP(0) NOT NULL,
    `teacher_id` INTEGER NOT NULL,
    `class_id` INTEGER NOT NULL,
    `subject_id` INTEGER NOT NULL,

    INDEX `class_id`(`class_id`),
    INDEX `subject_id`(`subject_id`),
    INDEX `teacher_id`(`teacher_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `subject` VARCHAR(255) NOT NULL,
    `content` VARCHAR(255) NOT NULL,
    `date_time` TIMESTAMP(0) NOT NULL DEFAULT (now()),
    `was_read` BOOLEAN NOT NULL DEFAULT false,
    `sender_id` INTEGER NOT NULL,
    `sender_type_id` INTEGER NOT NULL,
    `receiver_id` INTEGER NOT NULL,
    `receiver_type_id` INTEGER NOT NULL,

    INDEX `receiver_type_id`(`receiver_type_id`),
    INDEX `sender_type_id`(`sender_type_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `parents` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pesel` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone_number` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(255) NOT NULL,
    `last_name` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `pesel`(`pesel`),
    UNIQUE INDEX `email`(`email`),
    UNIQUE INDEX `phone_number`(`phone_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `problem_types` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `problems_gradebook` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(255) NOT NULL,
    `reported_time` TIMESTAMP(0) NOT NULL DEFAULT (now()),
    `problem_type_id` INTEGER NOT NULL,
    `reporter_id` INTEGER NOT NULL,
    `user_type_id` INTEGER NOT NULL,
    `status_id` INTEGER NOT NULL,

    INDEX `problem_type_id`(`problem_type_id`),
    INDEX `status_id`(`status_id`),
    INDEX `user_type_id`(`user_type_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `problems_history_gradebook` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `change_description` VARCHAR(255) NOT NULL,
    `change_time` TIMESTAMP(0) NOT NULL DEFAULT (now()),
    `problem_id` INTEGER NOT NULL,
    `status_id` INTEGER NOT NULL,

    INDEX `problem_id`(`problem_id`),
    INDEX `status_id`(`status_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `school_events` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `start_time` TIMESTAMP(0) NOT NULL,
    `end_time` TIMESTAMP(0) NOT NULL,
    `event_type_id` INTEGER NOT NULL,

    INDEX `event_type_id`(`event_type_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `statuses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `students` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pesel` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone_number` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(255) NOT NULL,
    `last_name` VARCHAR(255) NOT NULL,
    `class_id` INTEGER NULL,

    UNIQUE INDEX `pesel`(`pesel`),
    UNIQUE INDEX `email`(`email`),
    UNIQUE INDEX `phone_number`(`phone_number`),
    INDEX `class_id`(`class_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `students_parents` (
    `student_id` INTEGER NOT NULL,
    `parent_id` INTEGER NOT NULL,

    INDEX `parent_id`(`parent_id`),
    PRIMARY KEY (`student_id`, `parent_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subjects` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `surveys` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `start_time` TIMESTAMP(0) NOT NULL,
    `end_time` TIMESTAMP(0) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `surveys_possible_responses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `response` VARCHAR(255) NOT NULL,
    `question_id` INTEGER NOT NULL,

    INDEX `question_id`(`question_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `surveys_questions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `question` VARCHAR(255) NOT NULL,
    `survey_id` INTEGER NOT NULL,
    `question_type_id` INTEGER NOT NULL,

    INDEX `question_type_id`(`question_type_id`),
    INDEX `survey_id`(`survey_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `surveys_questions_types` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `surveys_responses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `response` VARCHAR(255) NOT NULL,
    `student_id` INTEGER NOT NULL,
    `question_id` INTEGER NOT NULL,

    INDEX `question_id`(`question_id`),
    INDEX `student_id`(`student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teachers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pesel` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone_number` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(255) NOT NULL,
    `last_name` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `pesel`(`pesel`),
    UNIQUE INDEX `email`(`email`),
    UNIQUE INDEX `phone_number`(`phone_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teachers_subjects` (
    `teacher_id` INTEGER NOT NULL,
    `subject_id` INTEGER NOT NULL,

    INDEX `subject_id`(`subject_id`),
    PRIMARY KEY (`teacher_id`, `subject_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `updates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(255) NOT NULL,
    `version` VARCHAR(255) NOT NULL,
    `release_time` TIMESTAMP(0) NOT NULL DEFAULT (now()),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users_types` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `attendances` ADD CONSTRAINT `attendances_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `attendances` ADD CONSTRAINT `attendances_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `badges` ADD CONSTRAINT `badges_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `badges_categories`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `badges_history` ADD CONSTRAINT `badges_history_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `badges_history` ADD CONSTRAINT `badges_history_ibfk_2` FOREIGN KEY (`badge_id`) REFERENCES `badges`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `classes` ADD CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `grades_gradebook` ADD CONSTRAINT `grades_gradebook_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `grades_gradebook` ADD CONSTRAINT `grades_gradebook_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `grades_gradebook` ADD CONSTRAINT `grades_gradebook_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `homeworks` ADD CONSTRAINT `homeworks_ibfk_1` FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `homeworks` ADD CONSTRAINT `homeworks_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `lessons` ADD CONSTRAINT `lessons_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `lessons` ADD CONSTRAINT `lessons_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `lessons` ADD CONSTRAINT `lessons_ibfk_3` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_type_id`) REFERENCES `users_types`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_type_id`) REFERENCES `users_types`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `problems_gradebook` ADD CONSTRAINT `problems_gradebook_ibfk_1` FOREIGN KEY (`problem_type_id`) REFERENCES `problem_types`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `problems_gradebook` ADD CONSTRAINT `problems_gradebook_ibfk_2` FOREIGN KEY (`user_type_id`) REFERENCES `users_types`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `problems_gradebook` ADD CONSTRAINT `problems_gradebook_ibfk_3` FOREIGN KEY (`status_id`) REFERENCES `statuses`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `problems_history_gradebook` ADD CONSTRAINT `problems_history_gradebook_ibfk_1` FOREIGN KEY (`problem_id`) REFERENCES `problems_gradebook`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `problems_history_gradebook` ADD CONSTRAINT `problems_history_gradebook_ibfk_2` FOREIGN KEY (`status_id`) REFERENCES `statuses`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `school_events` ADD CONSTRAINT `school_events_ibfk_1` FOREIGN KEY (`event_type_id`) REFERENCES `event_types`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `students_parents` ADD CONSTRAINT `students_parents_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `students_parents` ADD CONSTRAINT `students_parents_ibfk_2` FOREIGN KEY (`parent_id`) REFERENCES `parents`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `surveys_possible_responses` ADD CONSTRAINT `surveys_possible_responses_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `surveys_questions`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `surveys_questions` ADD CONSTRAINT `surveys_questions_ibfk_1` FOREIGN KEY (`survey_id`) REFERENCES `surveys`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `surveys_questions` ADD CONSTRAINT `surveys_questions_ibfk_2` FOREIGN KEY (`question_type_id`) REFERENCES `surveys_questions_types`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `surveys_responses` ADD CONSTRAINT `surveys_responses_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `surveys_responses` ADD CONSTRAINT `surveys_responses_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `surveys_questions`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `teachers_subjects` ADD CONSTRAINT `teachers_subjects_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `teachers_subjects` ADD CONSTRAINT `teachers_subjects_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
