import { useState, useEffect } from "react"
import Header from "../components/Header"
import api from "../api/api"
import "./Suppliers.css"

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([])
    const [filteredSuppliers, setFilteredSuppliers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [address, setAddress] = useState("")
    const [contactPerson, setContactPerson] = useState("")

    
    const [editModal, setEditModal] = useState(false)
    const [detailModal, setDetailModal] = useState(false)
    const [editSupplier, setEditSupplier] = useState(null)
    const [selectedSupplier, setSelectedSupplier] = useState(null)

    
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")

    const fetchSuppliers = async () => {
        try {
            setLoading(true)
            const res = await api.get("/suppliers")
            setSuppliers(res.data.data.suppliers)
            setFilteredSuppliers(res.data.data.suppliers)
        } catch (err) {
            console.error(err)
            setError("Failed to load suppliers")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSuppliers()
    }, [])

    
    useEffect(() => {
        let result = [...suppliers]

        if (searchQuery) {
            result = result.filter(s => 
                s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (s.phone && s.phone.includes(searchQuery)) ||
                (s.contactPerson && s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()))
            )
        }

        if (statusFilter !== "all") {
            result = result.filter(s => s.status === statusFilter)
        }

        setFilteredSuppliers(result)
    }, [searchQuery, statusFilter, suppliers])

    const addSupplier = async (e) => {
        e.preventDefault()
        setError("")

        try {
            const res = await api.post("/suppliers", {
                name,
                email,
                phone,
                address,
                contactPerson
            })

            if (res.data.status === "success") {
                fetchSuppliers()
                
                setName("")
                setEmail("")
                setPhone("")
                setAddress("")
                setContactPerson("")
            }
        } catch (err) {
            if (err.response?.data?.details) {
                setError(err.response.data.details[0].msg)
            } else {
                setError("Failed to add supplier")
            }
        }
    }

    const openEdit = (supplier) => {
        setEditSupplier(supplier)
        setEditModal(true)
    }

    const openDetails = (supplier) => {
        setSelectedSupplier(supplier)
        setDetailModal(true)
    }

    const updateSupplier = async (e) => {
        e.preventDefault()
        setError("")

        try {
            const res = await api.put(`/suppliers/${editSupplier.id}`, {
                name: editSupplier.name,
                email: editSupplier.email,
                phone: editSupplier.phone,
                address: editSupplier.address,
                contactPerson: editSupplier.contactPerson,
                status: editSupplier.status
            })

            if (res.data.status === "success") {
                setEditModal(false)
                fetchSuppliers()
            }
        } catch (err) {
            setError("Failed to update supplier")
        }
    }

    const deleteSupplier = async (id) => {
        if (!window.confirm("Are you sure you want to delete this supplier?")) return

        try {
            await api.delete(`/suppliers/${id}`)
            fetchSuppliers()
        } catch (err) {
            alert("Failed to delete supplier")
        }
    }

    const toggleStatus = async (supplier) => {
        try {
            const newStatus = supplier.status === "active" ? "inactive" : "active"
            await api.put(`/suppliers/${supplier.id}`, {
                ...supplier,
                status: newStatus
            })
            fetchSuppliers()
        } catch (err) {
            alert("Failed to update status")
        }
    }

    const stats = {
        total: suppliers.length,
        active: suppliers.filter(s => s.status === "active").length,
        inactive: suppliers.filter(s => s.status === "inactive").length
    }

    const getStatusBadge = (status) => {
        return status === "active" 
            ? { class: "status-active", label: "Active" }
            : { class: "status-inactive", label: "Inactive" }
    }

    return (
        <div>
            <Header />

            <div className="suppliers-container">
                <div className="suppliers-header">
                    <h2>Suppliers Management</h2>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading suppliers...</p>
                    </div>
                ) : (
                    <>
                        {/* Statistics */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">🏢</div>
                                <div className="stat-info">
                                    <h3>{stats.total}</h3>
                                    <p>Total Suppliers</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">✅</div>
                                <div className="stat-info">
                                    <h3>{stats.active}</h3>
                                    <p>Active Suppliers</p>
                                </div>
                            </div>
                            <div className="stat-card stat-warning">
                                <div className="stat-icon">⏸️</div>
                                <div className="stat-info">
                                    <h3>{stats.inactive}</h3>
                                    <p>Inactive Suppliers</p>
                                </div>
                            </div>
                        </div>

                        {/* Add Supplier Form */}
                        <div className="form-section">
                            <h3>Add New Supplier</h3>
                            <form onSubmit={addSupplier} className="supplier-form">
                                {error && <p className="error">{error}</p>}

                                <input
                                    placeholder="Company Name *"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />

                                <input
                                    placeholder="Email *"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />

                                <input
                                    placeholder="Phone Number"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />

                                <input
                                    placeholder="Contact Person"
                                    value={contactPerson}
                                    onChange={(e) => setContactPerson(e.target.value)}
                                />

                                <textarea
                                    placeholder="Address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    rows="2"
                                />

                                <button type="submit">Add Supplier</button>
                            </form>
                        </div>

                        {/* Filters */}
                        <div className="filters-section">
                            <div className="search-box">
                                <input
                                    type="text"
                                    placeholder="🔍 Search suppliers..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        {/* Suppliers Grid */}
                        <div className="suppliers-grid">
                            {filteredSuppliers.length === 0 ? (
                                <div className="empty-state">
                                    {searchQuery || statusFilter !== "all"
                                        ? "No suppliers match your filters"
                                        : "No suppliers found. Add your first supplier above."}
                                </div>
                            ) : (
                                filteredSuppliers.map(supplier => (
                                    <div key={supplier.id} className="supplier-card">
                                        <div className="supplier-card-header">
                                            <h3>{supplier.name}</h3>
                                            <span className={`status-badge ${getStatusBadge(supplier.status).class}`}>
                                                {getStatusBadge(supplier.status).label}
                                            </span>
                                        </div>

                                        <div className="supplier-card-body">
                                            <div className="supplier-info">
                                                <div className="info-item">
                                                    <span className="info-icon">📧</span>
                                                    <span>{supplier.email}</span>
                                                </div>
                                                {supplier.phone && (
                                                    <div className="info-item">
                                                        <span className="info-icon">📱</span>
                                                        <span>{supplier.phone}</span>
                                                    </div>
                                                )}
                                                {supplier.contactPerson && (
                                                    <div className="info-item">
                                                        <span className="info-icon">👤</span>
                                                        <span>{supplier.contactPerson}</span>
                                                    </div>
                                                )}
                                                {supplier.address && (
                                                    <div className="info-item">
                                                        <span className="info-icon">📍</span>
                                                        <span>{supplier.address}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="supplier-card-actions">
                                            <button
                                                className="btn-view"
                                                onClick={() => openDetails(supplier)}
                                                title="View Details"
                                            >
                                                👁️ View
                                            </button>
                                            <button
                                                className="btn-edit"
                                                onClick={() => openEdit(supplier)}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                className={`btn-toggle ${supplier.status === 'active' ? 'btn-deactivate' : 'btn-activate'}`}
                                                onClick={() => toggleStatus(supplier)}
                                            >
                                                {supplier.status === 'active' ? '⏸️ Deactivate' : '▶️ Activate'}
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() => deleteSupplier(supplier.id)}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Table View */}
                        <div className="table-section">
                            <div className="table-header">
                                <h3>Suppliers List ({filteredSuppliers.length})</h3>
                            </div>

                            <table className="supplier-table">
                                <thead>
                                    <tr>
                                        <th>Company</th>
                                        <th>Contact Person</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSuppliers.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="empty-state">
                                                No suppliers available
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredSuppliers.map(supplier => (
                                            <tr key={supplier.id}>
                                                <td><strong>{supplier.name}</strong></td>
                                                <td>{supplier.contactPerson || '-'}</td>
                                                <td>{supplier.email}</td>
                                                <td>{supplier.phone || '-'}</td>
                                                <td>
                                                    <span className={`status-badge ${getStatusBadge(supplier.status).class}`}>
                                                        {getStatusBadge(supplier.status).label}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button
                                                            className="btn-view"
                                                            onClick={() => openDetails(supplier)}
                                                        >👁️</button>
                                                        <button
                                                            className="btn-edit"
                                                            onClick={() => openEdit(supplier)}
                                                        >✏️</button>
                                                        <button
                                                            className="btn-delete"
                                                            onClick={() => deleteSupplier(supplier.id)}
                                                        >🗑️</button>
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
                            <h3>Edit Supplier</h3>
                            <form onSubmit={updateSupplier}>
                                <input
                                    placeholder="Company Name"
                                    value={editSupplier.name}
                                    onChange={(e) => setEditSupplier({...editSupplier, name: e.target.value})}
                                    required
                                />

                                <input
                                    placeholder="Email"
                                    type="email"
                                    value={editSupplier.email}
                                    onChange={(e) => setEditSupplier({...editSupplier, email: e.target.value})}
                                    required
                                />

                                <input
                                    placeholder="Phone"
                                    value={editSupplier.phone || ''}
                                    onChange={(e) => setEditSupplier({...editSupplier, phone: e.target.value})}
                                />

                                <input
                                    placeholder="Contact Person"
                                    value={editSupplier.contactPerson || ''}
                                    onChange={(e) => setEditSupplier({...editSupplier, contactPerson: e.target.value})}
                                />

                                <textarea
                                    placeholder="Address"
                                    value={editSupplier.address || ''}
                                    onChange={(e) => setEditSupplier({...editSupplier, address: e.target.value})}
                                    rows="3"
                                />

                                <select
                                    value={editSupplier.status}
                                    onChange={(e) => setEditSupplier({...editSupplier, status: e.target.value})}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>

                                <button type="submit">Save Changes</button>
                                <button type="button" onClick={() => setEditModal(false)}>Cancel</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Detail Modal */}
                {detailModal && selectedSupplier && (
                    <div className="modal">
                        <div className="modal-content detail-modal">
                            <h3>Supplier Details</h3>

                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>Company Name:</label>
                                    <p>{selectedSupplier.name}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Email:</label>
                                    <p>{selectedSupplier.email}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Phone:</label>
                                    <p>{selectedSupplier.phone || 'N/A'}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Contact Person:</label>
                                    <p>{selectedSupplier.contactPerson || 'N/A'}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Address:</label>
                                    <p>{selectedSupplier.address || 'N/A'}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Status:</label>
                                    <span className={`status-badge ${getStatusBadge(selectedSupplier.status).class}`}>
                                        {getStatusBadge(selectedSupplier.status).label}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <label>Created:</label>
                                    <p>{new Date(selectedSupplier.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Last Updated:</label>
                                    <p>{new Date(selectedSupplier.updatedAt).toLocaleString()}</p>
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

export default Suppliers