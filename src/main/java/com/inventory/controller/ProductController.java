package com.inventory.controller;

import com.inventory.model.Product;
import com.inventory.service.ProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/products")
@CrossOrigin("*")
public class ProductController {

    private static final Logger logger = LoggerFactory.getLogger(ProductController.class);

    @Autowired
    private ProductService productService;

    // Create Product
    @PostMapping
    public ResponseEntity<Map<String, Object>> createProduct(@Valid @RequestBody Product product) {
        logger.info("POST /api/v1/products - Creating new product");
        Product createdProduct = productService.createProduct(product);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Product created successfully");
        response.put("data", createdProduct);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Get All Products
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllProducts() {
        logger.info("GET /api/v1/products - Fetching all products");
        List<Product> products = productService.getAllProducts();

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("count", products.size());
        response.put("data", products);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Get Product by ID
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getProductById(@PathVariable Long id) {
        logger.info("GET /api/v1/products/{} - Fetching product by ID", id);
        Product product = productService.getProductById(id);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", product);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Get Product by SKU
    @GetMapping("/sku/{sku}")
    public ResponseEntity<Map<String, Object>> getProductBySku(@PathVariable String sku) {
        logger.info("GET /api/v1/products/sku/{} - Fetching product by SKU", sku);
        Product product = productService.getProductBySku(sku);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", product);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Get Products by Category
    @GetMapping("/category/{category}")
    public ResponseEntity<Map<String, Object>> getProductsByCategory(@PathVariable String category) {
        logger.info("GET /api/v1/products/category/{} - Fetching products by category", category);
        List<Product> products = productService.getProductsByCategory(category);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("count", products.size());
        response.put("data", products);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Search Products
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchProducts(@RequestParam String keyword) {
        logger.info("GET /api/v1/products/search?keyword={} - Searching products", keyword);
        List<Product> products = productService.searchProducts(keyword);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("count", products.size());
        response.put("data", products);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Update Product
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody Product productDetails) {
        logger.info("PUT /api/v1/products/{} - Updating product", id);
        Product updatedProduct = productService.updateProduct(id, productDetails);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Product updated successfully");
        response.put("data", updatedProduct);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Delete Product
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteProduct(@PathVariable Long id) {
        logger.info("DELETE /api/v1/products/{} - Deleting product", id);
        productService.deleteProduct(id);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Product deleted successfully");

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Update Inventory
    @PatchMapping("/{id}/inventory")
    public ResponseEntity<Map<String, Object>> updateInventory(
            @PathVariable Long id,
            @RequestParam Integer quantity) {
        logger.info("PATCH /api/v1/products/{}/inventory - Updating inventory", id);
        Product updatedProduct = productService.updateInventory(id, quantity);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Inventory updated successfully");
        response.put("data", updatedProduct);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Health Check
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("application", "Inventory Management System");
        response.put("version", "1.0.0");
        return ResponseEntity.ok(response);
    }
}
