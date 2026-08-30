# Build stage using Eclipse Temurin JDK 21
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app

# Copy Maven wrapper and dependencies configuration
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Ensure Maven wrapper is executable
RUN chmod +x ./mvnw

# Copy backend source code
COPY src/ src/

# Build application JAR, skipping tests
RUN ./mvnw clean package -DskipTests

# Runtime stage using Eclipse Temurin JRE 21
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy the generated JAR from the build stage
COPY --from=builder /app/target/*.jar app.jar

# Render assigns a dynamic port via the PORT environment variable
ENV PORT=8080
EXPOSE 8080

# Execute Spring Boot JAR using Render's PORT environment variable
ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT:-8080}"]
