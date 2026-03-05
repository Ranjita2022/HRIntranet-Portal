package org.ieee.hrintranet.repository;

import org.ieee.hrintranet.entity.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface HolidayRepository extends JpaRepository<Holiday, Integer> {
    
    List<Holiday> findByIsActiveOrderByHolidayDateAsc(Boolean isActive);
    
    @Query("SELECT h FROM Holiday h WHERE h.isActive = true " +
           "AND h.holidayDate >= :fromDate " +
           "AND h.holidayDate <= :toDate " +
           "ORDER BY h.holidayDate ASC")
    List<Holiday> findUpcomingHolidays(@Param("fromDate") LocalDate fromDate, 
                                       @Param("toDate") LocalDate toDate);
    
    @Query("SELECT h FROM Holiday h WHERE h.isActive = true " +
           "AND h.holidayDate >= :currentDate " +
           "ORDER BY h.holidayDate ASC")
    List<Holiday> findFutureHolidays(@Param("currentDate") LocalDate currentDate);
}
