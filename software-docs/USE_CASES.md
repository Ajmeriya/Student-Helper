# Use Case Specification

## 1. Actors
- Student
- Broker
- Hostel Admin
- External System Services (Cloudinary, Payment Gateway, Geocoding/Distance Service)

## 2. Student Use Cases

### UC-STU-01: Register and Login
- Primary Actor: Student
- Preconditions: Student has valid email/phone.
- Main Flow:
1. Student submits signup data.
2. System validates input and creates account.
3. Student logs in with email/password.
4. System returns JWT token.
- Postconditions: Student is authenticated.

### UC-STU-02: Browse PG and Hostel Listings
- Primary Actor: Student
- Main Flow:
1. Student requests listing pages.
2. System applies filters (city, price, features).
3. System returns matching listings.
- Postconditions: Student views shortlist.

### UC-STU-03: View Listing Details
- Primary Actor: Student
- Main Flow:
1. Student selects PG/Hostel by ID.
2. System returns detailed data including media and owner context.
- Postconditions: Student can decide next action.

### UC-STU-04: Post Marketplace Item
- Primary Actor: Student
- Preconditions: Student is authenticated with `student` role.
- Main Flow:
1. Student submits item data and optional images.
2. System uploads images and stores listing.
3. System returns created item details.
- Postconditions: Item is visible in marketplace.

### UC-STU-05: Chat with Another User
- Primary Actor: Student
- Main Flow:
1. Student opens conversations.
2. Student sends message to target user.
3. System stores and returns message status.
- Alternate Flow: Unauthorized user receives 401.
- Postconditions: Conversation updated.

### UC-STU-06: Create and Verify Payment
- Primary Actor: Student
- Main Flow:
1. Student initiates payment for booking/purchase.
2. System creates payment order.
3. Payment callback/client submits verification payload.
4. System verifies and updates payment status.
- Postconditions: Payment status stored and retrievable.

### UC-STU-07: Manage Profile
- Primary Actor: Student
- Main Flow:
1. Student fetches own profile.
2. Student updates editable profile fields.
3. System validates and saves updates.
- Postconditions: Updated profile returned.

## 3. Broker Use Cases

### UC-BRK-01: Create PG Listing
- Primary Actor: Broker
- Preconditions: Authenticated user with `BROKER` role.
- Main Flow:
1. Broker submits PG form with media.
2. System uploads media and creates PG record.
- Postconditions: PG listing created.

### UC-BRK-02: Update/Delete Own PG
- Primary Actor: Broker
- Main Flow:
1. Broker requests update/delete on owned PG.
2. System validates ownership.
3. System applies requested change.
- Postconditions: Listing updated or removed.

### UC-BRK-03: Update PG Status
- Primary Actor: Broker
- Main Flow:
1. Broker sends status (`available`, `sold`, `onRent`).
2. System validates status value.
3. System updates PG status and related metadata.
- Postconditions: Status reflects market availability.

### UC-BRK-04: View Received Payments
- Primary Actor: Broker
- Main Flow:
1. Broker requests received payments.
2. System returns payment records where broker is receiver.
- Postconditions: Broker can track income.

## 4. Hostel Admin Use Cases

### UC-HAD-01: Create Hostel Listing
- Primary Actor: Hostel Admin
- Preconditions: Authenticated user with `HOSTEL_ADMIN` role.
- Main Flow:
1. Admin submits hostel details and media.
2. System stores hostel and links it to admin.
- Postconditions: Hostel listing created.

### UC-HAD-02: Update/Delete Own Hostel
- Primary Actor: Hostel Admin
- Main Flow:
1. Admin updates or deletes owned hostel.
2. System validates authorization and ownership.
- Postconditions: Hostel information stays current.

### UC-HAD-03: View Own Hostels and Payments
- Primary Actor: Hostel Admin
- Main Flow:
1. Admin requests `/my-hostels` or received payments.
2. System returns role-owned records.
- Postconditions: Admin can manage operations.

## 5. System Service Use Cases

### UC-SYS-01: Upload Media to Cloudinary
- Primary Actor: Backend System
- Supporting Actor: Cloudinary
- Main Flow:
1. Backend receives multipart files.
2. Backend uploads files to Cloudinary.
3. Cloudinary returns secure URLs.
4. Backend stores URLs in entity.

### UC-SYS-02: Geocode and Distance Calculation
- Primary Actor: Backend System
- Supporting Actor: Geocoding/Distance API
- Main Flow:
1. Backend receives address or coordinates.
2. Backend calls geocoding/distance utility services.
3. Backend returns structured distance/geocode response.

### UC-SYS-03: Payment Order and Verification
- Primary Actor: Backend System
- Supporting Actor: Payment Gateway
- Main Flow:
1. Backend creates payment order.
2. Backend receives payment identifiers/signature.
3. Backend verifies payment and updates status.

## 6. Use Case-to-Module Mapping
- Authentication: `AuthController`, `AuthService`
- Profile: `UserController`, `UserService`
- PG: `PGController`, `PGService`
- Hostel: `HostelController`, `HostelService`
- Item: `ItemController`, `ItemService`
- Message: `MessageController`, `MessageService`
- Payment: `PaymentController`, `PaymentService`
- Distance: `DistanceController`, `DistanceService`
