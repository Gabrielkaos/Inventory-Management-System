import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Header from "../components/Header"
import api from "../api/api"
import "./Dashboard.css"

const Dashboard = () => {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        products: { total: 0, active: 0, lowStock: 0, outOfStock: 0 },
        categories: { total: 0, withProducts: 0, empty: 0 },
        suppliers: { total: 0, active: 0, inactive: 0 },
        transactions: { total: 0, stockIn: 0, stockOut: 0, today: 0 }
    })
    
    const [recentTransactions, setRecentTransactions] = useState([])
    const [lowStockProducts, setLowStockProducts] = useState([])
    const [topCategories, setTopCategories] = useState([])
    const [recentProducts, setRecentProducts] = useState([])

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)
            
            
            const [productsRes, categoriesRes, suppliersRes, transactionsRes] = await Promise.all([
                api.get("/products"),
                api.get("/categories"),
                api.get("/suppliers"),
                api.get("/stock-transactions")
            ])

            const products = productsRes.data.data.products
            const categories = categoriesRes.data.data.categories
            const suppliers = suppliersRes.data.data.suppliers
            const transactions = transactionsRes.data.data.transactions

            
            const productStats = {
                total: products.length,
                active: products.filter(p => p.status === "active").length,
                lowStock: products.filter(p => p.stock > 0 && p.stock < 10).length,
                outOfStock: products.filter(p => p.stock === 0).length
            }

            
            const categoryProductCount = {}
            products.forEach(p => {
                if (p.categoryId) {
                    categoryProductCount[p.categoryId] = (categoryProductCount[p.categoryId] || 0) + 1
                }
            })

            const categoryStats = {
                total: categories.length,
                withProducts: Object.keys(categoryProductCount).length,
                empty: categories.length - Object.keys(categoryProductCount).length
            }

            
            const supplierStats = {
                total: suppliers.length,
                active: suppliers.filter(s => s.status === "active").length,
                inactive: suppliers.filter(s => s.status === "inactive").length
            }

            
            const today = new Date().toDateString()
            const transactionStats = {
                total: transactions.length,
                stockIn: transactions.filter(t => t.type === "in").reduce((sum, t) => sum + t.quantity, 0),
                stockOut: transactions.filter(t => t.type === "out").reduce((sum, t) => sum + t.quantity, 0),
                today: transactions.filter(t => new Date(t.createdAt).toDateString() === today).length
            }

            setStats({
                products: productStats,
                categories: categoryStats,
                suppliers: supplierStats,
                transactions: transactionStats
            })

            
            setRecentTransactions(transactions.slice(0, 5))

            
            setLowStockProducts(
                products
                    .filter(p => p.stock > 0 && p.stock < 10)
                    .sort((a, b) => a.stock - b.stock)
                    .slice(0, 5)
            )

            
            const categoryData = categories
                .map(c => ({
                    ...c,
                    productCount: categoryProductCount[c.id] || 0
                }))
                .sort((a, b) => b.productCount - a.productCount)
                .slice(0, 5)
            setTopCategories(categoryData)

            
            setRecentProducts(
                products
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5)
            )

        } catch (err) {
            console.error("Failed to fetch dashboard data:", err)
        } finally {
            setLoading(false)
        }
    }

    const getStockClass = (stock) => {
        if (stock === 0) return "stock-zero"
        if (stock < 10) return "stock-low"
        if (stock < 50) return "stock-medium"
        return "stock-high"
    }

    const calculateInventoryValue = () => {
        //TODO
        return stats.products.total * 100
    }

    

    if (loading) {
        return (
            <div>
                <Header />
                <div className="dashboard-container">
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading dashboard...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="dashboard-file">
            <Header />

            <div className="dashboard-container">
                <div className="dashboard-header">
                    <div>
                        <h2>Dashboard</h2>
                        <p className="subtitle">Overview of your inventory</p>
                    </div>
                    <button className="refresh-btn" onClick={fetchDashboardData}>
                        Refresh
                    </button>
                </div>

                {/* Main Stats Grid */}
                <div className="stats-overview">
                    <div className="stat-card-large stat-products">
                        <div className="stat-icon-large">
                            <svg xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 -960 960 960" width="35px" fill="#A96424"><path d="M440-183v-274L200-596v274l240 139Zm80 0 240-139v-274L520-457v274Zm-80 92L160-252q-19-11-29.5-29T120-321v-318q0-22 10.5-40t29.5-29l280-161q19-11 40-11t40 11l280 161q19 11 29.5 29t10.5 40v318q0 22-10.5 40T800-252L520-91q-19 11-40 11t-40-11Zm200-528 77-44-237-137-78 45 238 136Zm-160 93 78-45-237-137-78 45 237 137Z"/></svg>
                        </div>
                        <div className="stat-content">
                            <h3>{stats.products.total}</h3>
                            <p>Total Products</p>
                            <div className="stat-breakdown">
                                <span className="badge badge-success">{stats.products.active} Active</span>
                                <span className="badge badge-warning">{stats.products.lowStock} Low Stock</span>
                                <span className="badge badge-danger">{stats.products.outOfStock} Out</span>
                            </div>
                            <Link to="/products" className="stat-link">View All →</Link>
                        </div>
                    </div>

                    <div className="stat-card-large stat-categories">
                        <div className="stat-icon-large">
                            <svg xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 -960 960 960" width="35px" fill="#c7b66bff"><path d="M120-200v-240h320v240H120Zm400 0v-240h320v240H520ZM120-520v-240h720v240H120Zm80 240h160v-80H200v80Zm400 0h160v-80H600v80Zm-320-40Zm400 0Z"/></svg>
                        </div>
                        <div className="stat-content">
                            <h3>{stats.categories.total}</h3>
                            <p>Categories</p>
                            <div className="stat-breakdown">
                                <span className="badge badge-info">{stats.categories.withProducts} With Products</span>
                                <span className="badge badge-muted">{stats.categories.empty} Empty</span>
                            </div>
                            <Link to="/categories" className="stat-link">Manage →</Link>
                        </div>
                    </div>

                    <div className="stat-card-large stat-suppliers">
                        <div className="stat-icon-large">
                            <svg xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 -960 960 960" width="35px" fill="#434343"><path d="M200-80q-33 0-56.5-23.5T120-160v-451q-18-11-29-28.5T80-680v-120q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v120q0 23-11 40.5T840-611v451q0 33-23.5 56.5T760-80H200Zm0-520v440h560v-440H200Zm-40-80h640v-120H160v120Zm200 280h240v-80H360v80Zm120 20Z"/></svg>
                        </div>
                        <div className="stat-content">
                            <h3>{stats.suppliers.total}</h3>
                            <p>Suppliers</p>
                            <div className="stat-breakdown">
                                <span className="badge badge-success">{stats.suppliers.active} Active</span>
                                <span className="badge badge-muted">{stats.suppliers.inactive} Inactive</span>
                            </div>
                            <Link to="/suppliers" className="stat-link">View All →</Link>
                        </div>
                    </div>

                    <div className="stat-card-large stat-transactions">
                        <div className="stat-icon-large">
                            <svg xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 -960 960 960" width="35px" fill="#434343"><path d="M240-80q-50 0-85-35t-35-85v-120h120v-560h600v680q0 50-35 85t-85 35H240Zm480-80q17 0 28.5-11.5T760-200v-600H320v480h360v120q0 17 11.5 28.5T720-160ZM360-600v-80h360v80H360Zm0 120v-80h360v80H360ZM240-160h360v-80H200v40q0 17 11.5 28.5T240-160Zm0 0h-40 400-360Z"/></svg>
                               </div>
                        <div className="stat-content">
                            <h3>{stats.transactions.total}</h3>
                            <p>Transactions</p>
                            <div className="stat-breakdown">
                                <span className="badge badge-success">+{stats.transactions.stockIn} In</span>
                                <span className="badge badge-danger">-{stats.transactions.stockOut} Out</span>
                                <span className="badge badge-info">{stats.transactions.today} Today</span>
                            </div>
                            <Link to="/transactions" className="stat-link">View History →</Link>
                        </div>
                    </div>
                </div>

                {/* Secondary Stats */}
                <div className="secondary-stats">
                    <div className="stat-card">
                        <div className="stat-icon">

                        </div>
                        <div className="stat-info">
                            <h4>${calculateInventoryValue().toLocaleString()}</h4>
                            <p>Est. Inventory Value</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"></div>
                        <div className="stat-info">
                            <h4>{stats.products.lowStock + stats.products.outOfStock}</h4>
                            <p>Items Need Attention</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"></div>
                        <div className="stat-info">
                            <h4>{stats.transactions.stockIn - stats.transactions.stockOut}</h4>
                            <p>Net Stock Change</p>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="dashboard-grid">
                    {/* Low Stock Alert */}
                    <div className="dashboard-card alert-card">
                        <div className="card-header">
                            <h3>Low Stock Alert</h3>
                            <span className="badge badge-warning">{lowStockProducts.length} items</span>
                        </div>
                        <div className="card-content">
                            {lowStockProducts.length === 0 ? (
                                <p className="empty-message">All products have sufficient stock!</p>
                            ) : (
                                <div className="list-items">
                                    {lowStockProducts.map(product => (
                                        <div key={product.id} className="list-item">
                                            <div className="item-info">
                                                <strong>{product.name}</strong>
                                                <span className="item-category">{product.category?.name}</span>
                                            </div>
                                            <span className={`stock-badge ${getStockClass(product.stock)}`}>
                                                {product.stock} {product.unit}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <Link to="/products" className="card-footer-link">
                            View All Products →
                        </Link>
                    </div>

                    {/* Recent Transactions */}
                    <div className="dashboard-card">
                        <div className="card-header">
                            <h3>Recent Transactions</h3>
                            <span className="badge badge-info">{recentTransactions.length}</span>
                        </div>
                        <div className="card-content">
                            {recentTransactions.length === 0 ? (
                                <p className="empty-message">No transactions yet</p>
                            ) : (
                                <div className="list-items">
                                    {recentTransactions.map(transaction => (
                                        <div key={transaction.id} className="list-item">
                                            <div className="item-icon">
                                                {transaction.type==="in" &&  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#434343"><path d="M440-800v487L216-537l-56 57 320 320 320-320-56-57-224 224v-487h-80Z"/></svg>}
                                                {transaction.type==="out" &&  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#434343"><path d="M440-160v-487L216-423l-56-57 320-320 320 320-56 57-224-224v487h-80Z"/></svg>}
                                                {transaction.type==="adjustment" &&  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#434343"><path d="M80-80q0-111 29.5-189.5T185-400q46-52 103-80.5T400-520v-120q-137-17-228.5-84.5T80-880h800q0 88-91.5 155.5T560-640v120q55 11 112 39.5T775-400q46 52 75.5 130.5T880-80H640v-80h155q-18-152-113.5-220T480-448q-106 0-201.5 68T165-160h155v80H80Zm400-635q91 0 162-24.5T755-800H205q42 36 113 60.5T480-715Zm0 635q-33 0-56.5-23.5T400-160q0-17 6.5-31t17.5-25q24-24 81-50.5T640-320q-28 78-54 135t-50 81q-11 11-25 17.5T480-80Zm0-635Z"/></svg>}
                                                {transaction.type==="return" &&  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#434343"><path d="M360-240 120-480l240-240 56 56-144 144h488v-160h80v240H272l144 144-56 56Z"/></svg>}
                                            
                                            </div>
                                            <div className="item-info">
                                                <strong>{transaction.product?.name}</strong>
                                                <span className="item-meta">
                                                    {transaction.type === 'out' ? '-' : '+'}{transaction.quantity} {transaction.product?.unit}
                                                    {' • '}
                                                    {new Date(transaction.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <Link to="/transactions" className="card-footer-link">
                            View All Transactions →
                        </Link>
                    </div>

                    {/* Top Categories */}
                    <div className="dashboard-card">
                        <div className="card-header">
                            <h3>Top Categories</h3>
                        </div>
                        <div className="card-content">
                            {topCategories.length === 0 ? (
                                <p className="empty-message">No categories yet</p>
                            ) : (
                                <div className="chart-list">
                                    {topCategories.map(category => (
                                        <div key={category.id} className="chart-item">
                                            <div className="chart-label">
                                                <span>{category.name}</span>
                                                <span className="chart-value">{category.productCount}</span>
                                            </div>
                                            <div className="chart-bar">
                                                <div 
                                                    className="chart-bar-fill"
                                                    style={{
                                                        width: `${(category.productCount / stats.products.total) * 100}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <Link to="/categories" className="card-footer-link">
                            Manage Categories →
                        </Link>
                    </div>

                    {/* Recently Added Products */}
                    <div className="dashboard-card">
                        <div className="card-header">
                            <h3>Recently Added</h3>
                        </div>
                        <div className="card-content">
                            {recentProducts.length === 0 ? (
                                <p className="empty-message">No products yet</p>
                            ) : (
                                <div className="list-items">
                                    {recentProducts.map(product => (
                                        <div key={product.id} className="list-item">
                                            <div className="item-info">
                                                <strong>{product.name}</strong>
                                                <span className="item-meta">
                                                    {product.category?.name}
                                                    {product.supplier && ` • ${product.supplier.name}`}
                                                </span>
                                            </div>
                                            <span className={`stock-badge ${getStockClass(product.stock)}`}>
                                                {product.stock} {product.unit}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <Link to="/products" className="card-footer-link">
                            View All Products →
                        </Link>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                    <h3>Quick Actions</h3>
                    <div className="action-buttons">
                        <Link to="/products" className="action-btn action-primary">
                            <span className="action-icon"></span>
                            <span>Add Product</span>
                        </Link>
                        <Link to="/transactions" className="action-btn action-success">
                            <span className="action-icon"></span>
                            <span>Record Stock In</span>
                        </Link>
                        <Link to="/transactions" className="action-btn action-danger">
                            <span className="action-icon"></span>
                            <span>Record Stock Out</span>
                        </Link>
                        <Link to="/categories" className="action-btn action-info">
                            <span className="action-icon"></span>
                            <span>Manage Categories</span>
                        </Link>
                        <Link to="/suppliers" className="action-btn action-warning">
                            <span className="action-icon"></span>
                            <span>Manage Suppliers</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard