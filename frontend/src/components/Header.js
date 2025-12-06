
import { useContext } from "react"
import { Link } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import "./Header.css"

const Header = () => {
    const { user, logout } = useContext(AuthContext)

    return (
        <header className="header">
            <nav className="nav-links">
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/products">Products</Link>
                <Link to="/categories">Categories</Link>
                <Link to="/suppliers">Suppliers</Link>
                <Link to="/transactions">Transactions</Link>
            </nav>

            <div className="user-section">
                <p className="user-text">
                    Hello {user?.username ?? "User"}
                </p>
                <button className="logout-btn" onClick={logout}>
                    Logout
                </button>
            </div>
        </header>
    )
}

export default Header
