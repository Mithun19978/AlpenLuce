package com.shop.demo.database.repository.projectRepository.shop;

import com.shop.demo.database.entity.project.shop.GarmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GarmentRepository extends JpaRepository<GarmentEntity, Long> {
    List<GarmentEntity> findByActiveTrue();
    List<GarmentEntity> findByActiveTrueOrderByCategoryAscIdAsc();
    List<GarmentEntity> findByActiveTrueAndFeaturedTrueOrderByCategoryAscIdAsc();
    List<GarmentEntity> findByCategoryAndActiveTrueOrderByIdAsc(String category);
}
