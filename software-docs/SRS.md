# Software Requirements Specification (SRS)

## 1. Introduction

### 1.1 Purpose
This document defines the software requirements for the Student Helper platform backend. It is intended for project guides, developers, testers, and evaluators.

### 1.2 Scope
Student Helper is a role-based platform for students to:
- find PG and hostel accommodations,
- buy and sell second-hand items,
- communicate with other users,
- calculate location/distance for decision support,
- perform booking/purchase payments.

The backend is implemented in Spring Boot and exposes REST APIs consumed by the frontend.

### 1.3 Definitions and Acronyms
- `PG`: Paying Guest accommodation listing
- `JWT`: JSON Web Token
- `RBAC`: Role-Based Access Control
- `SRS`: Software Requirements Specification
- `API`: Application Programming Interface

### 1.4 References
- `backend-spring/pom.xml`
- `backend-spring/src/main/resources/application.properties`
- Controller classes under `backend-spring/src/main/java/com/studenthelper/controller`
- Entity classes under `backend-spring/src/main/java/com/studenthelper/entity`

## 2. Overall Description

### 2.1 Product Perspective
The backend follows layered architecture:
- Controller layer (`/api/*` REST endpoints)
- Service layer (business logic)
- Repository layer (Spring Data JPA)
- Database layer (MySQL)

External integrations:
- Cloudinary (media upload)
- Geocoding and distance services (Nominatim/OSRM via utility/service layer)
- Razorpay-compatible payment flow (create-order, verify)

### 2.2 Product Functions
- Authentication and authorization with JWT
- Role-based user management (`student`, `broker`, `hostelAdmin`)
- PG listing CRUD and filtering
- Hostel listing CRUD and filtering
- Marketplace item posting and browsing
- Messaging between users
- Distance/geocoding utility APIs
- Payment order creation, verification, and payment history
- User profile retrieval and update

### 2.3 User Classes and Characteristics
- Student:
  - Browses PG/hostel listings
  - Posts marketplace items
  - Chats and pays for bookings/purchases
- Broker:
  - Manages own PG listings
  - Receives payments related to owned resources
- Hostel Admin:
  - Manages own hostel listings
  - Receives payments related to owned resources
- Admin/Developer (operational role):
  - Deploys, configures, monitors backend services

### 2.4 Operating Environment
- Java 23+
- Spring Boot 3.3.x
- MySQL 8+
- Maven 3.6+
- OS: Windows/Linux (development and deployment)

### 2.5 Constraints
- API is stateless and token-based
- Database schema and entities are JPA-driven
- Role-based access constraints enforced in selected endpoints
- File/media handling depends on cloud credentials

### 2.6 Assumptions and Dependencies
- MySQL is reachable and configured
- JWT secret/expiration are configured
- Cloudinary credentials are valid for upload features
- Payment mode and provider credentials are configured per environment

## 3. External Interface Requirements

### 3.1 User Interfaces
Frontend web client consumes REST APIs and shows module-specific dashboards based on role.

### 3.2 Hardware Interfaces
No dedicated hardware interfaces.

### 3.3 Software Interfaces
- MySQL (`student_helper` database)
- Cloudinary API (media upload)
- Geocoding and routing services
- Payment gateway integration

### 3.4 Communication Interfaces
- HTTP/HTTPS JSON APIs
- Multipart/form-data for media upload endpoints

## 4. System Features and Functional Requirements

### 4.1 Authentication Module (`/api/auth`)
- `FR-AUTH-01`: System shall allow user signup with role-based profile data.
- `FR-AUTH-02`: System shall allow user login using email and password.
- `FR-AUTH-03`: System shall issue JWT token on successful authentication.
- `FR-AUTH-04`: System shall return current authenticated user via `/api/auth/me`.

### 4.2 User Profile Module (`/api/user`)
- `FR-USER-01`: System shall return authenticated user profile.
- `FR-USER-02`: System shall allow profile updates for authenticated user.
- `FR-USER-03`: System shall fetch public/basic user data by user ID.

### 4.3 PG Module (`/api/pg`)
- `FR-PG-01`: System shall list PG records with filters.
- `FR-PG-02`: System shall return PG details by ID.
- `FR-PG-03`: System shall allow only `BROKER` role to create PG.
- `FR-PG-04`: System shall allow broker to update own PG details and media.
- `FR-PG-05`: System shall allow broker to delete own PG.
- `FR-PG-06`: System shall return broker-specific PGs (`/my-pgs`).
- `FR-PG-07`: System shall allow broker to update listing status (`available`, `sold`, `onRent`).

### 4.4 Hostel Module (`/api/hostel`)
- `FR-HOSTEL-01`: System shall list hostel records with filters.
- `FR-HOSTEL-02`: System shall return hostel details by ID.
- `FR-HOSTEL-03`: System shall allow only `HOSTEL_ADMIN` role to create hostel.
- `FR-HOSTEL-04`: System shall allow hostel admin to update own hostel.
- `FR-HOSTEL-05`: System shall allow hostel admin to delete own hostel.
- `FR-HOSTEL-06`: System shall return admin-specific hostels (`/my-hostels`).

### 4.5 Marketplace Item Module (`/api/item`)
- `FR-ITEM-01`: System shall list item records with filters.
- `FR-ITEM-02`: System shall return item details by ID.
- `FR-ITEM-03`: System shall allow authenticated student to create item listing with optional images.
- `FR-ITEM-04`: System shall return authenticated student's own item listings.

### 4.6 Messaging Module (`/api/message`)
- `FR-MSG-01`: System shall list user conversations.
- `FR-MSG-02`: System shall list messages between authenticated user and another user.
- `FR-MSG-03`: System shall allow sending message with optional context (`pg`, `hostel`, `item`).
- `FR-MSG-04`: System shall return unread message count.
- `FR-MSG-05`: System shall allow authorized deletion of message.

### 4.7 Distance Module (`/api/distance`)
- `FR-DIST-01`: System shall geocode address and return coordinates.
- `FR-DIST-02`: System shall validate latitude/longitude inputs.
- `FR-DIST-03`: System shall calculate distance and duration between points.

### 4.8 Payment Module (`/api/payment`)
- `FR-PAY-01`: System shall create payment order for supported payment type.
- `FR-PAY-02`: System shall verify payment signature/status.
- `FR-PAY-03`: System shall return payer-side payment history.
- `FR-PAY-04`: System shall return receiver-side payment history.

### 4.9 Health Module (`/api/health`)
- `FR-HEALTH-01`: System shall expose service health endpoint.

## 5. Non-Functional Requirements

### 5.1 Security
- `NFR-SEC-01`: Passwords shall never be returned in API responses.
- `NFR-SEC-02`: Authenticated endpoints shall require valid JWT.
- `NFR-SEC-03`: Role restrictions shall be enforced for protected operations.
- `NFR-SEC-04`: Sensitive secrets shall be configurable via environment variables.

### 5.2 Performance
- `NFR-PERF-01`: Common list APIs should respond within acceptable latency under normal load.
- `NFR-PERF-02`: Pagination/filtering should be supported and optimized at query level where required.

### 5.3 Reliability and Availability
- `NFR-REL-01`: API shall return structured error responses for recoverable failures.
- `NFR-REL-02`: Service shall recover safely after restarts with persistent data in MySQL.

### 5.4 Maintainability
- `NFR-MAIN-01`: Code shall follow layered architecture separation.
- `NFR-MAIN-02`: DTOs shall isolate API contract from persistence entities.

### 5.5 Portability
- `NFR-PORT-01`: Application shall run on standard JVM environments supporting Java 23+.
- `NFR-PORT-02`: Configuration shall support local and cloud deployment.

## 6. Data Requirements

### 6.1 Core Entities
- User
- PG
- Hostel
- Item
- Message
- Payment

### 6.2 Key Relationships
- One User can own many PG listings.
- One User can own many Hostel listings.
- One User can sell many Item listings.
- Messages link sender and receiver users.
- Payments link payer and optional receiver and target resource (PG/Hostel/Item).

## 7. Validation and Acceptance Criteria
- Authentication, role restrictions, and protected endpoints behave as specified.
- CRUD/list operations for PG/Hostel/Item work with valid payloads.
- Messaging and payment endpoints return consistent responses.
- Distance/geocoding endpoints validate inputs and handle errors.
- Health endpoint confirms service availability.

## 8. Future Scope (Optional)
- Real-time messaging via WebSocket
- Review/rating module for accommodations and sellers
- Advanced analytics and recommendation engine
- Notification service (email/SMS/push)
