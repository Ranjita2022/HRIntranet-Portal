package org.ieee.hrintranet.repository;

import org.ieee.hrintranet.entity.EmergencyContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmergencyContactRepository extends JpaRepository<EmergencyContact, Integer> {
    
    List<EmergencyContact> findByIsActiveOrderByDisplayOrderAscCreatedAtDesc(Boolean isActive);
    
    List<EmergencyContact> findByTypeAndIsActiveOrderByDisplayOrderAscCreatedAtDesc(
        EmergencyContact.ContactType type, Boolean isActive);
    
    List<EmergencyContact> findByIsEmergencyAndIsActiveOrderByDisplayOrderAscCreatedAtDesc(
        Boolean isEmergency, Boolean isActive);
    
    Long countByIsActive(Boolean isActive);
}
