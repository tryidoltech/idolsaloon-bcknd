import React from "react";
import "../styles/AppointmentForm.css";
import { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaCut, FaVenusMars } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const customer_form_url = import.meta.env.VITE_API_CUSTOMER_BOOKING_APPT;
const services_data_url = import.meta.env.VITE_API_APPOINTMENT_FORM_SERVICES;
const timings_url = import.meta.env.VITE_API_APPOINTMENT_FORM_TIMINGS;
const employee_names_url = import.meta.env.VITE_API_PENDING_APPOINTMENTS_EMPLOYEES;

const CustomerSideAppt = () => {
    const [minDate, setMinDate] = useState("");
    const [maxDate, setMaxDate] = useState("");
    const [selectedServices, setSelectedServices] = useState([]);
    const [servicesOptions, setServicesOptions] = useState([]);
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [timeSlots, setTimeSlots] = useState([]);
    const [formData, setFormData] = useState({
      phone: "",
      name: "",
      email: "",
      pincode: "",
      date: "",
      time: "",
      gender: "",
      services: [],
      employee: null
    });
    const navigate = useNavigate();
  
    useEffect(() => {
      const today = new Date();
      const maxDate = new Date();
      maxDate.setDate(today.getDate() + 7);
  
      setMinDate(formatDate(today));
      setMaxDate(formatDate(maxDate));
    }, []);
    
    //services url 
    useEffect(() => {
      setLoading(true);
      axios
        .get(services_data_url)
        .then((response) => {
          if (response.data && typeof response.data.services === "object") {
            const servicesArray = Object.values(response.data.services);
            const services = servicesArray.map((service) => ({
              label: service.name,
              value: service.name,
            }));
            setServicesOptions(services);
          } else {
            console.error("Unexpected response structure", response.data);
          }
          setLoading(false);
        })
        .catch((err) => {
          setError(err);
          setLoading(false);
        });
    }, []);
    
    // Fetch employee names from API
    useEffect(() => {
      setLoading(true);
      axios
        .get(employee_names_url)
        .then((response) => {
          if (response.data && typeof response.data === "object") {
            const employeesArray = Object.entries(response.data).map(([key, value]) => ({
              label: value,
              value: key, // Use the key as the value for employee ID
            })).filter(employee => employee.value !== 'success');
            setEmployeeOptions(employeesArray);
          } else {
            console.error("Unexpected response structure", response.data);
          }
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
    };
  
    const formatDate = (date) => {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${year}-${month}-${day}`;
    };
  
    useEffect(() => {
      axios
        .get(timings_url)
        .then((response) => {
          setTimeSlots(response.data);
        })
        .catch((err) => {
          console.log(err);
        });
    }, []);

    const reverseDate = (date) => {
        const [year, month, day] = date.split("-");
        return `${day}-${month}-${year}`;
      };
  
    const generateTimeSlots = () => {
      return timeSlots.map((time, index) => (
        <option key={index} value={time}>
          {formatTime(time)}
        </option>
      ));
    };
  
    const handleServiceChange = (selected) => {
      const selectedServiceNames = selected.map((service) => service.value);
      setFormData((prevFormData) => ({
        ...prevFormData,
        services: selectedServiceNames,
      }));
    };
    
    const handleEmployeeChange = (selected) => {
      setFormData((prevFormData) => ({
        ...prevFormData,
        employee: selected ? selected.value : null,
      }));
    };
  
    const formatTime = (timeString) => {
      const [hour, minute] = timeString.split(":").map(Number);
      const suffix = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 || 12;
      const minuteStr = minute === 0 ? "00" : String(minute).padStart(2, "0");
      return `${hour12}:${minuteStr} ${suffix}`;
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const requestData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          date: reverseDate(formData.date),
          time: formData.time,
          pincode: formData.pincode,
          gender: formData.gender,
          prefEmployee: formData.employee,
          services: formData.services,
        };
        await axios.post(customer_form_url, requestData);
        // Handle successful submission (e.g., navigate to another page or show success message)
        toast.success("Appointment Booked Successfully!!");
        // navigate("/success");
        console.log(requestData);
      } catch (error) {
        // Handle errors (e.g., show error message)
        console.error("Error booking appointment:", error);
        toast.error("Failed to book appointment. Please try again.");
      }
    };
  
    return (
      <>
        <h2 className="appt-form-heading">New Appointments</h2>
        <div className="appt-form-container">
          <form className="appt-form-form_container" onSubmit={handleSubmit}>
            <div className="appt-form-left">
              <div className="appt-form-group">
                <label htmlFor="phone">Phone No</label>
                <div className="appt-input-container">
                  <FaPhone className="appt-icon" />
                  <input
                    type="tel"
                    id="phone"
                    placeholder="Enter Phone No."
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
  
              <div className="appt-form-group">
                <label htmlFor="name">Client Name</label>
                <div className="appt-input-container">
                  <FaUser className="appt-icon" />
                  <input
                    type="text"
                    id="name"
                    placeholder="Enter Client name"
                    value={formData.name}
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

              <div className="appt-form-group">
                <label htmlFor="employee">Employee</label>
                <div className="appt-input-container">
                  <FaUser className="appt-icon" />
                  <Select
                    options={employeeOptions}
                    value={formData.employee ? { label: employeeOptions.find(e => e.value === formData.employee)?.label, value: formData.employee } : null}
                    onChange={handleEmployeeChange}
                    labelledBy="Select"
                    isMulti={false}
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
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
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
                  <select
                    id="time"
                    value={formData.time}
                    onChange={handleInputChange}
                  >
                    <option value="">Enter Time Slot</option>
                    {generateTimeSlots()}
                  </select>
                </div>
              </div>
            </div>
            <button type="submit" className="appt-submit-button">
              Submit
            </button>
          </form>
        </div>
      </>
    );
}

export default CustomerSideAppt;
