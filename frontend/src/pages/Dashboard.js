import { AuthContext } from "../context/AuthContext"
import { useContext, useState } from "react"
import "./Dashboard.css"

const Dashboard = () => {
    const {user, logout} = useContext(AuthContext)
    const [products, setProducts] = useState([])


    const fetchProducts = async () => {
        
    }

    return (
        <div>
            <header>
                <div className="header-div">
                    <p>Hello {user.username}</p>
                    <button onClick={logout}>Logout</button>
                </div>
            </header>

            <div>
                <h2>Categories</h2>
                <ul>
                    <li>

                    </li>
                </ul>
            </div>
        </div>
    )
}

export default Dashboard