import { AuthContext } from "../context/AuthContext"
import { useContext, useEffect, useState } from "react"
import api from "../api/api"
import "./Dashboard.css"

const Dashboard = () => {
    const {user, logout} = useContext(AuthContext)
    const [products, setProducts] = useState([])


    const fetchProducts = async () => {
        try{
            const res = await api.get("/products")
            setProducts(res.data.data.products)
        }catch(error){
            console.error(error)
        }
    }

    useEffect(()=>{
        fetchProducts()
    },[])

    return (
        <div>
            <header>
                <div className="header-div">
                    <p>Hello {user.username}</p>
                    <button onClick={logout}>Logout</button>
                </div>
            </header>

            <div>
                <h2>Products</h2>
                <form>
                    <input placeholder="Product Name"/>
                    <textarea placeholder="Description" />
                </form>
                <ul>
                    {products.length===0 ? <div>No products found</div>:products.map((product)=>(
                        <li key={product.id}>
                            {product.name} - {product.description}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default Dashboard