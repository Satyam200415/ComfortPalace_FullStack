import { useLocation, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BadgeCheck, ChevronLeft, Home, IndianRupee, Clock, ShieldCheck } from 'lucide-react'
import { money, dateTime } from '../../utils/formatters'

export default function BookingSuccess() {
  const location = useLocation()
  const navigate = useNavigate()
  const { bookingId, hotelName, amount, paymentMethod, roomName, checkIn, checkOut, roomsBooked, guests } = location.state || {}

  if (!bookingId) return <main className="cp-page"><section className="card cp-confirm-card text-center p-5"><h1 className="h3">Booking not found</h1><p className="text-secondary">No booking information is available.</p><Link to="/hotels-in" className="btn btn-primary">Browse hotels</Link></section></main>

  const details = [['Booking ID', `#${bookingId}`], ['Hotel', hotelName], ['Room', roomName], ['Check-in', dateTime(checkIn)], ['Check-out', dateTime(checkOut)], ['Rooms', `${roomsBooked} room${roomsBooked > 1 ? 's' : ''}`], ['Guests', `${guests} guest${guests > 1 ? 's' : ''}`], ['Payment method', paymentMethod === 'CASH' ? 'Cash at hotel' : 'Paid online']]
  return <main className="cp-page"><div className="cp-container cp-narrow-container">
    <button type="button" onClick={() => navigate('/hotels-in')} className="btn btn-link px-0 mb-3"><ChevronLeft size={18}/> Back to hotels</button>
    <motion.section initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} className="card cp-confirm-card">
      <div className="cp-confirm-hero"><div className="cp-confirm-icon"><BadgeCheck size={38}/></div><h1 className="h2">Booking confirmed!</h1><p className="mb-0">Your reservation has been successfully completed.</p></div>
      <div className="p-4 p-md-5"><section className="cp-detail-panel p-4 rounded-3"><p className="cp-eyebrow"><ShieldCheck size={15}/> Booking details</p><div className="cp-summary-lines">{details.map(([label, value]) => <div key={label}><span className="text-secondary">{label}</span><b>{value}</b></div>)}<div><span className="text-secondary">Amount</span><b className="text-success"><IndianRupee size={15}/> {money(amount)}</b></div></div></section>
      <section className="alert alert-info mt-4 mb-0"><p className="fw-bold mb-2"><Clock size={16}/> Important information</p><ul className="mb-0 small"><li>A confirmation email has been sent to your registered email address.</li><li>Please carry a valid ID proof during check-in.</li><li>{paymentMethod === 'CASH' ? 'Payment will be collected at the hotel during check-in.' : 'Your payment has been processed successfully.'}</li></ul></section>
      <div className="d-flex flex-column flex-sm-row gap-3 mt-4"><Link to="/profile" className="btn btn-primary flex-grow-1">View my bookings</Link><Link to="/hotels-in" className="btn btn-outline-primary"><Home size={17}/> Browse hotels</Link></div></div>
    </motion.section><p className="text-center text-secondary small mt-4"><ShieldCheck size={14}/> Your booking is secured with SSL encryption.</p>
  </div></main>
}
