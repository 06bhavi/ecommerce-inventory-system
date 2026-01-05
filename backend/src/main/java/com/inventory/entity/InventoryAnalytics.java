package com.inventory.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "inventory_analytics")
public class InventoryAnalytics {
    @Id
    private String id;

    @Indexed(unique = true)
    private Long productId;

    private String sku;
    private String productName;
    private String category;
    private Integer totalViewCount;
    private Integer totalPurchases;
    private Double averageRating;
    private Integer currentStock;
    private List<PriceHistory> priceHistory;
    private LocalDateTime lastUpdated;

    public InventoryAnalytics() {
    }

    public InventoryAnalytics(String id, Long productId, String sku, String productName, String category,
            Integer totalViewCount, Integer totalPurchases, Double averageRating, Integer currentStock,
            List<PriceHistory> priceHistory, LocalDateTime lastUpdated) {
        this.id = id;
        this.productId = productId;
        this.sku = sku;
        this.productName = productName;
        this.category = category;
        this.totalViewCount = totalViewCount;
        this.totalPurchases = totalPurchases;
        this.averageRating = averageRating;
        this.currentStock = currentStock;
        this.priceHistory = priceHistory;
        this.lastUpdated = lastUpdated;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Integer getTotalViewCount() {
        return totalViewCount;
    }

    public void setTotalViewCount(Integer totalViewCount) {
        this.totalViewCount = totalViewCount;
    }

    public Integer getTotalPurchases() {
        return totalPurchases;
    }

    public void setTotalPurchases(Integer totalPurchases) {
        this.totalPurchases = totalPurchases;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public Integer getCurrentStock() {
        return currentStock;
    }

    public void setCurrentStock(Integer currentStock) {
        this.currentStock = currentStock;
    }

    public List<PriceHistory> getPriceHistory() {
        return priceHistory;
    }

    public void setPriceHistory(List<PriceHistory> priceHistory) {
        this.priceHistory = priceHistory;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public static class PriceHistory {
        private Double price;
        private LocalDateTime timestamp;

        public PriceHistory() {
        }

        public PriceHistory(Double price, LocalDateTime timestamp) {
            this.price = price;
            this.timestamp = timestamp;
        }

        public Double getPrice() {
            return price;
        }

        public void setPrice(Double price) {
            this.price = price;
        }

        public LocalDateTime getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
        }
    }
}
