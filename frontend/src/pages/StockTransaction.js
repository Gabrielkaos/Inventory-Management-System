import { useState, useEffect } from "react"
import Header from "../components/Header"
import api from "../api/api"
import "./StockTransaction.css"

const StockTransactions = () => {
    const [transactions, setTransactions] = useState([])
    const [filteredTransactions, setFilteredTransactions] = useState([])
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    // Form states
    const [productId, setProductId] = useState("")
    const [transactionType, setTransactionType] = useState("")
    const [quantity, setQuantity] = useState("")
    const [notes, setNotes] = useState("")
    const [referenceNumber, setReferenceNumber] = useState("")

    // Filter states
    const [searchQuery, setSearchQuery] = useState("")
    const [typeFilter, setTypeFilter] = useState("all")
    const [productFilter, setProductFilter] = useState("all")
    const [dateFilter, setDateFilter] = useState("all")

    // Modal state
    const [detailModal, setDetailModal] = useState(false)
    const [selectedTransaction, setSelectedTransaction] = useState(null)

    const fetchTransactions = async () => {
        try {
            setLoading(true)
            const res = await api.get("/stock-transactions")
            setTransactions(res.data.data.transactions)
            setFilteredTransactions(res.data.data.transactions)
        } catch (err) {
            console.error(err)
            setError("Failed to load transactions")
        } finally {
            setLoading(false)
        }
    }

    const fetchProducts = async () => {
        try {
            const res = await api.get("/products")
            setProducts(res.data.data.products)
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        fetchTransactions()
        fetchProducts()
    }, [])

    // Filtering logic
    useEffect(() => {
        let result = [...transactions]

        // Search
        if (searchQuery) {
            result = result.filter(t => 
                t.product?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Type filter
        if (typeFilter !== "all") {
            result = result.filter(t => t.type === typeFilter)
        }

        // Product filter
        if (productFilter !== "all") {
            result = result.filter(t => t.productId === productFilter)
        }

        // Date filter
        if (dateFilter !== "all") {
            const now = new Date()
            result = result.filter(t => {
                const transDate = new Date(t.createdAt)
                const diffDays = Math.floor((now - transDate) / (1000 * 60 * 60 * 24))
                
                if (dateFilter === "today") return diffDays === 0
                if (dateFilter === "week") return diffDays <= 7
                if (dateFilter === "month") return diffDays <= 30
                return true
            })
        }

        setFilteredTransactions(result)
    }, [searchQuery, typeFilter, productFilter, dateFilter, transactions])

    const addTransaction = async (e) => {
        e.preventDefault()
        setError("")

        if (!productId || !transactionType || !quantity) {
            setError("Please fill in all required fields")
            return
        }

        const qty = parseInt(quantity)
        if (isNaN(qty) || qty <= 0) {
            setError("Quantity must be a positive number")
            return
        }

        try {
            const res = await api.post("/stock-transactions", {
                productId,
                type: transactionType,
                quantity: qty,
                notes,
                referenceNumber: referenceNumber || null
            })

            if (res.data.status === "success") {
                fetchTransactions()
                fetchProducts() // Refresh products to show updated stock
                // Reset form
                setProductId("")
                setTransactionType("")
                setQuantity("")
                setNotes("")
                setReferenceNumber("")
            }
        } catch (err) {
            if (err.response?.data?.message) {
                setError(err.response.data.message)
            } else if (err.response?.data?.details) {
                setError(err.response.data.details[0].msg)
            } else {
                setError("Failed to record transaction")
            }
        }
    }

    const openDetails = (transaction) => {
        setSelectedTransaction(transaction)
        setDetailModal(true)
    }

    const getTransactionBadge = (type) => {
        const badges = {
            "in": { class: "type-in", label: "Stock In" },
            "out": { class: "type-out", label: "Stock Out" },
            "adjustment": { class: "type-adjustment", label: "Adjustment" },
            "return": { class: "type-return", label: "Return" }
        }
        return badges[type] || { class: "type-in", label: type }
    }

    // Calculate statistics
    const stats = {
        total: transactions.length,
        stockIn: transactions.filter(t => t.type === "in").reduce((sum, t) => sum + t.quantity, 0),
        stockOut: transactions.filter(t => t.type === "out").reduce((sum, t) => sum + t.quantity, 0),
        adjustments: transactions.filter(t => t.type === "adjustment").length,
        today: transactions.filter(t => {
            const today = new Date().toDateString()
            return new Date(t.createdAt).toDateString() === today
        }).length
    }

    return (
        <div>
            <Header />

            <div className="transactions-container">
                <div className="transactions-header">
                    <h2>Stock Transactions</h2>
                    <p className="subtitle">Track all inventory movements and changes</p>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading transactions...</p>
                    </div>
                ) : (
                    <>
                        {/* Statistics */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#434343"><path d="M240-80q-50 0-85-35t-35-85v-120h120v-560h600v680q0 50-35 85t-85 35H240Zm480-80q17 0 28.5-11.5T760-200v-600H320v480h360v120q0 17 11.5 28.5T720-160ZM360-600v-80h360v80H360Zm0 120v-80h360v80H360ZM240-160h360v-80H200v40q0 17 11.5 28.5T240-160Zm0 0h-40 400-360Z"/></svg>
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.total}</h3>
                                    <p>Total Transactions</p>
                                </div>
                            </div>
                            <div className="stat-card stat-success">
                                <div className="stat-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#434343"><path d="M440-800v487L216-537l-56 57 320 320 320-320-56-57-224 224v-487h-80Z"/></svg>
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.stockIn}</h3>
                                    <p>Total Stock In</p>
                                </div>
                            </div>
                            <div className="stat-card stat-danger">
                                <div className="stat-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#434343"><path d="M440-160v-487L216-423l-56-57 320-320 320 320-56 57-224-224v487h-80Z"/></svg>
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.stockOut}</h3>
                                    <p>Total Stock Out</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#434343"><path d="M580-240q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z"/></svg>
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.today}</h3>
                                    <p>Today's Transactions</p>
                                </div>
                            </div>
                        </div>

                        {/* Add Transaction Form */}
                        <div className="form-section">
                            <h3>Record New Transaction</h3>
                            <form onSubmit={addTransaction} className="transaction-form">
                                {error && <p className="error">{error}</p>}

                                <select
                                    value={productId}
                                    onChange={(e) => setProductId(e.target.value)}
                                    required
                                >
                                    <option value="">Select Product *</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} (Current: {p.stock} {p.unit})
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={transactionType}
                                    onChange={(e) => setTransactionType(e.target.value)}
                                    required
                                >
                                    <option value="">Transaction Type *</option>
                                    <option value="in">Stock In (Receive from supplier)</option>
                                    <option value="out">Stock Out (Sale/Issue)</option>
                                    <option value="adjustment">Adjustment (Correction)</option>
                                    <option value="return">Return</option>
                                </select>

                                <input
                                    type="number"
                                    placeholder="Quantity *"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    min="1"
                                    required
                                />

                                <input
                                    placeholder="Reference # (PO, Invoice, etc.)"
                                    value={referenceNumber}
                                    onChange={(e) => setReferenceNumber(e.target.value)}
                                />

                                <textarea
                                    placeholder="Notes/Reason"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows="2"
                                />

                                <button type="submit">Record Transaction</button>
                            </form>
                        </div>

                        {/* Filters */}
                        <div className="filters-section">
                            <div className="search-box">
                                <input
                                    type="text"
                                    placeholder="Search transactions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                                <option value="all">All Types</option>
                                <option value="in">Stock In</option>
                                <option value="out">Stock Out</option>
                                <option value="adjustment">Adjustment</option>
                                <option value="return">Return</option>
                            </select>

                            <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)}>
                                <option value="all">All Products</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>

                            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">Last 7 Days</option>
                                <option value="month">Last 30 Days</option>
                            </select>
                        </div>

                        {/* Transactions Timeline */}
                        <div className="timeline-section">
                            <div className="timeline-header">
                                <h3>Transaction History ({filteredTransactions.length})</h3>
                            </div>

                            {filteredTransactions.length === 0 ? (
                                <div className="empty-state">
                                    {searchQuery || typeFilter !== "all" || productFilter !== "all"
                                        ? "No transactions match your filters"
                                        : "No transactions yet. Record your first transaction above."}
                                </div>
                            ) : (
                                <div className="timeline">
                                    {filteredTransactions.map(transaction => (
                                        <div key={transaction.id} className="timeline-item">
                                            <div className="timeline-icon">
                                                {transaction.type==="in" &&  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#434343"><path d="M440-800v487L216-537l-56 57 320 320 320-320-56-57-224 224v-487h-80Z"/></svg>}
                                                {transaction.type==="out" &&  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#434343"><path d="M440-160v-487L216-423l-56-57 320-320 320 320-56 57-224-224v487h-80Z"/></svg>}
                                                {transaction.type==="adjustment" &&  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#434343"><path d="M80-80q0-111 29.5-189.5T185-400q46-52 103-80.5T400-520v-120q-137-17-228.5-84.5T80-880h800q0 88-91.5 155.5T560-640v120q55 11 112 39.5T775-400q46 52 75.5 130.5T880-80H640v-80h155q-18-152-113.5-220T480-448q-106 0-201.5 68T165-160h155v80H80Zm400-635q91 0 162-24.5T755-800H205q42 36 113 60.5T480-715Zm0 635q-33 0-56.5-23.5T400-160q0-17 6.5-31t17.5-25q24-24 81-50.5T640-320q-28 78-54 135t-50 81q-11 11-25 17.5T480-80Zm0-635Z"/></svg>}
                                                {transaction.type==="return" &&  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#434343"><path d="M360-240 120-480l240-240 56 56-144 144h488v-160h80v240H272l144 144-56 56Z"/></svg>}
                                            </div>
                                            <div className="timeline-content">
                                                <div className="timeline-header-row">
                                                    <div>
                                                        <h4>{transaction.product?.name}</h4>
                                                        <span className={`type-badge ${getTransactionBadge(transaction.type).class}`}>
                                                            {getTransactionBadge(transaction.type).label}
                                                        </span>
                                                    </div>
                                                    <div className="timeline-quantity">
                                                        <span className={transaction.type === 'out' ? 'qty-out' : 'qty-in'}>
                                                            {transaction.type === 'out' ? '-' : '+'}{transaction.quantity}
                                                        </span>
                                                        <span className="qty-unit">{transaction.product?.unit}</span>
                                                    </div>
                                                </div>

                                                <div className="timeline-details">
                                                    {transaction.referenceNumber && (
                                                        <span className="detail-item">
                                                            Ref: <code>{transaction.referenceNumber}</code>
                                                        </span>
                                                    )}
                                                    <span className="detail-item">
                                                        By: {transaction.owner?.username || 'System'}
                                                    </span>
                                                    <span className="detail-item">
                                                        {new Date(transaction.createdAt).toLocaleString()}
                                                    </span>
                                                </div>

                                                {transaction.notes && (
                                                    <p className="timeline-notes">💬 {transaction.notes}</p>
                                                )}

                                                <button 
                                                    className="btn-details"
                                                    onClick={() => openDetails(transaction)}
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Table View */}
                        <div className="table-section">
                            <div className="table-header">
                                <h3>Transactions Table</h3>
                            </div>

                            <table className="transaction-table">
                                <thead>
                                    <tr>
                                        <th>Date & Time</th>
                                        <th>Product</th>
                                        <th>Type</th>
                                        <th>Quantity</th>
                                        <th>Reference</th>
                                        <th>User</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="empty-state">
                                                No transactions available
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredTransactions.map(transaction => (
                                            <tr key={transaction.id}>
                                                <td>{new Date(transaction.createdAt).toLocaleString()}</td>
                                                <td><strong>{transaction.product?.name}</strong></td>
                                                <td>
                                                    <span className={`type-badge ${getTransactionBadge(transaction.type).class}`}>
                                                        {getTransactionBadge(transaction.type).label}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={transaction.type === 'out' ? 'qty-out' : 'qty-in'}>
                                                        {transaction.type === 'out' ? '-' : '+'}{transaction.quantity} {transaction.product?.unit}
                                                    </span>
                                                </td>
                                                <td>
                                                    {transaction.referenceNumber ? (
                                                        <code>{transaction.referenceNumber}</code>
                                                    ) : '-'}
                                                </td>
                                                <td>{transaction.owner?.username || 'System'}</td>
                                                <td>
                                                    <button
                                                        className="btn-view"
                                                        onClick={() => openDetails(transaction)}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#ffffffff"><path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"/></svg>
                                                        
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* Detail Modal */}
                {detailModal && selectedTransaction && (
                    <div className="modal">
                        <div className="modal-content detail-modal">
                            <h3>Transaction Details</h3>

                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>Transaction ID:</label>
                                    <p><code>{selectedTransaction.id}</code></p>
                                </div>
                                <div className="detail-item">
                                    <label>Product:</label>
                                    <p>{selectedTransaction.product?.name}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Type:</label>
                                    <span className={`type-badge ${getTransactionBadge(selectedTransaction.type).class}`}>
                                        {getTransactionBadge(selectedTransaction.type).label}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <label>Quantity:</label>
                                    <p className={selectedTransaction.type === 'out' ? 'qty-out' : 'qty-in'}>
                                        {selectedTransaction.type === 'out' ? '-' : '+'}{selectedTransaction.quantity} {selectedTransaction.product?.unit}
                                    </p>
                                </div>
                                <div className="detail-item">
                                    <label>Reference Number:</label>
                                    <p>{selectedTransaction.referenceNumber || 'N/A'}</p>
                                </div>
                                <div className="detail-item">
                                    <label>User:</label>
                                    <p>{selectedTransaction.owner?.username || 'System'}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Date & Time:</label>
                                    <p>{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="detail-item full-width">
                                    <label>Notes:</label>
                                    <p>{selectedTransaction.notes || 'No notes'}</p>
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

export default StockTransactions