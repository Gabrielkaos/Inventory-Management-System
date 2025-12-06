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
                                <div className="stat-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#434343"><path d="M200-80q-33 0-56.5-23.5T120-160v-451q-18-11-29-28.5T80-680v-120q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v120q0 23-11 40.5T840-611v451q0 33-23.5 56.5T760-80H200Zm0-520v440h560v-440H200Zm-40-80h640v-120H160v120Zm200 280h240v-80H360v80Zm120 20Z"/></svg>
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.total}</h3>
                                    <p>Total Suppliers</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#78A75A"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.active}</h3>
                                    <p>Active Suppliers</p>
                                </div>
                            </div>
                            <div className="stat-card stat-warning">
                                <div className="stat-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#434343"><path d="m820-28-92-92H160q-33 0-56.5-23.5T80-200v-440q0-33 23.5-56.5T160-720h80l80 80H160v440h487L28-820l56-56L876-84l-56 56Zm60-166-80-80v-366H434L320-754v-46q0-33 23.5-56.5T400-880h160q33 0 56.5 23.5T640-800v80h160q33 0 56.5 23.5T880-640v446ZM400-720h160v-80H400v80Zm217 263Zm-189 37Z"/></svg>
                                </div>
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
                                    placeholder="Search suppliers..."
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
                                                    <span className="info-icon">
                                                        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#434343"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480v58q0 59-40.5 100.5T740-280q-35 0-66-15t-52-43q-29 29-65.5 43.5T480-280q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480v58q0 26 17 44t43 18q26 0 43-18t17-44v-58q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93h200v80H480Zm0-280q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Z"/></svg>
                                                    </span>
                                                    <span>{supplier.email}</span>
                                                </div>
                                                {supplier.phone && (
                                                    <div className="info-item">
                                                        <span className="info-icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#434343"><path d="M798-120q-125 0-247-54.5T329-329Q229-429 174.5-551T120-798q0-18 12-30t30-12h162q14 0 25 9.5t13 22.5l26 140q2 16-1 27t-11 19l-97 98q20 37 47.5 71.5T387-386q31 31 65 57.5t72 48.5l94-94q9-9 23.5-13.5T670-390l138 28q14 4 23 14.5t9 23.5v162q0 18-12 30t-30 12ZM241-600l66-66-17-94h-89q5 41 14 81t26 79Zm358 358q39 17 79.5 27t81.5 13v-88l-94-19-67 67ZM241-600Zm358 358Z"/></svg>
                                                        </span>
                                                        <span>{supplier.phone}</span>
                                                    </div>
                                                )}
                                                {supplier.contactPerson && (
                                                    <div className="info-item">
                                                        <span className="info-icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#434343"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z"/></svg>
                                                        </span>
                                                        <span>{supplier.contactPerson}</span>
                                                    </div>
                                                )}
                                                {supplier.address && (
                                                    <div className="info-item">
                                                        <span className="info-icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#434343"><path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z"/></svg>
                                                        </span>
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
                                                View
                                            </button>
                                            <button
                                                className="btn-edit"
                                                onClick={() => openEdit(supplier)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className={`btn-toggle ${supplier.status === 'active' ? 'btn-deactivate' : 'btn-activate'}`}
                                                onClick={() => toggleStatus(supplier)}
                                            >
                                                {supplier.status === 'active' ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() => deleteSupplier(supplier.id)}
                                            >
                                                Delete
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
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#ffffffff"><path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"/></svg>
                                                        </button>
                                                        <button
                                                            className="btn-edit"
                                                            onClick={() => openEdit(supplier)}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#6b5c5cff"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
                                                        </button>
                                                        <button
                                                            className="btn-delete"
                                                            onClick={() => deleteSupplier(supplier.id)}
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