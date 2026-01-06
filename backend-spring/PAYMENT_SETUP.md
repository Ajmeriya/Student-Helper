# Payment System Setup Guide

## Overview
The payment system is integrated using Razorpay payment gateway, supporting:
- PG Bookings
- Hostel Bookings  
- Marketplace Item Purchases

## Backend Setup

### 1. Add Razorpay Credentials

Add to `application.properties` or environment variables:

```properties
razorpay.key_id=your_razorpay_key_id
razorpay.key_secret=your_razorpay_key_secret
```

Or set as environment variables:
```bash
export RAZORPAY_KEY_ID=your_razorpay_key_id
export RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 2. Get Razorpay Credentials

1. Sign up at https://razorpay.com/
2. Go to Dashboard → Settings → API Keys
3. Generate Test/Live API keys
4. Copy Key ID and Key Secret

## Frontend Setup

### 1. Add Razorpay Key

Create/update `.env` file in `frontend/`:

```env
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### 2. Razorpay SDK

The Razorpay checkout script is automatically loaded when the payment modal opens.

## API Endpoints

### Create Payment Order
```
POST /api/payment/create-order
Authorization: Bearer <token>
Body: {
  "paymentType": "PG_BOOKING" | "HOSTEL_BOOKING" | "ITEM_PURCHASE",
  "entityId": 123,
  "amount": 5000,
  "currency": "INR",
  "bookingStartDate": "2024-01-01T00:00:00", // Optional for bookings
  "bookingEndDate": "2024-12-31T00:00:00", // Optional for bookings
  "notes": "Optional notes"
}
```

### Verify Payment
```
POST /api/payment/verify
Body: {
  "razorpayOrderId": "order_xxx",
  "razorpayPaymentId": "pay_xxx",
  "razorpaySignature": "signature_xxx"
}
```

### Get My Payments
```
GET /api/payment/my-payments
Authorization: Bearer <token>
```

### Get Received Payments
```
GET /api/payment/received-payments
Authorization: Bearer <token>
```

## Payment Flow

1. User clicks "Book Now" or "Buy Now"
2. Frontend creates payment order via `/api/payment/create-order`
3. Razorpay checkout modal opens
4. User completes payment
5. Frontend verifies payment via `/api/payment/verify`
6. Backend updates entity status (PG → onRent, Hostel → decreases rooms, Item → sold)

## Payment Types

- **PG_BOOKING**: For booking a PG room
- **HOSTEL_BOOKING**: For booking a hostel room
- **ITEM_PURCHASE**: For purchasing marketplace items
- **SECURITY_DEPOSIT**: For security deposits (future use)
- **MAINTENANCE**: For maintenance fees (future use)

## Security

- Payment verification uses Razorpay signature verification
- All payment endpoints require authentication (except verify webhook)
- Payment status is tracked in database
- Failed payments are logged

## Testing

Use Razorpay test credentials:
- Test cards: https://razorpay.com/docs/payments/test-cards/
- Test UPI: success@razorpay

## Production Checklist

- [ ] Replace test Razorpay keys with live keys
- [ ] Set up webhook URL in Razorpay dashboard
- [ ] Configure webhook secret
- [ ] Test payment flow end-to-end
- [ ] Set up payment notifications
- [ ] Configure refund policy

