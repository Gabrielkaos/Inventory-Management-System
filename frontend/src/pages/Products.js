import { useEffect, useState } from "react"
import api from "../api/api"
import "./Products.css"
import Header from "../components/Header"


const Products = () => {
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [error, setError] = useState("")
    const [productName, setProductName] = useState("")
    const [productDescription, setProductDescription] = useState("")
    const [productCategory, setProductCategory] = useState("")
    const [productUnit, setProductUnit] = useState("")
    const [productStock, setProductStock] = useState("")


    const fetchProducts = async () => {
        try{
            const res = await api.get("/products")
            setProducts(res.data.data.products)
        }catch(error){
            console.error(error)
        }
    }
    const fetchCategories = async () => {
        try{
            const res = await api.get("/categories")
            setCategories(res.data.data.categories)
        }catch(error){
            console.error(error)
        }
    }

    useEffect(()=>{
        fetchProducts()
        fetchCategories()
    },[])

    const addProduct = async (e) => {
        e.preventDefault()
        setError("")
        console.log(productName,productDescription,productStock,productUnit)
        try{
            const res = await api.post("/products",{
                name:productName,
                description:productDescription,
                categoryId:productCategory,
                stock:productStock,
                unit:productUnit
            })
            if(res.data.status==="success"){
                fetchProducts()
                setProductName("");
                setProductDescription("");
                setProductCategory("");
                setProductUnit("");
                setProductStock("");
            }else{
                setError(res.data.message)
            }
        }catch(err){
            if (err.response?.data?.details) {
                const firstError = err.response.data.details[0].msg;
                setError(firstError);
            } else {
                setError(err.response?.data?.error || "Server error");
            }
        }
    }

    return (
        <div>
            <Header/>

            <div>
                <h2>Products</h2>
                {error && <div>{error}</div>}

                <form onSubmit={(e)=>addProduct(e)}>
                    <input placeholder="Product Name" onChange={(e)=>setProductName(e.target.value)} value={productName}/>
                    <textarea placeholder="Description" onChange={(e)=>setProductDescription(e.target.value)} value={productDescription}/>
                    
                    <select onChange={(e)=>setProductCategory(e.target.value)} value={productCategory}>
                        <option value="">Select Category</option>
                        {categories.map((category)=>(
                            <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                    </select>

                    <input placeholder="Stock" onChange={(e)=>setProductStock(e.target.value)} value={productStock} />
                    <select onChange={(e)=>setProductUnit(e.target.value)} value={productUnit} >
                        <option value="">Select Unit</option>
                        <option value="kg">Kilograms (kg)</option>
                        <option value="g">Grams (g)</option>
                        <option value="box">Box</option>
                        <option value="pcs">Pieces (pcs)</option>
                        <option value="pack">Pack</option>
                        <option value="liter">Liter</option>
                    </select>
                    
                    <button type="submit">Add Product</button>
                </form>
                <ul>
                    {products.length===0 ? <div>No products found</div>:products.map((product)=>(
                        <li key={product.id}>
                            {product.name} - {product.description} - {product.uniqueCode} - {product.stock} - {product.unit}
                        </li>
                    ))}
                </ul>
                {/* <ul>
                    {categories.length===0 ? <div>No categories found</div>:categories.map((category)=>(
                        <li key={category.id}>
                            {category.name}
                        </li>
                    ))}
                </ul> */}
            </div>
        </div>
    )
}

export default Products