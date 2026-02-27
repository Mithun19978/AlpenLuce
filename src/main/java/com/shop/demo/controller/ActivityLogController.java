package com.shop.demo.controller;

import com.shop.demo.database.entity.project.ActivityLogEntity;
import com.shop.demo.service.activitylog.ActivityLogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping(value = "/server/admin/activity-logs", produces = MediaType.APPLICATION_JSON_VALUE)
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    public ActivityLogController(ActivityLogService activityLogService) {
        this.activityLogService = activityLogService;
    }

    @GetMapping
    public ResponseEntity<Page<ActivityLogEntity>> getLogs(
            @RequestParam(required = false) Integer roleMask,
            @RequestParam(required = false) String eventType,
            @RequestParam(required = false)
                @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false)
                @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "50") int size) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(activityLogService.getLogs(roleMask, eventType, from, to, pageable));
    }

    @GetMapping("/staff")
    public ResponseEntity<Page<ActivityLogEntity>> getStaffLogs(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "50") int size) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(activityLogService.getStaffLogs(pageable));
    }
}
