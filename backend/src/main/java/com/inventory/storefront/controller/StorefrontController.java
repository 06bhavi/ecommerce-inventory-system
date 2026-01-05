package com.inventory.storefront.controller;

import com.inventory.model.Product;
import com.inventory.storefront.dto.OrderRequest;
import com.inventory.storefront.dto.OrderResponse;
import com.inventory.storefront.service.StorefrontService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class StorefrontController {

    private final StorefrontService storefrontService;

    @Autowired
    public StorefrontController(StorefrontService storefrontService) {
        this.storefrontService = storefrontService;
    }

    @GetMapping("/storefront/products")
    public ResponseEntity<Page<Product>> getProducts(Pageable pageable) {
        return ResponseEntity.ok(storefrontService.getProducts(pageable));
    }

    @GetMapping("/storefront/products/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(storefrontService.getProduct(id));
    }

    @PostMapping("/orders")
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderRequest request) {
        OrderResponse response = storefrontService.createOrder(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(storefrontService.getOrder(id));
    }

    @GetMapping("/storefront/my-orders")
    public ResponseEntity<java.util.List<OrderResponse>> getMyOrders(@RequestParam String email) {
        return ResponseEntity.ok(storefrontService.getOrdersByEmail(email));
    }
}
