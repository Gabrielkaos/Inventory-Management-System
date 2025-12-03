import { AuthContext } from "../context/AuthContext"
import { useContext } from "react"
import "./Dashboard.css"

const Dashboard = () => {
    const {user, logout} = useContext(AuthContext)
    

    return (
        <div>
            <header>
                <div className="header-div">
                    <p>Hello {user.username}</p>
                    <button onClick={logout}>Logout</button>
                </div>
            </header>

            <div>

            </div>
        </div>
    )
}

export default Dashboard