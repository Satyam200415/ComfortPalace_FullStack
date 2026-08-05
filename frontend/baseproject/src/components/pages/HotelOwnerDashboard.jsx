import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { hotelApi } from '../../api/hotelApi'
import { amenityApi } from '../../api/amenityApi'
import { roomApi } from '../../api/roomApi'
import { bookingApi } from '../../api/bookingApi'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { LoginContext } from '../../context/LoginContext'

function HotelOwnerDashboard() {
  const [hotels, setHotels] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingHotel, setEditingHotel] = useState(null)
  const [categories, setCategories] = useState([])
  const [amenities, setAmenities] = useState([])
  const [stats, setStats] = useState({ totalHotels: 0, publishedHotels: 0 })
  const [roomHotel, setRoomHotel] = useState(null)
  const [roomImages, setRoomImages] = useState([])
  const [activeTab, setActiveTab] = useState('hotels') // 'hotels' or 'bookings'
  const navigate = useNavigate()
  const { isAuthenticated, user } = useContext(LoginContext)
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      amenityIds: [],
    },
  })
  const {
    control: roomControl,
    register: registerRoom,
    handleSubmit: handleRoomSubmit,
    reset: resetRoom,
    formState: { errors: roomErrors, isSubmitting: isRoomSubmitting },
  } = useForm({
    defaultValues: {
      roomType: 'STANDARD', capacity: 2, totalRooms: 1, availableRooms: 1,
      hourlyAvailable: true, fullDayAvailable: true,
      pricingList: [{ duration: 'HOURS_3', price: '', available: true }],
    },
  })
  const { fields: pricingFields, append: appendPricing, remove: removePricing } = useFieldArray({
    control: roomControl,
    name: 'pricingList',
  })

  const extractHotelArray = (payload) => {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.content)) return payload.content
    if (Array.isArray(payload?.data)) return payload.data
    if (Array.isArray(payload?.hotels)) return payload.hotels
    if (Array.isArray(payload?.data?.content)) return payload.data.content
    if (Array.isArray(payload?.data?.hotels)) return payload.data.hotels
    if (Array.isArray(payload?._embedded?.hotels)) return payload._embedded.hotels
    return []
  }

  const normalizeHotelList = (payload) => {
    const hotelsArray = extractHotelArray(payload)

    return hotelsArray.map((hotel) => ({
      ...hotel,
      name: hotel.name || hotel.hotelName || '',
      category:
        hotel.category ||
        (hotel.categoryId ? { id: hotel.categoryId, name: hotel.categoryName } : undefined),
      imageUrl: hotel.thumbnailImage || hotel.coverImage || hotel.imageUrl,
    }))
  }

  const normalizeCategoryList = (payload) => {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.content)) return payload.content
    if (Array.isArray(payload?.data)) return payload.data
    if (Array.isArray(payload?._embedded?.categories)) return payload._embedded.categories
    if (Array.isArray(payload?.categories)) return payload.categories
    return []
  }

  const fetchHotels = async () => {
    try {
      setLoading(true)
      const data = await hotelApi.getMyHotels()
      setHotels(normalizeHotelList(data))
    } catch (error) {
      console.error('Failed to fetch hotels:', error)
      alert('Failed to load hotels')
    } finally {
      setLoading(false)
    }
  }

  const fetchHotelStats = async () => {
    try {
      const data = await hotelApi.getHotelStats()
      setStats({
        totalHotels: data?.totalHotels ?? 0,
        publishedHotels: data?.publishedHotels ?? 0,
      })
    } catch (error) {
      console.error('Failed to fetch hotel stats:', error)
    }
  }

  const fetchOwnerBookings = async () => {
    try {
      const data = await hotelApi.getOwnerBookings()
      setBookings(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await hotelApi.api.get('/categories')
      setCategories(normalizeCategoryList(response.data))
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchAmenities = async () => {
    try {
      const response = await amenityApi.getAllAmenities()
      const amenityList = Array.isArray(response)
        ? response
        : Array.isArray(response?.content)
        ? response.content
        : Array.isArray(response?.data)
        ? response.data
        : []
      setAmenities(amenityList)
    } catch (error) {
      console.error('Failed to fetch amenities:', error)
    }
  }

  useEffect(() => {
    if (!isAuthenticated && !localStorage.getItem('token')) {
      navigate('/login')
      return
    }

    fetchHotels()
    fetchCategories()
    fetchAmenities()
    fetchHotelStats()
    fetchOwnerBookings()
  }, [isAuthenticated, navigate])

  const handleAddHotel = () => {
    setEditingHotel(null)
    reset()
    setShowModal(true)
  }

  const handleEditHotel = (hotel) => {
    setEditingHotel(hotel)
    reset({
      name: hotel.name,
      description: hotel.description,
      city: hotel.city || '',
      area: hotel.area || '',
      address: hotel.address || '',
      hotelType: hotel.hotelType || 'STANDARD',
      status: hotel.status || 'PUBLISHED',
      coupleFriendly: Boolean(hotel.coupleFriendly),
      localIdAccepted: Boolean(hotel.localIdAccepted),
      category: hotel.category?.id ? String(hotel.category.id) : '',
      amenityIds: hotel.amenities?.map((amenity) => String(amenity.id)) || [],
    })
    setShowModal(true)
  }

  const handleDeleteHotel = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hotel?')) {
      return
    }

    try {
      await hotelApi.deleteHotel(id)
      alert('Hotel deleted successfully')
      fetchHotels()
    } catch (error) {
      console.error('Failed to delete hotel:', error)
      alert('Failed to delete hotel')
    }
  }

  const handleAddRoom = (hotel) => {
    resetRoom()
    setRoomImages([])
    setRoomHotel(hotel)
  }

  const onSubmitRoom = async (data) => {
    try {
      if (roomImages.length < 4) {
        alert('Please select at least 4 room images')
        return
      }
      const createdRoom = await roomApi.createRoom({
        hotelId: roomHotel.id,
        roomName: data.roomName,
        roomType: data.roomType,
        description: data.description || '',
        capacity: Number(data.capacity),
        bedType: data.bedType || null,
        totalRooms: Number(data.totalRooms),
        availableRooms: Number(data.availableRooms),
        hourlyAvailable: Boolean(data.hourlyAvailable),
        fullDayAvailable: Boolean(data.fullDayAvailable),
        pricingList: data.pricingList.map((rate) => ({
          duration: rate.duration,
          price: Number(rate.price),
          available: Boolean(rate.available),
        })),
      },roomHotel.id)
      await roomApi.uploadImages(createdRoom.id, roomImages)
      alert('Room added successfully')
      setRoomHotel(null)
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add room')
    }
  }

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return
    }

    try {
      await bookingApi.updateStatus(bookingId, 'CANCELLED')
      alert('Booking cancelled successfully')
      fetchOwnerBookings()
    } catch (error) {
      console.error('Failed to cancel booking:', error)
      alert('Failed to cancel booking')
    }
  }

  const handleApproveCancellation = async (bookingId) => {
    if (!window.confirm('Are you sure you want to approve this cancellation request?')) {
      return
    }

    try {
      await bookingApi.updateStatus(bookingId, 'CANCELLED')
      alert('Cancellation approved successfully')
      fetchOwnerBookings()
    } catch (error) {
      console.error('Failed to approve cancellation:', error)
      alert('Failed to approve cancellation')
    }
  }

  const formatDate = (value) => value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not available'

  const onSubmit = async (data) => {
    try {
      const selectedCategory = categories.find((category) => String(category.id) === String(data.category))

      const hotelPayload = {
        hotelName: data.name,
        description: data.description,
        shortDescription: data.description?.substring(0, 120),
        hotelType: data.hotelType || 'STANDARD',
        categoryId: selectedCategory ? selectedCategory.id : null,
        city: data.city || 'Mumbai',
        area: data.area || '',
        address: data.address || 'Not specified',
        status: data.status || 'PUBLISHED',
        coupleFriendly: Boolean(data.coupleFriendly),
        localIdAccepted: Boolean(data.localIdAccepted),
        amenityIds: Array.isArray(data.amenityIds)
          ? data.amenityIds.map((id) => Number(id))
          : data.amenityIds
          ? [Number(data.amenityIds)]
          : [],
      }

      if (editingHotel) {
        await hotelApi.updateHotel(editingHotel.id, hotelPayload)
        alert('Hotel updated successfully')
      } else {
        const createdHotel = await hotelApi.addHotel(hotelPayload)
        const hotelId = createdHotel?.id

        if (data.imageUrl && data.imageUrl.length > 0 && hotelId) {
          await hotelApi.uploadImage(hotelId, data.imageUrl[0])
        }

        alert('Hotel added successfully')
      }

      setShowModal(false)
      reset()
      fetchHotels()
    } catch (error) {
      console.error('Failed to save hotel:', error)
      console.error('Error response:', error.response?.data)
      alert(`Failed to save hotel: ${error.response?.data?.message || error.message}`)
    }
  }

  const ownerName = user?.name || user?.username || 'Hotel owner'
  const activeHotels = stats.totalHotels
  const totalBookings = bookings.length
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length
  const revenue = bookings
    .filter(b => b.status === 'COMPLETED' || b.status === 'CONFIRMED')
    .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0)

  const SUMMARY_METRICS = [
    { title: 'Total Hotels', value: activeHotels },
    { title: 'Published Hotels', value: stats.publishedHotels },
    { title: 'Total Bookings', value: totalBookings },
    { title: 'Revenue', value: `₹${(revenue / 1000).toFixed(1)}K` },
  ]

  return (
    <main className="cp-dashboard-page">
      <section className="cp-dashboard-header">
        <div>
          <p className="cp-dashboard-label">Hotel owner workspace</p>
          <h1>Good to see you, {ownerName}.</h1>
          <p>Keep your listings polished, publish new stays, and give guests an accurate view of your properties.</p>
        </div>
        <button type="button" className="cp-dashboard-button cp-dashboard-header-action" onClick={handleAddHotel}>
          <span>＋</span> Add a hotel
        </button>
      </section>

      <section className="cp-dashboard-summary">
        {SUMMARY_METRICS.map((metric) => (
          <article key={metric.title} className="cp-dashboard-summary-card">
            <p>{metric.title}</p>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </section>

      {/* Tab Navigation */}
      <section className="cp-dashboard-section">
        <div className="cp-dashboard-panel">
          <div className="cp-dashboard-panel-header">
            <div className="cp-dashboard-tabs">
              <button 
                type="button" 
                className={`cp-dashboard-tab ${activeTab === 'hotels' ? 'cp-dashboard-tab-active' : ''}`}
                onClick={() => setActiveTab('hotels')}
              >
                Hotel listings
              </button>
              <button 
                type="button" 
                className={`cp-dashboard-tab ${activeTab === 'bookings' ? 'cp-dashboard-tab-active' : ''}`}
                onClick={() => setActiveTab('bookings')}
              >
                Bookings
              </button>
            </div>
            {activeTab === 'hotels' && (
              <button type="button" className="cp-dashboard-button" onClick={handleAddHotel}>
                Add hotel
              </button>
            )}
          </div>

          {/* Hotels Tab */}
          {activeTab === 'hotels' && (
            <>
              {loading ? (
                <p className="cp-dashboard-empty-state">Loading hotels...</p>
              ) : hotels.length === 0 ? (
                <p className="cp-dashboard-empty-state">No hotels found. Add your first hotel!</p>
              ) : (
                <div className="cp-dashboard-listings-grid">
                  {hotels.map((hotel) => {
                    const imageUrl = hotel.imageUrl ? hotelApi.getHotelImage(hotel.id) : null
                    const amenitiesPreview = hotel.amenities?.slice(0, 3) || []
                    const status = hotel.status || 'DRAFT'

                    return (
                      <article key={hotel.id} className="cp-dashboard-hotel-card">
                        <div className="cp-dashboard-hotel-visual">
                          {imageUrl ? (
                            <img src={imageUrl} alt={hotel.name} onError={(event) => { event.currentTarget.style.display = 'none' }} />
                          ) : (
                            <span>{hotel.name?.charAt(0) || 'H'}</span>
                          )}
                          <span className={`cp-dashboard-status cp-dashboard-status-${status.toLowerCase()}`}>{status}</span>
                        </div>
                        <div className="cp-dashboard-hotel-card-body">
                          <p className="cp-dashboard-card-type">{hotel.category?.name || hotel.hotelType || 'Hotel'}</p>
                          <h3>{hotel.name}</h3>
                          <span className="cp-dashboard-location">⌖ {hotel.area || hotel.city || 'Location not set'}</span>
                          <span className="cp-dashboard-owner">Owner: {ownerName}</span>
                          <p className="cp-dashboard-description">{hotel.description || 'No description added yet.'}</p>
                          <div className="cp-dashboard-amenity-row">
                            {amenitiesPreview.length > 0 ? amenitiesPreview.map((amenity) => <span key={amenity.id || amenity.name}>{amenity.name}</span>) : <span>Details in progress</span>}
                          </div>
                          <div className="cp-dashboard-card-actions">
                            <button type="button" className="cp-dashboard-action-button cp-dashboard-room-button" onClick={() => handleAddRoom(hotel,hotel.id)}>Add room</button>
                            <button type="button" className="cp-dashboard-action-button" onClick={() => navigate(`/hotel-owner/hotels/${hotel.id}/rooms`)}>View rooms</button>
                            <button type="button" className="cp-dashboard-action-button" onClick={() => handleEditHotel(hotel)}>Edit listing</button>
                            <button type="button" className="cp-dashboard-action-button cp-dashboard-action-button-danger" onClick={() => handleDeleteHotel(hotel.id)}>Delete</button>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <>
              {bookings.length === 0 ? (
                <p className="cp-dashboard-empty-state">No bookings found yet.</p>
              ) : (
                <div className="cp-dashboard-bookings-list">
                  {bookings.map((booking) => (
                    <article key={booking.id} className="cp-dashboard-booking-card">
                      <div className="cp-dashboard-booking-header">
                        <div>
                          <h3>{booking.hotelName}</h3>
                          <span className="cp-dashboard-booking-room">{booking.roomName}</span>
                        </div>
                        <span className={`cp-dashboard-status cp-dashboard-status-${(booking.status || '').toLowerCase()}`}>
                          {booking.status?.replaceAll('_', ' ') || 'PENDING'}
                        </span>
                      </div>
                      <div className="cp-dashboard-booking-details">
                        <div>
                          <span>Guest</span>
                          <strong>{booking.guestName}</strong>
                        </div>
                        <div>
                          <span>Email</span>
                          <strong>{booking.guestEmail}</strong>
                        </div>
                        <div>
                          <span>Check-in</span>
                          <strong>{formatDate(booking.checkIn)}</strong>
                        </div>
                        <div>
                          <span>Check-out</span>
                          <strong>{formatDate(booking.checkOut)}</strong>
                        </div>
                        <div>
                          <span>Rooms</span>
                          <strong>{booking.roomsBooked}</strong>
                        </div>
                        <div>
                          <span>Amount</span>
                          <strong>₹{booking.totalAmount?.toFixed(0) || 0}</strong>
                        </div>
                      </div>
                      {(booking.status === 'CONFIRMED' || booking.status === 'CANCELLATION_REQUESTED') && (
                        <div className="cp-dashboard-booking-actions">
                          {booking.status === 'CANCELLATION_REQUESTED' ? (
                            <>
                              <button 
                                type="button" 
                                className="cp-dashboard-action-button cp-dashboard-action-button-success"
                                onClick={() => handleApproveCancellation(booking.id)}
                              >
                                Approve Cancellation
                              </button>
                            </>
                          ) : (
                            <button 
                              type="button" 
                              className="cp-dashboard-action-button cp-dashboard-action-button-danger"
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {showModal && (
        <div className="cp-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingHotel ? 'Edit Hotel' : 'Add Hotel'}</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <label>Hotel Name *</label>
              <input
                type="text"
                placeholder="Hotel Name"
                {...register('name', { required: 'Hotel name is required' })}
              />
              {errors.name && <small className="cp-error">{errors.name.message}</small>}

              <label>Description *</label>
              <textarea
                rows="4"
                placeholder="Hotel Description"
                {...register('description', { required: 'Description is required' })}
              />
              {errors.description && <small className="cp-error">{errors.description.message}</small>}

              <label>Category *</label>
              <select
                {...register('category', { required: 'Please select a category' })}
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && <small className="cp-error">{errors.category.message}</small>}

              <label>City *</label>
              <input
                type="text"
                placeholder="City"
                {...register('city', { required: 'City is required' })}
              />
              {errors.city && <small className="cp-error">{errors.city.message}</small>}

              <label>Area</label>
              <input type="text" placeholder="Area / locality" {...register('area')} />

              <label>Address *</label>
              <textarea
                rows="2"
                placeholder="Hotel address"
                {...register('address', { required: 'Address is required' })}
              />
              {errors.address && <small className="cp-error">{errors.address.message}</small>}

              <label>Hotel Type *</label>
              <select {...register('hotelType', { required: 'Hotel type is required' })}>
                <option value="STANDARD">Standard</option>
                <option value="BUDGET">Budget</option>
                <option value="PREMIUM">Premium</option>
                <option value="LUXURY">Luxury</option>
                <option value="BOUTIQUE">Boutique</option>
                <option value="RESORT">Resort</option>
                <option value="BUSINESS">Business</option>
                <option value="HERITAGE">Heritage</option>
              </select>

              <label>Status *</label>
              <select {...register('status', { required: 'Please select a status' })}>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="INACTIVE">Inactive</option>
              </select>

              <label className="cp-checkbox-label">
                <input type="checkbox" {...register('coupleFriendly')} />
                Allows couple stays
              </label>

              <label className="cp-checkbox-label">
                <input type="checkbox" {...register('localIdAccepted')} />
                Accepts local ID bookings
              </label>

              <label>Amenities *</label>
              <Controller
                name="amenityIds"
                control={control}
                rules={{
                  validate: (value) =>
                    Array.isArray(value) && value.length > 0 || 'Please select at least one amenity',
                }}
                render={({ field }) => (
                  <div className="cp-amenities-grid">
                    {amenities.map((amenity) => {
                      const checked = Array.isArray(field.value)
                        ? field.value.includes(String(amenity.id))
                        : false

                      return (
                        <label key={amenity.id} className="cp-checkbox-label">
                          <input
                            type="checkbox"
                            value={String(amenity.id)}
                            checked={checked}
                            onChange={(event) => {
                              const nextValue = event.target.checked
                                ? [...(Array.isArray(field.value) ? field.value : []), String(amenity.id)]
                                : (Array.isArray(field.value)
                                  ? field.value.filter((item) => item !== String(amenity.id))
                                  : [])
                              field.onChange(nextValue)
                            }}
                          />
                          {amenity.name}
                        </label>
                      )
                    })}
                  </div>
                )}
              />
              {errors.amenityIds && <small className="cp-error">{errors.amenityIds.message}</small>}

              {!editingHotel && (
                <>
                  <label>Hotel Image</label>
                  <input type="file" accept="image/*" {...register('imageUrl')} />
                </>
              )}

              <div className="cp-modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingHotel ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {roomHotel && (
        <div className="cp-modal-overlay" onClick={() => setRoomHotel(null)}>
          <div className="cp-modal cp-room-modal" onClick={(event) => event.stopPropagation()}>
            <p className="cp-dashboard-label">Room inventory</p>
            <h2>Add a room to {roomHotel.name}</h2>
            <form onSubmit={handleRoomSubmit(onSubmitRoom)}>
              <label>Room name *</label>
              <input {...registerRoom('roomName', { required: 'Room name is required' })} placeholder="Deluxe King Room" />
              {roomErrors.roomName && <small className="cp-error">{roomErrors.roomName.message}</small>}
              <div className="cp-room-form-grid">
                <div><label>Room type *</label><select {...registerRoom('roomType')}><option value="STANDARD">Standard</option><option value="DELUXE">Deluxe</option><option value="SUITE">Suite</option><option value="PREMIUM">Premium</option><option value="FAMILY">Family</option></select></div>
                <div><label>Bed type</label><select {...registerRoom('bedType')}><option value="">Select bed</option><option value="KING_SIZE">King size</option><option value="QUEEN_SIZE">Queen size</option><option value="DOUBLE_BED">Double bed</option><option value="TWIN_BEDS">Twin beds</option></select></div>
                <div><label>Guest capacity *</label><input type="number" min="1" {...registerRoom('capacity', { required: true, min: 1 })} /></div>
                <div><label>Total rooms *</label><input type="number" min="1" {...registerRoom('totalRooms', { required: true, min: 1 })} /></div>
                <div><label>Available rooms *</label><input type="number" min="0" {...registerRoom('availableRooms', { required: true, min: 0 })} /></div>
              </div>
              <section className="cp-owner-room-rates-form">
                <div className="cp-owner-room-rates-header">
                  <strong>Rates by duration</strong>
                  <button type="button" onClick={() => appendPricing({ duration: 'HOURS_3', price: '', available: true })}>Add another rate</button>
                </div>
                {pricingFields.map((field, index) => (
                  <div className="cp-owner-room-rate-row" key={field.id}>
                    <div><label>Duration *<select {...registerRoom(`pricingList.${index}.duration`)}><option value="HOURS_3">3 hours</option><option value="HOURS_6">6 hours</option><option value="HOURS_9">9 hours</option><option value="HOURS_12">12 hours</option><option value="HOURS_24">24 hours</option></select></label></div>
                    <div><label>Rate (₹) *<input type="number" min="1" placeholder="1500" {...registerRoom(`pricingList.${index}.price`, { required: 'Enter a rate', min: { value: 1, message: 'Rate must be greater than 0' } })} /></label></div>
                    <div><label className="cp-checkbox-label"><input type="checkbox" {...registerRoom(`pricingList.${index}.available`)} /> Available</label></div>
                    <button type="button" className="cp-button cp-button-secondary" onClick={() => removePricing(index)} disabled={pricingFields.length === 1}>Remove</button>
                  </div>
                ))}
                {roomErrors.pricingList?.map?.((rate, index) => rate?.price && <small className="cp-error" key={index}>Rate {index + 1}: {rate.price.message}</small>)}
              </section>
              <label>Description</label>
              <textarea rows="3" {...registerRoom('description')} placeholder="Room details and highlights" />
              <label>Room images * <small>(select at least 4 images)</small></label>
              <input type="file" accept="image/*" multiple onChange={(event) => setRoomImages(Array.from(event.target.files || []))} />
              {roomImages.length > 0 && <small className={roomImages.length >= 4 ? '' : 'cp-error'}>{roomImages.length} image{roomImages.length === 1 ? '' : 's'} selected {roomImages.length < 4 ? '— select at least 4.' : ''}</small>}
              <div className="cp-room-toggle-row">
                <label className="cp-checkbox-label"><input type="checkbox" {...registerRoom('hourlyAvailable')} />Hourly booking</label>
                <label className="cp-checkbox-label"><input type="checkbox" {...registerRoom('fullDayAvailable')} />Full-day booking</label>
              </div>
              <div className="cp-modal-actions">
                <button type="button" onClick={() => setRoomHotel(null)}>Cancel</button>
                <button type="submit" disabled={isRoomSubmitting}>{isRoomSubmitting ? 'Adding...' : 'Add room'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

export default HotelOwnerDashboard
