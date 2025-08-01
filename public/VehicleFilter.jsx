import React, { useState, useEffect, useRef } from 'react';
import './VehicleFilter.css';

const VehicleFilter = ({ apiBaseUrl = '/api' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalRequests, setTotalRequests] = useState(0);
  
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Fetch suggestions when user types
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      if (selectedVehicle) {
        setSelectedVehicle(null);
        setRequests([]);
        setTotalRequests(0);
      }
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchSuggestions = async (query) => {
    try {
      const response = await fetch(`${apiBaseUrl}/vehicles/suggestions?query=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      
      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
      setError(null);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setSuggestions([]);
      setShowSuggestions(false);
      setError('Failed to fetch vehicle suggestions');
    }
  };

  const fetchVehicleRequests = async (vehicleNumber) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${apiBaseUrl}/vehicles/${encodeURIComponent(vehicleNumber)}/requests`);
      if (!response.ok) throw new Error('Failed to fetch vehicle requests');
      
      const data = await response.json();
      setRequests(data.requests);
      setTotalRequests(data.totalRequests);
      setSelectedVehicle(vehicleNumber);
    } catch (err) {
      console.error('Error fetching vehicle requests:', err);
      setError('Failed to fetch vehicle requests. Please try again.');
      setRequests([]);
      setTotalRequests(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (vehicleNumber) => {
    setSearchQuery(vehicleNumber);
    setShowSuggestions(false);
    fetchVehicleRequests(vehicleNumber);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      fetchVehicleRequests(searchQuery.trim());
    }
  };

  const getStatusClass = (status) => {
    if (status.includes('approved') || status === 'complete') return 'approved';
    if (status.includes('rejected')) return 'rejected';
    if (status === 'pending') return 'pending';
    return 'complete';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="vehicle-filter-container">
      <div className="vehicle-filter-header">
        <h1>🚗 Vehicle Request Filter</h1>
        <p>Search for vehicle numbers and view all related tire requests</p>
      </div>

      <div className="search-section">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-container">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type vehicle number (e.g., ABC-1234)..."
              className="search-input"
              autoComplete="off"
            />
            
            {showSuggestions && suggestions.length > 0 && (
              <div ref={suggestionsRef} className="suggestions">
                {suggestions.map((vehicle, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(vehicle.vehicleNumber)}
                  >
                    <div className="vehicle-number">{vehicle.vehicleNumber}</div>
                    <div className="vehicle-details">
                      {vehicle.make || 'Unknown'} {vehicle.model || ''} - {vehicle.type || 'Unknown Type'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button type="submit" className="search-button" disabled={!searchQuery.trim()}>
            Search
          </button>
        </form>
      </div>

      <div className="results-section">
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading vehicle requests...</p>
          </div>
        ) : selectedVehicle ? (
          <div className="results-container">
            <div className="results-header">
              <h2 className="results-title">Results for "{selectedVehicle}"</h2>
              <span className="results-count">
                {totalRequests} request{totalRequests !== 1 ? 's' : ''}
              </span>
            </div>

            {totalRequests === 0 ? (
              <div className="no-results">
                <div className="no-results-icon">📋</div>
                <h3>No requests found</h3>
                <p>No tire requests have been submitted for vehicle "{selectedVehicle}"</p>
              </div>
            ) : (
              <div className="requests-list">
                {requests.map((request) => (
                  <div key={request.id} className="request-card">
                    <div className="request-header">
                      <div className="request-id">Request #{request.id}</div>
                      <div className="request-date">
                        Submitted: {formatDate(request.submittedAt)}
                      </div>
                    </div>
                    
                    <div className="request-body">
                      <div className="request-details">
                        <div className="detail-item">
                          <span className="detail-label">Status</span>
                          <span className="detail-value">
                            <span className={`status-badge status-${getStatusClass(request.status)}`}>
                              {request.status}
                            </span>
                          </span>
                        </div>
                        
                        <div className="detail-item">
                          <span className="detail-label">Requester</span>
                          <span className="detail-value">{request.requesterName}</span>
                        </div>
                        
                        <div className="detail-item">
                          <span className="detail-label">Vehicle Brand</span>
                          <span className="detail-value">{request.vehicleBrand}</span>
                        </div>
                        
                        <div className="detail-item">
                          <span className="detail-label">Vehicle Model</span>
                          <span className="detail-value">{request.vehicleModel}</span>
                        </div>
                        
                        <div className="detail-item">
                          <span className="detail-label">Tire Size Required</span>
                          <span className="detail-value">{request.tireSizeRequired}</span>
                        </div>
                        
                        <div className="detail-item">
                          <span className="detail-label">Quantity</span>
                          <span className="detail-value">
                            {request.quantity} tires, {request.tubesQuantity} tubes
                          </span>
                        </div>
                        
                        <div className="detail-item">
                          <span className="detail-label">Present KM Reading</span>
                          <span className="detail-value">
                            {request.presentKmReading?.toLocaleString() || 'N/A'}
                          </span>
                        </div>
                        
                        <div className="detail-item">
                          <span className="detail-label">Department</span>
                          <span className="detail-value">{request.userSection || 'N/A'}</span>
                        </div>
                      </div>
                      
                      {request.requestReason && (
                        <div className="request-reason">
                          <span className="detail-label">Request Reason</span>
                          <p className="detail-value">{request.requestReason}</p>
                        </div>
                      )}
                      
                      {request.comments && (
                        <div className="request-comments">
                          <span className="detail-label">Comments</span>
                          <p className="detail-value">{request.comments}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>Search for a vehicle number</h3>
            <p>Start typing a vehicle number to see auto-suggestions and view all related requests</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleFilter;