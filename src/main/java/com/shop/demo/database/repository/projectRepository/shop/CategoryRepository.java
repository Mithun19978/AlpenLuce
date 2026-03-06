package com.shop.demo.database.repository.projectRepository.shop;

import com.shop.demo.database.entity.project.shop.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<CategoryEntity, Long> {

    List<CategoryEntity> findAllByOrderByDepthAscDisplayOrderAsc();

    List<CategoryEntity> findByActiveTrueOrderByDepthAscDisplayOrderAsc();
}
