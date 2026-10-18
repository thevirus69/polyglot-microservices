package com.example.payment.controller;

import com.example.payment.model.PaymentRequest;
import com.example.payment.model.PaymentResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
public class PaymentController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "payment-service");
        health.put("runtime", "Java " + System.getProperty("java.version") + " (Spring Boot 3)");
        health.put("timestamp", java.time.Instant.now().toString());
        return ResponseEntity.ok(health);
    }

    @PostMapping("/payments")
    public ResponseEntity<PaymentResponse> processPayment(@RequestBody PaymentRequest request) {
        if (request.getOrderId() == null || request.getAmount() == null || request.getAmount() <= 0) {
            return ResponseEntity.badRequest().build();
        }

        String transactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String runtimeInfo = "Java " + System.getProperty("java.version") + " (Spring Boot 3)";

        PaymentResponse response = new PaymentResponse(
                transactionId,
                request.getOrderId(),
                request.getAmount(),
                "APPROVED",
                runtimeInfo
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
