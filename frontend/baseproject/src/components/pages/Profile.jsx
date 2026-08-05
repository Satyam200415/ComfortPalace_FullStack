import { Link, useNavigate } from 'react-router-dom'
import { useContext, useEffect, useMemo, useState } from 'react'
import { LoginContext } from '../../context/LoginContext'
import { bookingApi } from '../../api/bookingApi'

function Profile() {
  const { user, isAuthenticated } = useContext(LoginContext)
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to request cancellation for this booking? The owner will need to approve it.')) {
      return
    }

    try {
      await bookingApi.updateStatus(bookingId, 'CANCELLATION_REQUESTED')
      alert('Cancellation request submitted. The owner will review and approve it.')
      // Refresh bookings
      bookingApi.getMyBookings().then(setBookings).catch(() => setError('Could not load your booking history.'))
    } catch (error) {
      console.error('Failed to request cancellation:', error)
      alert('Failed to request cancellation')
    }
  }

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return }
    bookingApi.getMyBookings().then(setBookings).catch(() => setError('Could not load your booking history.')).finally(() => setLoading(false))
  }, [isAuthenticated, navigate])

  const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Guest User'
  const upcomingBookings = useMemo(() => bookings.filter((booking) => ['PENDING', 'CONFIRMED', 'CHECKED_IN'].includes(booking.status)).length, [bookings])
  const formatDate = (value) => value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not available'
  const formatStay = (booking) => {
    if (!booking.checkIn || !booking.checkOut) return 'Stay details unavailable'
    const hours = Math.round((new Date(booking.checkOut) - new Date(booking.checkIn)) / 3600000)
    return `${hours} hour${hours === 1 ? '' : 's'} stay`
  }

  return <main className="cp-profile-page">
    <section className="cp-profile-hero"><div className="cp-profile-identity"><div className="cp-profile-avatar">{user?.firstName?.[0] || 'G'}{user?.lastName?.[0] || ''}</div><div><p className="cp-profile-kicker">My Profile</p><h1>{fullName}</h1><p>Manage your bookings and account details in one place.</p></div></div><div className="cp-profile-actions"><Link to="/hotels-in/mumbai" className="cp-button cp-button-primary">Explore Hotels</Link><Link to="/" className="cp-button cp-button-secondary">Back to Home</Link></div></section>
    <section className="cp-profile-grid"><article className="cp-profile-card"><h2>Account Details</h2><div className="cp-profile-info-list"><div><span>Full Name</span><strong>{fullName}</strong></div><div><span>Email</span><strong>{user?.email || 'Not available'}</strong></div><div><span>Account role</span><strong>{user?.role?.replace('ROLE_', '') || 'Guest'}</strong></div><div><span>Member ID</span><strong>{user?.id || 'Not available'}</strong></div></div></article><article className="cp-profile-card"><h2>Quick Stats</h2><div className="cp-profile-stats"><div><strong>{bookings.length}</strong><span>Total Bookings</span></div><div><strong>{upcomingBookings}</strong><span>Upcoming Stays</span></div><div><strong>{bookings.filter((booking) => booking.status === 'COMPLETED').length}</strong><span>Completed Stays</span></div></div></article></section>
    <section className="cp-profile-card"><div className="cp-profile-section-head"><h2>Recent Bookings</h2><span>Track your upcoming and previous stays</span></div>{loading ? <p>Loading your bookings...</p> : error ? <p className="cp-error">{error}</p> : bookings.length === 0 ? <p>You have no bookings yet. Explore hotels to make your first booking.</p> : <div className="cp-profile-bookings">{bookings.map((booking) => <article key={booking.id} className="cp-profile-booking-row"><div><strong>{booking.hotelName}</strong><span>{booking.roomName} | {formatStay(booking)}</span></div><div><strong>{formatDate(booking.checkIn)}</strong><span className={`cp-profile-status ${['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CANCELLATION_REQUESTED'].includes(booking.status) ? 'cp-profile-status-upcoming' : ''}`}>{booking.status?.replaceAll('_', ' ')}</span></div>{(booking.status === 'CONFIRMED' || booking.status === 'PENDING') && <button type="button" className="cp-button cp-button-secondary cp-button-small" onClick={() => handleCancelBooking(booking.id)}>Request Cancellation</button>}</article>)}</div>}</section>
  </main>
}

export default Profile
