package com.sangam.sangam.config;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.SQLException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.context.annotation.Configuration;

import com.zaxxer.hikari.HikariDataSource;

@Configuration
public class DatabaseDiagnosticConfig implements BeanPostProcessor {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseDiagnosticConfig.class);
    private static final Pattern USER_PASS_PATTERN = Pattern.compile("://([^:@]+):([^@]+)@");

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        if (bean instanceof DataSource dataSource) {
            runSafeDiagnostics(dataSource);
        }
        return bean;
    }

    private void runSafeDiagnostics(DataSource dataSource) {
        logger.info("==================== DATABASE STARTUP DIAGNOSTICS ====================");

        String rawUrl = "UNKNOWN";
        String username = "UNKNOWN";
        String driverClass = "UNKNOWN";
        boolean hasPassword = false;
        int passwordLength = 0;

        if (dataSource instanceof HikariDataSource hikariDs) {
            rawUrl = hikariDs.getJdbcUrl();
            username = hikariDs.getUsername();
            driverClass = hikariDs.getDriverClassName();
            String pwd = hikariDs.getPassword();
            if (pwd != null && !pwd.isEmpty()) {
                hasPassword = true;
                passwordLength = pwd.length();
            }
        }

        String sanitizedUrl = sanitizeJdbcUrl(rawUrl);

        logger.info("[DB DIAGNOSTIC] Driver Class: {}", driverClass);
        logger.info("[DB DIAGNOSTIC] Sanitized JDBC URL: {}", sanitizedUrl);
        logger.info("[DB DIAGNOSTIC] Database Username: {}", username);
        logger.info("[DB DIAGNOSTIC] DB_PASSWORD configured: {} (length: {})", hasPassword, passwordLength);

        // Raw JDBC Connection Probe
        logger.info("[DB DIAGNOSTIC] Testing raw JDBC connection to database...");
        try (Connection conn = dataSource.getConnection()) {
            DatabaseMetaData metaData = conn.getMetaData();
            logger.info("[DB DIAGNOSTIC] >>> CONNECTION SUCCESSFUL <<<");
            logger.info("[DB DIAGNOSTIC] Database Product: {} {}",
                    metaData.getDatabaseProductName(),
                    metaData.getDatabaseProductVersion());
            logger.info("[DB DIAGNOSTIC] JDBC Driver: {} {}",
                    metaData.getDriverName(),
                    metaData.getDriverVersion());
            logger.info("[DB DIAGNOSTIC] Database URL (from metadata): {}",
                    sanitizeJdbcUrl(metaData.getURL()));
        } catch (SQLException e) {
            logger.error("[DB DIAGNOSTIC] >>> CONNECTION FAILED <<<");
            logger.error("[DB DIAGNOSTIC] Root Exception Class: {}", e.getClass().getName());
            logger.error("[DB DIAGNOSTIC] SQL Error Message: {}", e.getMessage());
            logger.error("[DB DIAGNOSTIC] SQLState: {}", e.getSQLState());
            logger.error("[DB DIAGNOSTIC] Vendor ErrorCode: {}", e.getErrorCode());
            if (e.getCause() != null) {
                logger.error("[DB DIAGNOSTIC] Underlying Cause: {} - {}",
                        e.getCause().getClass().getName(),
                        e.getCause().getMessage());
            }
        } catch (Exception e) {
            logger.error("[DB DIAGNOSTIC] Unexpected probe error: {} - {}",
                    e.getClass().getName(),
                    e.getMessage());
        }

        logger.info("======================================================================");
    }

    private String sanitizeJdbcUrl(String url) {
        if (url == null) {
            return "null";
        }
        Matcher matcher = USER_PASS_PATTERN.matcher(url);
        if (matcher.find()) {
            return matcher.replaceAll("://$1:******@");
        }
        return url;
    }
}
