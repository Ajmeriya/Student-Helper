#!/bin/bash
# Run Spring Boot application with Java 23/24 JVM arguments
echo "Starting Spring Boot application with Java 23..."
mvn spring-boot:run -Dspring-boot.run.jvmArguments="--enable-native-access=ALL-UNNAMED"

