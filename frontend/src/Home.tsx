import React, { useState } from "react";
import * as yup from "yup";
import { Formik } from "formik";
import { useNavigate } from "react-router";

// Maximum weight limit in kg
const MAX_WEIGHT_LIMIT = 75000;

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
  const [weightError, setWeightError] = useState<string | null>(null);
  const [sameLocationError, setSameLocationError] = useState<string | null>(
    null,
  );
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Update schema to require all fields
  const schema = yup.object({
    origin: yup.string().required("Origin is required"),
    destination: yup
      .string()
      .required("Destination is required")
      .test(
        "different-locations",
        "Origin and destination cannot be the same",
        function (value) {
          // Access other field values from the context
          const { origin } = this.parent;
          if (!origin || !value) return true; // Skip validation if either field is empty
          return origin.trim().toLowerCase() !== value.trim().toLowerCase();
        },
      ),
    weight: yup
      .string()
      .required("Cargo weight is required")
      .test(
        "weight-limit",
        `Weight exceeds maximum limit of ${MAX_WEIGHT_LIMIT.toLocaleString()} kg`,
        (value) => {
          const numWeight = parseFloat(value || "0");
          return !isNaN(numWeight) && numWeight <= MAX_WEIGHT_LIMIT;
        },
      ),
    priority: yup.string().required("Delivery priority is required"),
    goodsType: yup.string().required("Type of goods is required"),
    perishableLevel: yup.number().when("goodsType", {
      is: (val: string) => val === "perishable",
      then: yup
        .number()
        .required("Perishability level is required")
        .min(1)
        .max(10),
      otherwise: yup.number().min(1).max(10),
    }),
  });

  const validateSubmit = (values: Shipment) => {
    // Check for empty fields
    const errors: { [key: string]: string } = {};

    if (!values.origin.trim()) {
      errors.origin = "Origin is required";
    }

    if (!values.destination.trim()) {
      errors.destination = "Destination is required";
    }

    if (!values.weight.toString().trim()) {
      errors.weight = "Cargo weight is required";
    }

    if (!values.priority.trim()) {
      errors.priority = "Delivery priority is required";
    }

    if (!values.goodsType.trim()) {
      errors.goodsType = "Type of goods is required";
    }

    if (
      values.goodsType === "perishable" &&
      (values.perishableLevel < 1 || values.perishableLevel > 10)
    ) {
      errors.perishableLevel = "Valid perishability level (1-10) is required";
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return false;
    }

    // Check weight limit
    const weight = parseFloat(values.weight);
    if (!isNaN(weight) && weight > MAX_WEIGHT_LIMIT) {
      setWeightError(
        `Total weight limit has exceeded ${MAX_WEIGHT_LIMIT.toLocaleString()} kg, can't find modes of transport`,
      );
      return false;
    }
    setWeightError(null);

    // Check if origin and destination are the same
    if (
      values.origin.trim().toLowerCase() ===
        values.destination.trim().toLowerCase() &&
      values.origin.trim() !== ""
    ) {
      setSameLocationError("Origin and destination cannot be the same");
      return false;
    }
    setSameLocationError(null);

    return true;
  };

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
      onSubmit={(data, formikHelpers) => {
        // Touch all fields to show all validation errors
        Object.keys(data).forEach((field) => {
          formikHelpers.setFieldTouched(field, true);
        });

        if (validateSubmit(data)) {
          navigate("/results", { state: data });
        }
      }}
    >
      {(formikProps) => {
        // Update perishable slider visibility when goods type changes
        const handleGoodsTypeChange = (e) => {
          formikProps.handleChange(e);
          setShowPerishableSlider(e.target.value === "perishable");
          // Clear any form error for this field
          if (formErrors.goodsType) {
            setFormErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors.goodsType;
              return newErrors;
            });
          }
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

        // Check for same location when either field changes
        const handleLocationChange = (e) => {
          formikProps.handleChange(e);

          // Clear any form error for this field
          if (formErrors[e.target.name]) {
            setFormErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors[e.target.name];
              return newErrors;
            });
          }

          // If both fields have values, check if they're the same
          const fieldName = e.target.name;
          const otherFieldName =
            fieldName === "origin" ? "destination" : "origin";
          const currentValue = e.target.value.trim().toLowerCase();
          const otherValue = formikProps.values[otherFieldName]
            ?.trim()
            .toLowerCase();

          if (currentValue && otherValue && currentValue === otherValue) {
            setSameLocationError("Origin and destination cannot be the same");
          } else {
            setSameLocationError(null);
          }
        };

        // Add this for smooth transition on slider change
        const handlePerishableChange = (e) => {
          formikProps.handleChange(e);

          // Clear any form error for this field
          if (formErrors.perishableLevel) {
            setFormErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors.perishableLevel;
              return newErrors;
            });
          }

          // Add animation pulse effect when slider value changes
          const valueDisplay = document.querySelector(".perishable-value");
          if (valueDisplay) {
            valueDisplay.classList.remove("pulse-animation");
            // Trigger DOM reflow to restart animation
            void valueDisplay.offsetWidth;
            valueDisplay.classList.add("pulse-animation");
          }
        };

        // Add this function to handle clicking directly on the markers
        const handleMarkerClick = (value) => {
          formikProps.setFieldValue("perishableLevel", value);

          // Clear any form error for this field
          if (formErrors.perishableLevel) {
            setFormErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors.perishableLevel;
              return newErrors;
            });
          }

          // Add animation pulse effect when marker is clicked
          const valueDisplay = document.querySelector(".perishable-value");
          if (valueDisplay) {
            valueDisplay.classList.remove("pulse-animation");
            // Trigger DOM reflow to restart animation
            void valueDisplay.offsetWidth;
            valueDisplay.classList.add("pulse-animation");
          }
        };

        // Add weight check on change
        const handleWeightChange = (e) => {
          formikProps.handleChange(e);

          // Clear any form error for this field
          if (formErrors.weight) {
            setFormErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors.weight;
              return newErrors;
            });
          }

          const weight = parseFloat(e.target.value);
          if (!isNaN(weight) && weight > MAX_WEIGHT_LIMIT) {
            setWeightError(
              `Total weight limit has exceeded ${MAX_WEIGHT_LIMIT.toLocaleString()} kg, can't find modes of transport`,
            );
          } else {
            setWeightError(null);
          }
        };

        // Standard input change handler to clear errors
        const handleInputChange = (e) => {
          formikProps.handleChange(e);

          // Clear any form error for this field
          if (formErrors[e.target.name]) {
            setFormErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors[e.target.name];
              return newErrors;
            });
          }
        };

        const perishableColor = getPerishableColor(
          formikProps.values.perishableLevel,
        );

        // Check if form has any empty required fields
        const hasEmptyRequiredFields = () => {
          return (
            !formikProps.values.origin.trim() ||
            !formikProps.values.destination.trim() ||
            !formikProps.values.weight.toString().trim() ||
            !formikProps.values.priority.trim() ||
            !formikProps.values.goodsType.trim() ||
            (formikProps.values.goodsType === "perishable" &&
              (formikProps.values.perishableLevel < 1 ||
                formikProps.values.perishableLevel > 10))
          );
        };

        return (
          <div className="form-container">
            <form noValidate onSubmit={formikProps.handleSubmit}>
              <div className="form-card">
                <h2 className="section-title">Shipment Details</h2>

                <div className="form-section">
                  <div className="form-row two-columns">
                    <div className="form-field">
                      <label htmlFor="origin">Origin *</label>
                      <input
                        type="text"
                        id="origin"
                        name="origin"
                        value={formikProps.values.origin}
                        onChange={handleLocationChange}
                        onBlur={formikProps.handleBlur} // Add this to enable Formik validation on blur
                        placeholder="City, Country"
                        required
                        className={`input-field ${
                          sameLocationError ||
                          formErrors.origin ||
                          (formikProps.touched.origin &&
                            formikProps.errors.origin)
                            ? "error-input"
                            : ""
                        }`}
                      />
                      {(formikProps.touched.origin &&
                        formikProps.errors.origin) ||
                      formErrors.origin ? (
                        <div className="error-message">
                          {formErrors.origin || formikProps.errors.origin}
                        </div>
                      ) : null}
                    </div>
                    <div className="form-field">
                      <label htmlFor="destination">Destination *</label>
                      <input
                        type="text"
                        id="destination"
                        name="destination"
                        value={formikProps.values.destination}
                        onChange={handleLocationChange}
                        onBlur={formikProps.handleBlur} // Add this to enable Formik validation on blur
                        placeholder="City, Country"
                        required
                        className={`input-field ${
                          sameLocationError ||
                          formErrors.destination ||
                          (formikProps.touched.destination &&
                            formikProps.errors.destination)
                            ? "error-input"
                            : ""
                        }`}
                      />
                      {(formikProps.touched.destination &&
                        formikProps.errors.destination) ||
                      sameLocationError ||
                      formErrors.destination ? (
                        <div className="error-message">
                          {formErrors.destination ||
                            sameLocationError ||
                            formikProps.errors.destination}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-card">
                <h2 className="section-title">Cargo Specifications</h2>

                <div className="form-section">
                  <div className="form-row two-columns">
                    <div className="form-field">
                      <label htmlFor="weight">Weight (kg) *</label>
                      <input
                        type="number"
                        id="weight"
                        name="weight"
                        value={formikProps.values.weight}
                        onChange={handleWeightChange}
                        onBlur={formikProps.handleBlur}
                        min="0"
                        step="0.1"
                        required
                        className={`input-field ${weightError || formErrors.weight ? "error-input" : ""}`}
                        placeholder="0.0"
                      />
                      {(formikProps.touched.weight &&
                        formikProps.errors.weight) ||
                      weightError ||
                      formErrors.weight ? (
                        <div className="error-message">
                          {formErrors.weight ||
                            weightError ||
                            formikProps.errors.weight}
                        </div>
                      ) : null}
                    </div>
                    <div className="form-field">
                      <label htmlFor="goodsType">Type of Goods *</label>
                      <select
                        id="goodsType"
                        name="goodsType"
                        value={formikProps.values.goodsType}
                        onChange={handleGoodsTypeChange}
                        onBlur={formikProps.handleBlur} // Add this to enable Formik validation on blur
                        className={`input-field select-field ${
                          formErrors.goodsType ||
                          (formikProps.touched.goodsType &&
                            formikProps.errors.goodsType)
                            ? "error-input"
                            : ""
                        }`}
                        required
                      >
                        <option value="standard">Standard</option>
                        <option value="perishable">Perishable</option>
                        <option value="hazardous">Hazardous</option>
                        <option value="high_value">High Value</option>
                        <option value="fragile">Fragile</option>
                        <option value="oversized">Oversized</option>
                      </select>
                      {(formikProps.touched.goodsType &&
                        formikProps.errors.goodsType) ||
                      formErrors.goodsType ? (
                        <div className="error-message">
                          {formErrors.goodsType || formikProps.errors.goodsType}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {showPerishableSlider && (
                    <div className="form-row">
                      <div className="form-field full-width perishable-slider-container">
                        <div className="perishable-header">
                          <label htmlFor="perishableLevel">
                            Perishability Level *
                          </label>
                          <span
                            className="perishable-value"
                            style={{
                              backgroundColor: perishableColor,
                              boxShadow: `0 0 8px ${perishableColor}80`,
                            }}
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
                            step="1"
                            value={formikProps.values.perishableLevel}
                            onChange={handlePerishableChange}
                            className="slider-input"
                            required
                          />
                          <div
                            className="slider-track"
                            style={{
                              background: `linear-gradient(to right, #4CAF50, ${perishableColor}, #D32F2F)`,
                            }}
                          ></div>
                          <div
                            className="slider-thumb"
                            style={{
                              left: `${((formikProps.values.perishableLevel - 1) / 9) * 100}%`,
                              backgroundColor: perishableColor,
                              transform: `translateX(-50%) scale(${formikProps.values.perishableLevel === 10 ? "1.2" : "1"})`,
                            }}
                          ></div>
                        </div>

                        <div className="slider-markers">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <span
                              key={num}
                              className={`slider-marker ${num === formikProps.values.perishableLevel ? "active" : ""}`}
                              onClick={() => handleMarkerClick(num)}
                              style={{
                                backgroundColor:
                                  num === formikProps.values.perishableLevel
                                    ? perishableColor
                                    : "",
                                boxShadow:
                                  num === formikProps.values.perishableLevel
                                    ? `0 2px 8px ${perishableColor}80`
                                    : "",
                              }}
                            >
                              {num}
                            </span>
                          ))}
                        </div>

                        <div className="slider-labels">
                          <span className="less-perishable">
                            Less perishable
                          </span>

                          <span className="highly-perishable">
                            Highly perishable
                          </span>
                        </div>

                        {formErrors.perishableLevel && (
                          <div className="error-message">
                            {formErrors.perishableLevel}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-card">
                <h2 className="section-title">Shipping Preferences</h2>

                <div className="form-section">
                  {/* Replace the priority dropdown with visual option cards */}
                  <div className="form-row">
                    <div className="form-field full-width">
                      <label className="preference-label">
                        Delivery Priority *
                      </label>

                      <div className="priority-options">
                        <div
                          className={`priority-option ${formikProps.values.priority === "cost" ? "active" : ""}`}
                          onClick={() =>
                            formikProps.setFieldValue("priority", "cost")
                          }
                        >
                          <div className="priority-icon">💰</div>
                          <div className="priority-label">Cost-Effective</div>
                          <div className="priority-description">
                            Lowest shipping cost with reasonable transit times
                          </div>
                        </div>

                        <div
                          className={`priority-option ${formikProps.values.priority === "speed" ? "active" : ""}`}
                          onClick={() =>
                            formikProps.setFieldValue("priority", "speed")
                          }
                        >
                          <div className="priority-icon">⚡</div>
                          <div className="priority-label">Fastest Delivery</div>
                          <div className="priority-description">
                            Expedited shipping with minimal transit time
                          </div>
                        </div>

                        <div
                          className={`priority-option ${formikProps.values.priority === "balanced" ? "active" : ""}`}
                          onClick={() =>
                            formikProps.setFieldValue("priority", "balanced")
                          }
                        >
                          <div className="priority-icon">⚖️</div>
                          <div className="priority-label">Balanced</div>
                          <div className="priority-description">
                            Optimal balance between cost and delivery speed
                          </div>
                        </div>

                        <div
                          className={`priority-option ${formikProps.values.priority === "eco" ? "active" : ""}`}
                          onClick={() =>
                            formikProps.setFieldValue("priority", "eco")
                          }
                        >
                          <div className="priority-icon">🌿</div>
                          <div className="priority-label">Eco-Friendly</div>
                          <div className="priority-description">
                            Routes optimized for minimal environmental impact
                          </div>
                        </div>
                      </div>

                      {(formikProps.touched.priority &&
                        formikProps.errors.priority) ||
                      formErrors.priority ? (
                        <div className="error-message">
                          {formErrors.priority || formikProps.errors.priority}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button" // Change to button type to handle submission manually
                  className="primary-button"
                  onClick={() => {
                    // Touch all fields to show validation errors
                    Object.keys(formikProps.values).forEach((field) => {
                      formikProps.setFieldTouched(field, true, true);
                    });

                    // Then submit the form
                    formikProps.handleSubmit();
                  }}
                  disabled={
                    !!weightError ||
                    !!sameLocationError ||
                    !formikProps.isValid ||
                    hasEmptyRequiredFields() ||
                    Object.keys(formErrors).length > 0
                  }
                >
                  Find Optimal Routes
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    formikProps.handleReset();
                    setWeightError(null);
                    setSameLocationError(null);
                    setFormErrors({});
                  }}
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
