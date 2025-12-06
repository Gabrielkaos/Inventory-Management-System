import { useState, useEffect } from "react"
import Header from "../components/Header"
import api from "../api/api"
import "./Categories.css"

const Categories = () => {
    const [categories, setCategories] = useState([])
    const [filteredCategories, setFilteredCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    // Form states
    const [categoryName, setCategoryName] = useState("")
    const [editModal, setEditModal] = useState(false)
    const [editCategory, setEditCategory] = useState(null)
    const [detailModal, setDetailModal] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState(null)

    // Search state
    const [searchQuery, setSearchQuery] = useState("")

    // Statistics
    const [productCounts, setProductCounts] = useState({})

    const fetchCategories = async () => {
        try {
            setLoading(true)
            const res = await api.get("/categories")
            if (res.data.status === "success") {
                setCategories(res.data.data.categories)
                setFilteredCategories(res.data.data.categories)
                await fetchProductCounts(res.data.data.categories)
            }
        } catch (err) {
            console.error(err)
            setError("Failed to load categories")
        } finally {
            setLoading(false)
        }
    }

    const fetchProductCounts = async (cats) => {
        try {
            const res = await api.get("/products")
            const products = res.data.data.products
            
            const counts = {}
            cats.forEach(cat => {
                counts[cat.id] = products.filter(p => p.categoryId === cat.id).length
            })
            setProductCounts(counts)
        } catch (err) {
            console.error("Failed to fetch product counts")
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    // Search filter
    useEffect(() => {
        if (searchQuery) {
            setFilteredCategories(
                categories.filter(c => 
                    c.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
            )
        } else {
            setFilteredCategories(categories)
        }
    }, [searchQuery, categories])

    const addCategory = async (e) => {
        e.preventDefault()
        setError("")

        if (!categoryName.trim()) {
            setError("Category name is required")
            return
        }

        try {
            const res = await api.post("/categories", { name: categoryName })
            if (res.data.status === "success") {
                fetchCategories()
                setCategoryName("")
            }
        } catch (err) {
            if (err.response?.data?.details) {
                setError(err.response.data.details[0].msg)
            } else if (err.response?.data?.message) {
                setError(err.response.data.message)
            } else {
                setError("Failed to add category")
            }
        }
    }

    const openEdit = (category) => {
        setEditCategory(category)
        setEditModal(true)
    }

    const openDetails = async (category) => {
        try {
            const res = await api.get(`/categories/${category.id}`)
            setSelectedCategory(res.data.category)
            setDetailModal(true)
        } catch (err) {
            alert("Failed to load category details")
        }
    }

    const updateCategory = async (e) => {
        e.preventDefault()
        setError("")

        try {
            const res = await api.put(`/categories/${editCategory.id}`, {
                name: editCategory.name
            })
            
            if (res.data.status === "success") {
                setEditModal(false)
                fetchCategories()
            }
        } catch (err) {
            setError("Failed to update category")
        }
    }

    const deleteCategory = async (id) => {
        const count = productCounts[id] || 0
        
        if (count > 0) {
            if (!window.confirm(
                `This category has ${count} product(s). Deleting it may affect those products. Continue?`
            )) return
        } else {
            if (!window.confirm("Are you sure you want to delete this category?")) return
        }

        try {
            await api.delete(`/categories/${id}`)
            fetchCategories()
        } catch (err) {
            alert("Failed to delete category")
        }
    }

    const stats = {
        total: categories.length,
        withProducts: Object.values(productCounts).filter(c => c > 0).length,
        empty: Object.values(productCounts).filter(c => c === 0).length,
        totalProducts: Object.values(productCounts).reduce((a, b) => a + b, 0)
    }

    return (
        <div className="categories-file">
            <Header />

            <div className="categories-container">
                <div className="categories-header">
                    <h2>Categories Management</h2>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading categories...</p>
                    </div>
                ) : (
                    <>
                        {/* Statistics */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#c7b66bff"><path d="M120-200v-240h320v240H120Zm400 0v-240h320v240H520ZM120-520v-240h720v240H120Zm80 240h160v-80H200v80Zm400 0h160v-80H600v80Zm-320-40Zm400 0Z"/></svg>
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.total}</h3>
                                    <p>Total Categories</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#A96424"><path d="M440-183v-274L200-596v274l240 139Zm80 0 240-139v-274L520-457v274Zm-80 92L160-252q-19-11-29.5-29T120-321v-318q0-22 10.5-40t29.5-29l280-161q19-11 40-11t40 11l280 161q19 11 29.5 29t10.5 40v318q0 22-10.5 40T800-252L520-91q-19 11-40 11t-40-11Zm200-528 77-44-237-137-78 45 238 136Zm-160 93 78-45-237-137-78 45 237 137Z"/></svg>
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.totalProducts}</h3>
                                    <p>Total Products</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#78A75A"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.withProducts}</h3>
                                    <p>Active Categories</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#EA3323"><path d="m336-280 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.empty}</h3>
                                    <p>Empty Categories</p>
                                </div>
                            </div>
                        </div>

                        {/* Add Category Form */}
                        <div className="form-section">
                            <h3>Add New Category</h3>
                            <form onSubmit={addCategory} className="category-form">
                                {error && <p className="error">{error}</p>}
                                
                                <input
                                    placeholder="Category Name (e.g., Electronics, Food, Clothing)"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    maxLength={50}
                                    required
                                />
                                
                                <button type="submit">Add Category</button>
                            </form>
                        </div>

                        {/* Search */}
                        <div className="search-section">
                            <input
                                type="text"
                                placeholder="Search categories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Categories Grid */}
                        <div className="categories-grid">
                            {filteredCategories.length === 0 ? (
                                <div className="empty-state">
                                    {searchQuery 
                                        ? "No categories match your search" 
                                        : "No categories found. Add your first category above."}
                                </div>
                            ) : (
                                filteredCategories.map(category => (
                                    <div key={category.id} className="category-card">
                                        <div className="category-card-header">
                                            <h3>{category.name}</h3>
                                            <div className="category-badge">
                                                {productCounts[category.id] || 0} products
                                            </div>
                                        </div>
                                        
                                        <div className="category-card-body">
                                            <div className="category-meta">
                                                <span className="meta-item">
                                                    <strong>ID:</strong> <code>{category.id.slice(0, 8)}...</code>
                                                </span>
                                                <span className="meta-item">
                                                    <strong>Created:</strong> {new Date(category.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="category-card-actions">
                                            <button 
                                                className="btn-view"
                                                onClick={() => openDetails(category)}
                                                title="View Details"
                                            >
                                                View
                                            </button>
                                            <button 
                                                className="btn-edit"
                                                onClick={() => openEdit(category)}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                className="btn-delete"
                                                onClick={() => deleteCategory(category.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Alternative: Table View */}
                        <div className="table-section" style={{marginTop: '2rem'}}>
                            <div className="table-header">
                                <h3>Categories List ({filteredCategories.length})</h3>
                            </div>
                            
                            <table className="category-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Products</th>
                                        <th>Created</th>
                                        <th>Last Updated</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCategories.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="empty-state">
                                                No categories available
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredCategories.map(category => (
                                            <tr key={category.id}>
                                                <td><strong>{category.name}</strong></td>
                                                <td>
                                                    <span className={`product-count ${
                                                        (productCounts[category.id] || 0) === 0 
                                                            ? 'count-empty' 
                                                            : 'count-active'
                                                    }`}>
                                                        {productCounts[category.id] || 0}
                                                    </span>
                                                </td>
                                                <td>{new Date(category.createdAt).toLocaleDateString()}</td>
                                                <td>{new Date(category.updatedAt).toLocaleDateString()}</td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button 
                                                            className="btn-view"
                                                            onClick={() => openDetails(category)}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#ffffffff"><path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"/></svg>
                                                        </button>
                                                        <button 
                                                            className="btn-edit"
                                                            onClick={() => openEdit(category)}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#6b5c5cff"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
                                                        </button>
                                                        <button 
                                                            className="btn-delete"
                                                            onClick={() => deleteCategory(category.id)}
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
                            <h3>Edit Category</h3>
                            <form onSubmit={updateCategory}>
                                <input
                                    placeholder="Category Name"
                                    value={editCategory.name}
                                    onChange={(e) => setEditCategory({...editCategory, name: e.target.value})}
                                    maxLength={50}
                                    required
                                />
                                <button type="submit">Save Changes</button>
                                <button type="button" onClick={() => setEditModal(false)}>Cancel</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Detail Modal */}
                {detailModal && selectedCategory && (
                    <div className="modal">
                        <div className="modal-content detail-modal">
                            <h3>Category Details</h3>
                            
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>Category Name:</label>
                                    <p>{selectedCategory.name}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Category ID:</label>
                                    <p><code>{selectedCategory.id}</code></p>
                                </div>
                                <div className="detail-item">
                                    <label>Total Products:</label>
                                    <p className="product-count count-active">
                                        {productCounts[selectedCategory.id] || 0} products
                                    </p>
                                </div>
                                <div className="detail-item">
                                    <label>Created:</label>
                                    <p>{new Date(selectedCategory.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Last Updated:</label>
                                    <p>{new Date(selectedCategory.updatedAt).toLocaleString()}</p>
                                </div>
                            </div>

                            <button type="button" onClick={() => setDetailModal(false)}>Close</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Categories