package com.inventory.config;

import com.inventory.model.Product;
import com.inventory.repository.jpa.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.Arrays;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner initData(ProductRepository productRepository) {
        return args -> {
            if (productRepository.count() == 0) {
                System.out.println("No products found. Seeding database...");

                Product p1 = new Product();
                p1.setName("Laptop Pro");
                p1.setDescription("High-performance laptop for professionals with 16GB RAM and 512GB SSD.");
                p1.setPrice(new BigDecimal("1299.99"));
                p1.setQuantity(50);
                p1.setSku("LAP-001");
                p1.setCategory("Electronics");
                p1.setImageUrl(
                        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60");
                p1.setStatus("IN_STOCK");

                Product p2 = new Product();
                p2.setName("Wireless Mouse");
                p2.setDescription("Ergonomic wireless mouse with precision tracking.");
                p2.setPrice(new BigDecimal("29.99"));
                p2.setQuantity(200);
                p2.setSku("MOU-001");
                p2.setCategory("Accessories");
                p2.setImageUrl(
                        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60");
                p2.setStatus("IN_STOCK");

                Product p3 = new Product();
                p3.setName("USB-C Hub");
                p3.setDescription("Multi-port USB-C hub with HDMI, USB 3.0, and SD card reader.");
                p3.setPrice(new BigDecimal("49.99"));
                p3.setQuantity(150);
                p3.setSku("HUB-001");
                p3.setCategory("Accessories");
                p3.setImageUrl(
                        "https://images.unsplash.com/photo-1616239162891-cb3c9a6296cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"); // fixed
                                                                                                                                        // broken
                                                                                                                                        // url
                p3.setStatus("IN_STOCK");

                Product p4 = new Product();
                p4.setName("Monitor 4K");
                p4.setDescription("27-inch 4K UltraHD monitor for stunning visuals.");
                p4.setPrice(new BigDecimal("399.99"));
                p4.setQuantity(30);
                p4.setSku("MON-001");
                p4.setCategory("Electronics");
                p4.setImageUrl(
                        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60");
                p4.setStatus("IN_STOCK");

                Product p5 = new Product();
                p5.setName("Mechanical Keyboard");
                p5.setDescription("RGB mechanical gaming keyboard with blue switches.");
                p5.setPrice(new BigDecimal("149.99"));
                p5.setQuantity(80);
                p5.setSku("KEY-001");
                p5.setCategory("Accessories");
                p5.setImageUrl(
                        "https://images.unsplash.com/photo-1587829741301-3231756c5139?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60");
                p5.setStatus("IN_STOCK");

                productRepository.saveAll(Arrays.asList(p1, p2, p3, p4, p5));
                System.out.println("Database seeded with " + productRepository.count() + " products.");
            }
        };
    }
}
