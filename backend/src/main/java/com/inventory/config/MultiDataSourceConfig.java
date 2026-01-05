package com.inventory.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableJpaRepositories(basePackages = "com.inventory.repository.jpa")
@EnableMongoRepositories(basePackages = "com.inventory.repository.mongo")
public class MultiDataSourceConfig {
        // This configuration explicitly enables both JPA and MongoDB repositories.
        // Specifying basePackageClasses ensures strict separation of potential scanning
        // conflicts.
}
