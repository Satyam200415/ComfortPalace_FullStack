import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { LoginContext } from '../../context/LoginContext'
export default function AdminRoute({children}) { const {user,isAuthenticated}=useContext(LoginContext); const role=user?.role?.replace('ROLE_',''); if(!isAuthenticated)return <Navigate to="/login" replace/>; return role==='ADMIN'?children:<Navigate to="/" replace/> }
