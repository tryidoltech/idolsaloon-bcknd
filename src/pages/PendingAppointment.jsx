import React, { useState, useEffect } from "react";
import { useTable } from "react-table";
import "../styles/PendingAppointment.css";
import { NavLink } from "react-router-dom";
import axios from "axios";
import Loader from "../components/Loader";
import { BASE_URL, APPOINTMENTS_URL } from "../redux/constants";

const apiUrl = `${BASE_URL}${APPOINTMENTS_URL}getAllPendingAppointmentsByBranchId/66addb87384b0263493328dd`;

const PendingAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `${apiUrl}?page=${page}&count=${count}`
        );

        const data = response.data.data; // Ensure correct data path
        const totalPages = response.data.totalPages; // Assuming the API returns totalPages
        setTotalPages(totalPages || 0); // Fallback to 0 if undefined
        const formattedAppointments = data.map((appointment) => ({
          serviceName: Array.isArray(appointment.services)
            ? appointment.services.map((service) => service.name)
            : [],
          clientName: appointment.clientName || "",
          contact: appointment.mobile || "",
          dateTime: `${new Date(appointment.date).toLocaleDateString()} - ${
            convertTo12HourFormat(appointment.time) || ""
          }`,
          workerName: appointment.workerId.name || "",
          duration: appointment.duration || "N/A",
          cancel: "Cancel",
          apptId: appointment._id,
        }));
        setAppointments(formattedAppointments);
      } catch (error) {
        console.error("API fetching error", error);
        setError("Failed to load pending appointments.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [page, count]);

  const convertTo12HourFormat = (time) => {
    if (!time) return "";
    const [hour, minute] = time.split(":");
    const hourInt = parseInt(hour, 10);
    const ampm = hourInt >= 12 ? "PM" : "AM";
    const adjustedHour = hourInt % 12 || 12;
    return `${adjustedHour}:${minute.padStart(2, "0")} ${ampm}`;
  };

  const handleCancelClick = async (apptId) => {
    try {
      await axios.post("http://localhost:3000/api/appointments/cancel", {
        apptId,
      });
      setAppointments((prevAppointments) =>
        prevAppointments.filter((appointment) => appointment.apptId !== apptId)
      );
      console.log(`Appointment with ID ${apptId} cancelled successfully`);
    } catch (error) {
      console.error(`Error cancelling appointment with ID ${apptId}`, error);
    }
  };

  const handleAssignClick = async (apptId, prefEmployee) => {
    try {
      await axios.post("http://localhost:3000/api/appointments/assign", {
        apptId,
        prefEmployee,
      });
      setAppointments((prevAppointments) =>
        prevAppointments.filter((appointment) => appointment.apptId !== apptId)
      );
      console.log(
        `Appointment with ID ${apptId} assigned to employee ${prefEmployee} successfully`
      );
    } catch (error) {
      console.error(`Error assigning appointment with ID ${apptId}`, error);
    }
  };

  const columns = React.useMemo(
    () => [
      {
        Header: "Service Name",
        accessor: "serviceName",
        Cell: ({ value }) => (
          <div className="pending-appt-service-list">
            {value.map((service, index) => (
              <span key={index} className="pending-appt-service-item">
                {service}
              </span>
            ))}
          </div>
        ),
      },
      {
        Header: "Client Name",
        accessor: "clientName",
      },
      {
        Header: "Contact",
        accessor: "contact",
      },
      {
        Header: "Date - Time",
        accessor: "dateTime",
      },
      {
        Header: "Preferred Worker",
        accessor: "workerName",
      },
      {
        Header: "Duration",
        accessor: "duration",
      },
      {
        Header: "Assign Employee",
        accessor: "assignEmployee",
        Cell: ({ value, row }) => (
          <select
            className="pending-appt-assign-select"
            onChange={(e) =>
              handleAssignClick(row.original.apptId, e.target.value)
            }
          >
            <option value="">Assign</option>
            {Array.isArray(value) &&
              value.map((employee, index) => (
                <option key={index} value={employee}>
                  {employee}
                </option>
              ))}
          </select>
        ),
      },
      {
        Header: "Cancel",
        accessor: "cancel",
        Cell: ({ row }) => (
          <button
            className="pending-appt-cancel-btn"
            onClick={() => handleCancelClick(row.original.apptId)}
          >
            Cancel
          </button>
        ),
      },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({
      columns,
      data: appointments,
    });

  if (loading) {
    return <Loader />;
  }

  // Calculate page numbers to display
  const renderPageNumbers = () => {
    if (totalPages === 0) return null; // No pages to render

    const pages = [];
    for (let i = 0; i < totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={i === page ? "active-page" : ""}
        >
          {i + 1}
        </button>
      );
    }
    return pages;
  };

  const handlePrevClick = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleNextClick = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  // Handle count change from dropdown
  const handleCountChange = (event) => {
    setCount(parseInt(event.target.value));
    setPage(0); // Reset page to 0 when changing count
  };
  return (
    <div className="pending-appointments-container">
      <div className="pending-appointments-header">
        <h2>Pending Appointments</h2>
        <NavLink to="/AppointmentForm" className="navlink">
          <button className="pending-add-appointment-btn">
            Add a new Appointment
          </button>
        </NavLink>
      </div>
      {error ? (
        <h1>{error}</h1>
      ) : (
        <>
          <table {...getTableProps()} className="pending-appointments-table">
            <thead>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th {...column.getHeaderProps()}>
                      {column.render("Header")}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows.map((row) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map((cell) => (
                      <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="pagination">
            <div className="left">
              <select
                id="count-select"
                value={count}
                onChange={handleCountChange}
              >
                <option value={10}>10 / page</option>
                <option value={30}>30 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
            <div className="right">
              <button onClick={handlePrevClick} disabled={page === 0}>
                &lt;
              </button>
              {renderPageNumbers()}
              <button
                onClick={handleNextClick}
                disabled={page === totalPages - 1}
              >
                &gt;
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PendingAppointment;
