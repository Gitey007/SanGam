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
import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class DatabaseDiagnosticConfig implements BeanPostProcessor {

    private static final Pattern USER_PASS_PATTERN = Pattern.compile("://([^:@]+):([^@]+)@");

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        if (bean instanceof DataSource dataSource) {
            runSafeDiagnostics(dataSource);
        }
        return bean;
    }

    private void runSafeDiagnostics(DataSource dataSource) {
        log.info("==================== DATABASE STARTUP DIAGNOSTICS ====================");

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

        log.info("[DB DIAGNOSTIC] Driver Class: {}", driverClass);
        log.info("[DB DIAGNOSTIC] Sanitized JDBC URL: {}", sanitizedUrl);
        log.info("[DB DIAGNOSTIC] Database Username: {}", username);
        log.info("[DB DIAGNOSTIC] DB_PASSWORD configured: {} (length: {})", hasPassword, passwordLength);

        // Raw JDBC Connection Probe
        log.info("[DB DIAGNOSTIC] Testing raw JDBC connection to database...");
        try (Connection conn = dataSource.getConnection()) {
            DatabaseMetaData metaData = conn.getMetaData();
            log.info("[DB DIAGNOSTIC] >>> CONNECTION SUCCESSFUL <<<");
            log.info("[DB DIAGNOSTIC] Database Product: {} {}",
                    metaData.getDatabaseProductName(),
                    metaData.getDatabaseProductVersion());
            log.info("[DB DIAGNOSTIC] JDBC Driver: {} {}",
                    metaData.getDriverName(),
                    metaData.getDriverVersion());
            log.info("[DB DIAGNOSTIC] Database URL (from metadata): {}",
                    sanitizeJdbcUrl(metaData.getURL()));
        } catch (SQLException e) {
            log.error("[DB DIAGNOSTIC] >>> CONNECTION FAILED <<<");
            log.error("[DB DIAGNOSTIC] Root Exception Class: {}", e.getClass().getName());
            log.error("[DB DIAGNOSTIC] SQL Error Message: {}", e.getMessage());
            log.error("[DB DIAGNOSTIC] SQLState: {}", e.getSQLState());
            log.error("[DB DIAGNOSTIC] Vendor ErrorCode: {}", e.getErrorCode());
            if (e.getCause() != null) {
                log.error("[DB DIAGNOSTIC] Underlying Cause: {} - {}",
                        e.getCause().getClass().getName(),
                        e.getCause().getMessage());
            }
        } catch (Exception e) {
            log.error("[DB DIAGNOSTIC] Unexpected probe error: {} - {}",
                    e.getClass().getName(),
                    e.getMessage());
        }

        log.info("======================================================================");
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
