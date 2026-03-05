package org.ieee.hrintranet.repository;

import org.ieee.hrintranet.entity.CarouselSlide;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CarouselSlideRepository extends JpaRepository<CarouselSlide, Integer> {
    
    List<CarouselSlide> findByIsActiveOrderByDisplayOrderAscCreatedAtDesc(Boolean isActive);
    
    Long countByIsActive(Boolean isActive);
}
