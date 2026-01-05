package com.inventory.config;

import com.inventory.entity.InventoryAnalytics;
import com.inventory.entity.ProductReview;
import com.inventory.entity.UserActivityLog;
import jakarta.annotation.PostConstruct;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;

@Configuration
public class MongoConfig {

        private final MongoTemplate mongoTemplate;

        public MongoConfig(MongoTemplate mongoTemplate) {
                this.mongoTemplate = mongoTemplate;
        }

        @PostConstruct
        public void initIndexes() {
                try {
                        // ProductReview Indexes
                        mongoTemplate.indexOps(ProductReview.class)
                                        .ensureIndex(new Index().on("productId", Sort.Direction.ASC));
                        mongoTemplate.indexOps(ProductReview.class)
                                        .ensureIndex(new Index().on("userId", Sort.Direction.ASC));
                        mongoTemplate.indexOps(ProductReview.class)
                                        .ensureIndex(new Index().on("rating", Sort.Direction.DESC));

                        // UserActivityLog Indexes
                        mongoTemplate.indexOps(UserActivityLog.class)
                                        .ensureIndex(new Index().on("userId", Sort.Direction.ASC).on("timestamp",
                                                        Sort.Direction.DESC));
                        mongoTemplate.indexOps(UserActivityLog.class)
                                        .ensureIndex(new Index().on("productId", Sort.Direction.ASC));
                        mongoTemplate.indexOps(UserActivityLog.class)
                                        .ensureIndex(new Index().on("action", Sort.Direction.ASC));

                        // InventoryAnalytics Indexes
                        mongoTemplate.indexOps(InventoryAnalytics.class)
                                        .ensureIndex(new Index().on("productId", Sort.Direction.ASC).unique());
                        mongoTemplate.indexOps(InventoryAnalytics.class)
                                        .ensureIndex(new Index().on("category", Sort.Direction.ASC));
                        mongoTemplate.indexOps(InventoryAnalytics.class)
                                        .ensureIndex(new Index().on("averageRating", Sort.Direction.DESC));
                } catch (Exception e) {
                        // Log error but allow application to start (likely dirty DB state)
                        System.err.println("Warning: Could not create some MongoDB indexes: " + e.getMessage());
                }
        }
}
