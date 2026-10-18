# Stage 1: Build JAR using Maven and JDK 17
FROM maven:3.9-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# Cache dependencies layer
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build executable fat JAR
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Lightweight JRE Runtime (Zero build tools, small footprint)
FROM eclipse-temurin:17-jre-alpine AS runner

WORKDIR /app

# Security: Create non-root system user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy the built JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar
RUN chown -R appuser:appgroup /app

USER appuser
EXPOSE 8083

# JVM container-aware memory allocation flags
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
