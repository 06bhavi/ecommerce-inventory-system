package com.inventory.controller;

import com.inventory.entity.UserActivityLog;
import com.inventory.repository.mongo.UserActivityLogRepository;
import com.inventory.service.HybridInventoryService;

import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import static org.springframework.data.mongodb.core.aggregation.Aggregation.*;

@RestController
@RequestMapping("/api/v1/activity")
public class ActivityLogController {

    private final HybridInventoryService hybridService;
    private final UserActivityLogRepository activityRepository;
    private final MongoTemplate mongoTemplate;

    public ActivityLogController(HybridInventoryService hybridService, UserActivityLogRepository activityRepository,
            MongoTemplate mongoTemplate) {
        this.hybridService = hybridService;
        this.activityRepository = activityRepository;
        this.mongoTemplate = mongoTemplate;
    }

    @PostMapping
    public ResponseEntity<Void> logActivity(@RequestBody UserActivityLog activity) {
        hybridService.logProductView(activity.getProductId(), activity.getUserId(), activity.getMetadata());
        return ResponseEntity.accepted().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserActivityLog>> getUserActivity(@PathVariable String userId) {
        return ResponseEntity.ok(activityRepository.findByUserId(userId));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<UserActivityLog>> getProductActivity(@PathVariable Long productId) {
        return ResponseEntity.ok(activityRepository.findByProductId(productId));
    }

    @GetMapping("/user/{userId}/recent")
    public ResponseEntity<List<UserActivityLog>> getRecentUserActivity(@PathVariable String userId) {
        List<UserActivityLog> all = activityRepository.findByUserId(userId);
        List<UserActivityLog> recent = all.stream()
                .sorted((a1, a2) -> {
                    if (a1.getTimestamp() == null)
                        return 1;
                    if (a2.getTimestamp() == null)
                        return -1;
                    return a2.getTimestamp().compareTo(a1.getTimestamp());
                })
                .limit(10)
                .toList();
        return ResponseEntity.ok(recent);
    }

    @GetMapping("/analytics/top-viewed")
    @SuppressWarnings({ "unchecked", "rawtypes" })
    public ResponseEntity<List<Map<String, Object>>> getTopViewedProducts() {
        Aggregation aggregation = newAggregation(
                match(org.springframework.data.mongodb.core.query.Criteria.where("action").is("PRODUCT_VIEW")),
                group("productId", "productName").count().as("viewCount"),
                sort(Sort.Direction.DESC, "viewCount"),
                limit(10));

        AggregationResults<Map> results = mongoTemplate.aggregate(aggregation, "user_activity_log", Map.class);
        // Cast or assume safe since we are returning JSON
        return ResponseEntity.ok((List<Map<String, Object>>) (List<?>) results.getMappedResults());
    }
}
