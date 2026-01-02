# Student Helper - Advanced React Frontend

A comprehensive platform for college students and working professionals to find hostels and PGs (Paying Guest accommodations) in their city.

## Features

### 🎯 Core Functionality

- **Role-Based Authentication**
  - Student (with college name)
  - Broker (PG owner)
  - Hostel Admin

- **PG Management**
  - Browse PGs filtered by city
  - Advanced filters (price, distance, AC, furnished, etc.)
  - Map integration for location selection
  - Distance calculation from PG to college
  - Photo and video uploads
  - Special instructions and rules
  - Owner on first floor indicator

- **Hostel Management**
  - Browse hostels filtered by city and gender
  - Facility filters (mess, WiFi, laundry, gym)
  - Room availability tracking
  - Photo and video uploads for different room types
  - Fees with included facilities

- **Marketplace**
  - Buy and sell items (books, electronics, etc.)
  - Category-based filtering
  - Search functionality

- **Chat System**
  - Real-time messaging between users
  - No direct phone numbers shared
  - Conversation management

- **AI Price Prediction**
  - ML-based PG rent prediction
  - Based on property features and location
  - Dataset description included

### 🎨 Design Features

- **Responsive Design**
  - Mobile-first approach
  - Fully responsive on all devices
  - Touch-friendly interface

- **Modern UI/UX**
  - Tailwind CSS for styling
  - Framer Motion animations
  - React Hot Toast for notifications
  - Image galleries and video players
  - Interactive maps with Leaflet

- **User Experience**
  - Intuitive navigation
  - Role-based dashboards
  - Advanced filtering and search
  - Smooth transitions and animations

## Tech Stack

- **React 18** - UI library
- **React Router DOM** - Routing
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Hook Form** - Form management
- **React Leaflet** - Map integration
- **React Hot Toast** - Notifications
- **React Icons** - Icons
- **React Image Gallery** - Image display
- **React Player** - Video playback

## Project Structure

```
src/
├── components/
│   ├── Common/
│   │   ├── FilterPanel.jsx
│   │   └── MapComponent.jsx
│   ├── Layout/
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── PG/
│   │   ├── PGCard.jsx
│   │   └── PricePrediction.jsx
│   └── Hostel/
│       └── HostelCard.jsx
├── context/
│   └── AuthContext.jsx
├── pages/
│   ├── Auth/
│   │   ├── Login.jsx
│   │   └── Signup.jsx
│   ├── Student/
│   │   ├── StudentDashboard.jsx
│   │   ├── PGList.jsx
│   │   ├── PGDetails.jsx
│   │   ├── HostelList.jsx
│   │   ├── HostelDetails.jsx
│   │   └── Marketplace.jsx
│   ├── Broker/
│   │   ├── BrokerDashboard.jsx
│   │   ├── AddPG.jsx
│   │   ├── EditPG.jsx
│   │   └── MyPGs.jsx
│   ├── HostelAdmin/
│   │   ├── HostelAdminDashboard.jsx
│   │   ├── AddHostel.jsx
│   │   ├── EditHostel.jsx
│   │   └── MyHostels.jsx
│   ├── Chat/
│   │   └── Chat.jsx
│   └── Home.jsx
├── App.jsx
├── main.jsx
└── index.css
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## API Integration

The frontend is currently using **mock data** (fake data for testing). 

**Backend Integration**: We'll integrate APIs step by step. See `API_INTEGRATION_GUIDE.md` for the step-by-step plan.

### Current Status

- ✅ Frontend: 100% complete with mock data
- ⏳ Backend: Will be created step by step
- ⏳ Integration: Ready to start

When ready, we'll integrate APIs one by one:
1. Authentication APIs
2. PG APIs
3. Hostel APIs
4. Marketplace APIs
5. Chat APIs
6. File Upload

## Features in Detail

### City-Wise Filtering
All listings are automatically filtered based on the user's city during registration.

### Distance Calculation
Uses road network distance (not direct distance) from PG to college. Requires backend integration with mapping services.

### Map Integration
Interactive maps using Leaflet for location selection and display. Click on map to set property location.

### Image/Video Upload
File upload functionality ready for backend integration. Supports multiple images and videos.

### Chat System
Real-time messaging system. Requires WebSocket or Socket.io integration on backend.

### AI Price Prediction
ML model for predicting PG rent based on features. Dataset description included in component.

## Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- Real-time notifications
- Advanced analytics dashboard
- Payment integration
- Review and rating system
- Favorites/bookmarks
- Social sharing
- Multi-language support

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

