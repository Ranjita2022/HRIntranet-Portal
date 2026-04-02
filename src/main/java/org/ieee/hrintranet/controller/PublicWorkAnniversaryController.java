package org.ieee.hrintranet.controller;

import org.ieee.hrintranet.entity.Employee;
import org.ieee.hrintranet.entity.WorkAnniversaryDisplay;
import org.ieee.hrintranet.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
            
            int totalMonths = (int) ChronoUnit.MONTHS.between(startDate, today);
            int yearsOfService = totalMonths / 12;
            int monthsOfExperience = totalMonths % 12;

            LocalDate experienceDate = resolveCompletedExperienceDate(startDate, today, yearsOfService, totalMonths);

            WorkAnniversaryDisplay displayEntity = new WorkAnniversaryDisplay(
                emp.getId(),
                emp.getFullName(),
                emp.getDepartment(),
                emp.getPosition(),
                startDate,
                experienceDate,
                yearsOfService
            );
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
     * Get all work anniversaries for all employees, regardless of status.
     * Used by admin views that need to show active, inactive, and terminated employees.
     */
    @GetMapping("/all-employees")
    public ResponseEntity<List<WorkAnniversaryDisplay>> getAllEmployeeAnniversaries() {
        LocalDate today = LocalDate.now();
        List<WorkAnniversaryDisplay> calculatedAnniversaries = new java.util.ArrayList<>();

        List<Employee> allEmployees = employeeRepository.findAll();

        for (Employee emp : allEmployees) {
            LocalDate startDate = emp.getStartDate();
            if (startDate == null || startDate.isAfter(today)) continue;

            int totalMonths = (int) ChronoUnit.MONTHS.between(startDate, today);
            int yearsOfService = totalMonths / 12;
            int monthsOfExperience = totalMonths % 12;

            LocalDate experienceDate = resolveCompletedExperienceDate(startDate, today, yearsOfService, totalMonths);

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

            calculatedAnniversaries.add(displayEntity);
        }

        calculatedAnniversaries.sort((a1, a2) -> {
            int yearComp = a2.getYearsOfExperience().compareTo(a1.getYearsOfExperience());
            if (yearComp != 0) return yearComp;
            return a1.getEmployeeName().compareTo(a2.getEmployeeName());
        });

        return ResponseEntity.ok(calculatedAnniversaries);
    }
    
    /**
     * Get all work anniversaries
     */
    @GetMapping("/all")
    public ResponseEntity<List<WorkAnniversaryDisplay>> getAllAnniversaries() {
        List<WorkAnniversaryDisplay> anniversaries = calculateAnniversariesForDisplay();
        
        anniversaries.sort((a1, a2) -> {
            int yearComp = a2.getYearsOfExperience().compareTo(a1.getYearsOfExperience());
            if (yearComp != 0) return yearComp;
            return a1.getEmployeeName().compareTo(a2.getEmployeeName());
        });
        
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
                .sorted((a1, a2) -> a1.getAnniversaryDate().compareTo(a2.getAnniversaryDate()))
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
}
