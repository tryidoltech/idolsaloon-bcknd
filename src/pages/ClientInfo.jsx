import React, { useState, useEffect } from "react";
import { useTable } from "react-table";
import axios from "axios";
import Loader from "../components/Loader";
import "../styles/ClientInfo.css";
import { BASE_URL, BRANCHES_URL } from "../redux/constants";

const apiUrl = `${BASE_URL}${BRANCHES_URL}`;

const ClientInfo = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [services, setServices] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data } = await axios.get(
          `${apiUrl}getClientInfo/66addb87384b0263493328dd`
        );

        const totalPages = data.totalPages;
        setTotalPages(totalPages || 0);
        const formattedClients = data.data.map((client) => ({
          name: client.name || "N/A",
          email: client.email || "",
          phone: client.mobile || "",
          gender: client.gender || "N/A",
          pincode: client.pincode || "N/A",
        }));
        setClients(formattedClients);
      } catch (error) {
        console.error("API fetching error", error);
        setError("Failed to fetch client data");
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [page, count]);

  const handleViewInfo = async (phone) => {
    try {
      const { data } = await axios.post(`${apiUrl}getClientDetails`, { phone });
      if (data.success) {
        const allServices = data.appointments.flatMap(
          (appointment) => appointment.services || []
        );
        setServices(allServices);
        setShowPopup(true);
      } else {
        console.error("Failed to fetch client details.");
      }
    } catch (error) {
      console.error("Error fetching client details: ", error);
    }
  };

  const columns = React.useMemo(
    () => [
      { Header: "Name", accessor: "name" },
      { Header: "Email", accessor: "email" },
      { Header: "Phone.no", accessor: "phone" },
      { Header: "Gender", accessor: "gender" },
      { Header: "Pincode", accessor: "pincode" },
      {
        Header: "View Information",
        accessor: "viewInfo",
        Cell: ({ row }) => (
          <button
            className="client-info-button"
            onClick={() => handleViewInfo(row.original.phone)}
          >
            View Info
          </button>
        ),
      },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({
      columns,
      data: clients,
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
    <div className="client-info-container">
      {error ? (
        <h1>{error}</h1>
      ) : (
        <>
          <h1>Client Information</h1>
          <table {...getTableProps()} className="client-info-table">
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

          {showPopup && (
            <div className="client-popup">
              <div className="client-popup-content">
                <h2>Services</h2>
                <ul className="service-list">
                  {services.map((service, index) => (
                    <li key={index} className="service-item">
                      {service}
                    </li>
                  ))}
                </ul>
                <button
                  className="client-info-button"
                  onClick={() => setShowPopup(false)}
                >
                  Close
                </button>
              </div>
            </div>
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

export default ClientInfo;
