import React, { useState, useEffect, useCallback } from "react";
import { useTable } from "react-table";
import Modal from "react-modal";
import axios from "axios";
import img from "../assets/add_product.png";
import uploadIcon from "../assets/Avatar.png";
import { FaEdit, FaTrash } from "react-icons/fa";
import "../styles/AdminServicesList.css";
import Loader from "../components/Loader";
import { BASE_URL, SERVICES_URL } from "../redux/constants";

Modal.setAppElement("#root");

const apiUrl = `${BASE_URL}${SERVICES_URL}`;

const AdminServicesList = () => {
  const [data, setData] = useState([]);
  const [addModalIsOpen, setAddModalIsOpen] = useState(false);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  // const [newService, setNewService] = useState({});
  const [editService, setEditService] = useState({});
  const [deleteServiceId, setDeleteServiceId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedEditFile, setSelectedEditFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [newService, setNewService] = useState({
    image: "",
    name: "",
    price: "",
    duration: "",
    description: "",
  });

  const [imagePreview, setImagePreview] = useState("");

  const fetchServices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get(
        `${apiUrl}getAllServicesByBranch/66addb87384b0263493328dd?page=${page}&count=${count}`
      );
      console.log("Edit Service State:", editService); // Check if the state is updated correctly

      const services = response.data.data; // Adjust based on actual API response structure
      const totalPages = response.data.totalPages; // Ensure your API returns total count

      setTotalPages(Math.ceil(totalPages / count));
      setData(
        services.map((service) => ({
          id: service._id,
          image: service.image,
          serviceName: service.name,
          price: service.price,
          duration: service.duration,
          description: service.description,
        }))
      );
    } catch (error) {
      console.error("Error fetching services data", error);
      setError("Failed to fetch services data");
    } finally {
      setIsLoading(false);
    }
  }, [page, count]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices, page, count]);

  const columns = React.useMemo(
    () => [
      {
        Header: "Image",
        accessor: "image",
        Cell: ({ value }) => (
          <img
            src={value}
            alt="Service"
            style={{ width: 50, height: 50, objectFit: "cover" }}
          />
        ),
      },
      {
        Header: "Service Name",
        accessor: "serviceName",
      },
      {
        Header: "Price",
        accessor: "price",
      },
      {
        Header: "Duration",
        accessor: "duration",
      },
      {
        Header: "Action",
        Cell: ({ row: { original } }) => (
          <div className="admin-services-action-buttons">
            <FaEdit
              className="admin-services-edit-button"
              onClick={() => openEditModal(original)}
            />
            <FaTrash
              className="admin-services-delete-button"
              onClick={() => openDeleteModal(original.id)}
            />
          </div>
        ),
      },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });

  const handleChange = (e, setter) => {
    const { name, value, files } = e.target;
    setter((prevState) => ({
      ...prevState,
      [name]: files ? files[0] : value,
    }));

    if (files && files.length > 0) {
      setImagePreview(URL.createObjectURL(files[0])); // Set the image preview
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData();
    Object.entries(newService).forEach(([key, value]) =>
      formData.append(key, value)
    );
    if (selectedFile) formData.append("image", selectedFile);

    try {
      await axios.post(`${apiUrl}createService`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchServices(); // Refresh data after adding
      closeAddModal();
    } catch (error) {
      console.error(
        "Error adding service:",
        error.response ? error.response.data : error.message
      );
      setError("Error adding service");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditService = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("name", editService.serviceName);
    formData.append("description", editService.description);
    formData.append("price", editService.price);
    formData.append("duration", editService.duration);

    if (selectedEditFile) {
      formData.append("image", selectedEditFile);
    }

    try {
      if (!editService.id) {
        throw new Error("Service ID is required to update the service.");
      }

      const response = await axios.put(
        `${apiUrl}updateService/${editService.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Service updated successfully:", response.data);
      await fetchServices(); // Refresh data after editing
      closeEditModal();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error editing service";
      console.error("Error details:", error); // Log the complete error for debugging
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteService = async () => {
    setIsLoading(true);
    try {
      await axios.delete(`${apiUrl}deleteService/${deleteServiceId}`);
      await fetchServices(); // Refresh data after deleting
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting service:", error);
      setError("Error deleting service");
    } finally {
      setIsLoading(false);
    }
  };

  const closeAddModal = () => {
    setAddModalIsOpen(false);
    setSelectedFile(null);
    setImagePreview(""); // Clear the image preview
  };

  const closeEditModal = () => {
    setEditModalIsOpen(false);
    setSelectedEditFile(null);
    setImagePreview(""); // Clear the image preview
  };

  const closeDeleteModal = () => setDeleteModalIsOpen(false);

  const openAddModal = () => {
    setNewService({
      image: "",
      serviceName: "",
      price: "",
      duration: "",
      description: "",
    });
    setSelectedFile(null);
    setAddModalIsOpen(true);
  };

  const openEditModal = (service) => {
    
    setEditService({
      id: service.id,
      image: service.image,
      serviceName: service.serviceName,
      price: service.price,
      duration: service.duration,
      description: service.description,
    });
    setSelectedEditFile(null);
    setEditModalIsOpen(true);
  };

  const openDeleteModal = (id) => {
    setDeleteServiceId(id);
    setDeleteModalIsOpen(true);
  };

  if (isLoading) return <Loader />;

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
    setCount(parseInt(event.target.value, 10));
    setPage(0); // Reset page to 0 when changing count
    fetchServices(); // Fetch the updated services with the new count
  };

  return (
    <>
      <div className="admin-services-heading">
        <h2>Services</h2>
        <button onClick={openAddModal}>Add New Service</button>
      </div>

      {error ? (
        <h1>{error}</h1>
      ) : (
        <table {...getTableProps()} className="admin-services-table">
          <thead>
            {headerGroups.map((headerGroup, headerGroupIndex) => (
              <tr
                key={headerGroupIndex}
                {...headerGroup.getHeaderGroupProps()}
                className="admin-header-row"
              >
                {headerGroup.headers.map((column, columnIndex) => (
                  <th
                    key={columnIndex}
                    {...column.getHeaderProps()}
                    className="admin-header-cell"
                  >
                    {column.render("Header")}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className="admin-tbody">
            {rows.map((row, rowIndex) => {
              prepareRow(row);
              return (
                <tr
                  key={rowIndex}
                  {...row.getRowProps()}
                  className="admin-table-row"
                >
                  {row.cells.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      {...cell.getCellProps()}
                      className="admin-table-cell"
                    >
                      {cell.render("Cell")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
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

      {/* Add Service Modal */}
      <Modal
        isOpen={addModalIsOpen}
        onRequestClose={closeAddModal}
        contentLabel="Add Service"
        className="admin-service-Modal"
        overlayClassName="admin-service-Overlay"
      >
        <div className="admin-service-heading">
          <img src={img} alt="Add" className="admin-service-add-image" />
          <h2>Add Service</h2>
        </div>
        <form onSubmit={handleAddService}>
          <div className="admin-service-form-group">
            <label>Service Image</label>
            <div
              className="admin-service-image-upload"
              onClick={() => document.getElementById("fileInput").click()}
            >
              <img
                src={
                  selectedFile ? URL.createObjectURL(selectedFile) : uploadIcon
                }
                alt="Upload"
                className="admin-add-image"
              />
              {!selectedFile && <span>Click to upload or drag and drop</span>}
              {selectedFile && (
                <span>
                  {selectedFile.name.length > 20
                    ? `${selectedFile.name.substring(0, 20)}...`
                    : selectedFile.name}
                </span>
              )}
              <input
                type="file"
                id="fileInput"
                style={{ display: "none" }}
                onChange={(e) => handleChange(e, setSelectedFile)}
              />
            </div>
          </div>
          <div className="admin-service-form-group">
            <label>Service Name</label>
            <input
              type="text"
              name="serviceName"
              value={newService.serviceName || ""}
              onChange={(e) => handleChange(e, setNewService)}
              placeholder="example"
              required
            />
          </div>
          <div className="admin-service-form-group">
            <label>Price</label>
            <input
              type="number"
              name="price"
              value={newService.price || ""}
              onChange={(e) => handleChange(e, setNewService)}
              placeholder="example"
              required
            />
          </div>
          <div className="admin-service-form-group">
            <label>Duration</label>
            <input
              type="text"
              name="duration"
              value={newService.duration || ""}
              onChange={(e) => handleChange(e, setNewService)}
              placeholder="example"
              required
            />
          </div>
          <div className="admin-service-form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={newService.description || ""}
              onChange={(e) => handleChange(e, setNewService)}
              placeholder="example"
              required
            />
          </div>
          <div className="btn">
            <button className="first-btn" type="button" onClick={closeAddModal}>
              Cancel
            </button>
            <button className="second-btn" type="submit">
              Add Service
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Service Modal */}
      <Modal
        isOpen={editModalIsOpen}
        onRequestClose={closeEditModal}
        contentLabel="Edit Service"
        className="admin-service-Modal"
        overlayClassName="admin-service-Overlay"
      >
        <div className="admin-service-heading">
          <img src={img} alt="Edit" className="admin-service-add-image" />
          <h2>Edit Service</h2>
        </div>
        <form onSubmit={handleEditService}>
          <div className="admin-service-form-group">
            <label>Service Image</label>
            <div
              className="admin-service-image-upload"
              onClick={() => document.getElementById("editFileInput").click()}
            >
              <img
                src={
                  selectedEditFile
                    ? URL.createObjectURL(selectedEditFile)
                    : editService.image
                }
                alt="Upload"
                className="admin-add-image"
              />
              {!selectedEditFile && (
                <span>Click to upload or drag and drop</span>
              )}
              {selectedEditFile && (
                <span>
                  {selectedEditFile.name.length > 20
                    ? `${selectedEditFile.name.substring(0, 20)}...`
                    : selectedEditFile.name}
                </span>
              )}
              <input
                type="file"
                id="editFileInput"
                style={{ display: "none" }}
                onChange={(e) => handleChange(e, setSelectedEditFile)}
              />
            </div>
          </div>
          <div className="admin-service-form-group">
            <label>Service Name</label>
            <input
              type="text"
              name="serviceName"
              value={editService.serviceName || ""}
              onChange={(e) => handleChange(e, setEditService)}
              placeholder="example"
              required
            />
          </div>
          <div className="admin-service-form-group">
            <label>Price</label>
            <input
              type="number"
              name="price"
              value={editService.price || ""}
              onChange={(e) => handleChange(e, setEditService)}
              placeholder="example"
              required
            />
          </div>
          <div className="admin-service-form-group">
            <label>Duration</label>
            <input
              type="text"
              name="duration"
              value={editService.duration || ""}
              onChange={(e) => handleChange(e, setEditService)}
              placeholder="example"
              required
            />
          </div>
          <div className="admin-service-form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={editService.description || ""}
              onChange={(e) => handleChange(e, setEditService)}
              placeholder="example"
              required
            />
          </div>
          <div className="btn">
            <button
              className="first-btn"
              type="button"
              onClick={closeEditModal}
            >
              Cancel
            </button>
            <button className="second-btn" type="submit">
              Update Service
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Service Modal */}
      <Modal
        isOpen={deleteModalIsOpen}
        onRequestClose={closeDeleteModal}
        contentLabel="Delete Service"
        className="admin-service-Modal"
        overlayClassName="admin-service-Overlay"
      >
        <div className="admin-service-heading">
          <h2>Confirm Delete</h2>
        </div>
        <p>Are you sure you want to delete this service?</p>
        <br />
        <div className="btn">
          <button className="first-btn" onClick={closeDeleteModal}>
            Cancel
          </button>
          <button className="second-btn" onClick={handleDeleteService}>
            Delete
          </button>
        </div>
      </Modal>
    </>
  );
};

export default AdminServicesList;
