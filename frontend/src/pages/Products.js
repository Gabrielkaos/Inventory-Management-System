import { useEffect, useState } from "react"
import api from "../api/api"
import Header from "../components/Header"
import "./Products.css"

const Products = () => {
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])

    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)

    const [productName, setProductName] = useState("")
    const [productDescription, setProductDescription] = useState("")
    const [productCategory, setProductCategory] = useState("")
    const [productUnit, setProductUnit] = useState("")
    const [productStock, setProductStock] = useState("")

    const [editModal, setEditModal] = useState(false)
    const [editProduct, setEditProduct] = useState(null)

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const res = await api.get("/products")
            setProducts(res.data.data.products)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const fetchCategories = async () => {
        try {
            const res = await api.get("/categories")
            setCategories(res.data.data.categories)
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        fetchProducts()
        fetchCategories()
    }, [])

    const addProduct = async (e) => {
        e.preventDefault()
        setError("")

        try {
            const res = await api.post("/products", {
                name: productName,
                description: productDescription,
                categoryId: productCategory,
                stock: productStock,
                unit: productUnit,
            })

            if (res.data.status === "success") {
                fetchProducts()
                setProductName("")
                setProductDescription("")
                setProductCategory("")
                setProductUnit("")
                setProductStock("")
            }
        } catch (err) {
            if (err.response?.data?.details) {
                setError(err.response.data.details[0].msg)
            } else {
                setError("Error adding product.")
            }
        }
    }

    const openEdit = (product) => {
        setEditProduct(product)
        setEditModal(true)
    }

    const updateProduct = async (e) => {
        e.preventDefault()
        setError("")

        try {
            const res = await api.put(`/products/${editProduct.id}`, {
                name: editProduct.name,
                description: editProduct.description,
                categoryId: editProduct.categoryId,
                stock: editProduct.stock,
                unit: editProduct.unit,
            })

            if (res.data.status === "success") {
                setEditModal(false)
                fetchProducts()
            }
        } catch (err) {
            setError("Update failed.")
        }
    }

    const deleteProduct = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return

        try {
            await api.delete(`/products/${id}`)
            fetchProducts()
        } catch (err) {
            alert("Failed to delete product")
        }
    }

    return (
        <div>
            <Header />

            <h2>Products</h2>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <form onSubmit={addProduct} className="product-form">
                        {error && <p className="error">{error}</p>}

                        <input placeholder="Name" value={productName} onChange={(e)=>setProductName(e.target.value)} />

                        <textarea placeholder="Description" value={productDescription} onChange={(e)=>setProductDescription(e.target.value)} />

                        <select value={productCategory} onChange={(e)=>setProductCategory(e.target.value)}>
                            <option value="">Select Category</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>

                        <input placeholder="Stock" value={productStock} onChange={(e)=>setProductStock(e.target.value)} />

                        <select value={productUnit} onChange={(e)=>setProductUnit(e.target.value)}>
                            <option value="">Select Unit</option>
                            <option value="kg">Kilograms</option>
                            <option value="g">Grams</option>
                            <option value="box">Box</option>
                            <option value="pcs">Pieces</option>
                            <option value="pack">Pack</option>
                            <option value="liter">Liter</option>
                        </select>

                        <button type="submit">Add Product</button>
                    </form>

                    
                    <table className="product-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Stock</th>
                                <th>Unit</th>
                                <th>Code</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {products.length === 0 ? (
                                <tr><td colSpan="7">No products found.</td></tr>
                            ) : (
                                products.map(product => (
                                    <tr key={product.id}>
                                        <td>{product.name}</td>
                                        <td>{product.description}</td>
                                        <td>{product.category?.name}</td>
                                        <td>{product.stock}</td>
                                        <td>{product.unit}</td>
                                        <td>{product.uniqueCode}</td>
                                        <td>
                                            <button onClick={() => openEdit(product)}>Edit</button>
                                            <button onClick={() => deleteProduct(product.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </>
            )}

            
            {editModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Edit Product</h3>

                        <form onSubmit={updateProduct}>
                            <input value={editProduct.name} onChange={(e)=>setEditProduct({...editProduct, name:e.target.value})} />

                            <textarea value={editProduct.description} onChange={(e)=>setEditProduct({...editProduct, description:e.target.value})} />

                            <select value={editProduct.categoryId} onChange={(e)=>setEditProduct({...editProduct, categoryId:e.target.value})}>
                                <option value="">Select Category</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>

                            <input value={editProduct.stock} onChange={(e)=>setEditProduct({...editProduct, stock:e.target.value})} />

                            <select value={editProduct.unit} onChange={(e)=>setEditProduct({...editProduct, unit:e.target.value})}>
                                <option value="kg">Kilograms</option>
                                <option value="g">Grams</option>
                                <option value="box">Box</option>
                                <option value="pcs">Pieces</option>
                                <option value="pack">Pack</option>
                                <option value="liter">Liter</option>
                            </select>

                            <button type="submit">Save</button>
                            <button type="button" onClick={()=>setEditModal(false)}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Products
