
import './App.css';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Products from './pages/Products';
import Categories from './pages/Categories';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path='/register' element={<Register/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/products' element={
              <ProtectedRoute>
                  <Products/>
              </ProtectedRoute>
            }/>
            <Route path='/categories' element={
              <ProtectedRoute>
                  <Categories/>
              </ProtectedRoute>
            }/>
            
          
          <Route path='/' element={<Navigate to="/products" replace/>}/>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
