package org.ieee.hrintranet.controller;

import org.ieee.hrintranet.entity.Employee;
import org.ieee.hrintranet.entity.Image;
import org.ieee.hrintranet.repository.EmployeeRepository;
import org.ieee.hrintranet.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.ClientAnchor;
import org.apache.poi.ss.usermodel.CreationHelper;
import org.apache.poi.ss.usermodel.Drawing;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.Picture;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.ArrayList;
import java.util.HashMap;
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
    public ResponseEntity<List<Map<String, Object>>> getAllEmployees() {
        List<Employee> employees = employeeRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Employee emp : employees) {
            result.add(toResponseMap(emp));
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getEmployee(@PathVariable int id) {
        return employeeRepository.findById(id)
                .map(emp -> ResponseEntity.ok(toResponseMap(emp)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportEmployeesExcel() {
        List<Employee> employees = employeeRepository.findAll().stream()
                .sorted(Comparator
                        .comparing((Employee emp) -> safeSortValue(emp.getFullName()), String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(emp -> safeSortValue(emp.getEmployeeId()), String.CASE_INSENSITIVE_ORDER))
                .toList();

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Employees");
            CreationHelper helper = workbook.getCreationHelper();
            Drawing<?> drawing = sheet.createDrawingPatriarch();

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(org.apache.poi.ss.usermodel.IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            String[] headers = {
                    "Serial No",
                    "Employee ID",
                    "Full Name",
                    "Email",
                    "Birth Date",
                    "Position",
                    "Department",
                    "Start Date",
                    "End Date",
                    "Status",
                    "Photo"
            };

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIndex = 1;
            for (Employee employee : employees) {
                Row row = sheet.createRow(rowIndex);
                row.setHeightInPoints(80f);

                createTextCell(row, 0, String.valueOf(rowIndex));
                createTextCell(row, 1, employee.getEmployeeId());
                createTextCell(row, 2, employee.getFullName());
                createTextCell(row, 3, employee.getEmail());
                createTextCell(row, 4, formatDate(employee.getBirthDate()));
                createTextCell(row, 5, employee.getPosition());
                createTextCell(row, 6, employee.getDepartment());
                createTextCell(row, 7, formatDate(employee.getStartDate()));
                createTextCell(row, 8, formatDate(employee.getEndDate()));
                createTextCell(row, 9, employee.getStatus() != null ? employee.getStatus().name() : "");

                String photoText = addEmployeePhoto(sheet, workbook, drawing, helper, employee, rowIndex, 10);
                createTextCell(row, 10, photoText);

                rowIndex++;
            }

            for (int i = 0; i < headers.length - 1; i++) {
                sheet.autoSizeColumn(i);
            }
            sheet.setColumnWidth(10, 18 * 256);

            workbook.write(outputStream);

            HttpHeaders headersResponse = new HttpHeaders();
            headersResponse.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headersResponse.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=employees-with-photos.xlsx");

            return ResponseEntity.ok()
                    .headers(headersResponse)
                    .body(outputStream.toByteArray());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    /** Build a response map that includes computed profileImageUrl */
    private Map<String, Object> toResponseMap(Employee emp) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", emp.getId());
        map.put("employeeId", emp.getEmployeeId());
        map.put("firstName", emp.getFirstName());
        map.put("lastName", emp.getLastName());
        map.put("fullName", emp.getFullName());
        map.put("email", emp.getEmail());
        map.put("position", emp.getPosition());
        map.put("department", emp.getDepartment());
        map.put("startDate", emp.getStartDate());
        map.put("endDate", emp.getEndDate());
        map.put("birthDate", emp.getBirthDate());
        map.put("status", emp.getStatus());
        map.put("createdAt", emp.getCreatedAt());
        map.put("updatedAt", emp.getUpdatedAt());
        map.put("profileImage", emp.getProfileImage());

        // Compute profileImageUrl for frontend use
        String profileImageUrl = null;
        if (emp.getProfileImage() != null && emp.getProfileImage().getFilename() != null) {
            String filename = emp.getProfileImage().getFilename();
            if (filename != null) {
                profileImageUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                        .path("/api/uploads/")
                        .path(filename)
                        .toUriString();
            }
        }
        map.put("profileImageUrl", profileImageUrl);
        return map;
    }

    private String safeSortValue(String value) {
        return value == null ? "" : value.trim();
    }

    private String formatDate(LocalDate date) {
        return date != null ? date.toString() : "";
    }

    private void createTextCell(Row row, int columnIndex, String value) {
        Cell cell = row.createCell(columnIndex);
        cell.setCellValue(value != null ? value : "");
    }

    private String addEmployeePhoto(Sheet sheet,
                                    Workbook workbook,
                                    Drawing<?> drawing,
                                    CreationHelper helper,
                                    Employee employee,
                                    int rowIndex,
                                    int photoColumnIndex) throws IOException {
        Image image = employee.getProfileImage();
        if (image == null || image.getFilePath() == null) {
            return "";
        }

        Path filePath = Paths.get(image.getFilePath());
        if (!Files.exists(filePath) || !Files.isReadable(filePath)) {
            return "Missing photo";
        }

        int pictureType = resolvePictureType(image.getMimeType(), image.getFilename());
        if (pictureType == -1) {
            return "Unsupported image type";
        }

        byte[] imageBytes = Files.readAllBytes(filePath);
        int pictureIndex = workbook.addPicture(imageBytes, pictureType);

        ClientAnchor anchor = helper.createClientAnchor();
        anchor.setCol1(photoColumnIndex);
        anchor.setRow1(rowIndex);
        anchor.setCol2(photoColumnIndex + 1);
        anchor.setRow2(rowIndex + 1);

        Picture picture = drawing.createPicture(anchor, pictureIndex);
        picture.resize(0.9, 0.9);
        return "";
    }

    private int resolvePictureType(String mimeType, String filename) {
        String normalizedMimeType = mimeType != null ? mimeType.toLowerCase() : "";
        String normalizedFilename = filename != null ? filename.toLowerCase() : "";

        if (normalizedMimeType.contains("png") || normalizedFilename.endsWith(".png")) {
            return Workbook.PICTURE_TYPE_PNG;
        }
        if (normalizedMimeType.contains("jpeg") || normalizedMimeType.contains("jpg")
                || normalizedFilename.endsWith(".jpg") || normalizedFilename.endsWith(".jpeg")) {
            return Workbook.PICTURE_TYPE_JPEG;
        }

        return -1;
    }
    
    @PostMapping
    public ResponseEntity<?> createEmployee(@RequestBody Employee employee, Authentication authentication) {
        try {
            normalizeEmployeeNames(employee);

            if (employee.getStatus() == Employee.EmployeeStatus.TERMINATED && employee.getEndDate() == null) {
                employee.setEndDate(LocalDate.now());
            } else if (employee.getStatus() != Employee.EmployeeStatus.TERMINATED) {
                employee.setEndDate(null);
            }

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
                    normalizeEmployeeNames(employee);

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
                    existing.setEndDate(employee.getEndDate());
                    existing.setBirthDate(employee.getBirthDate());
                    existing.setStatus(employee.getStatus());

                    if (existing.getStatus() == Employee.EmployeeStatus.TERMINATED && existing.getEndDate() == null) {
                        existing.setEndDate(LocalDate.now());
                    } else if (existing.getStatus() != Employee.EmployeeStatus.TERMINATED) {
                        existing.setEndDate(null);
                    }

                    if (employee.getProfileImage() != null) {
                        existing.setProfileImage(employee.getProfileImage());
                    }
                    Employee updated = employeeRepository.save(existing);
                    auditService.logAction(authentication.getName(), "UPDATE", "employees", updated.getId(), oldData, updated);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private void normalizeEmployeeNames(Employee employee) {
        if (employee.getLastName() == null || employee.getLastName().trim().isEmpty()) {
            employee.setLastName("");
        }
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

    @DeleteMapping("/{id}/photo")
    public ResponseEntity<?> deleteEmployeePhoto(@PathVariable int id, Authentication authentication) {
        try {
            Employee employee = employeeRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Employee not found"));

            if (employee.getProfileImage() == null) {
                return ResponseEntity.ok(Map.of("message", "No photo to delete"));
            }

            int imageId = employee.getProfileImage().getId();
            fileStorageService.deleteImage(imageId);
            employee.setProfileImage(null);
            employeeRepository.save(employee);

            auditService.logAction(authentication.getName(), "DELETE", "employee_photo", employee.getId(), null, employee);
            return ResponseEntity.ok(Map.of("message", "Photo deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/departments")
    public ResponseEntity<List<String>> getDepartments() {
        return ResponseEntity.ok(employeeRepository.findAllActiveDepartments());
    }
    
    @GetMapping("/recent-joiners")
    public ResponseEntity<List<Map<String, Object>>> getRecentJoiners(@RequestParam(defaultValue = "90") int days) {
        LocalDate fromDate = LocalDate.now().minusDays(days);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Employee emp : employeeRepository.findRecentJoiners(fromDate)) {
            result.add(toResponseMap(emp));
        }
        return ResponseEntity.ok(result);
    }
}
