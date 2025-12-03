
import './App.css';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path='/register' element={<Register/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/dashboard' element={
              <ProtectedRoute>
                  <Dashboard/>
              </ProtectedRoute>
            }/>
            
          
          <Route path='/' element={<Navigate to="/dashboard" replace/>}/>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
