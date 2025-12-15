# E-Commerce Inventory Management System

## Project Overview

A production-ready inventory management system built with Java, Spring Boot, Docker, and Jenkins. This system manages product inventory for an e-commerce platform.

## Tech Stack

- **Backend**: Java 17 + Spring Boot 3.2
- **Database**: MySQL 8.0
- **Build**: Maven 3.9+
- **Containerization**: Docker & Docker Compose
- **CI/CD**: Jenkins
- **Version Control**: Git

## Quick Start

### Prerequisites
```bash
java -version    # Java 17+
mvn -version     # Maven 3.8+
docker --version
git --version
```

### Local Development

```bash
# Clone repository
git clone https://github.com/06bhavi/ecommerce-inventory-system.git
cd ecommerce-inventory-system

# Build & Run
mvn clean package
mvn spring-boot:run

# Access application
# http://localhost:8080
```

### Using Docker

```bash
# Start services
docker-compose up -d

# Check status
docker-compose ps

# Test API
curl http://localhost:8080/api/v1/products/health

# Stop services
docker-compose down
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/products` | List all products |
| GET | `/api/v1/products/{id}` | Get product by ID |
| GET | `/api/v1/products/sku/{sku}` | Get by SKU |
| GET | `/api/v1/products/category/{cat}` | Get by category |
| POST | `/api/v1/products` | Create product |
| PUT | `/api/v1/products/{id}` | Update product |
| DELETE | `/api/v1/products/{id}` | Delete product |
| PATCH | `/api/v1/products/{id}/inventory` | Update inventory |
| GET | `/api/v1/products/health` | Health check |

### Example Request

```bash
# Create product
curl -X POST http://localhost:8090/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "description": "Gaming Laptop",
    "price": 1299.99,
    "quantity": 50,
    "sku": "LAP-001",
    "category": "Electronics"
  }'

# Get all products
curl http://localhost:8080/api/v1/products

# Update inventory (add 5 units)
curl -X PATCH http://localhost:8080/api/v1/products/1/inventory?quantity=5
```

## Database Schema

```sql
CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    sku VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Project Structure

```
ecommerce-inventory-system/
├── src/main/java/com/inventory/
│   ├── controller/          # REST endpoints
│   ├── service/             # Business logic
│   ├── model/               # JPA entities
│   ├── repository/          # Database access
│   └── exception/           # Error handling
├── docker/                  # Docker scripts
├── jenkins/                 # Jenkins config
├── linux-scripts/           # Helper scripts
├── Dockerfile               # Container image
├── docker-compose.yml       # Services orchestration
├── Jenkinsfile              # CI/CD pipeline
├── pom.xml                  # Maven dependencies
├── init.sql                 # Database initialization
└── README.md
```

## Jenkins CI/CD

### Setup Jenkins

```bash
bash jenkins/setup-jenkins.sh
# Access: http://localhost:8081
```

### Pipeline Stages

1. Checkout - Clone from Git
2. Build - Maven compilation
3. Test - Unit tests
4. Package - Create JAR
5. Build Docker - Build image
6. Test Docker - Test container
7. Report - Generate report

### Create Job

1. Jenkins Dashboard → New Item
2. Name: `inventory-devops-pipeline`
3. Type: Pipeline
4. Configure:
   - Definition: Pipeline script from SCM
   - SCM: Git
   - Repository: `https://github.com/06bhavi/ecommerce-inventory-system.git`
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`
5. Build Now

## Configuration

### application.properties

```properties
spring.application.name=Inventory Management System
server.port=8080

spring.datasource.url=jdbc:mysql://localhost:3306/inventory_db
spring.datasource.username=root
spring.datasource.password=root123

spring.jpa.hibernate.ddl-auto=update
logging.level.com.inventory=DEBUG
```

## Testing

```bash
# Unit tests
mvn test

# Build & test locally
mvn clean package

# Docker test
docker-compose up -d
curl http://localhost:8080/api/v1/products/health
docker-compose down
```

## Helper Scripts

```bash
# Maven build
bash linux-scripts/maven-build.sh

# Health check
bash linux-scripts/health-check.sh

# View logs
bash linux-scripts/check-logs.sh

# Final verification
bash linux-scripts/final-check.sh
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 8080 in use | Change port in `application.properties` |
| MySQL connection error | Check `docker-compose ps` |
| Maven build fails | Run `mvn clean install` |
| Jenkins won't start | Run `bash jenkins/setup-jenkins.sh` |
| Docker build fails | Check `docker build -t inventory-app:1.0.0 .` |

## Development Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes & test
mvn clean package
docker-compose up -d

# Commit & push
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# Jenkins builds automatically
# Merge to main when ready
```

## Performance Tips

- Use indexes on sku, category columns
- Implement pagination for large datasets
- Enable database connection pooling
- Monitor query performance
- Use caching for frequent reads

## Security

- ✅ Store secrets in environment variables
- ✅ Validate all input data
- ✅ Use strong database passwords
- ✅ Implement authentication
- ✅ Use HTTPS in production

## Future Enhancements

- [ ] User authentication
- [ ] Order management
- [ ] Payment integration
- [ ] Email notifications
- [ ] Kubernetes deployment
- [ ] Redis caching
- [ ] Prometheus monitoring
- [ ] GraphQL API

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License - See LICENSE file

## Author

**Bhavini Ajmera**

- GitHub: [@06bhavi](https://github.com/06bhavi)
- Email: bhavini765@gmail.com

## Support

- GitHub Issues: [Create Issue](https://github.com/06bhavi/ecommerce-inventory-system/issues)
- API Docs: http://localhost:8080
- Jenkins: http://localhost:8081

---

**Status**: ✅ Production Ready | **Last Updated**: December 14, 2025
