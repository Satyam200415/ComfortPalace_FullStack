import { useEffect, useMemo, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, Bell, Building2, CircleDollarSign, Download, Hotel, LayoutDashboard, LogOut, Menu, Moon, Search, ShieldCheck, Sun, Users, X } from 'lucide-react'
import { api } from '../../api/api'
import { LoginContext } from '../../context/LoginContext'
import './AdminDashboard.css'

const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const tabs = [{ id:'overview', label:'Overview', icon:LayoutDashboard }, { id:'hotels', label:'Hotels', icon:Hotel }, { id:'owners', label:'Hotel owners', icon:Building2 }, { id:'customers', label:'Customers', icon:Users }, { id:'bookings', label:'Bookings', icon:BarChart3 }]

export default function AdminDashboard() {
  const { user, isAuthenticated } = useContext(LoginContext)
  const [active, setActive] = useState('overview'), [dashboard, setDashboard] = useState(null), [items, setItems] = useState([]), [loading, setLoading] = useState(true), [query,setQuery]=useState(''), [menu,setMenu]=useState(false), [dark,setDark]=useState(false), [notice,setNotice]=useState('')
  const navigate = useNavigate()
  const endpoint = active === 'hotels' ? '/admin/hotels' : active === 'bookings' ? '/admin/bookings' : active === 'owners' ? '/admin/hotel-owners' : '/admin/customers'
  const title = tabs.find(t=>t.id===active)?.label || 'Overview'
  useEffect(()=>{ document.documentElement.classList.toggle('admin-dark',dark) },[dark])
  useEffect(()=>{ loadDashboard() },[])
  useEffect(()=>{ if(active !== 'overview') loadTable() },[active])
  const loadDashboard=async()=>{ 
    console.log('Loading dashboard data...')
    console.log('Current user:', user)
    console.log('Is authenticated:', isAuthenticated)
    try {
      setLoading(true)
      const {data}=await api.get('/admin/dashboard')
      console.log('Dashboard data received:', data)
      setDashboard(data)
      setNotice('Dashboard refreshed successfully.')
    } catch (error) { 
      console.error('Dashboard load error:', error)
      console.error('Error response:', error.response)
      console.error('Error status:', error.response?.status)
      console.error('Error data:', error.response?.data)
      if (error.response?.status === 401) {
        setNotice('Authentication required. Please login again.')
      } else if (error.response?.status === 403) {
        setNotice('Admin access was denied. Please sign in with an ADMIN account.')
      } else {
        setNotice(`Unable to load dashboard data: ${error.message || 'Unknown error'}`)
      }
    } finally {
      setLoading(false)
    }
  }
  const loadTable=async(search=query)=>{ try {setLoading(true); const sep=endpoint.includes('?')?'&':'?'; const {data}=await api.get(`${endpoint}${sep}query=${encodeURIComponent(search)}`);setItems(data.content||[])} catch {setNotice('Unable to load this management list.')} finally {setLoading(false)} }
  const selectTab=(id)=>{setActive(id);setQuery('');setMenu(false)}
  const changeStatus=async(item, status)=>{ const isHotel=active==='hotels', target=isHotel?'hotels':'users'; const description=status==='DELETE'?'remove this record from active use':`${status.toLowerCase()} this ${isHotel?'hotel':'user'}`; if(!window.confirm(`Are you sure you want to ${description}?`))return; try { if(status==='DELETE') await api.delete(`/admin/${target}/${item.id}`); else if(isHotel) await api.patch(`/admin/hotels/${item.id}/status`,{status}); else await api.patch(`/admin/users/${item.id}/access`,{enabled:status==='ACTIVE'}); setNotice('Change saved and written to the audit log.');loadTable();loadDashboard() } catch(e){ console.error('Status change error:', e); setNotice(e.response?.data?.message||e.message||'The change could not be saved.')} }
  const updateBooking=async(item,status)=>{if(!window.confirm(`Change booking #${item.id} to ${status}?`))return;try{await api.patch(`/admin/bookings/${item.id}/status`,{status});setNotice('Booking updated.');loadTable();loadDashboard()}catch{setNotice('Booking update failed.')}}
  const metric = (label, value, Icon, tint) => <article className="admin-metric"><div><span>{label}</span><strong>{value ?? '—'}</strong></div><i style={{background:tint}}><Icon size={21}/></i></article>
  const recent = dashboard?.recentBookings || []
  const chart = useMemo(()=>Object.entries(dashboard?.revenueByMonth||{}),[dashboard])
  return <div className="admin-shell">
    <aside className={menu?'admin-sidebar open':'admin-sidebar'}><div className="admin-brand"><span><ShieldCheck size={22}/></span><b>comfort<span>place</span></b><button onClick={()=>setMenu(false)}><X size={20}/></button></div><p className="admin-section-label">WORKSPACE</p>{tabs.map(({id,label,icon:Icon})=><button key={id} className={active===id?'active':''} onClick={()=>selectTab(id)}><Icon size={19}/>{label}</button>)}<div className="admin-sidebar-bottom"><button onClick={()=>setActive('overview')}><Bell size={19}/>Notifications</button><button onClick={()=>navigate('/')}><LogOut size={19}/>Exit admin</button></div></aside>
    {menu&&<div className="admin-overlay" onClick={()=>setMenu(false)}/>}<main className="admin-main"><header className="admin-topbar"><button className="admin-menu" onClick={()=>setMenu(true)}><Menu/></button><div><p>Administration</p><h1>{title}</h1></div><div className="admin-top-actions"><button onClick={()=>setDark(!dark)} aria-label="toggle color theme">{dark?<Sun size={19}/>:<Moon size={19}/>}</button><div className="admin-avatar">A</div></div></header>
      {notice&&<div className="admin-toast">{notice}<button onClick={()=>setNotice('')}>×</button></div>}
      {active==='overview'?<section className="admin-content"> <div className="admin-welcome"><div><p>Platform overview</p><h2>Good to see you, Admin</h2><span>Here's what's happening across ComfortPlace today.</span></div><button onClick={() => loadDashboard()} disabled={loading}>{loading?'Refreshing...':'Refresh data'}</button></div>{loading?<Loading/>:<><div className="admin-metrics">{metric('Total users',dashboard?.totalUsers,Users,'#e4efff')}{metric('Customers',dashboard?.totalCustomers,Users,'#e7f8ef')}{metric('Hotel owners',dashboard?.totalOwners,Building2,'#fff1de')}{metric('Hotels',dashboard?.totalHotels,Hotel,'#efe9ff')}{metric('Bookings',dashboard?.totalBookings,BarChart3,'#e9f8fa')}{metric('Platform revenue',money.format(dashboard?.totalRevenue||0),CircleDollarSign,'#fff0f2')}</div><div className="admin-analytics"><article className="admin-panel chart"><div className="panel-heading"><div><h3>Revenue performance</h3><p>Revenue from completed and active bookings</p></div><strong>{money.format(dashboard?.totalRevenue||0)}</strong></div><div className="bars">{chart.length?chart.map(([month,value])=><div key={month}><span style={{height:`${Math.max(12,(value/Math.max(...chart.map(x=>x[1])))*145)}px`}} title={money.format(value)}/><small>{month}</small></div>):<p>No revenue recorded yet.</p>}</div></article><article className="admin-panel booking-health"><h3>Booking health</h3><p>Current booking distribution</p><div><span>Active</span><b>{dashboard?.activeBookings||0}</b></div><div><span>Pending</span><b>{dashboard?.pendingBookings||0}</b></div><div><span>Cancelled</span><b>{dashboard?.cancelledBookings||0}</b></div><div><span>Rooms listed</span><b>{dashboard?.totalRooms||0}</b></div></article></div><div className="admin-panel"><div className="panel-heading"><div><h3>Recent bookings</h3><p>Latest platform activity</p></div><button className="link-btn" onClick={()=>selectTab('bookings')}>View all</button></div><BookingRows rows={recent}/></div></>}</section>:<section className="admin-content"><div className="admin-table-header"><div><p>Management</p><h2>{title}</h2></div>{active==='bookings'&&<a className="export-btn" href="http://localhost:8080/api/admin/reports/bookings.csv" target="_blank"><Download size={17}/>Export CSV</a>}</div><div className="admin-panel"><div className="table-tools"><div className="search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&loadTable()} placeholder={`Search ${title.toLowerCase()}…`}/></div><button onClick={()=>loadTable()} className="filter-btn">Search</button></div>{loading?<Loading/>:<ManagementTable active={active} rows={items} onUser={changeStatus} onBooking={updateBooking}/>}</div></section>}</main>
    <footer className="admin-footer">
      <div className="admin-footer-content">
        <p> {new Date().getFullYear()} ComfortPlace. All rights reserved.</p>
        <span>Admin Panel v1.0</span>
      </div>
    </footer>
  </div>
}
function Loading(){return <div className="admin-loading"><span/>Loading secure workspace…</div>}
function BookingRows({rows}){return <div className="admin-table-wrap"><table><thead><tr><th>Booking</th><th>Hotel</th><th>Guest</th><th>Amount</th><th>Status</th></tr></thead><tbody>{rows.length?rows.map(b=><tr key={b.id}><td>#{b.id}</td><td>{b.hotelName}</td><td>{b.guestName}</td><td>{money.format(b.totalAmount||0)}</td><td><Status value={b.status}/></td></tr>):<tr><td colSpan="5" className="empty">No bookings found.</td></tr>}</tbody></table></div>}
function ManagementTable({active,rows,onUser,onBooking}){if(active==='bookings')return <div><BookingRows rows={rows}/>{rows.map(b=><div className="admin-row-actions" key={`a${b.id}`}><span>Booking #{b.id}</span><button onClick={()=>onBooking(b,'CONFIRMED')}>Confirm</button><button className="danger" onClick={()=>onBooking(b,'CANCELLED')}>Cancel / refund</button></div>)}</div>;return <div className="admin-table-wrap"><table><thead><tr><th>{active==='hotels'?'Hotel':'Name'}</th><th>{active==='hotels'?'Location':'Email'}</th><th>{active==='hotels'?'Owner':'Role'}</th><th>Status</th><th>Actions</th></tr></thead><tbody>{rows.length?rows.map(x=><tr key={x.id}><td><b>{x.name}</b></td><td>{x.city||x.email}</td><td>{x.owner||x.role}</td><td><Status value={x.status||(x.enabled?'ACTIVE':'SUSPENDED')}/></td><td className="actions">{active==='hotels'?<><button onClick={()=>onUser(x,'PUBLISHED')}>Approve</button><button onClick={()=>onUser(x,'SUSPENDED')}>Suspend</button><button className="danger" onClick={()=>onUser(x,'DELETE')}>Delist</button></>:<>{x.enabled?<button onClick={()=>onUser(x,'SUSPENDED')}>Suspend</button>:<button onClick={()=>onUser(x,'ACTIVE')}>Activate</button>}<button className="danger" onClick={()=>onUser(x,'DELETE')}>Delete</button></>}</td></tr>):<tr><td colSpan="5" className="empty">No records found.</td></tr>}</tbody></table></div>}
function Status({value}){return <span className={`status status-${String(value).toLowerCase()}`}>{String(value).replaceAll('_',' ')}</span>}
