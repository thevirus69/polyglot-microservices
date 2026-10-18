package com.example.payment.model;

import java.time.Instant;

public class PaymentResponse {
    private String transactionId;
    private String orderId;
    private Double amount;
    private String status;
    private String runtime;
    private String timestamp;

    public PaymentResponse() {
    }

    public PaymentResponse(String transactionId, String orderId, Double amount, String status, String runtime) {
        this.transactionId = transactionId;
        this.orderId = orderId;
        this.amount = amount;
        this.status = status;
        this.runtime = runtime;
        this.timestamp = Instant.now().toString();
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRuntime() {
        return runtime;
    }

    public void setRuntime(String runtime) {
        this.runtime = runtime;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}
