package com.inventory.repository.mongo;

import com.inventory.entity.InventoryAnalytics;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryAnalyticsRepository extends MongoRepository<InventoryAnalytics, String> {
    Optional<InventoryAnalytics> findByProductId(Long productId);

    List<InventoryAnalytics> findByCategory(String category);

    List<InventoryAnalytics> findByAverageRatingGreaterThan(Double rating);

    Optional<InventoryAnalytics> findBySku(String sku);
}
