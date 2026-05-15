package org.ieee.hrintranet.controller;

import org.ieee.hrintranet.entity.Employee;
import org.ieee.hrintranet.entity.WorkAnniversaryDisplay;
import org.ieee.hrintranet.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Public Work Anniversaries API
 * Provides work anniversary data without authentication requirement
 */
@RestController
@RequestMapping("/public/work-anniversaries")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PublicWorkAnniversaryController {
    
    private final EmployeeRepository employeeRepository;
    
    /**
     * Calculate work anniversaries for all active employees
     * Returns WorkAnniversaryDisplay objects with calculated anniversary data
     * Does NOT persist - just returns calculated data
     */
    private List<WorkAnniversaryDisplay> calculateAnniversariesForDisplay() {
        LocalDate today = LocalDate.now();
        List<WorkAnniversaryDisplay> calculatedAnniversaries = new java.util.ArrayList<>();
        
        // Get all active employees (guard against null status)
        List<Employee> allActiveEmployees = employeeRepository.findAll().stream()
            .filter(emp -> emp.getStatus() != null && emp.getStatus() == Employee.EmployeeStatus.ACTIVE)
            .collect(Collectors.toList());
        
        // Calculate experience for each employee
        for (Employee emp : allActiveEmployees) {
            LocalDate startDate = emp.getStartDate();
            if (startDate == null || startDate.isAfter(today)) continue;

            LocalDate anniversaryDate = safeAnniversaryDate(startDate, today.getYear());
            int yearsOfService = calculateAnniversaryYears(startDate, today);
            int monthsOfExperience = calculateDisplayMonths(startDate, today, yearsOfService);

            WorkAnniversaryDisplay displayEntity = new WorkAnniversaryDisplay(
                emp.getId(),
                emp.getFullName(),
                emp.getDepartment(),
                emp.getPosition(),
                startDate,
                anniversaryDate,
                yearsOfService
            );
            displayEntity.setProfileImageUrl(buildProfileImageUrl(emp));
            displayEntity.setMonthsOfExperience(monthsOfExperience);
            displayEntity.setExperienceLabel(buildExperienceLabel(yearsOfService, monthsOfExperience));

            calculatedAnniversaries.add(displayEntity);
        }
        
        return calculatedAnniversaries;
    }

    private String buildExperienceLabel(int yearsOfService, int monthsOfExperience) {
        if (yearsOfService >= 1) {
            return yearsOfService + " " + (yearsOfService == 1 ? "Year" : "Years");
        }
        return monthsOfExperience + " " + (monthsOfExperience == 1 ? "Month" : "Months");
    }

    private LocalDate safeAnniversaryDate(LocalDate startDate, int year) {
        int month = startDate.getMonthValue();
        int day = startDate.getDayOfMonth();
        int maxDay = java.time.Month.of(month).length(java.time.Year.isLeap(year));
        int safeDay = Math.min(day, maxDay);
        return LocalDate.of(year, month, safeDay);
    }

    private int calculateAnniversaryYears(LocalDate startDate, LocalDate today) {
        return Math.max(0, today.getYear() - startDate.getYear());
    }

    private int calculateDisplayMonths(LocalDate startDate, LocalDate today, int yearsOfService) {
        if (yearsOfService >= 1) {
            return 0;
        }
        return Math.max(0, (int) ChronoUnit.MONTHS.between(startDate, today));
    }

    private LocalDate resolveCompletedExperienceDate(LocalDate startDate, LocalDate today, int yearsOfService, int totalMonths) {
        if (yearsOfService < 1) {
            return startDate.plusMonths(totalMonths);
        }

        LocalDate anniversaryThisYear = safeAnniversaryDate(startDate, today.getYear());
        if (anniversaryThisYear.isAfter(today)) {
            return safeAnniversaryDate(startDate, today.getYear() - 1);
        }

        return anniversaryThisYear;
    }

    /**
     * Get all work anniversaries for ACTIVE employees only.
     * Returns anniversary date in the current year for proper "This Month" filtering.
     * Used by admin views that need to show active employees with current-year anniversary dates.
     */
    @GetMapping("/all-employees")
    public ResponseEntity<List<WorkAnniversaryDisplay>> getAllEmployeeAnniversaries() {
        LocalDate today = LocalDate.now();
        List<WorkAnniversaryDisplay> calculatedAnniversaries = new java.util.ArrayList<>();

        List<Employee> allEmployees = employeeRepository.findAll();
        
        // Filter for ACTIVE employees only
        List<Employee> activeEmployees = allEmployees.stream()
            .filter(emp -> emp.getStatus() != null && emp.getStatus() == Employee.EmployeeStatus.ACTIVE)
            .collect(Collectors.toList());

        for (Employee emp : activeEmployees) {
            LocalDate startDate = emp.getStartDate();
            if (startDate == null || startDate.isAfter(today)) continue;

            int yearsOfService = calculateAnniversaryYears(startDate, today);
            int monthsOfExperience = calculateDisplayMonths(startDate, today, yearsOfService);

            // Use current year anniversary date for proper month filtering
            // This matches the home page behavior and enables "This Month" filtering to work correctly
            LocalDate anniversaryDate = safeAnniversaryDate(startDate, today.getYear());

            WorkAnniversaryDisplay displayEntity = new WorkAnniversaryDisplay(
                emp.getId(),
                emp.getFullName(),
                emp.getDepartment(),
                emp.getPosition(),
                startDate,
                anniversaryDate,
                yearsOfService
            );
            displayEntity.setProfileImageUrl(buildProfileImageUrl(emp));
            displayEntity.setEmployeeStatus(emp.getStatus() != null ? emp.getStatus().name() : null);
            displayEntity.setMonthsOfExperience(monthsOfExperience);
            displayEntity.setExperienceLabel(buildExperienceLabel(yearsOfService, monthsOfExperience));

            calculatedAnniversaries.add(displayEntity);
        }

        calculatedAnniversaries.sort((a1, a2) -> {
            return a1.getEmployeeName().compareToIgnoreCase(a2.getEmployeeName());
        });

        return ResponseEntity.ok(calculatedAnniversaries);
    }
    
    /**
     * Get all work anniversaries
     */
    @GetMapping("/all")
    public ResponseEntity<List<WorkAnniversaryDisplay>> getAllAnniversaries() {
        List<WorkAnniversaryDisplay> anniversaries = calculateAnniversariesForDisplay();
        anniversaries.sort((a1, a2) -> a1.getEmployeeName().compareToIgnoreCase(a2.getEmployeeName()));
        
        return ResponseEntity.ok(anniversaries);
    }
    
    /**
     * Get work anniversaries for current month
     */
    @GetMapping("/current-month")
    public ResponseEntity<List<WorkAnniversaryDisplay>> getCurrentMonth() {
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate endOfMonth = today.withDayOfMonth(today.lengthOfMonth());
        
        List<WorkAnniversaryDisplay> anniversaries = calculateAnniversariesForDisplay();
        
        List<WorkAnniversaryDisplay> currentMonth = anniversaries.stream()
                .filter(wa -> !wa.getAnniversaryDate().isBefore(startOfMonth) && !wa.getAnniversaryDate().isAfter(endOfMonth))
            .sorted((a1, a2) -> a1.getEmployeeName().compareToIgnoreCase(a2.getEmployeeName()))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(currentMonth);
    }
    
    /**
     * Get work anniversaries grouped by years of experience
     */
    @GetMapping("/by-year")
    public ResponseEntity<Map<Integer, List<WorkAnniversaryDisplay>>> getByYear() {
        List<WorkAnniversaryDisplay> anniversaries = calculateAnniversariesForDisplay();
        
        Map<Integer, List<WorkAnniversaryDisplay>> groupedByYear = new java.util.TreeMap<>((a, b) -> b.compareTo(a));
        
        for (WorkAnniversaryDisplay entity : anniversaries) {
            Integer year = entity.getYearsOfExperience();
            groupedByYear.computeIfAbsent(year, k -> new java.util.ArrayList<>()).add(entity);
        }
        
        groupedByYear.forEach((year, list) -> 
            list.sort((a, b) -> a.getEmployeeName().compareTo(b.getEmployeeName()))
        );
        
        return ResponseEntity.ok(groupedByYear);
    }

    private String buildProfileImageUrl(Employee emp) {
        if (emp.getProfileImage() == null) {
            return "";
        }

        String filePath = emp.getProfileImage().getFilePath();
        if (filePath != null && filePath.startsWith("http")) {
            return filePath;
        }

        String filename = emp.getProfileImage().getFilename();
        if (filename == null || filename.isBlank()) {
            return "";
        }

        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/uploads/")
                .path(filename)
                .toUriString();
    }
}
