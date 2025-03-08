import React, { useState } from "react";
import * as yup from "yup";
import { Formik } from "formik";
import { useNavigate } from "react-router";

// Update type definition to remove hazardous and perishable checkboxes
export type Shipment = {
  origin: string;
  destination: string;
  weight: string;
  priority: string;
  goodsType: string;
  perishableLevel: number;
};

export default function Home() {
  const navigate = useNavigate();
  const [showPerishableSlider, setShowPerishableSlider] = useState(false);

  // Update schema to remove hazardous and perishable checkboxes
  const schema = yup.object({
    origin: yup.string().required(),
    destination: yup.string().required(),
    weight: yup.string().required(),
    priority: yup.string(),
    goodsType: yup.string().required(),
    perishableLevel: yup.number().min(1).max(10),
  });

  return (
    <Formik
      validationSchema={schema}
      initialValues={{
        origin: "",
        destination: "",
        weight: "",
        priority: "balanced", // Default priority
        goodsType: "standard", // Default goods type
        perishableLevel: 5, // Default perishable level
      }}
      onSubmit={(data) => navigate("/results", { state: data })}
    >
      {(formikProps) => {
        // Update perishable slider visibility when goods type changes
        const handleGoodsTypeChange = (e) => {
          formikProps.handleChange(e);
          setShowPerishableSlider(e.target.value === "perishable");
        };

        // Get color based on perishable level with smooth transition
        const getPerishableColor = (level) => {
          // Color gradient from green (level 1) to red (level 10)
          const colors = [
            "#4CAF50", // Green
            "#8BC34A",
            "#CDDC39",
            "#FFEB3B",
            "#FFC107",
            "#FF9800",
            "#FF5722",
            "#F44336",
            "#E91E63",
            "#D32F2F", // Dark Red
          ];
          return colors[level - 1] || colors[4]; // Default to middle color if invalid
        };

        // Add this for smooth transition on slider change
        const handlePerishableChange = (e) => {
          formikProps.handleChange(e);

          // Add animation pulse effect when slider value changes
          const valueDisplay = document.querySelector(".perishable-value");
          if (valueDisplay) {
            valueDisplay.classList.add("pulse-animation");
            setTimeout(
              () => valueDisplay.classList.remove("pulse-animation"),
              300,
            );
          }
        };

        const perishableColor = getPerishableColor(
          formikProps.values.perishableLevel,
        );

        return (
          <div className="form-container">
            <form noValidate onSubmit={formikProps.handleSubmit}>
              <div className="form-card">
                <h2 className="section-title">Shipment Details</h2>

                <div className="form-section">
                  <div className="form-row two-columns">
                    <div className="form-field">
                      <label htmlFor="origin">Origin</label>
                      <input
                        type="text"
                        id="origin"
                        name="origin"
                        value={formikProps.values.origin}
                        onChange={formikProps.handleChange}
                        placeholder="City, Country"
                        required
                        className="input-field"
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="destination">Destination</label>
                      <input
                        type="text"
                        id="destination"
                        name="destination"
                        value={formikProps.values.destination}
                        onChange={formikProps.handleChange}
                        placeholder="City, Country"
                        required
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-card">
                <h2 className="section-title">Cargo Specifications</h2>

                <div className="form-section">
                  <div className="form-row two-columns">
                    <div className="form-field">
                      <label htmlFor="weight">Weight (kg)</label>
                      <input
                        type="number"
                        id="weight"
                        name="weight"
                        value={formikProps.values.weight}
                        onChange={formikProps.handleChange}
                        min="0"
                        step="0.1"
                        required
                        className="input-field"
                        placeholder="0.0"
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="goodsType">Type of Goods</label>
                      <select
                        id="goodsType"
                        name="goodsType"
                        value={formikProps.values.goodsType}
                        onChange={handleGoodsTypeChange}
                        className="input-field select-field"
                        required
                      >
                        <option value="standard">Standard</option>
                        <option value="perishable">Perishable</option>
                        <option value="hazardous">Hazardous</option>
                        <option value="high_value">High Value</option>
                        <option value="fragile">Fragile</option>
                        <option value="oversized">Oversized</option>
                      </select>
                    </div>
                  </div>

                  {showPerishableSlider && (
                    <div className="form-row">
                      <div className="form-field full-width perishable-slider-container">
                        <div className="perishable-header">
                          <label htmlFor="perishableLevel">
                            Perishability Level
                          </label>
                          <span
                            className="perishable-value"
                            style={{ backgroundColor: perishableColor }}
                          >
                            {formikProps.values.perishableLevel}
                          </span>
                        </div>

                        <div className="slider-container">
                          <input
                            type="range"
                            id="perishableLevel"
                            name="perishableLevel"
                            min="1"
                            max="10"
                            value={formikProps.values.perishableLevel}
                            onChange={handlePerishableChange}
                            className="slider-input"
                            style={{
                              background: `linear-gradient(to right, #4CAF50, ${perishableColor}, #D32F2F)`,
                            }}
                          />
                          <div className="slider-markers">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                              <span
                                key={num}
                                className={`slider-marker ${num === formikProps.values.perishableLevel ? "active" : ""}`}
                                onClick={() =>
                                  formikProps.setFieldValue(
                                    "perishableLevel",
                                    num,
                                  )
                                }
                              >
                                {num}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="slider-labels">
                          <span>Less perishable</span>
                          <span>Highly perishable</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-card">
                <h2 className="section-title">Shipping Preferences</h2>

                <div className="form-section">
                  <div className="form-row">
                    <div className="form-field full-width">
                      <label htmlFor="priority">Delivery Priority</label>
                      <select
                        id="priority"
                        name="priority"
                        value={formikProps.values.priority}
                        onChange={formikProps.handleChange}
                        className="input-field select-field"
                      >
                        <option value="cost">Cost-effective</option>
                        <option value="speed">Fastest delivery</option>
                        <option value="balanced">Balanced</option>
                        <option value="eco">Eco-friendly</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="primary-button"
                  onClick={() => console.log(formikProps.errors)}
                >
                  Find Optimal Routes
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={formikProps.handleReset}
                >
                  Clear Form
                </button>
              </div>
            </form>
          </div>
        );
      }}
    </Formik>
  );
}
