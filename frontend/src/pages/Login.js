
import { useContext, useState } from "react"
import { AuthContext } from "../context/AuthContext"
import { useNavigate, Link } from "react-router-dom"
import "./Login.css"

const Login = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const { login } = useContext(AuthContext)
    const navigator = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        const res = await login(email, password)

        if (res.success) {
            navigator("/")
        } else {
            setError(res.error)
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <h2>Login</h2>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <input
                        placeholder="Email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        placeholder="Password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button type="submit">Login</button>
                </form>

                <p>
                    Don’t have an account? <Link to="/register">Register</Link>
                </p>
            </div>
        </div>
    )
}

export default Login
