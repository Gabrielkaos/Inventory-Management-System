import { useEffect, useState } from "react"
import api from "../api/api"
import Header from "../components/Header"
import "./Products.css"

const Products = () => {
    const [products, setProducts] = useState([])
    const [filteredProducts, setFilteredProducts] = useState([])
    const [categories, setCategories] = useState([])

    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)

    // Form states
    const [productName, setProductName] = useState("")
    const [productDescription, setProductDescription] = useState("")
    const [productCategory, setProductCategory] = useState("")
    const [productUnit, setProductUnit] = useState("")
    const [productStock, setProductStock] = useState("")

    // Modal states
    const [editModal, setEditModal] = useState(false)
    const [detailModal, setDetailModal] = useState(false)
    const [editProduct, setEditProduct] = useState(null)
    const [selectedProduct, setSelectedProduct] = useState(null)

    // Filter & Search states
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [categoryFilter, setCategoryFilter] = useState("all")
    const [sortBy, setSortBy] = useState("updated")

    // Bulk operations
    const [selectedProducts, setSelectedProducts] = useState([])

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const res = await api.get("/products")
            setProducts(res.data.data.products)
            setFilteredProducts(res.data.data.products)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const fetchCategories = async () => {
        try {
            const res = await api.get("/categories")
            setCategories(res.data.data.categories)
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        fetchProducts()
        fetchCategories()
    }, [])

    // Filter and search logic
    useEffect(() => {
        let result = [...products]

        // Search filter
        if (searchQuery) {
            result = result.filter(p => 
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.uniqueCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
            )
        }

        // Status filter
        if (statusFilter !== "all") {
            result = result.filter(p => p.status === statusFilter)
        }

        // Category filter
        if (categoryFilter !== "all") {
            result = result.filter(p => p.categoryId === categoryFilter)
        }

        // Sorting
        result.sort((a, b) => {
            switch(sortBy) {
                case "name":
                    return a.name.localeCompare(b.name)
                case "stock":
                    return b.stock - a.stock
                case "updated":
                default:
                    return new Date(b.updatedAt) - new Date(a.updatedAt)
            }
        })

        setFilteredProducts(result)
    }, [searchQuery, statusFilter, categoryFilter, sortBy, products])

    const addProduct = async (e) => {
        e.preventDefault()
        setError("")

        try {
            const res = await api.post("/products", {
                name: productName,
                description: productDescription,
                categoryId: productCategory,
                stock: productStock,
                unit: productUnit,
            })

            if (res.data.status === "success") {
                fetchProducts()
                setProductName("")
                setProductDescription("")
                setProductCategory("")
                setProductUnit("")
                setProductStock("")
            }
        } catch (err) {
            if (err.response?.data?.details) {
                setError(err.response.data.details[0].msg)
            } else {
                setError("Error adding product.")
            }
        }
    }

    const openEdit = (product) => {
        setEditProduct(product)
        setEditModal(true)
    }

    const openDetails = (product) => {
        setSelectedProduct(product)
        setDetailModal(true)
    }

    const updateProduct = async (e) => {
        e.preventDefault()
        setError("")

        try {
            const res = await api.put(`/products/${editProduct.id}`, {
                name: editProduct.name,
                description: editProduct.description,
                categoryId: editProduct.categoryId,
                stock: editProduct.stock,
                unit: editProduct.unit,
            })

            if (res.data.status === "success") {
                setEditModal(false)
                fetchProducts()
            }
        } catch (err) {
            setError("Update failed.")
        }
    }

    const deleteProduct = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return

        try {
            await api.delete(`/products/${id}`)
            fetchProducts()
        } catch (err) {
            alert("Failed to delete product")
        }
    }


    const bulkDelete = async () => {
        if (!window.confirm(`Delete ${selectedProducts.length} products?`)) return

        try {
            await Promise.all(selectedProducts.map(id => api.delete(`/products/${id}`)))
            setSelectedProducts([])
            fetchProducts()
        } catch (err) {
            alert("Failed to delete products")
        }
    }

    const toggleSelectProduct = (id) => {
        setSelectedProducts(prev => 
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        )
    }

    const toggleSelectAll = () => {
        if (selectedProducts.length === filteredProducts.length) {
            setSelectedProducts([])
        } else {
            setSelectedProducts(filteredProducts.map(p => p.id))
        }
    }

    const getStatusBadge = (status) => {
        const badges = {
            "active": { class: "status-active", label: "Active" },
            "discontinued": { class: "status-discontinued", label: "Discontinued" },
            "out-of-stock": { class: "status-outofstock", label: "Out of Stock" }
        }
        return badges[status] || badges["active"]
    }

    const getStockClass = (stock) => {
        if (stock === 0) return "stock-zero"
        if (stock < 10) return "stock-low"
        if (stock < 50) return "stock-medium"
        return "stock-high"
    }

    // Statistics
    const stats = {
        total: products.length,
        active: products.filter(p => p.status === "active").length,
        lowStock: products.filter(p => p.stock < 10).length,
        outOfStock: products.filter(p => p.stock === 0).length
    }

    return (
        <div>
            <Header />

            <div className="products-container">
                <div className="products-header">
                    <h2>Products Management</h2>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading products...</p>
                    </div>
                ) : (
                    <>
                        {/* Statistics Cards */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#A96424"><path d="M440-183v-274L200-596v274l240 139Zm80 0 240-139v-274L520-457v274Zm-80 92L160-252q-19-11-29.5-29T120-321v-318q0-22 10.5-40t29.5-29l280-161q19-11 40-11t40 11l280 161q19 11 29.5 29t10.5 40v318q0 22-10.5 40T800-252L520-91q-19 11-40 11t-40-11Zm200-528 77-44-237-137-78 45 238 136Zm-160 93 78-45-237-137-78 45 237 137Z"/></svg>
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.total}</h3>
                                    <p>Total Products</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#78A75A"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.active}</h3>
                                    <p>Active Products</p>
                                </div>
                            </div>
                            <div className="stat-card stat-warning">
                                <div className="stat-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#7A611D"><path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z"/></svg>
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.lowStock}</h3>
                                    <p>Low Stock</p>
                                </div>
                            </div>
                            <div className="stat-card stat-danger">
                                <div className="stat-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#EA3323"><path d="m336-280 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.outOfStock}</h3>
                                    <p>Out of Stock</p>
                                </div>
                            </div>
                        </div>

                        {/* Add Product Form */}
                        <div className="form-section">
                            <h3>Add New Product</h3>
                            <form onSubmit={addProduct} className="product-form">
                                {error && <p className="error">{error}</p>}

                                <input 
                                    placeholder="Product Name" 
                                    value={productName} 
                                    onChange={(e)=>setProductName(e.target.value)} 
                                    required
                                />

                                <textarea 
                                    placeholder="Product Description" 
                                    value={productDescription} 
                                    onChange={(e)=>setProductDescription(e.target.value)} 
                                />

                                <select 
                                    value={productCategory} 
                                    onChange={(e)=>setProductCategory(e.target.value)}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>

                                <input 
                                    placeholder="Stock Quantity" 
                                    type="number"
                                    value={productStock} 
                                    onChange={(e)=>setProductStock(e.target.value)} 
                                    required
                                />

                                <select 
                                    value={productUnit} 
                                    onChange={(e)=>setProductUnit(e.target.value)}
                                    required
                                >
                                    <option value="">Select Unit</option>
                                    <option value="kg">Kilograms</option>
                                    <option value="g">Grams</option>
                                    <option value="box">Box</option>
                                    <option value="pcs">Pieces</option>
                                    <option value="pack">Pack</option>
                                    <option value="liter">Liter</option>
                                </select>

                                <button type="submit">Add Product</button>
                            </form>
                        </div>

                        {/* Filters & Search */}
                        <div className="filters-section">
                            <div className="search-box">
                                <input 
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                                <option value="all">All Categories</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>

                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="discontinued">Discontinued</option>
                                <option value="out-of-stock">Out of Stock</option>
                            </select>

                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="updated">Recently Updated</option>
                                <option value="name">Name (A-Z)</option>
                                <option value="stock">Stock Level</option>
                            </select>

                            {selectedProducts.length > 0 && (
                                <button className="bulk-delete-btn" onClick={bulkDelete}>
                                    Delete Selected ({selectedProducts.length})
                                </button>
                            )}
                        </div>

                        {/* Products Table */}
                        <div className="table-section">
                            <div className="table-header">
                                <h3>Product Inventory ({filteredProducts.length})</h3>
                            </div>

                            <table className="product-table">
                                <thead>
                                    <tr>
                                        <th>
                                            <input 
                                                type="checkbox"
                                                checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                                                onChange={toggleSelectAll}
                                            />
                                        </th>
                                        <th>Name</th>
                                        <th>Category</th>
                                        <th>Stock</th>
                                        <th>Unit</th>
                                        <th>Status</th>
                                        <th>Code</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="empty-state">
                                                {searchQuery || statusFilter !== "all" || categoryFilter !== "all" 
                                                    ? "No products match your filters" 
                                                    : "No products found. Add your first product above."}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredProducts.map(product => (
                                            <tr key={product.id}>
                                                <td>
                                                    <input 
                                                        type="checkbox"
                                                        checked={selectedProducts.includes(product.id)}
                                                        onChange={() => toggleSelectProduct(product.id)}
                                                    />
                                                </td>
                                                <td>
                                                    <strong>{product.name}</strong>
                                                    {product.description && (
                                                        <div className="product-desc">{product.description.substring(0, 50)}...</div>
                                                    )}
                                                </td>
                                                <td>{product.category?.name || '-'}</td>
                                                <td>
                                                    <div className="stock-control">
                                                        
                                                        <span className={`stock-value ${getStockClass(product.stock)}`}>
                                                            {product.stock}
                                                        </span>
                                                        
                                                    </div>
                                                </td>
                                                <td>{product.unit}</td>
                                                <td>
                                                    <span className={`status-badge ${getStatusBadge(product.status).class}`}>
                                                        {getStatusBadge(product.status).label}
                                                    </span>
                                                </td>
                                                <td><code>{product.uniqueCode}</code></td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button 
                                                            className="btn-view"
                                                            onClick={() => openDetails(product)}
                                                            title="View Details"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#ffffffff"><path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"/></svg>
                                                        </button>
                                                        <button 
                                                            className="btn-edit"
                                                            onClick={() => openEdit(product)}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#6b5c5cff"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
                                                        </button>
                                                        <button 
                                                            className="btn-delete"
                                                            onClick={() => deleteProduct(product.id)}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#434343"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* Edit Modal */}
                {editModal && (
                    <div className="modal">
                        <div className="modal-content">
                            <h3>Edit Product</h3>

                            <form onSubmit={updateProduct}>
                                <input 
                                    placeholder="Product Name"
                                    value={editProduct.name} 
                                    onChange={(e)=>setEditProduct({...editProduct, name:e.target.value})} 
                                    required
                                />

                                <textarea 
                                    placeholder="Product Description"
                                    value={editProduct.description || ''} 
                                    onChange={(e)=>setEditProduct({...editProduct, description:e.target.value})} 
                                />

                                <select 
                                    value={editProduct.categoryId} 
                                    onChange={(e)=>setEditProduct({...editProduct, categoryId:e.target.value})}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>

                                <input 
                                    placeholder="Stock Quantity"
                                    type="number"
                                    value={editProduct.stock} 
                                    onChange={(e)=>setEditProduct({...editProduct, stock:e.target.value})} 
                                    required
                                />

                                <select 
                                    value={editProduct.unit} 
                                    onChange={(e)=>setEditProduct({...editProduct, unit:e.target.value})}
                                    required
                                >
                                    <option value="">Select Unit</option>
                                    <option value="kg">Kilograms</option>
                                    <option value="g">Grams</option>
                                    <option value="box">Box</option>
                                    <option value="pcs">Pieces</option>
                                    <option value="pack">Pack</option>
                                    <option value="liter">Liter</option>
                                </select>

                                <button type="submit">Save Changes</button>
                                <button type="button" onClick={()=>setEditModal(false)}>Cancel</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Detail Modal */}
                {detailModal && selectedProduct && (
                    <div className="modal">
                        <div className="modal-content detail-modal">
                            <h3>Product Details</h3>
                            
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>Product Name:</label>
                                    <p>{selectedProduct.name}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Unique Code:</label>
                                    <p><code>{selectedProduct.uniqueCode}</code></p>
                                </div>
                                <div className="detail-item">
                                    <label>Category:</label>
                                    <p>{selectedProduct.category?.name || 'N/A'}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Stock:</label>
                                    <p className={getStockClass(selectedProduct.stock)}>
                                        {selectedProduct.stock} {selectedProduct.unit}
                                    </p>
                                </div>
                                <div className="detail-item">
                                    <label>Status:</label>
                                    <span className={`status-badge ${getStatusBadge(selectedProduct.status).class}`}>
                                        {getStatusBadge(selectedProduct.status).label}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <label>Description:</label>
                                    <p>{selectedProduct.description || 'No description'}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Created:</label>
                                    <p>{new Date(selectedProduct.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Last Updated:</label>
                                    <p>{new Date(selectedProduct.updatedAt).toLocaleString()}</p>
                                </div>
                            </div>

                            <button type="button" onClick={()=>setDetailModal(false)}>Close</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Products