import React, { useEffect, useState } from "react";
import { useTable } from "react-table";
import axios from "axios";
import "../styles/StockManagement.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import add_product from "../assets/add_product.png";
import Loader from "../components/Loader";
import { BASE_URL, PRODUCTS_URL } from "../redux/constants";

const apiUrl = `${BASE_URL}${PRODUCTS_URL}`;

const StocksManagement = () => {
  const [data, setData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null); // For delete index
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // For delete modal state
  const [newProduct, setNewProduct] = useState({
    image: "",
    productName: "",
    price: "",
    piece: "",
  });
  const [imagePreview, setImagePreview] = useState("");
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `${apiUrl}getAllProductsByBranch/66addb87384b0263493328dd`
        );
        const fetchedData = response.data;
        console.log(fetchedData);
        const totalPages = fetchedData.totalPages;
        setTotalPages(totalPages || 0);

        const formattedData = fetchedData.data.map((item) => ({
          id: item._id,
          image: item?.image[0] || "N/A",
          productName: item?.title || "N/A",
          price: item?.price,
          piece: item?.stock,
        }));

        setData(formattedData);
      } catch (error) {
        console.error("Error fetching data: ", error);
        setError("Product not found for this branch");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = React.useMemo(
    () => [
      {
        Header: "Image",
        accessor: "image",
        Cell: ({ cell: { value } }) => (
          <img src={value} alt="Product" className="stock-product-image" />
        ),
      },
      {
        Header: "Product Name",
        accessor: "productName",
      },
      {
        Header: "Price",
        accessor: "price",
      },
      {
        Header: "Piece",
        accessor: "piece",
      },
      {
        Header: "Action",
        accessor: "action",
        Cell: ({ row }) => (
          <div className="stock-action-icons">
            <FaEdit
              className="stock-edit-icon"
              onClick={() => openModal(true, row.index)}
            />
            <FaTrash
              className="stock-delete-icon"
              onClick={() => openDeleteModal(row.index)}
            />
          </div>
        ),
      },
    ],
    [data]
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });

  const openModal = (isEdit = false, index = null) => {
    setIsOpen(true);
    setIsEditMode(isEdit);
    setEditIndex(index);

    if (isEdit && index !== null) {
      const product = data[index];
      setNewProduct({
        image: "",
        productName: product.productName,
        price: product.price,
        piece: product.piece,
      });
      setImagePreview(product.image);
    } else {
      setNewProduct({
        image: "",
        productName: "",
        price: "",
        piece: "",
      });
      setImagePreview("");
    }
  };

  const closeModal = () => setIsOpen(false);

  const openDeleteModal = (index) => {
    setDeleteIndex(index);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "productName" && value.length > 15) {
      return;
    }
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProduct({ ...newProduct, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (isEditMode) {
      handleEditSubmit();
    } else {
      handleAddSubmit();
    }
  };

  const handleAddSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("title", newProduct.productName);
      formData.append("stock", newProduct.piece);
      formData.append("price", newProduct.price);
      formData.append("branchId", "66addb87384b0263493328dd");

      if (newProduct.image) {
        formData.append("image", newProduct.image);
      }

      const response = await axios.post(`${apiUrl}createProduct`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const newProductWithImageUrl = {
        ...newProduct,
        image: response.data.imageUrl || imagePreview,
      };

      setData((prevData) => [...prevData, newProductWithImageUrl]);

      setNewProduct({
        image: "",
        productName: "",
        price: "",
        piece: "",
      });
      setImagePreview("");
      closeModal();
    } catch (error) {
      console.error("Error uploading data: ", error);
    }
  };

  const handleEditSubmit = async () => {
    try {
      if (editIndex === null || editIndex >= data.length) {
        console.error("Invalid edit index");
        return;
      }

      const product = data[editIndex];

      if (!product.id) {
        console.error("Product ID is undefined");
        return;
      }

      const formData = new FormData();
      formData.append("title", newProduct.productName);
      formData.append("stock", newProduct.piece);
      formData.append("price", newProduct.price);
      formData.append("branchId", "66addb87384b0263493328dd");

      if (newProduct.image) {
        formData.append("image", newProduct.image);
      }

      const response = await axios.put(
        `${apiUrl}updateProduct/${product.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        const updatedProductWithImageUrl = {
          ...newProduct,
          image: response.data.imageUrl || imagePreview,
          id: product.id,
        };

        const updatedData = [...data];
        updatedData[editIndex] = updatedProductWithImageUrl;
        setData(updatedData);

        setNewProduct({
          image: "",
          productName: "",
          price: "",
          piece: "",
        });
        setImagePreview("");
        closeModal();
      } else {
        console.error("Failed to update product:", response.data.message);
      }
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  const handleDelete = async () => {
    const product = data[deleteIndex];
    try {
      const response = await axios.delete(
        `${apiUrl}deleteProduct/${product.id}`
      );

      const updatedData = data.filter((_, index) => index !== deleteIndex);
      setData(updatedData);
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting data: ", error);
    }
  };

  const handleClick = () => {
    document.getElementById("fileInput").click();
  };

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
      <div className="stock-header">
        <h2>Stock Management</h2>
        <button className="stock-add-btn" onClick={() => openModal(false)}>
          Add Product
        </button>
      </div>
      <p>
        {error ? (
          <h1>{error}</h1>
        ) : (
          <>
            <div>
              <table {...getTableProps()} className="stock-product-table">
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
                          <td {...cell.getCellProps()}>
                            {cell.render("Cell")}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {isOpen && (
                <div className="stock-modal-overlay">
                  <div className="stock-modal-content">
                    <div className="stock-header-content">
                      <img
                        src={add_product}
                        alt=""
                        className="stock-header-img"
                      />
                      <h3 className="stock-modal-title">
                        {isEditMode ? "Edit Product" : "Add Product"}
                      </h3>
                    </div>
                    <form className="stock-modal-form">
                      <div className="stock-form-group">
                        <label>
                          Product Image
                          <div
                            className="stock-image-upload"
                            onClick={handleClick}
                          >
                            <input
                              type="file"
                              // id="fileInput"
                              name="image"
                              onChange={handleImageChange}
                              style={{ display: "none" }}
                            />
                            <div className="stock-image-preview-container">
                              {imagePreview ? (
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="stock-image-preview"
                                />
                              ) : (
                                <span className="stock-placeholder-text">
                                  Click to upload or drag and drop
                                </span>
                              )}
                            </div>
                            {newProduct.image && (
                              <div className="stock-image-name">
                                {newProduct.image.name}
                              </div>
                            )}
                          </div>
                        </label>
                      </div>
                      <div className="stock-form-group">
                        <label>Product Name</label>
                        <input
                          type="text"
                          name="productName"
                          value={newProduct.productName}
                          onChange={handleInputChange}
                          placeholder="example"
                          maxLength="15"
                          disabled={isEditMode}
                          className="edit-modal-product-name"
                        />
                        {newProduct.productName.length > 15 && (
                          <div className="error-message">
                            Name must be 15 characters or less
                          </div>
                        )}
                      </div>
                      <div className="stock-form-group">
                        <label>Price</label>
                        <input
                          type="number"
                          name="price"
                          value={newProduct.price}
                          onChange={handleInputChange}
                          placeholder="100"
                        />
                      </div>
                      <div className="stock-form-group">
                        <label>Quantity</label>
                        <input
                          type="number"
                          name="piece"
                          value={newProduct.piece}
                          onChange={handleInputChange}
                          placeholder="20"
                        />
                      </div>
                      <div className="stock-modal-buttons">
                        <button type="button" onClick={closeModal}>
                          Cancel
                        </button>
                        <button type="button" onClick={handleSubmit}>
                          Confirm
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {isDeleteModalOpen && (
                <div className="stock-modal-overlay">
                  <div className="stock-modal-content">
                    <div className="stock-header-content">
                      <h3 className="stock-modal-title">Delete Product</h3>
                    </div>
                    <p>Are you sure you want to delete this product?</p>
                    <div className="stock-modal-buttons">
                      <button type="button" onClick={closeDeleteModal}>
                        Cancel
                      </button>
                      <button type="button" onClick={handleDelete}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

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
      </p>
    </>
  );
};

export default StocksManagement;
