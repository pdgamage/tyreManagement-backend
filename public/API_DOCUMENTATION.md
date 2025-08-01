# Vehicle Filter API Documentation

This document describes the new API endpoints added for the vehicle number filter functionality.

## New Endpoints

### 1. Vehicle Number Auto-Suggestions

**Endpoint:** `GET /api/vehicles/suggestions`

**Description:** Returns a list of vehicle numbers that match the search query for auto-suggestion functionality.

**Query Parameters:**
- `query` (string, required): The partial vehicle number to search for

**Example Request:**
```
GET /api/vehicles/suggestions?query=ABC
```

**Example Response:**
```json
[
  {
    "vehicleNumber": "ABC-1234",
    "make": "Toyota",
    "model": "Camry",
    "type": "Sedan"
  },
  {
    "vehicleNumber": "ABC-5678",
    "make": "Honda",
    "model": "Civic",
    "type": "Sedan"
  }
]
```

**Response Codes:**
- `200 OK`: Success
- `500 Internal Server Error`: Server error

---

### 2. Get Requests by Vehicle Number

**Endpoint:** `GET /api/vehicles/:vehicleNumber/requests`

**Description:** Returns all tire requests associated with a specific vehicle number.

**Path Parameters:**
- `vehicleNumber` (string, required): The vehicle number to search for

**Example Request:**
```
GET /api/vehicles/ABC-1234/requests
```

**Example Response:**
```json
{
  "vehicleNumber": "ABC-1234",
  "totalRequests": 3,
  "requests": [
    {
      "id": 1,
      "userId": 123,
      "vehicleId": 456,
      "vehicleNumber": "ABC-1234",
      "quantity": 4,
      "tubesQuantity": 4,
      "tireSize": "205/55R16",
      "requestReason": "Tire wear",
      "requesterName": "John Doe",
      "requesterEmail": "john@example.com",
      "requesterPhone": "1234567890",
      "vehicleBrand": "Toyota",
      "vehicleModel": "Camry",
      "lastReplacementDate": "2023-01-15",
      "existingTireMake": "Michelin",
      "tireSizeRequired": "205/55R16",
      "presentKmReading": 45000,
      "previousKmReading": 35000,
      "tireWearPattern": "Even wear",
      "comments": "Regular replacement",
      "status": "pending",
      "submittedAt": "2024-01-15T10:30:00.000Z",
      "userSection": "IT Department",
      "costCenter": "CC001",
      "vehicleMake": "Toyota",
      "vehicleType": "Sedan",
      "images": [
        "/uploads/image1.jpg",
        "/uploads/image2.jpg"
      ]
    }
  ]
}
```

**Response Codes:**
- `200 OK`: Success
- `400 Bad Request`: Vehicle number is missing
- `500 Internal Server Error`: Server error

---

## Frontend Implementation

### HTML/JavaScript Version

A complete HTML page with JavaScript is available at `/vehicle-filter.html` that demonstrates:
- Auto-suggestion functionality
- Real-time search as you type
- Responsive design
- Request details display
- Error handling

### React Component Version

React component files are provided:
- `VehicleFilter.jsx`: Main React component
- `VehicleFilter.css`: Styling for the component

**Usage:**
```jsx
import VehicleFilter from './VehicleFilter';

function App() {
  return (
    <div className="App">
      <VehicleFilter apiBaseUrl="/api" />
    </div>
  );
}
```

**Props:**
- `apiBaseUrl` (string, optional): Base URL for API calls. Defaults to `/api`

## Features

### Auto-Suggestion
- Triggers after typing 1+ characters
- 300ms debounce to prevent excessive API calls
- Shows vehicle number, make, model, and type
- Click to select suggestion

### Search Results
- Displays all requests for the selected vehicle
- Shows request count
- Detailed request information including:
  - Request ID and submission date
  - Status with color-coded badges
  - Requester information
  - Vehicle details
  - Tire specifications
  - KM readings
  - Department and cost center
  - Request reason and comments

### Responsive Design
- Mobile-friendly layout
- Adaptive grid for request details
- Touch-friendly interface

### Error Handling
- Network error handling
- User-friendly error messages
- Loading states
- Empty state handling

## Database Schema

The implementation uses existing tables:
- `vehicles`: For vehicle information and auto-suggestions
- `requests`: For tire request data
- `request_images`: For request images (if any)

No database schema changes are required.

## Security Considerations

- Input sanitization for search queries
- SQL injection prevention through parameterized queries
- Rate limiting recommended for suggestion endpoint
- CORS configuration already in place

## Performance Optimization

- Debounced search input (300ms)
- Limited suggestion results (10 items)
- Efficient SQL queries with proper indexing
- Lazy loading of images
- Responsive caching headers recommended

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ features used
- CSS Grid and Flexbox for layout
- Fetch API for HTTP requests