import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTable } from "react-table";
import axios from "axios";
import "../styles/AllAppointment.css";
import Loader from "../components/Loader";
import { BASE_URL, APPOINTMENTS_URL } from "../redux/constants";

const apiUrl = `${BASE_URL}${APPOINTMENTS_URL}getAllAppointmentByBranchId/66addb87384b0263493328dd`;

const STATUS_COLORS = {
  PENDING: "#FF6F6F",
  CONFIRMED: "#75ABFB",
  CHECKEDIN: "#D3DE51",
  PAID: "#16A458",
};

const AllAppointments = () => {
  const [allAppointments, setAllAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(10); // Default count set to 10
  const [totalPages, setTotalPages] = useState(0);

  const fetchAppointments = useCallback(async () => {
    try {
      const { data } = await axios.get(`${apiUrl}?page=${page}&count=${count}`);

      console.log("knjhfgdsjhkj",data)
      setTotalPages(data.totalPages);
      return data.data.map(
        ({
          services,
          clientName = "",
          mobile = "",
          date,
          time = "",
          workerId = {},
          duration = "N/A",
          status = "",
        }) => ({
          serviceName: Array.isArray(services)
            ? services.map((service) => service.name)
            : [services.name],
          clientName,
          contact: mobile,
          dateTime: `${new Date(date).toLocaleDateString()} - ${time}`,
          workerAssigned: workerId.name || "N/A",
          duration,
          status,
        })
      );
    } catch (err) {
      throw new Error("Failed to fetch appointments");
    }
  }, [page, count]);

  useEffect(() => {
    setLoading(true);
    fetchAppointments()
      .then(setAllAppointments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [fetchAppointments]);

  const columns = useMemo(
    () => [
      {
        Header: "Service Name",
        accessor: "serviceName",
        Cell: ({ value }) => (
          <div className="allappt-service-list">
            {value.map((service, index) => (
              <span key={index} className="allappt-service-item">
                {service}
              </span>
            ))}
          </div>
        ),
      },
      { Header: "Client Name", accessor: "clientName" },
      { Header: "Contact", accessor: "contact" },
      { Header: "Date - Time", accessor: "dateTime" },
      { Header: "Worker Assigned", accessor: "workerAssigned" },
      { Header: "Duration", accessor: "duration" },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value }) => (
          <button
            className="allappt-status-button"
            style={{
              backgroundColor: STATUS_COLORS[value.toUpperCase()] || "#000",
            }}
          >
            {value}
          </button>
        ),
      },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data: allAppointments });

  if (loading) return <Loader />;
  if (error) return <h1>{error}</h1>;

  // Calculate page numbers to display
  const renderPageNumbers = () => {
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
    <div className="allappt-container">
      <h1>All Appointments</h1>
      <table {...getTableProps()} className="allappt-table">
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()}>{column.render("Header")}</th>
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
    </div>
  );
};

export default AllAppointments;
