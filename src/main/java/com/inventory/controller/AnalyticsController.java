package com.inventory.controller;

import com.inventory.entity.InventoryAnalytics;
import com.inventory.exception.AnalyticsException;
import com.inventory.repository.mongo.InventoryAnalyticsRepository;

import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    private final InventoryAnalyticsRepository analyticsRepository;
    private final MongoTemplate mongoTemplate;

    public AnalyticsController(InventoryAnalyticsRepository analyticsRepository, MongoTemplate mongoTemplate) {
        this.analyticsRepository = analyticsRepository;
        this.mongoTemplate = mongoTemplate;
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<InventoryAnalytics> getProductAnalytics(@PathVariable Long productId) {
        return analyticsRepository.findByProductId(productId)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new AnalyticsException("Analytics not found for product: " + productId));
    }

    @GetMapping("/top-rated")
    public ResponseEntity<List<InventoryAnalytics>> getTopRatedProducts() {
        return ResponseEntity.ok(analyticsRepository.findByAverageRatingGreaterThan(4.0));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<InventoryAnalytics>> getCategoryAnalytics(@PathVariable String category) {
        return ResponseEntity.ok(analyticsRepository.findByCategory(category));
    }

    @GetMapping("/trending")
    public ResponseEntity<List<InventoryAnalytics>> getTrendingProducts() {
        Query query = new Query();
        query.with(Sort.by(Sort.Direction.DESC, "totalViewCount"));
        query.limit(10);
        return ResponseEntity.ok(mongoTemplate.find(query, InventoryAnalytics.class));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<InventoryAnalytics>> getLowStockProducts() {
        Query query = new Query();
        query.addCriteria(Criteria.where("currentStock").lt(10));
        return ResponseEntity.ok(mongoTemplate.find(query, InventoryAnalytics.class));
    }
}
