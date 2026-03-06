package com.shop.demo.database.repository.projectRepository.shop;

import com.shop.demo.database.entity.project.shop.GarmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GarmentRepository extends JpaRepository<GarmentEntity, Long> {

    /** All active garments — public shop listing */
    List<GarmentEntity> findByActiveTrueOrderByGarmentTypeAscIdAsc();

    /** All active + featured garments — home page featured section */
    List<GarmentEntity> findByActiveTrueAndFeaturedTrue();

    /** Active + featured filtered by gender type — home page gender buckets */
    List<GarmentEntity> findByGarmentTypeAndActiveTrueAndFeaturedTrue(String garmentType);
}
