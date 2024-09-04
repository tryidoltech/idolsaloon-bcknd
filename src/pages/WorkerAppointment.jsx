import React, { useEffect, useState } from "react";
import "../styles/WorkerAppointment.css";
import EmployeeCard from "../components/EmployeeCard";
import { useNavigate, useLocation } from "react-router-dom";
import Loader from "../components/Loader";
import axios from "axios";
import { BASE_URL, WORKERS_URL, APPOINTMENTS_URL } from "../redux/constants";

const apiWorkerUrl = `${BASE_URL}${WORKERS_URL}`;
const apiAppointmentUrl = `${BASE_URL}${APPOINTMENTS_URL}`;

const dummyFormData = {
  date: "2024-08-30",
  time: "2:00 PM",
};

const WorkerAppointment = () => {
  const { state } = useLocation();
  const { formData } = state || { formData: dummyFormData }; // Fallback to dummy data
  const [availableEmployeeIds, setAvailableEmployeeIds] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const navigate = useNavigate();

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const convertToMilitaryTime = (time) => {
    if (!time || !time.includes(" ")) {
      console.error("Invalid time format:", time);
      return "00:00"; // Return a default time or handle the error as needed
    }

    const [timePart, modifier] = time.split(" ");
    let [hours, minutes] = timePart.split(":");

    if (!hours || !minutes) {
      console.error("Invalid time parts:", timePart);
      return "00:00"; // Handle the error or return a default value
    }

    if (hours === "12") {
      hours = "00";
    }

    if (modifier === "PM") {
      hours = String(parseInt(hours, 10) + 12);
    }

    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
  };

  useEffect(() => {
    if (formData) {
      const fetchAvailableEmployees = async () => {
        try {
          const response = await axios.get(
            `${apiWorkerUrl}getAllWorkersByBranch/66addb87384b0263493328dd`
          );

          setEmployees(response.data.data);

          setLoading(false);
        } catch (error) {
          console.error("Error fetching available employees:", error);
          setError(error);
          setLoading(false);
        }
      };

      fetchAvailableEmployees();
    } else {
      setError(
        new Error("Form data is missing. Please fill out the appointment form.")
      );
    }
  }, [formData]);

  const handleEmployeeSelect = (workerId) => {
    console.log("Selected workerId:", workerId);
    setSelectedEmployeeId(workerId);
  };

  const handleCreateAppointment = async () => {
    if (selectedEmployeeId && formData) {
      try {
        setLoading(true);
        const formattedDate = reverseDateFormat(formData.date);

        const appointmentData = {
          ...formData,
          workerId: selectedEmployeeId,
          date: formattedDate,
        };

        console.log("Creating appointment with data:", appointmentData);
        const response = await axios.post(
          `${apiAppointmentUrl}createAppointmentByBranch`,
          appointmentData
        );

        console.log("Appointment created:", response);

        navigate("/ConfirmedAppointments");
        setLoading(false);
      } catch (error) {
        console.error("Error creating appointment:", error);
        setError(error);
      }
    }
  };

  const reverseDateFormat = (dateStr) => {
    const [day, month, year] = dateStr.split("-");
    return `${year}-${month}-${day}`;
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <div className="worker-appt-container">
        <h1>Workers Available</h1>
        <div className="worker-appt-list">
          {employees.map((employee) => (
            <EmployeeCard
              key={employee._id} // Ensure you're using _id here if that's the unique ID
              employee={employee}
              onSelect={() => handleEmployeeSelect(employee._id)} // Pass the worker's ID
            />
          ))}
        </div>
      </div>
      <div className="worker-appt-button-div">
        <button
          className="worker-create-appointment"
          onClick={handleCreateAppointment}
          disabled={!selectedEmployeeId}
        >
          Create Appointment
        </button>
      </div>
    </div>
  );
};

export default WorkerAppointment;
