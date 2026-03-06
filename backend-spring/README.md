# Student Helper - Spring Boot Backend

This is the Spring Boot backend for the Student Helper application, migrated from Node.js/Express.

## Setup Instructions

1. **Prerequisites:**
   - Java 24 or higher
   - Maven 3.6+
   - MySQL 8.0+

2. **Database Setup:**
   - Create MySQL database: `student_helper`
   - Update `application.properties` with your MySQL credentials

3. **Environment Variables:**
   - Set Cloudinary credentials in `application.properties` or environment variables:
     - `CLOUDINARY_CLOUD_NAME`
     - `CLOUDINARY_API_KEY`
     - `CLOUDINARY_API_SECRET`

4. **Run the Application:**
   
   **Windows:**
   ```bash
   run.bat
   ```
   
   **Linux/Mac:**
   ```bash
   chmod +x run.sh
   ./run.sh
   ```
   
   **Or manually:**
   ```bash
   mvn spring-boot:run -Dspring-boot.run.jvmArguments="--enable-native-access=ALL-UNNAMED"
   ```
   
   **Note:** The `--enable-native-access=ALL-UNNAMED` JVM argument is required for Java 23+ to avoid warnings about restricted native access methods.

5. **API Endpoints:**
   - Health: `GET /api/health`
   - Auth: `/api/auth/*`
   - PG: `/api/pg/*`
   - Hostel: `/api/hostel/*`
   - Item: `/api/item/*`
   - Message: `/api/message/*`
   - User: `/api/user/*`
   - Distance: `/api/distance/*`

## Port
Default port: 5000 (matches Node.js backend)

## Features
- JWT Authentication
- Role-based access control (Student, Broker, HostelAdmin)
- File uploads via Cloudinary
- Distance calculation using OSRM
- Geocoding using Nominatim
- MySQL database with JPA/Hibernate

