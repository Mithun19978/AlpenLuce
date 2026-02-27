package com.shop.demo.database.repository.projectRepository.shop;

import com.shop.demo.database.entity.project.shop.CustomizationDesignEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomizationDesignRepository extends JpaRepository<CustomizationDesignEntity, Long> {
    List<CustomizationDesignEntity> findByCustomizationId(Long customizationId);
    void deleteByCustomizationId(Long customizationId);
}
