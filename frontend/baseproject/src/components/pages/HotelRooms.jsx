import { useEffect, useMemo, useState, useContext } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BedDouble, ChevronDown, ChevronUp, Minus, Plus, UsersRound, Baby } from 'lucide-react'
import { hotelApi } from '../../api/hotelApi'
import { roomApi } from '../../api/roomApi'
import { LoginContext } from '../../context/LoginContext'

const fallback = 'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=1200'
const labels = ['Basic info', 'Amenities', 'Location', 'Ratings', 'Rules & policies', 'Room options']

export default function HotelRooms() {
  const { hotelId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [hotel, setHotel] = useState(null)
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedRoomId, setSelectedRoomId] = useState(null)
  const [selectedRate, setSelectedRate] = useState(null)
  const [activePhoto, setActivePhoto] = useState(0)
  
  // Parse duration from URL query params
  const durationParam = searchParams.get('duration')
  
  // Set default check-in/check-out based on duration
  const getInitialDates = () => {
    const now = new Date()
    // Set check-in to at least 1 hour from now to ensure it's in the future
    const checkIn = new Date(now.getTime() + 60 * 60 * 1000)
    const checkInDate = checkIn.toISOString().slice(0, 10)
    const checkInTime = checkIn.toTimeString().slice(0, 5)
    
    let hoursToAdd = 24 // default
    if (durationParam) {
      if (durationParam.includes('3 Hrs')) hoursToAdd = 3
      else if (durationParam.includes('6 Hrs')) hoursToAdd = 6
      else if (durationParam.includes('12 Hrs')) hoursToAdd = 12
      else if (durationParam.includes('1 Day Stay')) hoursToAdd = 24
    }
    
    const checkOut = new Date(checkIn.getTime() + hoursToAdd * 60 * 60 * 1000)
    const checkOutDate = checkOut.toISOString().slice(0, 10)
    const checkOutTime = checkOut.toTimeString().slice(0, 5)
    
    return { checkInDate, checkInTime, checkOutDate, checkOutTime }
  }
  
  const initialDates = getInitialDates()
  
  const [checkInDate, setCheckInDate] = useState(initialDates.checkInDate)
  const [checkInTime, setCheckInTime] = useState(initialDates.checkInTime)
  const [checkOutDate, setCheckOutDate] = useState(initialDates.checkOutDate)
  const [checkOutTime, setCheckOutTime] = useState(initialDates.checkOutTime)
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

  // Calculate actual duration in hours between check-in and check-out
  const actualDurationHours = useMemo(() => {
    if (!checkInDate || !checkOutDate || !checkInTime || !checkOutTime) return { hours: 0, minutes: 0, totalHours: 0 }
    const checkIn = new Date(`${checkInDate}T${checkInTime}`)
    const checkOut = new Date(`${checkOutDate}T${checkOutTime}`)
    const diffMs = checkOut - checkIn
    const totalHours = Math.max(0, diffMs / (1000 * 60 * 60))
    const hours = Math.floor(totalHours)
    const minutes = Math.round((totalHours - hours) * 60)
    return { hours, minutes, totalHours }
  }, [checkInDate, checkInTime, checkOutDate, checkOutTime])

  // Calculate price per hour from the selected rate
  const pricePerHour = useMemo(() => {
    if (!selectedPrice || !selectedPrice.price || isNaN(Number(selectedPrice.price))) return 0
    const durationHours = Number(selectedPrice.duration?.match(/\d+/)?.[0] || 24)
    if (durationHours === 0) return 0
    return Number(selectedPrice.price) / durationHours
  }, [selectedPrice])

  // Check if pricing is available
  const isPricingAvailable = useMemo(() => {
    return selectedPrice && selectedPrice.price && !isNaN(Number(selectedPrice.price)) && selectedPrice.price !== 'Contact hotel'
  }, [selectedPrice])

  // Calculate total price based on actual duration
  const calculatedTotalPrice = useMemo(() => {
    return Math.ceil(pricePerHour * actualDurationHours.totalHours * guests.rooms)
  }, [pricePerHour, actualDurationHours.totalHours, guests.rooms])

  // Format duration for display
  const formatDuration = (duration) => {
    if (duration.hours === 0 && duration.minutes === 0) return '0 hours'
    
    // If duration is more than 24 hours, show in days
    if (duration.totalHours >= 24) {
      const days = Math.floor(duration.totalHours / 24)
      const remainingHours = Math.round(duration.totalHours % 24)
      if (remainingHours === 0) return `${days} day${days > 1 ? 's' : ''}`
      return `${days} day${days > 1 ? 's' : ''} ${remainingHours}h`
    }
    
    // For durations less than 24 hours, show in hours and minutes
    if (duration.minutes === 0) return `${duration.hours} hour${duration.hours > 1 ? 's' : ''}`
    if (duration.hours === 0) return `${duration.minutes} minute${duration.minutes > 1 ? 's' : ''}`
    return `${duration.hours}h ${duration.minutes}m`
  }

  // Calculate available rooms for selected date range
  const availableRoomsForDates = useMemo(() => {
    if (!selectedRoom || !checkInDate || !checkOutDate) return selectedRoom?.totalRooms || 0
    
    const checkIn = new Date(`${checkInDate}T${checkInTime}`)
    const checkOut = new Date(`${checkOutDate}T${checkOutTime}`)
    
    // Use the availability data from API if available
    const availability = roomAvailability[selectedRoom.id]
    if (availability) {
      return availability.availableRooms
    }
    
    // Fallback to totalRooms
    return selectedRoom.totalRooms || 0
  }, [selectedRoom, checkInDate, checkInTime, checkOutDate, checkOutTime, roomAvailability])

  // Fetch availability for all rooms when date changes
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!checkInDate || !checkInTime || !checkOutDate || !checkOutTime || rooms.length === 0) return
      
      const checkIn = new Date(`${checkInDate}T${checkInTime}`)
      const checkOut = new Date(`${checkOutDate}T${checkOutTime}`)
      
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
  }, [checkInDate, checkInTime, checkOutDate, checkOutTime, rooms])

  // Reset active photo when room changes
  useEffect(() => {
    setActivePhoto(0)
  }, [selectedRoomId])
  const changePhoto = (direction) => setActivePhoto((current) => (current + direction + photos.length) % photos.length)
  const startReservation = () => {
    if (!selectedRoom || !selectedPrice) return
    if (!isPricingAvailable) { 
      // Show contact information instead of error
      setReservationError(`For pricing and booking, please contact ${hotel.hotelName} directly at ${hotel.area || hotel.city}.`); 
      return 
    }
    if (availableRoomsForDates < guests.rooms) { setReservationError(`Only ${availableRoomsForDates} room(s) are available for this stay.`); return }
    const checkIn = new Date(`${checkInDate}T${checkInTime}`)
    const checkOut = new Date(`${checkOutDate}T${checkOutTime}`)
    if (checkIn >= checkOut) { setReservationError('Check-out must be after check-in.'); return }
    // Allow check-in to be at least 30 minutes in the future
    const minCheckIn = new Date(Date.now() + 30 * 60 * 1000)
    if (checkIn < minCheckIn) { setReservationError('Check-in must be at least 30 minutes from now.'); return }
    setReservationError(''); setShowGuestForm(true)
  }
  const continueToPayment = (event) => {
    event.preventDefault()
    
    // Validate guest details before proceeding
    if (!guestDetails.name.trim()) {
      setReservationError('Please enter your full name.')
      return
    }
    if (!guestDetails.email.trim() || !guestDetails.email.includes('@')) {
      setReservationError('Please enter a valid email address.')
      return
    }
    if (!guestDetails.phone.trim() || guestDetails.phone.length !== 10) {
      setReservationError('Please enter a valid 10-digit mobile number.')
      return
    }
    
    const checkIn = new Date(`${checkInDate}T${checkInTime}`)
    const checkOut = new Date(`${checkOutDate}T${checkOutTime}`)
    sessionStorage.setItem('pendingBooking', JSON.stringify({ hotelName: hotel.hotelName, hotelImage: photos[0], address: hotel.area || hotel.city, roomName: selectedRoom.roomName, guestDetails, roomId: selectedRoom.id, checkIn: checkIn.toISOString().slice(0, 16), checkOut: checkOut.toISOString().slice(0, 16), totalAmount: calculatedTotalPrice, duration: formatDuration(actualDurationHours), roomsBooked: guests.rooms, guests: guests.adults, children: guests.children }))
    navigate('/payment')
  }
  const formattedCheckInDate = useMemo(() => new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${checkInDate}T00:00:00`)), [checkInDate])
  const formattedCheckOutDate = useMemo(() => new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${checkOutDate}T00:00:00`)), [checkOutDate])
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
      <section id="rooms" className="cp-booking-room-options"><p className="cp-booking-kicker">ROOM OPTIONS</p><h2>Select a room</h2>{rooms.map((room) => { const availability = roomAvailability[room.id] || { availableRooms: room.totalRooms }; const roomPrice = room.pricingList?.[0] || null; const hasValidPrice = roomPrice && roomPrice.price && !isNaN(Number(roomPrice.price)) && roomPrice.price !== 'Contact hotel'; const displayPrice = hasValidPrice ? `₹${Math.ceil((Number(roomPrice.price) / Number(roomPrice.duration?.match(/\d+/)?.[0] || 24)) * actualDurationHours.totalHours)}` : 'Contact hotel'; return <article className={`cp-booking-room-option ${selectedRoom?.id === room.id ? 'is-selected' : ''}`} key={room.id} onClick={() => { setSelectedRoomId(room.id); setSelectedRate(room.pricingList?.[0]?.id || null); startReservation() }}><img src={room.images?.[0] ? roomApi.getImageUrl(room.images[0]) : fallback} alt={room.roomName} /><div><h3>{room.roomName}</h3><p>{room.description || `${room.roomType} room for up to ${room.capacity} guests.`}</p><span>{room.capacity} guests | {room.bedType?.replaceAll('_', ' ') || 'Comfort bed'} | {availability.availableRooms} available</span></div><div className="cp-booking-rate-pills"><button type="button" className={selectedRoom?.id === room.id ? 'cp-price-box-active' : ''}><strong>{displayPrice}</strong><span>{formatDuration(actualDurationHours)}</span></button></div></article> })}</section>
    </div><aside className="cp-booking-summary"><div className="cp-booking-summary-offer"><span>Get upto 25% OFF on bookings</span><button type="button">Apply Coupon</button></div><div className="cp-booking-summary-body"><p>Your Booking Summary</p><div className="cp-booking-summary-date"><label><span>Check-in Date</span><input aria-label="Check-in date" type="date" min={new Date().toISOString().slice(0, 10)} value={checkInDate} onChange={(event) => setCheckInDate(event.target.value)} /><strong>{formattedCheckInDate}</strong></label><label><span>Check-in Time</span><input aria-label="Check-in time" type="time" value={checkInTime} onChange={(event) => setCheckInTime(event.target.value)} /></label><label><span>Check-out Date</span><input aria-label="Check-out date" type="date" min={checkInDate} value={checkOutDate} onChange={(event) => setCheckOutDate(event.target.value)} /><strong>{formattedCheckOutDate}</strong></label><label><span>Check-out Time</span><input aria-label="Check-out time" type="time" value={checkOutTime} onChange={(event) => setCheckOutTime(event.target.value)} /></label></div>{selectedRoom ? <><div className="cp-booking-rate-list">{rates.map((rate) => <label key={rate.id} className={selectedPrice?.id === rate.id ? 'is-selected' : ''}><input type="radio" checked={(selectedPrice?.id || rate.id) === rate.id} onChange={() => setSelectedRate(rate.id)} /><span><b>₹{calculatedTotalPrice}</b><small>{formatDuration(actualDurationHours)}</small></span></label>)}</div><motion.section layout className="cp-guest-picker"><button type="button" className="cp-guest-picker-toggle" onClick={() => setShowGuestPicker((value) => !value)} aria-expanded={showGuestPicker}><span>Select Rooms & Guests</span>{showGuestPicker ? <ChevronUp size={19} /> : <ChevronDown size={19} />}</button>{showGuestPicker && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="cp-guest-picker-rows">{[['rooms', 'Rooms', BedDouble], ['adults', 'Guests', UsersRound], ['children', 'Children', Baby]].map(([type, label, Icon]) => { const min = type === 'rooms' ? Math.ceil(guests.adults / 2) : type === 'adults' ? 1 : 0; return <div key={type} className="cp-guest-picker-row"><span className="cp-guest-picker-label"><Icon size={17} aria-hidden="true"/><b>{label}</b>{type === 'children' && <small>(Below age of 5)</small>}</span><span className="cp-guest-stepper"><button type="button" onClick={() => changeGuestCount(type, -1)} disabled={guests[type] <= min} aria-label={`Decrease ${label}`}><Minus size={17}/></button><strong aria-live="polite">{guests[type]}</strong><button type="button" onClick={() => changeGuestCount(type, 1)} aria-label={`Increase ${label}`}><Plus size={17}/></button></span></div> })}<p className="cp-guest-helper">Each room can accommodate a maximum of 2 guests.</p></motion.div>}</motion.section></> : <p>No rooms available yet.</p>}{reservationError && <p className="cp-error">{reservationError}</p>}<footer><div><strong>₹{(Number(selectedPrice?.price) || 0) * guests.rooms}</strong><small>{selectedPrice?.duration?.replaceAll('_', ' ') || 'Select a stay'}</small></div><button type="button" onClick={startReservation} disabled={!selectedRoom || selectedRoom.availableRooms < guests.rooms}>Reserve</button></footer></div></aside></div>
    {showGuestForm && <div className="cp-modal-overlay" onClick={() => setShowGuestForm(false)}><section className="cp-modal cp-guest-details-modal" onClick={(event) => event.stopPropagation()}><p className="cp-booking-kicker">STEP 1 OF 2</p><h2>Guest details</h2><p>Enter the details for this stay. You will choose a payment method next.</p><form onSubmit={continueToPayment}><label>Full name<input required value={guestDetails.name} onChange={(event) => setGuestDetails({ ...guestDetails, name: event.target.value })} placeholder="Your full name" /></label><label>Email address<input required type="email" value={guestDetails.email} onChange={(event) => setGuestDetails({ ...guestDetails, email: event.target.value })} placeholder="you@example.com" /></label><label>Mobile number<input required type="tel" pattern="[0-9]{10}" value={guestDetails.phone} onChange={(event) => setGuestDetails({ ...guestDetails, phone: event.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="10-digit mobile number" /></label><div className="cp-modal-actions"><button type="button" onClick={() => setShowGuestForm(false)} style={{opacity: 1, visibility: 'visible'}}>Cancel</button><button type="submit" className="cp-button cp-button-primary" style={{opacity: 1, visibility: 'visible'}}>Continue to payment</button></div></form></section></div>}
  </main>
}
