package com.inventory.service;

import com.inventory.model.Product;
import com.inventory.repository.jpa.ProductRepository;
import com.inventory.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ProductService {

    private static final Logger logger = LoggerFactory.getLogger(ProductService.class);

    @Autowired
    private ProductRepository productRepository;

    // Create
    public Product createProduct(Product product) {
        logger.info("Creating product: {}", product.getName());
        return productRepository.save(product);
    }

    // Read
    public Product getProductById(Long id) {
        logger.info("Fetching product with ID: {}", id);
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
    }

    public Product getProductBySku(String sku) {
        logger.info("Fetching product with SKU: {}", sku);
        return productRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with SKU: " + sku));
    }

    public List<Product> getAllProducts() {
        logger.info("Fetching all products");
        return productRepository.findAll();
    }

    public List<Product> getProductsByCategory(String category) {
        logger.info("Fetching products by category: {}", category);
        return productRepository.findByCategory(category);
    }

    public List<Product> searchProducts(String keyword) {
        logger.info("Searching products with keyword: {}", keyword);
        return productRepository.findByNameContainingIgnoreCase(keyword);
    }

    // Update
    public Product updateProduct(Long id, Product productDetails) {
        logger.info("Updating product with ID: {}", id);
        Product product = getProductById(id);

        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setPrice(productDetails.getPrice());
        product.setSku(productDetails.getSku());
        product.setCategory(productDetails.getCategory());
        product.setImageUrl(productDetails.getImageUrl());
        product.setQuantity(productDetails.getQuantity());

        if (product.getQuantity() <= 0) {
            product.setStatus("OUT_OF_STOCK");
        } else {
            product.setStatus("IN_STOCK");
        }

        return productRepository.save(product);
    }

    // Delete
    public void deleteProduct(Long id) {
        logger.info("Deleting product with ID: {}", id);
        Product product = getProductById(id);
        productRepository.delete(product);
        logger.info("Product deleted successfully");
    }

    // Inventory Management
    public Product updateInventory(Long id, Integer quantity) {
        logger.info("Updating inventory for product ID: {} with quantity: {}", id, quantity);
        Product product = getProductById(id);
        int newQuantity = product.getQuantity() + quantity;
        product.setQuantity(newQuantity);

        if (newQuantity <= 0) {
            product.setStatus("OUT_OF_STOCK");
        } else {
            product.setStatus("IN_STOCK");
        }

        return productRepository.save(product);
    }

    public boolean isInStock(Long id) {
        Product product = getProductById(id);
        return product.getQuantity() > 0;
    }

    @Autowired
    private com.inventory.repository.jpa.OrderRepository orderRepository;

    public List<com.inventory.model.Order> getAllOrders() {
        return orderRepository.findAll();
    }
}
