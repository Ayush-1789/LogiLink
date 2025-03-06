import React from "react";
import { useLocation, useNavigate } from "react-router";
import { Shipment } from "./Home";
import Map from "./Map";
import { Route } from "./Route";
import LocationWeather from "./LocationWeather";
import { DetailedRoute } from "./DetailedRoute";

type RouteStats = {
  totalDistance: number;
  totalBorderCrossings: number;
};

export default function RouteDetails() {
  const location = useLocation();

  const shipmentDetails = location.state.shipmentDetails as Shipment;

  const selectedRoute = location.state.selectedRoute as Route;

  const navigate = useNavigate();

  // TODO
  const calculateRouteStats = (detailedRoutes: DetailedRoute[]): RouteStats => {
    console.log(detailedRoutes);
    return { totalDistance: 0, totalBorderCrossings: 0 };
  };

  return (
    <div className="detailed-route-container">
      <h2>Detailed Route Information</h2>
      <div className="route-overview">
        <p className="route-summary">
          From <strong>{shipmentDetails.origin}</strong> to{" "}
          <strong>{shipmentDetails.destination}</strong>
        </p>
        <div style={{ width: "100%", height: "400px" }}>
          <Map />
        </div>
        <div className="overview-cards">
          <div className="overview-card">
            <span className="overview-icon cost-icon"></span>
            <div className="overview-details">
              <span className="overview-label">Total Cost</span>
              <span className="overview-value">
                ${selectedRoute.cost.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="overview-card">
            <span className="overview-icon time-icon"></span>
            <div className="overview-details">
              <span className="overview-label">Transit Time</span>
              <span className="overview-value">
                {selectedRoute.transitTime} days
              </span>
            </div>
          </div>
          <div className="overview-card">
            <span className="overview-icon distance-icon"></span>
            <div className="overview-details">
              <span className="overview-label">Total Distance</span>
              <span className="overview-value">
                {calculateRouteStats(selectedRoute.detailedRoute).totalDistance}{" "}
                km
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="route-timeline">
        {selectedRoute.detailedRoute.map((segment, index) => (
          <div key={index} className="timeline-segment">
            <div
              className={`timeline-point mode-${segment.mode.toLowerCase()}-point`}
            >
              <div className="timeline-point-icon"></div>
            </div>
            <div className="timeline-line">
              {index < selectedRoute.detailedRoute.length - 1 && (
                <div
                  className={`timeline-mode-line mode-${segment.mode.toLowerCase()}-line`}
                ></div>
              )}
            </div>
            <div className="timeline-card">
              <div className="timeline-header">
                <h3
                  className={`timeline-title mode-${segment.mode.toLowerCase()}-text`}
                >
                  {segment.mode} Transport
                </h3>
                <span className="timeline-subtitle">
                  {segment.from} → {segment.to}
                </span>
                {segment.borderCrossing && (
                  <span className="border-crossing-badge">
                    Border Crossing: {segment.borderCrossing}
                  </span>
                )}
              </div>
              <div className="timeline-details">
                <div className="detail-group">
                  <div className="detail-item">
                    <span className="detail-label">Provider:</span>
                    <span className="detail-value">{segment.company}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Vehicle:</span>
                    <span className="detail-value">{segment.vehicle}</span>
                  </div>
                </div>
                <div className="detail-group">
                  <div className="detail-item">
                    <span className="detail-label">Departure:</span>
                    <span className="detail-value">{segment.departure}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Arrival:</span>
                    <span className="detail-value">{segment.arrival}</span>
                  </div>
                </div>
                <div className="detail-group">
                  <div className="detail-item">
                    <span className="detail-label">Duration:</span>
                    <span className="detail-value">{segment.duration}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Distance:</span>
                    <span className="detail-value">{segment.distance}</span>
                  </div>
                </div>

                {segment.mode === "Air" && segment.flightDetails && (
                  <div className="additional-details">
                    <h4>Flight Details</h4>
                    <div className="detail-item">
                      <span className="detail-label">Flight Number:</span>
                      <span className="detail-value">
                        {segment.flightDetails.flightNumber}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Aircraft:</span>
                      <span className="detail-value">
                        {segment.flightDetails.aircraft}
                      </span>
                    </div>
                  </div>
                )}

                {segment.mode === "Sea" && segment.vesselDetails && (
                  <div className="additional-details">
                    <h4>Vessel Details</h4>
                    <div className="detail-item">
                      <span className="detail-label">Capacity:</span>
                      <span className="detail-value">
                        {segment.vesselDetails.capacity}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Route:</span>
                      <span className="detail-value">
                        {segment.vesselDetails.route}
                      </span>
                    </div>
                  </div>
                )}

                {segment.mode === "Land" && segment.trainDetails && (
                  <div className="additional-details">
                    <h4>Train Details</h4>
                    <div className="detail-item">
                      <span className="detail-label">Train Number:</span>
                      <span className="detail-value">
                        {segment.trainDetails.trainNumber}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Carriage:</span>
                      <span className="detail-value">
                        {segment.trainDetails.carriageNumber}
                      </span>
                    </div>
                  </div>
                )}
                {segment.fromCoords && (
                  <div className="weather-section">
                    <LocationWeather
                      coords={segment.fromCoords}
                      location={segment.from}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="detailed-route-actions">
        <button
          className="secondary-button"
          onClick={() => navigate("/results", { state: shipmentDetails })}
        >
          Back to Route Options
        </button>
        <button className="primary-button">Book This Route</button>
      </div>
    </div>
  );
}
