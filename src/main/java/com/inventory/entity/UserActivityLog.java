package com.inventory.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "user_activity_log")
public class UserActivityLog {
    @Id
    private String id;
    private String userId;
    private String action; // "PRODUCT_VIEW", "ADD_TO_CART", "PURCHASE", "WISHLIST"
    private Long productId;
    private String productName;
    private LocalDateTime timestamp;
    private Map<String, Object> metadata;

    public UserActivityLog() {
    }

    public UserActivityLog(String id, String userId, String action, Long productId, String productName,
            LocalDateTime timestamp, Map<String, Object> metadata) {
        this.id = id;
        this.userId = userId;
        this.action = action;
        this.productId = productId;
        this.productName = productName;
        this.timestamp = timestamp;
        this.metadata = metadata;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }
}
