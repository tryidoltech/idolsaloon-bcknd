import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import "../styles/Dashboard.css";
import "../styles/AdminDashboard.css";
import Cards from "../components/Cards";
import ApptDashCards from "../components/ApptDashCards";
import Loader from "../components/Loader";
import AdminSalesChart from "../components/AdminSalesChart";
import { BASE_URL, APPOINTMENTS_URL } from "../redux/constants";
import booking from "../assets/booking.png";
import week_booking from "../assets/week_booking.png";
import sales from "../assets/sales.png";

const apiUrl = `${BASE_URL}${APPOINTMENTS_URL}getAllAppointmentByBranchId/66addb87384b0263493328dd`;

const getRandomColor = () =>
  `#${Math.floor(Math.random() * 16777215).toString(16)}`;

const STATUS_COLORS = {
  PENDING: "#8280FF",
  CONFIRMED: "#FEC53D",
  "CHECK IN": "#4AD991",
  PAID: "#A6B5FF",
};

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    panelData: [],
    apptDashCardsData: [],
    services: [],
    weeklyRecord: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const { data } = await axios.get(apiUrl);
      const today = new Date();
      const todayString = today.toISOString().split("T")[0];

      const startOfWeek = new Date(
        today.setDate(today.getDate() - today.getDay() + 1)
      );
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const startOfWeekString = startOfWeek.toISOString().split("T")[0];
      const endOfWeekString = endOfWeek.toISOString().split("T")[0];

      const todaysAppointments = data.data.filter(
        (appointment) =>
          new Date(appointment.createdAt).toISOString().split("T")[0] ===
          todayString
      );

      const weeklyAppointments = data.data.filter((appointment) => {
        const createdAtDate = new Date(appointment.createdAt)
          .toISOString()
          .split("T")[0];
        return (
          createdAtDate >= startOfWeekString && createdAtDate <= endOfWeekString
        );
      });

      const statusCounts = data.data.reduce(
        (acc, appointment) => {
          if (acc[appointment.status] !== undefined) {
            acc[appointment.status]++;
          }
          return acc;
        },
        { PENDING: 0, CONFIRMED: 0, "CHECK IN": 0, PAID: 0 }
      );

      const panelData = [
        {
          id: "1",
          heading: "Today Booking",
          img: booking,
          panelinfo: todaysAppointments.length,
        },
        {
          id: "2",
          heading: "Week Booking",
          img: week_booking,
          panelinfo: weeklyAppointments.length,
        },
        {
          id: "3",
          heading: "Total Sales",
          img: sales,
          panelinfo: data.all_sales || 0,
        },
        {
          id: "4",
          heading: "Weekly Sales",
          img: sales,
          panelinfo: data.weekly_sales || 0,
        },
      ];

      const apptDashCardsData = Object.entries(statusCounts).map(
        ([status, count]) => ({
          status: `${status} Appointment`,
          count,
          color: STATUS_COLORS[status],
        })
      );

      const services = Object.entries(data.items_overview || {}).map(
        ([name, sales]) => ({
          name,
          sales,
          color: getRandomColor(),
        })
      );

      setDashboardData({
        panelData,
        apptDashCardsData,
        services,
        weeklyRecord: data.weeklyRecord || {},
      });
    } catch (err) {
      setError("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const totalSales = useMemo(
    () =>
      dashboardData.panelData.find((item) => item.heading === "Total Sales")
        ?.panelinfo || 0,
    [dashboardData.panelData]
  );

  if (loading) return <Loader />;
  if (error) return <h1>{error}</h1>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-heading">
        {/* <h3>Dashboard</h3> */}
      </div>
      <div className="dashboard-panel">
        {dashboardData.panelData.map((data) => (
          <Cards
            key={data.id}
            heading={data.heading}
            img={data.img}
            values={[data.panelinfo]}
          />
        ))}
      </div>
      <div className="dashboard-cards-panel2">
        {dashboardData.apptDashCardsData.map((data, index) => (
          <ApptDashCards
            key={index}
            status={data.status}
            count={data.count}
            color={data.color}
          />
        ))}
      </div>
      <div className="admin-sales-chart-section">
        <div className="admin-sales-chart-box">
          <AdminSalesChart
            totalSales={totalSales}
            weeklyRecord={dashboardData.weeklyRecord}
          />
        </div>
        <div className="admin-service-list-box">
          <div className="admin-services-list">
            <h4>Services</h4>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Sales</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.services.map((service, index) => (
                  <tr key={index}>
                    <td>{service.name}</td>
                    <td>
                      <span
                        className="admin-sales-percentage"
                        style={{ backgroundColor: service.color }}
                      >
                        {service.sales}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
