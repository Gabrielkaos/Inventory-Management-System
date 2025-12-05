import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./Login.css";


const Register = () =>{
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("") 
    const [error, setError] = useState("") 
    const {register} = useContext(AuthContext)
    const navigator = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        
        const res = await register(username,email,password)
        if(res.success){
            navigator("/login")
        }else{
            setError(res.error)
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">
            <h2>Register</h2>
            {error && <div className="login-error">{error}</div>}
            <form onSubmit={(e)=>handleSubmit(e)}>
                <input placeholder="Username" value={username} type="text" onChange={(e)=>setUsername(e.target.value)} required/>
                <input placeholder="Email" value={email} type="email"  onChange={(e)=>setEmail(e.target.value)} required/>
                <input placeholder="Password" value={password} type="password"  onChange={(e)=>setPassword(e.target.value)} required/>
                <button type="submit">Register</button>
            </form>
            <p>Already have an account? <Link to="/login">Login</Link></p>
            </div>
            
        </div>
    )
}

export default Register