import { useState, useEffect } from "react";
import Header from "../components/Header";
import api from "../api/api";

const Categories = () => {
    const [categories, setCategories] = useState([]) 
    
    const fetchCategories = async () =>{
        try{
            const res = await api.get("/categories")
            if(res.data.status==="success"){
                setCategories(res.data.data.categories)
            }else{
                console.error("Error Fetching")
            }

        }catch(err){
            console.error(err)
        }
    }

    useEffect(()=>{
        fetchCategories()
    },[])

    return (
        <div>
            <Header/>
            <h2>Categories</h2>
            {categories.length===0 ? <div>
                No categories found.
            </div>:
            <ul>
                {categories.map((category)=>(
                    <li key={category.id}>
                        {category.name}
                    </li>
                ))}
            </ul>
            }
            
            
        </div>
    )
}

export default Categories