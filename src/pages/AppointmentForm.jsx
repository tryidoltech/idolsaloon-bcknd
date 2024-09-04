import React from "react";
import "../styles/AppointmentForm.css";
import { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaCut,
  FaVenusMars,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { BASE_URL, SERVICES_URL, TIMES_URL } from "../redux/constants";

const serviceApiUrl = `${BASE_URL}${SERVICES_URL}`;
const timeApiUrl = `${BASE_URL}${TIMES_URL}`;

const services_data_url = import.meta.env.VITE_API_APPOINTMENT_FORM_SERVICES;
const phone_number_to_data = import.meta.env.VITE_API_CLIENT_INFO_DETAILS;
const timings_url = import.meta.env.VITE_API_APPOINTMENT_FORM_TIMINGS;

const AppointmentForm = () => {
  const [minDate, setMinDate] = useState("");
  const [maxDate, setMaxDate] = useState("");
  const [selectedServices, setSelectedServices] = useState([]);
  const [servicesOptions, setServicesOptions] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeSlotsOptions, setTimeSlotsOptions] = useState([]);
  const [formData, setFormData] = useState({
    clientName: "", // Updated key name
    email: "",
    mobile: "", // Updated key name
    city: "Bhopal", // Add missing field
    date: "",
    time: "",
    services: [],
    isOnline: false, // Add default value
    workerId: "", // Add default value if needed
    branchId: "66addb87384b0263493328dd", // Add default value if needed
  });

  const navigate = useNavigate();

  useEffect(() => {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 7);

    setMinDate(formatDate(today));
    setMaxDate(formatDate(maxDate));
  }, []);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${serviceApiUrl}getAllServicesByBranch/66addb87384b0263493328dd`)
      .then((response) => {
        const servicesArray = response.data.data;
        const services = servicesArray.map((service) => ({
          label: service.name,
          value: service._id,
        }));
        setServicesOptions(services);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: value,
    }));

    // Fetch client data when phone number reaches 10 digits
    if (id === "mobile" && value.length === 10) {
      fetchClientData(value);
    }
  };

  const fetchClientData = (mobile) => {
    setLoading(true);
    axios
      .post(phone_number_to_data, {
        phone: mobile, // Ensure correct key name
      })
      .then((response) => {
        if (response.data) {
          const clientData = response.data;
          setFormData((prevFormData) => ({
            ...prevFormData,
            clientName: clientData.name || "",
            email: clientData.email || "",
            city: clientData.city || "", // Update key
            gender: clientData.gender || "",
          }));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching client data:", err);
        setLoading(false);
      });
  };

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    axios
      .get(`${timeApiUrl}getAllTimesByBranchId/66addb87384b0263493328dd`)
      .then((response) => {
        const times = response.data.data.map((time) => ({
          label: time.time, // Displayed value
          value: time.time, // Actual value stored
        }));

        setTimeSlotsOptions(times);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleServiceChange = (selected) => {
    const selectedServiceNames = selected
      ? selected.map((service) => service.value)
      : [];
    setFormData((prevFormData) => ({
      ...prevFormData,
      services: selectedServiceNames,
    }));
  };

  const handleTimeChange = (selected) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      time: selected ? selected.value : "",
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    if (
      !formData.clientName ||
      !formData.mobile ||
      !formData.date ||
      !formData.time ||
      formData.services.length === 0
    ) {
      alert("Please fill all required fields");
      return;
    }

    navigate("/WorkerAppointment", { state: { formData } });
  };

  return (
    <>
      <h2 className="appt-form-heading">New Appointments</h2>
      <div className="appt-form-container">
        <form className="appt-form-form_container" onSubmit={handleSubmit}>
          <div className="appt-form-left">
            <div className="appt-form-group">
              <label htmlFor="mobile">Mobile No</label>
              <div className="appt-input-container">
                <FaPhone className="appt-icon" />
                <input
                  type="tel"
                  id="mobile" // Updated id
                  placeholder="Enter Mobile No."
                  value={formData.mobile} // Updated value
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="appt-form-group">
              <label htmlFor="clientName">Client Name</label>
              <div className="appt-input-container">
                <FaUser className="appt-icon" />
                <input
                  type="text"
                  id="clientName" // Updated id
                  placeholder="Enter Client Name"
                  value={formData.clientName} // Updated value
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="appt-form-group">
              <label htmlFor="date">Date</label>
              <div className="appt-input-container">
                <FaCalendarAlt className="appt-icon" />
                <input
                  type="date"
                  id="date"
                  min={minDate}
                  max={maxDate}
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="appt-form-group">
              <label htmlFor="services">Services</label>
              <div className="appt-input-container">
                <FaCut className="appt-icon" />
                <Select
                  options={servicesOptions}
                  value={formData.services.map((service) => ({
                    label: service,
                    value: service,
                  }))}
                  onChange={handleServiceChange}
                  labelledBy="Select"
                  isMulti={true}
                  styles={{
                    control: (baseStyles) => ({
                      ...baseStyles,
                      backgroundColor: "#f5f6fa",
                    }),
                  }}
                />
              </div>
            </div>
          </div>

          <div className="appt-form-right">
            <div className="appt-form-group">
              <label htmlFor="email">Email</label>
              <div className="appt-input-container">
                <FaEnvelope className="appt-icon" />
                <input
                  type="email"
                  id="email"
                  placeholder="Enter Email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="appt-form-group">
              <label htmlFor="gender">Gender</label>
              <div className="appt-input-container">
                <FaVenusMars className="appt-icon" />
                <input
                  id="gender"
                  type="text"
                  placeholder="Gender"
                  value={
                    formData.gender === "M"
                      ? "Male"
                      : formData.gender === "F"
                      ? "Female"
                      : ""
                  }
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="appt-form-group">
              <label htmlFor="pincode">Pincode</label>
              <div className="appt-input-container">
                <FaMapMarkerAlt className="appt-icon" />
                <input
                  type="text"
                  id="pincode"
                  placeholder="Enter Pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="appt-form-group">
              <label htmlFor="time">Time Slot</label>
              <div className="appt-input-container">
                <FaClock className="appt-icon" />
                <Select
                  options={timeSlotsOptions}
                  value={timeSlotsOptions.find(
                    (timeSlot) => timeSlot.value === formData.time
                  )}
                  onChange={handleTimeChange}
                  labelledBy="Select"
                  styles={{
                    control: (baseStyles) => ({
                      ...baseStyles,
                      backgroundColor: "#f5f6fa",
                    }),
                  }}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="appt-submit-button">
            Get Worker
          </button>
        </form>
      </div>
    </>
  );
};

export default AppointmentForm;
