import { createContext, useState, useEffect } from "react"
import api from "../api/api"


export const AuthContext = createContext()

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(()=>{
        const token = localStorage.getItem("token")
        const savedUser = localStorage.getItem("user")
        if(token && savedUser){
            setUser(JSON.parse(savedUser))
        }
        setLoading(false)
    },[])

    const register = async (username, email, password) => {
        try{
            const res = await api.post("/auth/register",{username,email,password})

            const {token, user} = res.data.data
            
            localStorage.setItem("token",token)
            localStorage.setItem("user",JSON.stringify(user))
            setUser(user)
            return {success:true}

        }catch(error){
            let errorMessage = 'Registration failed'
      
            if (error.response?.data) {
                if (error.response.data.details) {
                const details = error.response.data.details
                errorMessage = Array.isArray(details) 
                    ? details.map(d => d.msg).join(', ')
                    : details
                } else {
                errorMessage = error.response.data.message || 
                                error.response.data.error || 
                                'Registration failed'
                }
            } else if (error.message) {
                errorMessage = error.message
            }
            
            return {
                success: false,
                error: errorMessage
            }
        }
    }

    const login = async (email, password) =>{
        try{
            const res = await api.post("/auth/login",{email,password})
            const {token, user} = res.data.data
            localStorage.setItem("token",token)
            localStorage.setItem("user",JSON.stringify(user))
            setUser(user)
            return {success:true}
        }catch(error){
            let errorMessage = 'Login failed'
      
            if (error.response?.data) {
                if (error.response.data.details) {
                const details = error.response.data.details
                errorMessage = Array.isArray(details) 
                    ? details.map(d => d.msg).join(', ')
                    : details
                } else {
                errorMessage = error.response.data.message || 
                                error.response.data.error || 
                                'Login failed'
                }
            } else if (error.message) {
                errorMessage = error.message
            }
            
            return {
                success: false,
                error: errorMessage
            }
        }
    }

    const logout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{user, register, login, logout,loading}}>
            {children}
        </AuthContext.Provider>
    )
}