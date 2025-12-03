import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const {login} = useContext(AuthContext)
    const navigator = useNavigate()

    const handleSubmit = async (e) =>{
        e.preventDefault()
        setError("")

        const res = await login(email, password)

        if (res.success){
            navigator("/")
        }else{
            setError(res.error)
        }
    }

    return (
        <div>
            <div>
                <h2>Login</h2>
                {error && <div>{error}</div>}
                
                <form onSubmit={(e)=>handleSubmit(e)}>
                    <input placeholder="Email" value={email} onChange={(e)=>{setEmail(e.target.value)}} type="email" required/>
                    <input placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} type="password" required/>
                    <button type="submit">Login</button>
                </form>
                <p>Dont have an account? <Link to="/register">Register</Link></p>
            </div>
        </div>
    )
}


export default Login