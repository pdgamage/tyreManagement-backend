# Vehicle Filter API Documentation

## Overview
This document describes the new vehicle filter functionality added to the tyre management system. The feature allows users to search for vehicles with auto-suggest functionality and view all tire requests related to a specific vehicle.

## New API Endpoints

### 1. Vehicle Auto-Suggest Search
**Endpoint:** `GET /api/vehicles/search/numbers`

**Description:** Returns vehicle suggestions based on partial vehicle number input for auto-complete functionality.

**Query Parameters:**
- `query` (string, required): Partial vehicle number to search for

**Example Request:**
```
GET /api/vehicles/search/numbers?query=ABC
```

**Example Response:**
```json
[
  {
    "vehicleNumber": "ABC123",
    "make": "Toyota",
    "model": "Camry",
    "type": "Sedan",
    "department": "Sales",
    "costCentre": "CC001"
  },
  {
    "vehicleNumber": "ABC456",
    "make": "Honda",
    "model": "Civic",
    "type": "Sedan",
    "department": "Marketing",
    "costCentre": "CC002"
  }
]
```

### 2. Get All Vehicle Numbers
**Endpoint:** `GET /api/vehicles/numbers/all`

**Description:** Returns all unique vehicle numbers from both vehicles and requests tables.

**Example Request:**
```
GET /api/vehicles/numbers/all
```

**Example Response:**
```json
[
  {
    "vehicleNumber": "ABC123",
    "make": "Toyota",
    "model": "Camry",
    "type": "Sedan",
    "department": "Sales",
    "costCentre": "CC001"
  },
  {
    "vehicleNumber": "XYZ789",
    "make": "Ford",
    "model": "Focus",
    "type": null,
    "department": "IT",
    "costCentre": "CC003"
  }
]
```

### 3. Get Requests by Vehicle Number
**Endpoint:** `GET /api/requests/vehicle/:vehicleNumber`

**Description:** Returns all tire requests for a specific vehicle number with complete request details and images.

**Path Parameters:**
- `vehicleNumber` (string, required): The vehicle number to filter requests by

**Example Request:**
```
GET /api/requests/vehicle/ABC123
```

**Example Response:**
```json
{
  "vehicleNumber": "ABC123",
  "totalRequests": 3,
  "requests": [
    {
      "id": 1,
      "userId": 5,
      "vehicleId": 2,
      "vehicleNumber": "ABC123",
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
      "presentKmReading": 85000,
      "previousKmReading": 60000,
      "tireWearPattern": "Even wear",
      "comments": "Urgent replacement needed",
      "status": "pending",
      "submittedAt": "2024-01-15T10:30:00.000Z",
      "userSection": "Sales",
      "costCenter": "CC001",
      "vehicleDepartment": "Sales",
      "vehicleCostCentre": "CC001",
      "images": [
        "http://localhost:3000/uploads/image1.jpg",
        "http://localhost:3000/uploads/image2.jpg"
      ]
    }
  ]
}
```

## Frontend Dashboard

### Vehicle Filter Dashboard
A complete HTML dashboard has been created at `/public/vehicle-filter-dashboard.html` that demonstrates the vehicle filter functionality.

**Features:**
- **Auto-suggest search**: Type vehicle numbers and get real-time suggestions
- **Vehicle selection**: Click on suggestions to select a vehicle
- **Request display**: View all tire requests for the selected vehicle
- **Responsive design**: Works on desktop and mobile devices
- **Real-time search**: Debounced search with 300ms delay for optimal performance

**Access the dashboard:**
```
http://localhost:3000/public/vehicle-filter-dashboard.html
```

### Dashboard Features

1. **Search Interface**
   - Auto-complete input field
   - Real-time vehicle number suggestions
   - Keyboard navigation support (Enter to search)

2. **Vehicle Information Display**
   - Vehicle number, make, and model
   - Department and cost center information
   - Total number of requests

3. **Request History**
   - Complete list of all tire requests for the vehicle
   - Request status with color-coded badges
   - Detailed information including:
     - Submission date
     - Requester information
     - Tire specifications
     - KM readings
     - Request reason and comments

4. **Status Indicators**
   - Pending requests (yellow)
   - Approved/Complete requests (green)
   - Rejected requests (red)

## Integration Guide

### Frontend Integration

To integrate the vehicle filter functionality into your existing frontend:

1. **Auto-suggest Component**
```javascript
// Fetch vehicle suggestions
async function fetchVehicleSuggestions(query) {
  const response = await fetch(`/api/vehicles/search/numbers?query=${query}`);
  return await response.json();
}

// Get requests for a vehicle
async function getVehicleRequests(vehicleNumber) {
  const response = await fetch(`/api/requests/vehicle/${vehicleNumber}`);
  return await response.json();
}
```

2. **Search Implementation**
```javascript
// Debounced search function
let searchTimeout;
function handleSearchInput(query) {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    if (query.length >= 1) {
      fetchVehicleSuggestions(query);
    }
  }, 300);
}
```

### Backend Integration

The new endpoints are automatically available once the updated controllers and routes are deployed. No additional configuration is required.

## Error Handling

All endpoints include proper error handling:

- **400 Bad Request**: Missing or invalid parameters
- **404 Not Found**: Vehicle or requests not found
- **500 Internal Server Error**: Database or server errors

Example error response:
```json
{
  "error": "Vehicle number is required"
}
```

## Performance Considerations

1. **Search Optimization**
   - Vehicle search is limited to 10 results for performance
   - Uses LIKE queries with proper indexing on vehicleNumber fields
   - Debounced frontend searches to reduce API calls

2. **Database Queries**
   - Efficient JOIN queries between vehicles and requests tables
   - Proper indexing on vehicleNumber columns recommended
   - Image data is fetched separately to optimize main query performance

## Security

- All endpoints use the existing authentication and authorization middleware
- Input validation and sanitization for search queries
- SQL injection protection through parameterized queries

## Testing

Test the functionality using the provided dashboard or with API testing tools:

1. **Test Auto-suggest**
   ```bash
   curl "http://localhost:3000/api/vehicles/search/numbers?query=ABC"
   ```

2. **Test Vehicle Requests**
   ```bash
   curl "http://localhost:3000/api/requests/vehicle/ABC123"
   ```

3. **Access Dashboard**
   ```
   http://localhost:3000/public/vehicle-filter-dashboard.html
   ```