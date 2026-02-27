package com.shop.demo.database.repository.projectRepository.shop;

import com.shop.demo.database.entity.project.shop.CustomizationEntity;
import com.shop.demo.database.entity.project.shop.CustomizationEntity.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomizationRepository extends JpaRepository<CustomizationEntity, Long> {
    List<CustomizationEntity> findByUserId(Long userId);
    List<CustomizationEntity> findByStatus(Status status);
    List<CustomizationEntity> findByUserIdAndStatus(Long userId, Status status);
}
