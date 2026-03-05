package org.ieee.hrintranet.repository;

import org.ieee.hrintranet.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Integer> {
    
    Optional<Employee> findByEmployeeId(String employeeId);
    
    Optional<Employee> findByEmail(String email);
    
    List<Employee> findByStatus(Employee.EmployeeStatus status);
    
    @Query("SELECT e FROM Employee e WHERE e.status = 'ACTIVE' AND e.startDate >= :fromDate ORDER BY e.startDate DESC")
    List<Employee> findRecentJoiners(@Param("fromDate") LocalDate fromDate);
    
    @Query("SELECT e FROM Employee e WHERE e.status = 'ACTIVE' AND e.department = :department ORDER BY e.startDate DESC")
    List<Employee> findByDepartmentAndActive(@Param("department") String department);
    
    @Query("SELECT DISTINCT e.department FROM Employee e WHERE e.status = 'ACTIVE' ORDER BY e.department")
    List<String> findAllActiveDepartments();
}
