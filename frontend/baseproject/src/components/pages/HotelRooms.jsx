import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BedDouble, ChevronDown, ChevronUp, Minus, Plus, UsersRound, Baby } from 'lucide-react'
import { hotelApi } from '../../api/hotelApi'
import { roomApi } from '../../api/roomApi'

const fallback = 'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=1200'
const labels = ['Basic info', 'Amenities', 'Location', 'Ratings', 'Rules & policies', 'Room options']

export default function HotelRooms() {
  const { hotelId } = useParams()
  const navigate = useNavigate()
  const [hotel, setHotel] = useState(null)
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedRoomId, setSelectedRoomId] = useState(null)
  const [selectedRate, setSelectedRate] = useState(null)
  const [activePhoto, setActivePhoto] = useState(0)
  const [checkInDate, setCheckInDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [checkInTime, setCheckInTime] = useState(() => {
    const date = new Date(); date.setHours(date.getHours() + 1, 0, 0, 0)
    return date.toTimeString().slice(0, 5)
  })
  const [showGuestForm, setShowGuestForm] = useState(false)
  const [showGuestPicker, setShowGuestPicker] = useState(true)
  const [guests, setGuests] = useState({ rooms: 1, adults: 2, children: 0 })
  const [guestDetails, setGuestDetails] = useState({ name: '', email: '', phone: '' })
  const [reservationError, setReservationError] = useState('')
  const [roomAvailability, setRoomAvailability] = useState({})

  useEffect(() => {
    Promise.all([hotelApi.getHotelById(hotelId), roomApi.getRoomsByHotel(hotelId)])
      .then(([hotelData, roomData]) => {
        setHotel(hotelData); setRooms(roomData)
        const first = roomData.find((room) => room.totalRooms > 0) || roomData[0]
        setSelectedRoomId(first?.id || null); setSelectedRate(first?.pricingList?.[0]?.id || null)
      })
      .catch(() => setError('We could not load this hotel right now.'))
      .finally(() => setLoading(false))
  }, [hotelId])

  const selectedRoom = useMemo(() => rooms.find((room) => room.id === selectedRoomId) || rooms[0], [rooms, selectedRoomId])
  const rates = selectedRoom?.pricingList || []
  const selectedPrice = rates.find((rate) => rate.id === selectedRate) || rates[0]
  const photos = useMemo(() => {
    const images = (selectedRoom?.images || []).map((image) => roomApi.getImageUrl(image))
    return images.length ? images : [fallback, fallback, fallback, fallback, fallback]
  }, [selectedRoom])

  // Calculate available rooms for selected date range
  const availableRoomsForDates = useMemo(() => {
    if (!selectedRoom || !checkInDate || !selectedPrice) return selectedRoom?.totalRooms || 0
    
    const hours = Number(selectedPrice.duration?.match(/\d+/)?.[0] || 24)
    const checkIn = new Date(`${checkInDate}T${checkInTime}`)
    const checkOut = new Date(checkIn.getTime() + hours * 60 * 60 * 1000)
    
    // Use the availability data from API if available
    const availability = roomAvailability[selectedRoom.id]
    if (availability) {
      return availability.availableRooms
    }
    
    // Fallback to totalRooms
    return selectedRoom.totalRooms || 0
  }, [selectedRoom, checkInDate, checkInTime, selectedPrice, roomAvailability])

  // Fetch availability for all rooms when date changes
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!checkInDate || !checkInTime || rooms.length === 0) return
      
      const hours = 24 // Default to 24 hours for initial check
      const checkIn = new Date(`${checkInDate}T${checkInTime}`)
      const checkOut = new Date(checkIn.getTime() + hours * 60 * 60 * 1000)
      
      const checkInStr = checkIn.toISOString().slice(0, 16)
      const checkOutStr = checkOut.toISOString().slice(0, 16)
      
      const availabilityData = {}
      
      await Promise.all(rooms.map(async (room) => {
        try {
          const data = await roomApi.checkAvailability(room.id, checkInStr, checkOutStr)
          availabilityData[room.id] = data
        } catch (error) {
          console.error(`Failed to fetch availability for room ${room.id}:`, error)
          availabilityData[room.id] = { totalRooms: room.totalRooms, bookedRooms: 0, availableRooms: room.totalRooms }
        }
      }))
      
      setRoomAvailability(availabilityData)
    }
    
    fetchAvailability()
  }, [checkInDate, checkInTime, rooms])

  // Reset active photo when room changes
  useEffect(() => {
    setActivePhoto(0)
  }, [selectedRoomId])
  const changePhoto = (direction) => setActivePhoto((current) => (current + direction + photos.length) % photos.length)
  const startReservation = () => {
    if (!selectedRoom || !selectedPrice) return
    if (availableRoomsForDates < guests.rooms) { setReservationError(`Only ${availableRoomsForDates} room(s) are available for this stay.`); return }
    if (new Date(`${checkInDate}T${checkInTime}`) <= new Date()) { setReservationError('Please select a future check-in date and time.'); return }
    setReservationError(''); setShowGuestForm(true)
  }
  const continueToPayment = (event) => {
    event.preventDefault()
    const hours = Number(selectedPrice.duration?.match(/\d+/)?.[0] || 24)
    const checkIn = new Date(`${checkInDate}T${checkInTime}`)
    const checkOut = new Date(checkIn.getTime() + hours * 60 * 60 * 1000)
    sessionStorage.setItem('pendingBooking', JSON.stringify({ hotelName: hotel.hotelName, hotelImage: photos[0], address: hotel.area || hotel.city, roomName: selectedRoom.roomName, guestDetails, roomId: selectedRoom.id, checkIn: checkIn.toISOString().slice(0, 16), checkOut: checkOut.toISOString().slice(0, 16), totalAmount: Number(selectedPrice.price) * guests.rooms, duration: selectedPrice.duration, roomsBooked: guests.rooms, guests: guests.adults, children: guests.children }))
    navigate('/payment')
  }
  const formattedCheckInDate = useMemo(() => new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${checkInDate}T00:00:00`)), [checkInDate])
  const changeGuestCount = (type, amount) => setGuests((current) => {
    if (type === 'adults') {
      const adults = Math.max(1, current.adults + amount)
      return { ...current, adults, rooms: Math.max(current.rooms, Math.ceil(adults / 2)) }
    }
    if (type === 'rooms') return { ...current, rooms: Math.max(Math.ceil(current.adults / 2), current.rooms + amount) }
    return { ...current, children: Math.max(0, current.children + amount) }
  })

  if (loading) return <main className="cp-booking-page"><p>Loading hotel rooms...</p></main>
  if (error || !hotel) return <main className="cp-booking-page"><p className="cp-error">{error || 'Hotel not found.'}</p><Link to="/hotels-in">Browse hotels</Link></main>

  return <main className="cp-booking-page">
    <div className="cp-booking-breadcrumb"><Link to={`/hotels-in/${hotel.city?.toLowerCase() || ''}`}>Home</Link><span>&gt;</span><Link to={`/hotels-in/${hotel.city?.toLowerCase() || ''}`}>{hotel.city || 'Hotels'}</Link><span>&gt;</span><strong>{hotel.hotelName}</strong></div>
    <section className="cp-booking-gallery" aria-label={`${hotel.hotelName} photo gallery`}>
      <div className="cp-booking-photo-stage"><img src={photos[activePhoto]} alt={`${hotel.hotelName} view ${activePhoto + 1}`} onError={(event) => { event.currentTarget.src = fallback }} /><button type="button" className="cp-gallery-arrow is-prev" onClick={() => changePhoto(-1)} aria-label="Previous photo">&lsaquo;</button><button type="button" className="cp-gallery-arrow is-next" onClick={() => changePhoto(1)} aria-label="Next photo">&rsaquo;</button><span className="cp-gallery-count">{activePhoto + 1} / {photos.length}</span></div>
      <div className="cp-booking-photo-thumbnails">{photos.map((photo, index) => <button type="button" key={`${photo}-${index}`} className={activePhoto === index ? 'is-active' : ''} onClick={() => setActivePhoto(index)}><img src={photo} alt={`Show view ${index + 1}`} onError={(event) => { event.currentTarget.src = fallback }} /></button>)}</div>
    </section>
    <nav className="cp-booking-tabs">{labels.map((label, index) => <a key={label} href={index === 5 ? '#rooms' : '#basic'}>{label}</a>)}</nav>
    <div className="cp-booking-layout"><div className="cp-booking-content"><section id="basic" className="cp-booking-basic"><p className="cp-booking-kicker">{hotel.hotelType || 'PREMIUM HOTEL'}</p><h1>{hotel.hotelName}</h1><div className="cp-booking-meta"><span>Rating {Number(hotel.rating || 0).toFixed(1)} ({hotel.totalReviews || 0})</span><span>{hotel.area || hotel.city}</span></div><div className="cp-booking-policy-row">{hotel.coupleFriendly && <span>Couple friendly</span>}{hotel.localIdAccepted && <span>Accepts local ID</span>}<span>Verified property</span></div><p className="cp-booking-copy">{hotel.description || 'A comfortable hotel stay with flexible timings, welcoming spaces, and thoughtfully designed rooms.'}</p></section>
      <section className="cp-booking-perks"><div><b>+</b><span><strong>Flexible stay options</strong><small>Choose hourly or full-day rooms based on your schedule.</small></span></div><div><b>+</b><span><strong>Safe and verified stay</strong><small>ComfortPlace partner hotel with clear policies.</small></span></div></section>
      <section className="cp-booking-amenities"><p className="cp-booking-kicker">AMENITIES</p><h2>Things that make the stay better</h2><div>{(hotel.amenities || []).slice(0, 6).map((amenity) => <article key={amenity.id || amenity.name}><b>+</b><strong>{amenity.name}</strong><small>{amenity.description || 'Available for your comfort'}</small></article>)}{!(hotel.amenities || []).length && ['Comfortable rooms', 'Flexible bookings', 'Clean stay'].map((name) => <article key={name}><b>+</b><strong>{name}</strong><small>Designed for a better stay</small></article>)}</div></section>
      <section id="rooms" className="cp-booking-room-options"><p className="cp-booking-kicker">ROOM OPTIONS</p><h2>Select a room</h2>{rooms.map((room) => { const availability = roomAvailability[room.id] || { availableRooms: room.totalRooms }; return <article className={`cp-booking-room-option ${selectedRoom?.id === room.id ? 'is-selected' : ''}`} key={room.id} onClick={() => { setSelectedRoomId(room.id); setSelectedRate(room.pricingList?.[0]?.id || null) }}><img src={room.images?.[0] ? roomApi.getImageUrl(room.images[0]) : fallback} alt={room.roomName} /><div><h3>{room.roomName}</h3><p>{room.description || `${room.roomType} room for up to ${room.capacity} guests.`}</p><span>{room.capacity} guests | {room.bedType?.replaceAll('_', ' ') || 'Comfort bed'} | {availability.availableRooms} available</span></div><div className="cp-booking-rate-pills">{(room.pricingList || []).map((rate) => <button type="button" key={rate.id} onClick={(event) => { event.stopPropagation(); setSelectedRoomId(room.id); setSelectedRate(rate.id) }}>Rs {rate.price}<small>{rate.duration?.replaceAll('_', ' ')}</small></button>)}</div></article> })}</section>
    </div><aside className="cp-booking-summary"><div className="cp-booking-summary-offer"><span>Get upto 25% OFF on bookings</span><button type="button">Apply Coupon</button></div><div className="cp-booking-summary-body"><p>Your Booking Summary</p><div className="cp-booking-summary-date"><label><span>Check-in Date</span><input aria-label="Check-in date" type="date" min={new Date().toISOString().slice(0, 10)} value={checkInDate} onChange={(event) => setCheckInDate(event.target.value)} /><strong>{formattedCheckInDate}</strong></label><label><span>Check-in Time</span><input aria-label="Check-in time" type="time" value={checkInTime} onChange={(event) => setCheckInTime(event.target.value)} /></label></div>{selectedRoom ? <><div className="cp-booking-rate-list">{rates.map((rate) => <label key={rate.id} className={selectedPrice?.id === rate.id ? 'is-selected' : ''}><input type="radio" checked={(selectedPrice?.id || rate.id) === rate.id} onChange={() => setSelectedRate(rate.id)} /><span><b>₹{Number(rate.price) * guests.rooms}</b><small>{rate.duration?.replaceAll('_', ' ')}</small></span></label>)}</div><motion.section layout className="cp-guest-picker"><button type="button" className="cp-guest-picker-toggle" onClick={() => setShowGuestPicker((value) => !value)} aria-expanded={showGuestPicker}><span>Select Rooms & Guests</span>{showGuestPicker ? <ChevronUp size={19} /> : <ChevronDown size={19} />}</button>{showGuestPicker && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="cp-guest-picker-rows">{[['rooms', 'Rooms', BedDouble], ['adults', 'Guests', UsersRound], ['children', 'Children', Baby]].map(([type, label, Icon]) => { const min = type === 'rooms' ? Math.ceil(guests.adults / 2) : type === 'adults' ? 1 : 0; return <div key={type} className="cp-guest-picker-row"><span className="cp-guest-picker-label"><Icon size={17} aria-hidden="true"/><b>{label}</b>{type === 'children' && <small>(Below age of 5)</small>}</span><span className="cp-guest-stepper"><button type="button" onClick={() => changeGuestCount(type, -1)} disabled={guests[type] <= min} aria-label={`Decrease ${label}`}><Minus size={17}/></button><strong aria-live="polite">{guests[type]}</strong><button type="button" onClick={() => changeGuestCount(type, 1)} aria-label={`Increase ${label}`}><Plus size={17}/></button></span></div> })}<p className="cp-guest-helper">Each room can accommodate a maximum of 2 guests.</p></motion.div>}</motion.section></> : <p>No rooms available yet.</p>}{reservationError && <p className="cp-error">{reservationError}</p>}<footer><div><strong>₹{(Number(selectedPrice?.price) || 0) * guests.rooms}</strong><small>{selectedPrice?.duration?.replaceAll('_', ' ') || 'Select a stay'}</small></div><button type="button" onClick={startReservation} disabled={!selectedRoom || selectedRoom.availableRooms < guests.rooms}>Reserve</button></footer></div></aside></div>
    {showGuestForm && <div className="cp-modal-overlay" onClick={() => setShowGuestForm(false)}><section className="cp-modal cp-guest-details-modal" onClick={(event) => event.stopPropagation()}><p className="cp-booking-kicker">STEP 1 OF 2</p><h2>Guest details</h2><p>Enter the details for this stay. You will choose a payment method next.</p><form onSubmit={continueToPayment}><label>Full name<input required value={guestDetails.name} onChange={(event) => setGuestDetails({ ...guestDetails, name: event.target.value })} placeholder="Your full name" /></label><label>Email address<input required type="email" value={guestDetails.email} onChange={(event) => setGuestDetails({ ...guestDetails, email: event.target.value })} placeholder="you@example.com" /></label><label>Mobile number<input required type="tel" pattern="[0-9]{10}" value={guestDetails.phone} onChange={(event) => setGuestDetails({ ...guestDetails, phone: event.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="10-digit mobile number" /></label><div className="cp-modal-actions"><button type="button" onClick={() => setShowGuestForm(false)} style={{opacity: 1, visibility: 'visible'}}>Cancel</button><button type="submit" className="cp-button cp-button-primary" style={{opacity: 1, visibility: 'visible'}}>Continue to payment</button></div></form></section></div>}
  </main>
}
