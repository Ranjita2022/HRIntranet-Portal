package org.ieee.hrintranet.controller;

import org.ieee.hrintranet.entity.Employee;
import org.ieee.hrintranet.entity.WorkAnniversaryDisplay;
import org.ieee.hrintranet.repository.EmployeeRepository;
import org.ieee.hrintranet.repository.WorkAnniversaryDisplayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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
    private final WorkAnniversaryDisplayRepository workAnniversaryDisplayRepository;
    
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
        
        // Calculate anniversaries for each employee
        for (Employee emp : allActiveEmployees) {
            LocalDate startDate = emp.getStartDate();
            if (startDate == null || startDate.isAfter(today)) continue;
            
            // Calculate years of service
            int yearsOfService = today.getYear() - startDate.getYear();
            
            // Adjust if anniversary hasn't occurred yet this year
            if (today.getMonthValue() < startDate.getMonthValue() || 
                (today.getMonthValue() == startDate.getMonthValue() && today.getDayOfMonth() < startDate.getDayOfMonth())) {
                yearsOfService--;
            }
            
            // Show only the HIGHEST milestone
            if (yearsOfService >= 1) {
                LocalDate anniversaryDate = startDate.plusYears(yearsOfService);
                
                // Create display object (no persistence)
                WorkAnniversaryDisplay displayEntity = new WorkAnniversaryDisplay(
                    emp.getId(),
                    emp.getFullName(),
                    emp.getDepartment(),
                    emp.getPosition(),
                    startDate,
                    anniversaryDate,
                    yearsOfService
                );
                
                calculatedAnniversaries.add(displayEntity);
            }
        }
        
        return calculatedAnniversaries;
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
