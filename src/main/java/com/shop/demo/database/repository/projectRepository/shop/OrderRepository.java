package com.shop.demo.database.repository.projectRepository.shop;

import com.shop.demo.database.entity.project.shop.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
    List<OrderEntity> findByUserId(Long userId);
    List<OrderEntity> findByUserIdOrderByCreatedAtDesc(Long userId);
}
