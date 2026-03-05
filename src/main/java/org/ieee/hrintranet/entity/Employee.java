package org.ieee.hrintranet.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employees")
@Data
public class Employee {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "employee_id", unique = true, nullable = false, length = 50)
    private String employeeId;
    
    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;
    
    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;
    
    @Column(name = "email", unique = true, nullable = false, length = 200)
    private String email;
    
    @Column(nullable = false, length = 200)
    private String position;
    
    @Column(nullable = false, length = 100)
    private String department;
    
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;
    
    @Column(name = "birth_date")
    private LocalDate birthDate;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "profile_image_id")
    private Image profileImage;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EmployeeStatus status = EmployeeStatus.ACTIVE;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @Transient
    public String getFullName() {
        return firstName + " " + lastName;
    }
    
    public enum EmployeeStatus {
        ACTIVE, INACTIVE, TERMINATED
    }
}
