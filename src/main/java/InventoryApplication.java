

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication
public class InventoryApplication {

    private static final Logger logger = LoggerFactory.getLogger(InventoryApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(InventoryApplication.class, args);
        logger.info("✓ Inventory Management System started successfully");
    }
}
