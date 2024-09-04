import React, { useState, useEffect, useMemo } from "react";
import { useTable } from "react-table";
import axios from "axios";
import Loader from "../components/Loader";
import "../styles/PaidAppointments.css";
import { BASE_URL, APPOINTMENTS_URL } from "../redux/constants";

const apiUrl = `${BASE_URL}${APPOINTMENTS_URL}getAllCheckInAppointmentsByBranchId/66addb87384b0263493328dd`;

const PaidAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setError(null);
        setLoading(true);
        const response = await axios.get(`${apiUrl}?page=${page}&count=${count}`);
        const data = response.data;

        setTotalPages(data.totalPages || 0);
        const formattedAppointments = data.data.map((appointment) => ({
          serviceName: Array.isArray(appointment.services)
            ? appointment.services.map((service) => service.name)
            : [],
          clientName: appointment.clientName || "",
          contact: appointment.mobile || "",
          dateTime: `${new Date(appointment.date).toLocaleDateString()} - ${
            convertTo12HourFormat(appointment.time) || ""
          }`,
          workerAssigned: appointment.workerId.name || "",
          duration: convertToHoursAndMinutes(appointment.duration) || "N/A",
          payment: "View Info",
        }));

        setAppointments(formattedAppointments);
      } catch (error) {
        console.error("API fetching error", error);
        setError("Data not fetched. Please try again later.");
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

  const convertToHoursAndMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    let result = "";
    if (hours > 0) {
      result += `${hours}h `;
    }
    if (remainingMinutes > 0) {
      result += `${remainingMinutes}m`;
    }
    return result.trim(); // Remove any trailing whitespace
  };

  const columns = useMemo(() => [
    {
      Header: "Service Name",
      accessor: "serviceName",
      Cell: ({ value }) => (
        <div className="paid-appt-service-list">
          {value.map((service, index) => (
            <span key={index} className="paid-appt-service-item">
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
      accessor: "workerAssigned",
    },
    {
      Header: "Duration",
      accessor: "duration",
    },
    {
      Header: "Payment",
      accessor: "payment",
      Cell: () => (
        <button className="paid-appt-payment-btn">View Info</button>
      ),
    },
  ], []);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data: appointments,
  });

  if (loading) return <Loader />;

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
    <div className="paid-appointments-container">
      {error ? (
        <h1 className="error-message">{error}</h1>
      ) : (
        <>
          <div className="paid-appointments-header">
            <h2>Paid Appointments</h2>
          </div>
          <table {...getTableProps()} className="paid-appointments-table">
            <thead>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                  {headerGroup.headers.map((column) => (
                    <th {...column.getHeaderProps()} key={column.id}>
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
                  <tr {...row.getRowProps()} key={row.id}>
                    {row.cells.map((cell) => (
                      <td {...cell.getCellProps()} key={cell.column.id}>
                        {cell.render("Cell")}
                      </td>
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

export default PaidAppointments;
