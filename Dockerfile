# Stage 1: Build the Spring Boot application
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY backend/pom.xml ./pom.xml
COPY backend/src ./src
RUN mvn package -DskipTests -B -f ./pom.xml

# Stage 2: Runtime with MySQL client tools
FROM eclipse-temurin:21-jre
WORKDIR /app

# Install MySQL client (provides mysqldump and mysql CLI)
RUN apt-get update && \
    apt-get install -y --no-install-recommends mysql-client && \
    rm -rf /var/lib/apt/lists/*

# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Create backups directory
RUN mkdir -p /app/backups

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
