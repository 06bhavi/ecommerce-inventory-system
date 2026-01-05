package com.inventory.repository.mongo;

import com.inventory.entity.UserActivityLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UserActivityLogRepository extends MongoRepository<UserActivityLog, String> {
    List<UserActivityLog> findByUserId(String userId);

    List<UserActivityLog> findByAction(String action);

    List<UserActivityLog> findByProductId(Long productId);

    List<UserActivityLog> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
}
