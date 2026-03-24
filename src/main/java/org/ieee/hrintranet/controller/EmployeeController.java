package org.ieee.hrintranet.controller;

import org.ieee.hrintranet.entity.Employee;
import org.ieee.hrintranet.entity.Image;
import org.ieee.hrintranet.repository.EmployeeRepository;
import org.ieee.hrintranet.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/employees")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EmployeeController {
    
    private final EmployeeRepository employeeRepository;
    private final FileStorageService fileStorageService;
    private final org.ieee.hrintranet.service.AuditService auditService;
    
    @GetMapping
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok(employeeRepository.findAll());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployee(@PathVariable int id) {
        return employeeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<?> createEmployee(@RequestBody Employee employee, Authentication authentication) {
        try {
            if (employeeRepository.findByEmployeeId(employee.getEmployeeId()).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Employee ID already exists"));
            }
            
            if (employeeRepository.findByEmail(employee.getEmail()).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
            }
            
            Employee saved = employeeRepository.save(employee);
            auditService.logAction(authentication.getName(), "CREATE", "employees", saved.getId(), null, saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable int id, @RequestBody Employee employee, Authentication authentication) {
        return employeeRepository.findById(id)
                .map(existing -> {
                    Employee oldData = new Employee();
                    oldData.setId(existing.getId());
                    oldData.setEmployeeId(existing.getEmployeeId());
                    oldData.setFirstName(existing.getFirstName());
                    oldData.setLastName(existing.getLastName());
                    
                    existing.setEmployeeId(employee.getEmployeeId());
                    existing.setFirstName(employee.getFirstName());
                    existing.setLastName(employee.getLastName());
                    existing.setEmail(employee.getEmail());
                    existing.setPosition(employee.getPosition());
                    existing.setDepartment(employee.getDepartment());
                    existing.setStartDate(employee.getStartDate());
                    existing.setStatus(employee.getStatus());
                    if (employee.getProfileImage() != null) {
                        existing.setProfileImage(employee.getProfileImage());
                    }
                    Employee updated = employeeRepository.save(existing);
                    auditService.logAction(authentication.getName(), "UPDATE", "employees", updated.getId(), oldData, updated);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable int id, Authentication authentication) {
        return employeeRepository.findById(id)
                .map(employee -> {
                    auditService.logAction(authentication.getName(), "DELETE", "employees", employee.getId(), employee, null);
                    employeeRepository.delete(employee);
                    return ResponseEntity.ok(Map.of("message", "Employee deleted successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/{id}/upload-photo")
    public ResponseEntity<?> uploadEmployeePhoto(@PathVariable int id, 
                                                 @RequestParam("file") MultipartFile file,
                                                 Authentication authentication) {
        try {
            Employee employee = employeeRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Employee not found"));
            
            Image image = fileStorageService.storeImage(file, Image.ImageType.EMPLOYEE_PROFILE, 
                                                       authentication.getName());
            employee.setProfileImage(image);
            employeeRepository.save(employee);
            
            return ResponseEntity.ok(Map.of("message", "Photo uploaded successfully", "image", image));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/departments")
    public ResponseEntity<List<String>> getDepartments() {
        return ResponseEntity.ok(employeeRepository.findAllActiveDepartments());
    }
    
    @GetMapping("/recent-joiners")
    public ResponseEntity<List<Employee>> getRecentJoiners(@RequestParam(defaultValue = "90") int days) {
        LocalDate fromDate = LocalDate.now().minusDays(days);
        return ResponseEntity.ok(employeeRepository.findRecentJoiners(fromDate));
    }
}
