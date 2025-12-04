
import "./Header.css"
import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"

const Header = () => {
    const {user, logout} = useContext(AuthContext)
    return (
        <header>
            <div className="header-div">
                <p>Hello {user.username}</p>
                <button onClick={logout}>Logout</button>
            </div>
        </header>
    )
}


export default Header

