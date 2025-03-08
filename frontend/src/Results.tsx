import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { Route } from "./Route";
import mockRoutes from "./mockRoutes";

export default function Results() {
  const location = useLocation();
  const shipmentDetails = location.state;
  const navigate = useNavigate();
<<<<<<< HEAD
  // Extract priority directly from shipmentDetails for easy access
  const priority = shipmentDetails?.priority || "balanced";
=======
>>>>>>> 96dcec2fb7f9b47294f2602c3f189d8d1e751ab0
  
  // Use mockRoutes directly
  const allRouteOptions = React.useMemo(() => {
    return typeof mockRoutes === 'function' ? mockRoutes(shipmentDetails) : mockRoutes;
  }, [shipmentDetails]);
  
  // Filter routes based on priority selected in the Home page
  const priorityFilteredRoutes = React.useMemo(() => {
<<<<<<< HEAD
=======
    const priority = shipmentDetails?.priority || "balanced";
    
>>>>>>> 96dcec2fb7f9b47294f2602c3f189d8d1e751ab0
    // Apply the priority filter
    if (priority === "cost") {
      // Sort by cost (lowest first)
      return [...allRouteOptions].sort((a, b) => a.cost - b.cost);
    } else if (priority === "speed") {
      // Sort by transit time (fastest first)
      return [...allRouteOptions].sort((a, b) => a.transitTime - b.transitTime);
    } else if (priority === "eco") {
      // Sort by emissions (lowest first)
      return [...allRouteOptions].sort((a, b) => Number(a.co2Emissions) - Number(b.co2Emissions));
    } else {
      // For "balanced" - use a combined score
      return [...allRouteOptions].sort((a, b) => {
        // Normalize values between 0-1
        const maxCost = Math.max(...allRouteOptions.map(r => r.cost));
        const maxTime = Math.max(...allRouteOptions.map(r => r.transitTime));
        
        // Calculate balanced score (lower is better)
        const scoreA = (a.cost / maxCost) * 0.5 + (a.transitTime / maxTime) * 0.5;
        const scoreB = (b.cost / maxCost) * 0.5 + (b.transitTime / maxTime) * 0.5;
        
        return scoreA - scoreB;
      });
    }
<<<<<<< HEAD
  }, [allRouteOptions, priority]);
=======
  }, [shipmentDetails?.priority, allRouteOptions]);
>>>>>>> 96dcec2fb7f9b47294f2602c3f189d8d1e751ab0
  
  // Get recommended routes (top 3)
  const getRecommendedRoutes = () => {
    return priorityFilteredRoutes.slice(0, 3);
  };
  
  // Get additional routes (everything after top 3)
  const getAdditionalRoutes = () => {
    return priorityFilteredRoutes.slice(3);
  };
  
  // Navigate to detailed route view
  const showRouteDetails = (route: Route) => {
    navigate("/details", { state: { shipmentDetails, selectedRoute: route } });
  };
  
  // Get the priority label for UI display
  const getPriorityLabel = () => {
<<<<<<< HEAD
    switch(priority) {
=======
    switch(shipmentDetails?.priority) {
>>>>>>> 96dcec2fb7f9b47294f2602c3f189d8d1e751ab0
      case "cost": return "Cost-Effective";
      case "speed": return "Fastest";
      case "eco": return "Eco-Friendly";
      default: return "Balanced";
    }
  };

  // Get the priority emoji/icon
  const getPriorityIcon = () => {
<<<<<<< HEAD
    switch(priority) {
=======
    switch(shipmentDetails?.priority) {
>>>>>>> 96dcec2fb7f9b47294f2602c3f189d8d1e751ab0
      case "cost": return "💰"; // Money bag for cost-effective
      case "speed": return "⚡"; // Lightning for speed
      case "eco": return "🌿"; // Leaf for eco-friendly
      default: return "⚖️"; // Balance scale for balanced
    }
  };
  
  // Format transit time to days and hours
  const formatTransitTime = (hours: number) => {
    if (hours < 24) {
      return `${hours} hours`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0 
      ? `${days} days ${remainingHours} hrs` 
      : `${days} days`;
  };

  return (
    <div className="results-container">
<<<<<<< HEAD
      {priorityFilteredRoutes.length > 0 ? (
        <div className="routes-content">
          {/* Top 3 Recommendations Section */}
          <section className="route-section recommended-section">
            <div className="top-recommendations-header">
              <div className="header-badge">Top 3 Recommended Routes</div>
              
              <p className="recommendation-description">
                These routes are optimized for {getPriorityLabel().toLowerCase()} based on your preferences
=======
      {/* Header section with journey details */}
      <div className="results-header">
        <div className="header-content">
          <div className="header-top">
            <h1 className="results-title">Route Options</h1>
            <div className="priority-badge">
              <span className="priority-icon">{getPriorityIcon()}</span>
              <span className="priority-text">{getPriorityLabel()} Priority</span>
            </div>
          </div>
          
          <div className="journey-details">
            <div className="journey-path">
              <div className="journey-location origin">{shipmentDetails?.origin}</div>
              <div className="journey-connector">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
              <div className="journey-location destination">{shipmentDetails?.destination}</div>
            </div>
            <div className="shipment-details">
              <span className="shipment-weight">{shipmentDetails?.weight} kg</span>
              {shipmentDetails?.goodsType && (
                <span className="goods-type">{shipmentDetails.goodsType}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {priorityFilteredRoutes.length > 0 ? (
        <div className="routes-content">
          {/* Top Recommended Routes Section */}
          <section className="route-section recommended-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">✨</span>
                Recommended Routes
              </h2>
              <p className="section-description">
                Best options based on your {getPriorityLabel().toLowerCase()} priority
>>>>>>> 96dcec2fb7f9b47294f2602c3f189d8d1e751ab0
              </p>
            </div>
            
            <div className="recommended-routes-grid">
              {getRecommendedRoutes().map((route, index) => (
                <div
                  key={route.id}
<<<<<<< HEAD
                  className={`route-card recommended rank-${index + 1}`}
                  onClick={() => showRouteDetails(route)}
                >
                  <div className="recommendation-badge">#{index + 1} Recommended</div>
                  <div className="route-card-inner">
                    <div className="card-main-info">
                      <div className="transport-modes">
                        {route.modes.map((mode, idx) => (
                          <span key={idx} className={`mode-tag mode-${mode.toLowerCase()}`}>
                            {mode === 'Air' ? '✈️' : mode === 'Sea' ? '🚢' : '🚚'} {mode}
                          </span>
                        ))}
                      </div>
                      
                      <div className="route-path-display">
                        <div className="path-endpoint">{shipmentDetails?.origin}</div>
                        <div className="path-arrow">→</div>
                        <div className="path-endpoint">{shipmentDetails?.destination}</div>
                      </div>
                    </div>

                    <div className="key-metrics">
                      <div className="metric primary">
                        <span className="metric-emphasis">
                          {priority === "cost" ? "₹" + route.cost?.toLocaleString() :
                           priority === "speed" ? formatTransitTime(route.transitTime) :
                           priority === "eco" ? `${route.co2Emissions} kg CO₂` :
                           "₹" + route.cost?.toLocaleString()}
                        </span>
                        <span className="metric-label-primary">{getPriorityLabel()} Option</span>
                      </div>
                      
                      <div className="metrics-secondary">
                        <div className="metric">
                          <span className="metric-icon">💰</span>
                          <span className="metric-value">₹{route.cost?.toLocaleString() || 'N/A'}</span>
                        </div>
                        <div className="metric">
                          <span className="metric-icon">⏱️</span>
                          <span className="metric-value">{formatTransitTime(route.transitTime)}</span>
                        </div>
                        <div className="metric">
                          <span className="metric-icon">🌿</span>
                          <span className="metric-value">{route.co2Emissions ? `${route.co2Emissions} kg` : 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="card-footer">
                      
=======
                  className="route-card recommended"
                  onClick={() => showRouteDetails(route)}
                >
                  <div className="route-card-inner">
                    <div className="card-header">
                      <div className="route-rank">#{index + 1}</div>
                      <h3 className="route-name">{route.name}</h3>
                      <div className="route-modes">
                        {route.modes.map((mode, idx) => (
                          <span key={idx} className={`mode-tag mode-${mode.toLowerCase()}`}>
                            {mode}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="route-visualization">
                      <div className="route-endpoints">
                        <div className="endpoint origin">{shipmentDetails?.origin}</div>
                        <div className="endpoint destination">{shipmentDetails?.destination}</div>
                      </div>
                      <div className="route-path">
                        {route.modes.map((mode, idx) => (
                          <span key={idx} className={`path-segment mode-${mode.toLowerCase()}`}>
                            {mode === 'Air' ? '✈️' : mode === 'Sea' ? '🚢' : '🚚'}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="route-metrics">
                      <div className="metric">
                        <span className="metric-icon">💰</span>
                        <span className="metric-value">₹{route.cost?.toLocaleString() || 'N/A'}</span>
                        <span className="metric-label">Cost</span>
                      </div>
                      <div className="metric">
                        <span className="metric-icon">⏱️</span>
                        <span className="metric-value">{formatTransitTime(route.transitTime)}</span>
                        <span className="metric-label">Time</span>
                      </div>
                      <div className="metric">
                        <span className="metric-icon">🌿</span>
                        <span className="metric-value">{route.co2Emissions ? `${route.co2Emissions} kg` : 'N/A'}</span>
                        <span className="metric-label">CO₂</span>
                      </div>
                    </div>
                    
                    <div className="card-footer">
                      <div className="carrier">
                        <div className="carrier-avatar">{route.carrier?.charAt(0) || '?'}</div>
                        <span className="carrier-name">{route.carrier || 'Unknown carrier'}</span>
                      </div>
>>>>>>> 96dcec2fb7f9b47294f2602c3f189d8d1e751ab0
                      <button className="details-button">View Details</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

<<<<<<< HEAD
          <div className="section-divider">
            <span className="divider-text">Additional Options</span>
          </div>

          {getAdditionalRoutes().length > 0 && (
            <section className="route-section additional-section">
              <div className="additional-routes-list">
                {getAdditionalRoutes().map((route) => (
                  <div
                    key={route.id}
                    className="route-card alternative"
                    onClick={() => showRouteDetails(route)}
                  >
                    <div className="alt-route-content">
                      <div className="alt-route-main">
                        <div className="alt-route-header">
                          <h3 className="alt-route-name">{route.name}</h3>
                          <div className="alt-route-modes">
                            {route.modes.map((mode, index) => (
                              <span key={index} className={`mode-tag mode-${mode.toLowerCase()}`}>
                                {mode}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="alt-route-metrics">
                          <div className="alt-metric-item">
                            <span className="alt-metric-icon">💰</span>
                            <div className="alt-metric-detail">
                              <span className="alt-metric-value">₹{route.cost?.toLocaleString() || 'N/A'}</span>
                              <span className="alt-metric-label">Cost</span>
                            </div>
                          </div>
                          <div className="alt-metric-item">
                            <span className="alt-metric-icon">⏱️</span>
                            <div className="alt-metric-detail">
                              <span className="alt-metric-value">{formatTransitTime(route.transitTime)}</span>
                              <span className="alt-metric-label">Transit Time</span>
                            </div>
                          </div>
                          <div className="alt-metric-item">
                            <span className="alt-metric-icon">🌿</span>
                            <div className="alt-metric-detail">
                              <span className="alt-metric-value">{route.co2Emissions ? `${route.co2Emissions} kg` : 'N/A'}</span>
                              <span className="alt-metric-label">CO₂ Emissions</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="alt-route-visual">
                        <div className="alt-route-path">
                          <div className="alt-route-origin">{shipmentDetails?.origin}</div>
                          <div className="alt-route-line">
                            {route.modes.map((mode, idx) => (
                              <span key={idx} className={`alt-route-icon mode-${mode.toLowerCase()}`}>
                                {mode === 'Air' ? '✈️' : mode === 'Sea' ? '🚢' : '🚚'}
                              </span>
                            ))}
                          </div>
                          <div className="alt-route-destination">{shipmentDetails?.destination}</div>
                        </div>
                      </div>
                      
                      <div className="alt-route-action">
                        
                        <button className="alt-details-button">View Details</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
=======
          {/* Additional Routes Section */}
          {getAdditionalRoutes().length > 0 && (
            <section className="route-section additional-section">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-icon">🔍</span>
                  Alternative Options
                </h2>
                <p className="section-description">Additional routes that match your criteria</p>
              </div>
              
              <div className="additional-routes-list">
                {getAdditionalRoutes().map((route) => (
                  <div
                    key={route.id}
                    className="route-card alternative"
                    onClick={() => showRouteDetails(route)}
                  >
                    <div className="alt-route-content">
                      <div className="alt-route-main">
                        <div className="alt-route-header">
                          <h3 className="alt-route-name">{route.name}</h3>
                          <div className="alt-route-modes">
                            {route.modes.map((mode, index) => (
                              <span key={index} className={`mode-tag mode-${mode.toLowerCase()}`}>
                                {mode}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="alt-route-metrics">
                          <div className="alt-metric-item">
                            <span className="alt-metric-icon">💰</span>
                            <div className="alt-metric-detail">
                              <span className="alt-metric-value">₹{route.cost?.toLocaleString() || 'N/A'}</span>
                              <span className="alt-metric-label">Cost</span>
                            </div>
                          </div>
                          <div className="alt-metric-item">
                            <span className="alt-metric-icon">⏱️</span>
                            <div className="alt-metric-detail">
                              <span className="alt-metric-value">{formatTransitTime(route.transitTime)}</span>
                              <span className="alt-metric-label">Transit Time</span>
                            </div>
                          </div>
                          <div className="alt-metric-item">
                            <span className="alt-metric-icon">🌿</span>
                            <div className="alt-metric-detail">
                              <span className="alt-metric-value">{route.co2Emissions ? `${route.co2Emissions} kg` : 'N/A'}</span>
                              <span className="alt-metric-label">CO₂ Emissions</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="alt-route-visual">
                        <div className="alt-route-path">
                          <div className="alt-route-origin">{shipmentDetails?.origin}</div>
                          <div className="alt-route-line">
                            {route.modes.map((mode, idx) => (
                              <span key={idx} className={`alt-route-icon mode-${mode.toLowerCase()}`}>
                                {mode === 'Air' ? '✈️' : mode === 'Sea' ? '🚢' : '🚚'}
                              </span>
                            ))}
                          </div>
                          <div className="alt-route-destination">{shipmentDetails?.destination}</div>
                        </div>
                      </div>
                      
                      <div className="alt-route-action">
                        <div className="alt-carrier">
                          <div className="alt-carrier-logo">{route.carrier?.charAt(0) || '?'}</div>
                          <span className="alt-carrier-name">{route.carrier || 'Unknown'}</span>
                        </div>
                        <button className="alt-details-button">View Details</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
>>>>>>> 96dcec2fb7f9b47294f2602c3f189d8d1e751ab0
            </section>
          )}
        </div>
      ) : (
        <div className="no-routes-container">
          <div className="no-routes-content">
            <div className="no-routes-icon">🔍</div>
            <h3 className="no-routes-title">No Routes Found</h3>
            <p className="no-routes-message">
              No routes are available for your shipment details. Please try different parameters.
            </p>
            <button className="back-button" onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
