import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { roomApi } from '../../api/roomApi'
import { bookingApi } from '../../api/bookingApi'

const emptyRoom = {
  roomName: '', roomType: 'STANDARD', description: '', capacity: 2,
  bedType: 'DOUBLE_BED', totalRooms: 1, availableRooms: 1,
  hourlyAvailable: true, fullDayAvailable: true, active: true, thumbnailImage: '',
  pricingList: [{ duration: 'HOURS_3', price: 0, available: true }],
}

export default function OwnerRooms() {
  const { hotelId } = useParams()
  const [rooms, setRooms] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [viewingBookings, setViewingBookings] = useState(null)
  const [form, setForm] = useState(emptyRoom)
  const [saving, setSaving] = useState(false)
  const [roomImages, setRoomImages] = useState([])
  const [error, setError] = useState('')

  const loadRooms = async () => {
    setLoading(true)
    try { const [roomData, bookingData] = await Promise.all([roomApi.getRoomsByHotel(hotelId), bookingApi.getOwnerHotelBookings(hotelId)]); setRooms(roomData); setBookings(bookingData) }
    catch (requestError) { setError(requestError.response?.data?.message || 'Could not load rooms.') }
    finally { setLoading(false) }
  }
  useEffect(() => { loadRooms() }, [hotelId])

  const totals = useMemo(() => rooms.reduce((acc, room) => ({
    roomTypes: acc.roomTypes + 1,
    total: acc.total + Number(room.totalRooms || 0),
    available: acc.available + Number(room.availableRooms || 0),
  }), { roomTypes: 0, total: 0, available: 0 }), [rooms])

  const openEdit = (room) => {
    setEditing(room); setRoomImages([])
    setForm({
      ...emptyRoom,
      ...room,
      pricingList: room?.pricingList?.length > 0 ? room.pricingList : [{ duration: 'HOURS_3', price: 0, available: true }],
      images: undefined,
      hotelId: Number(hotelId),
    })
    setError('')
  }

  const openViewBookings = (room) => {
    setViewingBookings(room)
  }
  const setField = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value }))
  }

  const updateRate = (index, changes) => {
    setForm((current) => ({
      ...current,
      pricingList: current.pricingList.map((rate, rateIndex) =>
        rateIndex === index ? { ...rate, ...changes } : rate
      ),
    }))
  }

  const addRate = () => {
    setForm((current) => ({
      ...current,
      pricingList: [...(current.pricingList || []), { duration: 'HOURS_3', price: 0, available: true }],
    }))
  }

  const removeRate = (index) => {
    setForm((current) => ({
      ...current,
      pricingList: current.pricingList.filter((_, rateIndex) => rateIndex !== index),
    }))
  }

  const saveRoom = async (event) => {
    event.preventDefault(); setSaving(true); setError('')
    try {
      const pricingList = (form.pricingList || []).filter((rate) => rate.duration && Number(rate.price) > 0)
      if (pricingList.length === 0) throw new Error('Please add at least one rate with a valid price.')
      const payload = { ...form, hotelId: Number(hotelId), pricingList }
      if (editing) {
        await roomApi.updateRoom(editing.id, payload)
      } else {
        if (roomImages.length < 4) throw new Error('Select at least 4 room images.')
        const createdRoom = await roomApi.createRoom(payload, hotelId)
        await roomApi.uploadImages(createdRoom.id, roomImages)
      }
      setEditing(null); setForm(emptyRoom); await loadRooms()
    } catch (requestError) { setError(requestError.response?.data?.message || requestError.message || 'Could not save the room.') }
    finally { setSaving(false) }
  }
  const removeRoom = async (room) => {
    if (!window.confirm(`Delete ${room.roomName}? This cannot be undone.`)) return
    try { await roomApi.deleteRoom(room.id); await loadRooms() }
    catch (requestError) { setError(requestError.response?.data?.message || 'Could not delete the room.') }
  }

  return <main className="cp-owner-rooms-page">
    <div className="cp-owner-rooms-heading">
      <div><Link to="/hotel-owner/dashboard">← Back to dashboard</Link><h1>Room management</h1><p>Create room types, adjust inventory, and review availability.</p></div>
      <button className="cp-button cp-button-primary" onClick={() => openEdit(null)}>Add room</button>
    </div>
    {error && <p className="cp-error">{error}</p>}
    <section className="cp-room-summary">
      <div><strong>{totals.roomTypes}</strong><span>Room types</span></div><div><strong>{totals.total}</strong><span>Total inventory</span></div><div><strong>{totals.available}</strong><span>Available now</span></div><div><strong>{bookings.filter((booking) => ['PENDING','CONFIRMED','CHECKED_IN'].includes(booking.status)).length}</strong><span>Active bookings</span></div>
    </section>
    <section className="cp-owner-bookings"><div><h2>Booking activity</h2><p>Upcoming and active reservations for this hotel.</p></div>{bookings.length === 0 ? <p>No bookings yet.</p> : <div className="cp-owner-booking-list">{bookings.slice(0, 6).map((booking) => <article key={booking.id}><strong>{booking.guestName}</strong><span>{booking.roomName} · {new Date(booking.checkIn).toLocaleString()}</span><span className={`cp-dashboard-status cp-dashboard-status-${booking.status.toLowerCase()}`}>{booking.status.replaceAll('_', ' ')}</span></article>)}</div>}</section>
    {loading ? <p>Loading rooms…</p> : rooms.length === 0 ? <section className="cp-owner-rooms-empty"><h2>No rooms yet</h2><p>Add your first room type to start accepting bookings.</p></section> : <section className="cp-owner-rooms-list">
      {rooms.map((room) => <article className="cp-owner-room-card" key={room.id}>
        <div className="cp-owner-room-gallery">{(room.images || []).slice(0, 4).map((image) => <img key={image.id} src={roomApi.getImageUrl(image)} alt={`${room.roomName} view`} onError={(event) => { event.currentTarget.style.display = 'none' }} />)}{!(room.images || []).length && <span>No images</span>}</div>
        <div><span className={`cp-room-active ${room.active ? '' : 'is-inactive'}`}>{room.active ? 'Active' : 'Inactive'}</span><h2>{room.roomName}</h2><p>{room.roomType?.replaceAll('_', ' ')} · {room.capacity} guests · {room.bedType?.replaceAll('_', ' ')}</p><p>{room.description || 'No room description.'}</p></div>
        <div className="cp-owner-room-inventory"><strong>{room.availableRooms} / {room.totalRooms}</strong><span>rooms available</span><small>{room.hourlyAvailable ? 'Hourly' : ''}{room.hourlyAvailable && room.fullDayAvailable ? ' · ' : ''}{room.fullDayAvailable ? 'Full day' : ''}</small></div>
        <div className="cp-owner-room-rates"><strong>Rates</strong>{(room.pricingList || []).length ? room.pricingList.map((rate) => <span key={rate.id}>{rate.duration?.replaceAll('_', ' ')}: ₹{rate.price}</span>) : <span>Add rates when creating the room</span>}</div>
        <div className="cp-owner-room-actions"><button onClick={() => openEdit(room)}>Edit</button><button className="danger" onClick={() => removeRoom(room)}>Delete</button><button className="info" onClick={() => openViewBookings(room)}>View Bookings</button></div>
      </article>)}
    </section>}
    {editing !== null && <div className="cp-modal-overlay" onClick={() => setEditing(null)}><section className="cp-modal cp-owner-room-form" onClick={(event) => event.stopPropagation()}><h2>{editing ? 'Edit room' : 'Add room'}</h2><form onSubmit={saveRoom}>
      <label>Room name<input required name="roomName" value={form.roomName} onChange={setField} /></label>
      {!editing && <label>Room images * <small>(at least 4)</small><input required type="file" accept="image/*" multiple onChange={(event) => setRoomImages(Array.from(event.target.files || []))} />{roomImages.length > 0 && <><small className={roomImages.length >= 4 ? '' : 'cp-error'}>{roomImages.length} selected{roomImages.length < 4 ? ' — select at least 4.' : ''}</small><div className="cp-room-image-previews">{roomImages.map((file) => <img key={`${file.name}-${file.lastModified}`} src={URL.createObjectURL(file)} alt={file.name} />)}</div></>}</label>}
      <label>Description<textarea name="description" value={form.description || ''} onChange={setField} /></label>
      <div className="cp-room-form-grid"><label>Type<select name="roomType" value={form.roomType} onChange={setField}>{['STANDARD','DELUXE','SUITE','PREMIUM','FAMILY','SINGLE','DOUBLE','TRIPLE'].map((type) => <option key={type}>{type}</option>)}</select></label><label>Bed<select name="bedType" value={form.bedType || ''} onChange={setField}>{['SINGLE_BED','DOUBLE_BED','KING_SIZE','QUEEN_SIZE','TWIN_BEDS','BUNK_BED'].map((type) => <option key={type}>{type}</option>)}</select></label><label>Capacity<input required min="1" type="number" name="capacity" value={form.capacity} onChange={setField} /></label><label>Total rooms<input required min="1" type="number" name="totalRooms" value={form.totalRooms} onChange={setField} /></label><label>Available rooms<input required min="0" max={form.totalRooms} type="number" name="availableRooms" value={form.availableRooms} onChange={setField} /></label></div>
      <section className="cp-owner-room-rates-form"><div className="cp-owner-room-rates-header"><strong>Room rates</strong><button type="button" onClick={addRate}>Add rate</button></div>{(form.pricingList || []).map((rate, index) => <div className="cp-owner-room-rate-row" key={`${rate.duration}-${index}`}><div><label>Duration<select value={rate.duration} onChange={(event) => updateRate(index, { duration: event.target.value })}>{['HOURS_3','HOURS_6','HOURS_9','HOURS_12','HOURS_24'].map((duration) => <option key={duration} value={duration}>{duration.replaceAll('_', ' ')}</option>)}</select></label></div><div><label>Price (₹)<input min="0" type="number" value={rate.price} onChange={(event) => updateRate(index, { price: Number(event.target.value) })} /></label></div><div><label><input type="checkbox" checked={rate.available} onChange={(event) => updateRate(index, { available: event.target.checked })} /> Available</label></div><button type="button" className="cp-button cp-button-secondary" onClick={() => removeRate(index)}>Remove</button></div>)}</section>
      <div className="cp-room-toggle-row"><label><input type="checkbox" name="hourlyAvailable" checked={form.hourlyAvailable} onChange={setField} /> Hourly booking</label><label><input type="checkbox" name="fullDayAvailable" checked={form.fullDayAvailable} onChange={setField} /> Full-day booking</label><label><input type="checkbox" name="active" checked={form.active} onChange={setField} /> Active</label></div><div className="cp-modal-actions"><button type="button" onClick={() => setEditing(null)}>Cancel</button><button className="cp-button cp-button-primary" disabled={saving}>{saving ? 'Saving…' : 'Save room'}</button></div>
    </form></section></div>}
    {viewingBookings !== null && <div className="cp-modal-overlay" onClick={() => setViewingBookings(null)}><section className="cp-modal cp-owner-bookings-modal" onClick={(event) => event.stopPropagation()}><h2>Bookings for {viewingBookings.roomName}</h2>{bookings.filter(b => b.roomId === viewingBookings.id).length === 0 ? <p>No bookings for this room yet.</p> : <div className="cp-room-bookings-list">{bookings.filter(b => b.roomId === viewingBookings.id).map((booking) => <article key={booking.id} className="cp-room-booking-card"><div className="cp-room-booking-header"><div><h3>{booking.guestName}</h3><span>{booking.guestEmail}</span></div><span className={`cp-dashboard-status cp-dashboard-status-${booking.status.toLowerCase()}`}>{booking.status?.replaceAll('_', ' ')}</span></div><div className="cp-room-booking-details"><div><span>Check-in</span><strong>{new Date(booking.checkIn).toLocaleString()}</strong></div><div><span>Check-out</span><strong>{new Date(booking.checkOut).toLocaleString()}</strong></div><div><span>Rooms</span><strong>{booking.roomsBooked}</strong></div><div><span>Amount</span><strong>₹{booking.totalAmount?.toFixed(0) || 0}</strong></div><div><span>Payment Status</span><strong>{booking.paymentStatus || 'PENDING'}</strong></div></div></article>)}</div>}<div className="cp-modal-actions"><button type="button" onClick={() => setViewingBookings(null)}>Close</button></div></section></div>}
  </main>
}
