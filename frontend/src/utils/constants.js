// Application Constants

export const CITIES = [
  'Nadiad',
  'Ahmedabad',
  'Vadodara',
  'Surat',
  'Rajkot',
  'Gandhinagar',
  'Bhavnagar',
  'Jamnagar',
  'Junagadh',
  'Anand'
]

export const ROLES = {
  STUDENT: 'student',
  BROKER: 'broker',
  HOSTEL_ADMIN: 'hostelAdmin'
}

export const ROLE_LABELS = {
  [ROLES.STUDENT]: 'Student',
  [ROLES.BROKER]: 'Broker',
  [ROLES.HOSTEL_ADMIN]: 'Hostel Admin'
}

export const MARKETPLACE_CATEGORIES = [
  'Books',
  'Electronics',
  'Furniture',
  'Clothing',
  'Other'
]

export const HOSTEL_FACILITIES = [
  { key: 'mess', label: 'Mess Facility' },
  { key: 'wifi', label: 'WiFi' },
  { key: 'laundry', label: 'Laundry' },
  { key: 'gym', label: 'Gym' }
]

export const PG_FACILITIES = [
  { key: 'ac', label: 'AC Available' },
  { key: 'furnished', label: 'Furnished' },
  { key: 'ownerOnFirstFloor', label: 'Owner on First Floor' }
]

export const GENDER_OPTIONS = [
  { value: 'boys', label: 'Boys' },
  { value: 'girls', label: 'Girls' }
]

// API Configuration (Update with your backend URL)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

// Map Default Center (Nadiad, Gujarat)
export const DEFAULT_MAP_CENTER = [22.6944, 72.8606]
export const DEFAULT_MAP_ZOOM = 13
