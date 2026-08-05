import { useContext, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LoginContext } from '../../context/LoginContext'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useContext(LoginContext)
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)
  const close = () => setExpanded(false)
  const itemClass = ({ isActive }) => `cp-nav-link ${isActive ? 'cp-active' : ''}`
  const handleLogout = () => { logout(); close(); navigate('/') }
  return <header className="cp-navbar-wrap"><nav className="cp-navbar">
    <NavLink to="/" className="cp-brand" onClick={close}>ComfortPalace</NavLink>
    <button className="cp-navbar-toggler" type="button" onClick={() => setExpanded(!expanded)} aria-controls="cp-navigation" aria-expanded={expanded} aria-label="Toggle navigation"><span className="cp-navbar-toggler-icon" /></button>
    <div id="cp-navigation" className={`cp-nav-links ${expanded ? 'cp-nav-expanded' : ''}`}>
      <NavLink to="/" end className={itemClass} onClick={close}>Home</NavLink><NavLink to="/support" className={itemClass} onClick={close}>Support</NavLink>
      {isAuthenticated ? <><NavLink to="/profile" className={itemClass} onClick={close}>Profile</NavLink>{user?.role === 'ROLE_OWNER' && <NavLink to="/hotel-owner/dashboard" className={itemClass} onClick={close}>Dashboard</NavLink>}{user?.role === 'ROLE_ADMIN' && <NavLink to="/admin" className={itemClass} onClick={close}>Admin</NavLink>}<button type="button" className="cp-logout-button" onClick={handleLogout}>Logout</button></> : <><NavLink to="/login" className={itemClass} onClick={close}>Login</NavLink><NavLink to="/register" className="cp-button" onClick={close}>Create account</NavLink></>}
    </div>
  </nav></header>
}
