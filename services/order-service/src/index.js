const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'http://localhost:8000';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:8083';

// Liveness & Readiness Health Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'order-service',
    runtime: `Node.js ${process.version}`,
    timestamp: new Date().toISOString()
  });
});

// Process Order (Orchestrates calls to Python and Java microservices)
app.post('/orders', async (req, res) => {
  const { itemId, quantity, amount, customerId } = req.body;

  if (!itemId || !quantity || !amount || !customerId) {
    return res.status(400).json({
      error: 'Missing required fields: itemId, quantity, amount, customerId'
    });
  }

  const orderId = `ORD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

  try {
    // 1. Call Python Inventory Service to check stock
    const inventoryRes = await fetch(`${INVENTORY_SERVICE_URL}/inventory/${itemId}`);
    if (!inventoryRes.ok) {
      return res.status(404).json({
        error: `Item ${itemId} not found in Inventory Service`,
        downstreamStatus: inventoryRes.status
      });
    }

    const inventoryData = await inventoryRes.json();
    if (inventoryData.stock < quantity) {
      return res.status(409).json({
        error: `Insufficient stock for ${itemId}. Available: ${inventoryData.stock}, requested: ${quantity}`
      });
    }

    // 2. Call Java Payment Service to process transaction
    const paymentRes = await fetch(`${PAYMENT_SERVICE_URL}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        amount,
        customerId
      })
    });

    if (!paymentRes.ok) {
      return res.status(502).json({
        error: 'Payment processing failed in Java Payment Service',
        downstreamStatus: paymentRes.status
      });
    }

    const paymentData = await paymentRes.json();

    // 3. Aggregate & Respond
    return res.status(201).json({
      status: 'CONFIRMED',
      orderId,
      summary: {
        item: inventoryData.name,
        quantity,
        totalPaid: amount
      },
      pipelineDetails: {
        orderService: `Node.js (${process.version})`,
        inventoryService: inventoryData.runtime || 'Python (FastAPI)',
        paymentService: paymentData.runtime || 'Java 17 (Spring Boot)'
      },
      paymentReceipt: {
        transactionId: paymentData.transactionId,
        status: paymentData.status
      }
    });

  } catch (err) {
    console.error('Order orchestration error:', err.message);
    return res.status(503).json({
      error: 'Service communication error',
      details: err.message
    });
  }
});

let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`[OrderService] Node.js server running on port ${PORT}`);
  });

  // Graceful shutdown handling for Docker & Kubernetes
  const shutdown = (signal) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

module.exports = app;
