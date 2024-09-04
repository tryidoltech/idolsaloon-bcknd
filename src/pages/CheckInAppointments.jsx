import React, { useState, useEffect } from "react";
import { useTable } from "react-table";
import axios from "axios";
import "../styles/CheckInAppointments.css";
import PaymentPopUp from "../components/PaymentPopUp";
import Loader from "../components/Loader";
import { BASE_URL, APPOINTMENTS_URL } from "../redux/constants";

const apiUrl = `${BASE_URL}${APPOINTMENTS_URL}getAllCheckInAppointmentsByBranchId/66addb87384b0263493328dd`;

const CheckInAppointments = () => {
  const [checkedInAppointments, setCheckedInAppointments] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchCheckedInAppointments = async () => {
      try {
        const { data } = await axios.get(
          `${apiUrl}?page=${page}&count=${count}`
        );

        let totalPages = data.totalPages;
        setTotalPages(totalPages || 0);
        const formattedAppointments = data.data.map((appointment) => ({
          serviceName: appointment.services
            .map((service) => service.name)
            .join(", "),
          clientName: appointment.clientName || "",
          contact: appointment.mobile || "",
          dateTime: `${new Date(appointment.date).toLocaleDateString()} - ${
            appointment.time || ""
          }`,
          workerAssigned: appointment.workerId.name || "",
          duration: appointment.duration || "N/A",
          payment: appointment.totalBill || 0,
        }));
        setCheckedInAppointments(formattedAppointments);
      } catch (error) {
        console.error("API fetching error", error);
        setError("Data not fetching");
      } finally {
        setLoading(false);
      }
    };

    fetchCheckedInAppointments();
  }, [page, count]);

  const columns = React.useMemo(
    () => [
      { Header: "Service Name", accessor: "serviceName" },
      { Header: "Client Name", accessor: "clientName" },
      { Header: "Contact", accessor: "contact" },
      { Header: "Date - Time", accessor: "dateTime" },
      { Header: "Assigned Worker", accessor: "workerAssigned" },
      { Header: "Duration", accessor: "duration" },
      {
        Header: "Payment",
        accessor: "payment",
        Cell: ({ row }) => (
          <button
            className="checkin-appt-payment-btn"
            onClick={() => handlePaymentClick(row.original)}
          >
            Pay ₹{row.original.payment}
          </button>
        ),
      },
    ],
    []
  );

  const handlePaymentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowPopup(true);
  };

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({
      columns,
      data: checkedInAppointments,
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
    <div className="checkin-appointments-container">
      {error ? (
        <h1>{error}</h1>
      ) : (
        <>
          <div className="checkin-appointments-header">
            <h2>Checked in Appointments</h2>
          </div>
          <table {...getTableProps()} className="checkin-appointments-table">
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
          {showPopup && selectedAppointment && (
            <PaymentPopUp
              appt={selectedAppointment}
              totalAmount={selectedAppointment.payment}
              onClose={() => setShowPopup(false)}
            />
          )}

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

export default CheckInAppointments;
