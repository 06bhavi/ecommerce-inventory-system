package com.inventory.controller;

import com.inventory.entity.ProductReview;
import com.inventory.exception.ReviewNotFoundException;
import com.inventory.repository.mongo.ProductReviewRepository;
import com.inventory.service.HybridInventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reviews")
public class ReviewController {

    private final HybridInventoryService hybridService;
    private final ProductReviewRepository reviewRepository;

    public ReviewController(HybridInventoryService hybridService, ProductReviewRepository reviewRepository) {
        this.hybridService = hybridService;
        this.reviewRepository = reviewRepository;
    }

    @PostMapping("/{productId}")
    public ResponseEntity<ProductReview> addReview(
            @PathVariable Long productId,
            @RequestBody ProductReview review) {
        review.setProductId(productId);
        ProductReview savedReview = hybridService.addReview(review);
        return ResponseEntity.status(201).body(savedReview);
    }

    @GetMapping("/{productId}")
    public ResponseEntity<List<ProductReview>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewRepository.findByProductId(productId));
    }

    @GetMapping("/{productId}/average-rating")
    public ResponseEntity<Map<String, Object>> getAverageRating(@PathVariable Long productId) {
        List<ProductReview> reviews = reviewRepository.findByProductId(productId);
        double avg = reviews.stream()
                .mapToDouble(ProductReview::getRating)
                .average()
                .orElse(0.0);

        Map<String, Object> response = new HashMap<>();
        response.put("productId", productId);
        response.put("averageRating", Math.round(avg * 10.0) / 10.0);
        response.put("totalReviews", reviews.size());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{productId}/top-reviews")
    public ResponseEntity<List<ProductReview>> getTopReviews(@PathVariable Long productId) {
        List<ProductReview> reviews = reviewRepository.findByProductId(productId);
        List<ProductReview> topReviews = reviews.stream()
                .sorted((r1, r2) -> {
                    int h1 = r1.getHelpful() != null ? r1.getHelpful() : 0;
                    int h2 = r2.getHelpful() != null ? r2.getHelpful() : 0;
                    return Integer.compare(h2, h1);
                })
                .limit(5)
                .toList();
        return ResponseEntity.ok(topReviews);
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<ProductReview> updateReview(
            @PathVariable String reviewId,
            @RequestBody ProductReview reviewDetails) {

        ProductReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException("Review not found: " + reviewId));

        review.setRating(reviewDetails.getRating());
        review.setReviewText(reviewDetails.getReviewText());
        review.setTags(reviewDetails.getTags());
        review.setUpdatedAt(LocalDateTime.now());

        return ResponseEntity.ok(reviewRepository.save(review));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable String reviewId) {
        if (!reviewRepository.existsById(reviewId)) {
            throw new ReviewNotFoundException("Review not found: " + reviewId);
        }
        reviewRepository.deleteById(reviewId);
        return ResponseEntity.noContent().build();
    }
}
