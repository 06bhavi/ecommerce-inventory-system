FROM maven:3.9-eclipse-temurin-17 AS builder

LABEL maintainer="DevOps Team"
LABEL version="1.0"
LABEL description="Build stage for Java application"

WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jdk-alpine
LABEL maintainer="DevOps Team"
LABEL version="1.0"

WORKDIR /app
RUN apk add --no-cache curl
COPY --from=builder /app/target/inventory-management-system-1.0.0.jar app.jar
EXPOSE 8080
ENV JAVA_OPTS="-Xms256m -Xmx512m"
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/api/v1/products/health || exit 1
ENTRYPOINT exec java $JAVA_OPTS -jar app.jar
