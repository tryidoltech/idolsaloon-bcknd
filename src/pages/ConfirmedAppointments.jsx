import React, { useState, useEffect } from "react";
import { useTable } from "react-table";
import "../styles/ConfirmedAppointments.css";
import axios from "axios";
import Loader from "../components/Loader";
import checkicon from "../assets/check-in-icon.png";
import { BASE_URL, APPOINTMENTS_URL } from "../redux/constants";

const apiUrl = `${BASE_URL}${APPOINTMENTS_URL}getAllConfirmedAppointmentsByBranchId/66addb87384b0263493328dd`;

const ConfirmedAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentData, setCurrentData] = useState({});
  const [appointmentId, setAppointmentId] = useState("");
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}?page=${page}&count=${count}`
        );
        const data = response.data;
        const totalPages = response.data.totalPages; // Assuming the API returns totalPages
        setTotalPages(totalPages || 0); // Fallback to 0 if undefined
        const formattedAppointments = data.data.map((appointment) => ({
          serviceName: Array.isArray(appointment.services)
            ? appointment.services.map((service) => service.name)
            : [],
          clientName: appointment.clientName || "",
          contact: appointment.mobile || "",
          dateTime: `${new Date(appointment.date).toLocaleDateString()} - ${
            appointment.time || ""
          }`,
          workerAssigned: appointment.workerId.name || "N/A",
          duration: appointment.duration || "N/A",
          checkIn: "Check in",
          appointmentId: appointment._id,
        }));
        setAppointments(formattedAppointments.reverse());
      } catch (error) {
        console.error("API fetching error", error);
        setError("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [page, count]);

  const handleCheckIn = async () => {
    try {
      await axios.post(`${apiUrl}checkIn`, { apptId: appointmentId });
      console.log("Check-In confirmed with Appointment ID:", appointmentId);

      setAppointments((prevAppointments) =>
        prevAppointments.filter(
          (appointment) => appointment.appointmentId !== appointmentId
        )
      );
      setShowModal(false);
      setAppointmentId("");
      setCurrentData({});
    } catch (error) {
      console.error("Error confirming check-in:", error);
    }
  };

  const handleAppointmentIdChange = (e) => {
    setAppointmentId(e.target.value);
  };

  const columns = React.useMemo(
    () => [
      {
        Header: "Service Name",
        accessor: "serviceName",
        Cell: ({ value }) => (
          <div className="confirm-appt-service-list">
            {value.map((service, index) => (
              <span key={index} className="confirm-appt-service-item">
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
        Header: "Worker Assigned",
        accessor: "workerAssigned",
      },
      {
        Header: "Duration",
        accessor: "duration",
      },
      {
        Header: "Check in",
        accessor: "checkIn",
        Cell: ({ row }) => (
          <button
            className="confirm-appt-checkin-btn"
            onClick={() => {
              setAppointmentId(row.original.appointmentId);
              setShowModal(true);
            }}
          >
            Check in
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
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const handleNextClick = () => {
    if (page < totalPages - 1) {
      setPage(page + 1);
    }
  };

  const handleCountChange = (event) => {
    setCount(parseInt(event.target.value));
    setPage(0); // Reset page to 0 when changing count
  };

  return (
    <>
      <div className="confirm-appointments-header">
        <h2>Confirmed Appointments</h2>
        <button
          className="confirm-appt-checkin-btn"
          onClick={() => setShowModal(true)}
        >
          Check in
        </button>
      </div>
      {error ? (
        <h1>{error}</h1>
      ) : (
        <div className="confirm-appointments-container">
          <table {...getTableProps()} className="confirm-appointments-table">
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

          {showModal && (
            <div className="confirm-appointments-modal-overlay">
              <div className="confirm-appointments-modal-content">
                <div className="confirm-appointments-heading">
                  <img src={checkicon} alt="Check In" />
                </div>
                <h2>Check In</h2>
                <form>
                  <div>
                    <label>Appointment ID</label>
                    <input
                      type="text"
                      value={appointmentId}
                      onChange={handleAppointmentIdChange}
                    />
                  </div>
                  <div>
                    <label>Client Name</label>
                    <input
                      type="text"
                      value={currentData.clientName || ""}
                      readOnly
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCheckIn}
                    className="confirm-appointments-confirm-button"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="confirm-appointments-cancel-button"
                  >
                    Cancel
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="pagination">
        <div className="left">
          <select id="count-select" value={count} onChange={handleCountChange}>
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
          <button onClick={handleNextClick} disabled={page === totalPages - 1}>
            &gt;
          </button>
        </div>
      </div>
    </>
  );
};

export default ConfirmedAppointments;
