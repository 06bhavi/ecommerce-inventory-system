package com.inventory.service;

import com.inventory.entity.InventoryAnalytics;
import com.inventory.entity.ProductReview;
import com.inventory.entity.UserActivityLog;

import com.inventory.exception.ProductNotFoundException;
import com.inventory.model.Product;
import com.inventory.repository.mongo.InventoryAnalyticsRepository;
import com.inventory.repository.jpa.ProductRepository;
import com.inventory.repository.mongo.ProductReviewRepository;
import com.inventory.repository.mongo.UserActivityLogRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class HybridInventoryService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(HybridInventoryService.class);

    private final ProductRepository productRepository;
    private final InventoryAnalyticsRepository analyticsRepository;
    private final ProductReviewRepository reviewRepository;
    private final UserActivityLogRepository activityLogRepository;

    public HybridInventoryService(ProductRepository productRepository, InventoryAnalyticsRepository analyticsRepository,
            ProductReviewRepository reviewRepository, UserActivityLogRepository activityLogRepository) {
        this.productRepository = productRepository;
        this.analyticsRepository = analyticsRepository;
        this.reviewRepository = reviewRepository;
        this.activityLogRepository = activityLogRepository;
    }

    @Transactional
    public Product createProductWithAnalytics(Product product) {
        log.info("Creating product with analytics: {}", product.getName());
        Product savedProduct = productRepository.save(product);

        InventoryAnalytics analytics = new InventoryAnalytics();
        analytics.setProductId(savedProduct.getId());
        analytics.setSku(savedProduct.getSku());
        analytics.setProductName(savedProduct.getName());
        analytics.setCategory(savedProduct.getCategory()); // Assuming category exists
        analytics.setTotalViewCount(0);
        analytics.setTotalPurchases(0);
        analytics.setAverageRating(0.0);
        analytics.setCurrentStock(savedProduct.getQuantity());
        analytics.setPriceHistory(new ArrayList<>());
        analytics.setLastUpdated(LocalDateTime.now());

        // Add initial price to history
        InventoryAnalytics.PriceHistory ph = new InventoryAnalytics.PriceHistory(savedProduct.getPrice().doubleValue(),
                LocalDateTime.now());
        analytics.getPriceHistory().add(ph);

        analyticsRepository.save(analytics);
        return savedProduct;
    }

    public void logProductView(Long productId, String userId, Map<String, Object> metadata) {
        // Log activity
        UserActivityLog activity = new UserActivityLog();
        activity.setUserId(userId);
        activity.setAction("PRODUCT_VIEW");
        activity.setProductId(productId);
        activity.setTimestamp(LocalDateTime.now());
        activity.setMetadata(metadata);

        Optional<Product> productOpt = productRepository.findById(productId);
        productOpt.ifPresent(p -> activity.setProductName(p.getName()));

        activityLogRepository.save(activity);

        // Update analytics
        InventoryAnalytics analytics = analyticsRepository.findByProductId(productId)
                .orElseGet(() -> createAnalyticsForExistingProduct(productId));

        analytics.setTotalViewCount(analytics.getTotalViewCount() + 1);
        analytics.setLastUpdated(LocalDateTime.now());
        analyticsRepository.save(analytics);
    }

    @Transactional
    public ProductReview addReview(ProductReview review) {
        log.info("Adding review for product: {}", review.getProductId());

        // Verify product exists in MySQL
        if (!productRepository.existsById(review.getProductId())) {
            throw new ProductNotFoundException("Product not found with ID: " + review.getProductId());
        }

        review.setCreatedAt(LocalDateTime.now());
        review.setUpdatedAt(LocalDateTime.now());
        ProductReview savedReview = reviewRepository.save(review);

        // Update analytics average rating
        updateProductRating(review.getProductId());

        return savedReview;
    }

    @Transactional
    public void updateProductStock(Long productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found: " + productId));

        product.setQuantity(quantity);
        productRepository.save(product);

        // Sync to MongoDB
        InventoryAnalytics analytics = analyticsRepository.findByProductId(productId)
                .orElseGet(() -> createAnalyticsForExistingProduct(productId));

        analytics.setCurrentStock(quantity);
        analytics.setLastUpdated(LocalDateTime.now());
        analyticsRepository.save(analytics);
    }

    public void syncAnalyticsFromMySQL() {
        log.info("Starting daily analytics sync...");
        List<Product> products = productRepository.findAll();
        for (Product product : products) {
            InventoryAnalytics analytics = analyticsRepository.findByProductId(product.getId())
                    .orElseGet(() -> {
                        InventoryAnalytics newAnalytics = new InventoryAnalytics();
                        newAnalytics.setProductId(product.getId());
                        newAnalytics.setTotalViewCount(0);
                        newAnalytics.setTotalPurchases(0);
                        newAnalytics.setAverageRating(0.0);
                        newAnalytics.setPriceHistory(new ArrayList<>());
                        return newAnalytics;
                    });

            analytics.setSku(product.getSku());
            analytics.setProductName(product.getName());
            analytics.setCategory(product.getCategory()); // Check if category is string in Product
            analytics.setCurrentStock(product.getQuantity());
            analytics.setLastUpdated(LocalDateTime.now());

            // Track price changes
            if (analytics.getPriceHistory().isEmpty() ||
                    !analytics.getPriceHistory().get(analytics.getPriceHistory().size() - 1).getPrice()
                            .equals(product.getPrice().doubleValue())) {
                analytics.getPriceHistory()
                        .add(new InventoryAnalytics.PriceHistory(product.getPrice().doubleValue(),
                                LocalDateTime.now()));
            }

            analyticsRepository.save(analytics);
        }
        log.info("Analytics sync completed.");
    }

    private InventoryAnalytics createAnalyticsForExistingProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found: " + productId));

        InventoryAnalytics analytics = new InventoryAnalytics();
        analytics.setProductId(productId);
        analytics.setSku(product.getSku());
        analytics.setProductName(product.getName());
        // analytics.setCategory(product.getCategory());
        // Note: I need to verify Product model has category field. If not, I'll need to
        // adjust.
        analytics.setCategory(product.getCategory());
        analytics.setTotalViewCount(0);
        analytics.setTotalPurchases(0);
        analytics.setAverageRating(0.0);
        analytics.setCurrentStock(product.getQuantity());
        analytics.setPriceHistory(new ArrayList<>());
        analytics.setLastUpdated(LocalDateTime.now());
        analytics.getPriceHistory()
                .add(new InventoryAnalytics.PriceHistory(product.getPrice().doubleValue(), LocalDateTime.now()));
        return analytics;
    }

    private void updateProductRating(Long productId) {
        List<ProductReview> reviews = reviewRepository.findByProductId(productId);
        if (reviews.isEmpty())
            return;

        double avg = reviews.stream()
                .mapToDouble(ProductReview::getRating)
                .average()
                .orElse(0.0);

        InventoryAnalytics analytics = analyticsRepository.findByProductId(productId)
                .orElseGet(() -> createAnalyticsForExistingProduct(productId));

        analytics.setAverageRating(Math.round(avg * 10.0) / 10.0);
        analyticsRepository.save(analytics);
    }
}
