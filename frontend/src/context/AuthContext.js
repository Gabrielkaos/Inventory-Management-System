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
            localStorage.setItem("user",user)
            setUser(user)
            return {success:true}

        }catch(error){
            console.error(error)
        }
    }

    const login = async (email, password) =>{
        try{
            const res = await api.post("/auth/login",{email,password})
            const {token, user} = res.data.data
            localStorage.setItem("token",token)
            localStorage.setItem("user",user)
            setUser(user)
            return {success:true}
        }catch(error){
            console.error(error)
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