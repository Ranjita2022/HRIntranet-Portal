package org.ieee.hrintranet.controller;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.ieee.hrintranet.entity.Employee;
import org.ieee.hrintranet.entity.WorkAnniversaryDisplay;
import org.ieee.hrintranet.repository.EmployeeRepository;
import org.ieee.hrintranet.repository.WorkAnniversaryDisplayRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

/**
 * Work Anniversary Management Controller for Admin Dashboard
 * Calculates and manages work anniversaries based on employee start dates
 */
@RestController
@RequestMapping("/admin/work-anniversaries")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WorkAnniversaryController {
    
    private final WorkAnniversaryDisplayRepository workAnniversaryDisplayRepository;
    private final EmployeeRepository employeeRepository;
    
    /**
     * Calculate work anniversaries for all employees
     * Returns WorkAnniversaryDisplay entity objects with calculated anniversary data
     */
    private List<WorkAnniversaryDisplay> calculateAnniversariesForDisplay() {
        LocalDate today = LocalDate.now();
        List<WorkAnniversaryDisplay> calculatedAnniversaries = new java.util.ArrayList<>();
        
        // Clear existing display data and recalculate
        workAnniversaryDisplayRepository.deleteAll();
        
        // Get all employees, including active, inactive, and terminated records
        List<Employee> allEmployees = employeeRepository.findAll().stream()
            .collect(Collectors.toList());
        
        // Calculate and save experience rows for each employee
        for (Employee emp : allEmployees) {
            LocalDate startDate = emp.getStartDate();
            if (startDate == null || startDate.isAfter(today)) continue;
            
            int totalMonths = (int) ChronoUnit.MONTHS.between(startDate, today);
            int yearsOfService = totalMonths / 12;
            int monthsOfExperience = totalMonths % 12;

            LocalDate experienceDate = resolveCompletedExperienceDate(startDate, today, yearsOfService, totalMonths);

            // Create and save entity
            WorkAnniversaryDisplay displayEntity = new WorkAnniversaryDisplay(
                emp.getId(),
                emp.getFullName(),
                emp.getDepartment(),
                emp.getPosition(),
                startDate,
                experienceDate,
                yearsOfService
            );
            displayEntity.setEmployeeStatus(emp.getStatus() != null ? emp.getStatus().name() : null);
            displayEntity.setMonthsOfExperience(monthsOfExperience);
            displayEntity.setExperienceLabel(buildExperienceLabel(yearsOfService, monthsOfExperience));

            WorkAnniversaryDisplay savedEntity = workAnniversaryDisplayRepository.save(displayEntity);
            calculatedAnniversaries.add(savedEntity);
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
     * Get all work anniversaries (PUBLIC - no authentication required)
     * Returns calculated anniversary data
     */
    @GetMapping("/public/all")
    @CrossOrigin(origins = "*")
    public ResponseEntity<List<WorkAnniversaryDisplay>> getPublicAnniversaries() {
        List<WorkAnniversaryDisplay> anniversaries = calculateAnniversariesForDisplay();
        
        // Sort by years of experience (descending) then by name
        anniversaries.sort((a1, a2) -> {
            int yearComp = a2.getYearsOfExperience().compareTo(a1.getYearsOfExperience());
            if (yearComp != 0) return yearComp;
            return a1.getEmployeeName().compareTo(a2.getEmployeeName());
        });
        
        return ResponseEntity.ok(anniversaries);
    }
    
    /**
     * Get work anniversaries for current month (PUBLIC - no authentication required)
     */
    @GetMapping("/public/current-month")
    @CrossOrigin(origins = "*")
    public ResponseEntity<List<WorkAnniversaryDisplay>> getPublicCurrentMonth() {
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate endOfMonth = today.withDayOfMonth(today.lengthOfMonth());
        
        List<WorkAnniversaryDisplay> anniversaries = calculateAnniversariesForDisplay();
        
        List<WorkAnniversaryDisplay> currentMonth = anniversaries.stream()
                .filter(wa -> !wa.getAnniversaryDate().isBefore(startOfMonth) && !wa.getAnniversaryDate().isAfter(endOfMonth))
                .sorted((a1, a2) -> a1.getAnniversaryDate().compareTo(a2.getAnniversaryDate()))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(currentMonth);
    }
    
    /**
     * Get work anniversaries grouped by years (PUBLIC - no authentication required)
     */
    @GetMapping("/public/by-year")
    @CrossOrigin(origins = "*")
    public ResponseEntity<Map<Integer, List<WorkAnniversaryDisplay>>> getPublicByYear() {
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
    
    /**
     * Get all work anniversaries for authenticated admin users
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<WorkAnniversaryDisplay>> getAllWorkAnniversaries() {
        // Calculate and get anniversaries
        List<WorkAnniversaryDisplay> anniversaries = calculateAnniversariesForDisplay();
        
        // Sort by years of experience (descending) then by name
        anniversaries.sort((a1, a2) -> {
            int yearComp = a2.getYearsOfExperience().compareTo(a1.getYearsOfExperience());
            if (yearComp != 0) return yearComp;
            return a1.getEmployeeName().compareTo(a2.getEmployeeName());
        });
        
        return ResponseEntity.ok(anniversaries);
    }
    
    /**
     * Get work anniversaries for current month window
     */
    @GetMapping("/current-month")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<WorkAnniversaryDisplay>> getCurrentMonthAnniversaries() {
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate endOfMonth = today.withDayOfMonth(today.lengthOfMonth());
        
        // Calculate and get anniversaries
        List<WorkAnniversaryDisplay> anniversaries = calculateAnniversariesForDisplay();
        
        // Filter to current month
        List<WorkAnniversaryDisplay> currentMonth = anniversaries.stream()
                .filter(wa -> !wa.getAnniversaryDate().isBefore(startOfMonth) && !wa.getAnniversaryDate().isAfter(endOfMonth))
                .sorted((a1, a2) -> a1.getAnniversaryDate().compareTo(a2.getAnniversaryDate()))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(currentMonth);
    }
    
    /**
     * Get work anniversaries grouped by years of experience
     */
    @GetMapping("/by-year")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<Integer, List<WorkAnniversaryDisplay>>> getAnniversariesByYear() {
        // Calculate and get anniversaries
        List<WorkAnniversaryDisplay> anniversaries = calculateAnniversariesForDisplay();
        
        // Group by years of experience
        Map<Integer, List<WorkAnniversaryDisplay>> groupedByYear = new java.util.TreeMap<>((a, b) -> b.compareTo(a));
        
        for (WorkAnniversaryDisplay entity : anniversaries) {
            Integer year = entity.getYearsOfExperience();
            groupedByYear.computeIfAbsent(year, k -> new java.util.ArrayList<>()).add(entity);
        }
        
        // Sort each list by employee name
        groupedByYear.forEach((year, list) -> 
            list.sort((a, b) -> a.getEmployeeName().compareTo(b.getEmployeeName()))
        );
        
        return ResponseEntity.ok(groupedByYear);
    }
}
