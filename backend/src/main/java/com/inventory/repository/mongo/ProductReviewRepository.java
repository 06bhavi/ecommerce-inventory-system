package com.inventory.repository.mongo;

import com.inventory.entity.ProductReview;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductReviewRepository extends MongoRepository<ProductReview, String> {
    List<ProductReview> findByProductId(Long productId);

    List<ProductReview> findByUserId(String userId);

    List<ProductReview> findByRatingGreaterThanEqual(Double rating);

    List<ProductReview> findByTags(String tag);
}
