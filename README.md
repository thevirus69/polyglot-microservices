# Polyglot Microservices: Node.js + Python + Java with CI/CD

This repository is a complete, production-grade microservices project demonstrating how **Node.js**, **Python**, and **Java** applications are built, tested, containerized, and deployed using **GitHub Actions (100% Free)** and **Docker Compose**.

---

## 🏗️ Architecture

```
                       ┌────────────────────────┐
                       │      Client / cURL     │
                       └───────────┬────────────┘
                                   │ POST /orders
                                   ▼
                       ┌────────────────────────┐
                       │  Order Service (Node)  │  Port 3000
                       └─────┬────────────┬─────┘
                             │            │
            1. Check Stock   │            │ 2. Process Payment
                             ▼            ▼
      ┌───────────────────────────┐  ┌───────────────────────────┐
      │ Inventory Service (Python)│  │   Payment Service (Java)  │
      │         Port 8000         │  │         Port 8083         │
      └───────────────────────────┘  └───────────────────────────┘
```

| Service | Runtime & Framework | Port | Build Tool | CI Cache Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **Order Service** | Node.js 20 / Express | `3000` | `npm` | `~/.npm` via `package-lock.json` |
| **Inventory Service** | Python 3.12 / FastAPI | `8000` | `pip` | `~/.cache/pip` via `requirements.txt` |
| **Payment Service** | Java 17 / Spring Boot 3 | `8083` | Maven | `~/.m2/repository` via `pom.xml` |

---

## 🚀 Running Locally with Docker Compose

You can build and start all three microservices locally with one single command:

```bash
docker compose up --build
```

### 1. Test Service Health Endpoints
Open another terminal and verify each service runtime:

```bash
# Node.js Order Service
curl http://localhost:3000/health

# Python Inventory Service
curl http://localhost:8000/health

# Java Payment Service
curl http://localhost:8083/health
```

### 2. Test End-to-End Microservice Flow
Create an order through the Node.js API Gateway, which calls both Python and Java downstream:

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "ITEM-101",
    "quantity": 2,
    "amount": 199.98,
    "customerId": "CUST-42"
  }'
```

**Expected Response:**
```json
{
  "status": "CONFIRMED",
  "orderId": "ORD-...",
  "summary": {
    "item": "Mechanical Keyboard",
    "quantity": 2,
    "totalPaid": 199.98
  },
  "pipelineDetails": {
    "orderService": "Node.js (Express)",
    "inventoryService": "Python (FastAPI)",
    "paymentService": "Java 17 (Spring Boot)"
  },
  "paymentReceipt": {
    "transactionId": "TXN-...",
    "status": "APPROVED"
  }
}
```

---

## 🔄 CI/CD Pipeline (GitHub Actions)

The workflow file is located at [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml).

### Pipeline Stages
1. **Parallel Service Builds & Unit Tests:**
   * **Node.js Job:** Runs `npm ci`, lints, executes unit tests with Jest, builds Docker image.
   * **Python Job:** Sets up virtualenv, installs `requirements.txt`, runs `pytest`, builds Docker image.
   * **Java Job:** Sets up JDK 17 with Maven caching, runs `mvn clean verify`, builds multi-stage Docker image.
2. **Container Registry Publishing:**
   * Uses **GitHub Container Registry (`ghcr.io`)**, which is completely free for GitHub users. No third-party Docker Hub account or token is required.
3. **End-to-End Smoke Test:**
   * Spins up all three containers using `docker compose` directly on the GitHub Actions runner.
   * Runs an integration test against `http://localhost:3000/orders`.
   * Automatically shuts down the services upon completion.

---

## 🛠️ How to Deploy This to Your Own GitHub Repository

1. **Initialize Git inside this project folder:**
   ```bash
   cd polyglot-microservices
   git init
   git add .
   git commit -m "Initial commit of polyglot microservices CI/CD project"
   ```

2. **Create a new repository on GitHub:**
   * Go to [github.com/new](https://github.com/new) and name it `polyglot-microservices`.

3. **Link and Push:**
   ```bash
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/polyglot-microservices.git
   git push -u origin main
   ```

4. **Watch the Pipeline Run:**
   * Open your GitHub repository and click on the **Actions** tab.
   * Watch the three parallel builds (Java, Node.js, Python) followed by the integrated smoke test!
