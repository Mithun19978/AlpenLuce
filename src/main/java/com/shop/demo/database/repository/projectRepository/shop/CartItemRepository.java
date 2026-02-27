package com.shop.demo.database.repository.projectRepository.shop;

import com.shop.demo.database.entity.project.shop.CartItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItemEntity, Long> {
    List<CartItemEntity> findByUserId(Long userId);
    Optional<CartItemEntity> findByUserIdAndCustomizationId(Long userId, Long customizationId);
    void deleteByUserId(Long userId);
}
