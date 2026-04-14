# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy the pom.xml and download dependencies
# This is done first so that dependencies are cached and don't need to be redownloaded
# as long as the pom.xml remains unchanged
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy the actual source code
COPY src ./src

# Build the application, skipping tests to speed up the deployment
RUN mvn clean package -DskipTests

# Stage 2: Create a lightweight image for running the application
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the built JAR file from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the port (Render sets the PORT environment variable)
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
