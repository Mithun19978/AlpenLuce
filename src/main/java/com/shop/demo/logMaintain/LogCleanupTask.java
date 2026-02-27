package com.shop.demo.logMaintain;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Component
public class LogCleanupTask {
    private final String logBackupDir;

    public LogCleanupTask(@Value("${logging.file.path:D:/PERSONAL/BillingApplication/logs}/logsBackUp") String logBackupDir) {
        this.logBackupDir = logBackupDir;
    }

    @Scheduled(cron = "0 0 1 * * ?") // Runs daily at 1 AM
    public void cleanOldLogs() {
        try {
            Path logsBackUpDir = Paths.get(logBackupDir);
            if (!Files.exists(logsBackUpDir)) {
                return;
            }
            LocalDate threshold = LocalDate.now().minusDays(30);
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            Files.walk(logsBackUpDir, 1)
                 .filter(Files::isDirectory)
                 .forEach(dir -> {
                     try {
                         String dirName = dir.getFileName().toString();
                         LocalDate dirDate = LocalDate.parse(dirName, formatter);
                         if (dirDate.isBefore(threshold)) {
                             deleteDirectory(dir.toFile());
                         }
                     } catch (Exception e) {
                         System.err.println("Failed to process directory " + dir + ": " + e.getMessage());
                     }
                 });
        } catch (Exception e) {
            System.err.println("Log cleanup failed: " + e.getMessage());
        }
    }

    private void deleteDirectory(File dir) {
        if (dir.isDirectory()) {
            File[] files = dir.listFiles();
            if (files != null) {
                for (File file : files) {
                    deleteDirectory(file);
                }
            }
        }
        dir.delete();
    }
}