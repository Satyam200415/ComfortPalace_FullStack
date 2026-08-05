import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { hotelApi } from '../../api/hotelApi'
import { amenityApi } from '../../api/amenityApi'

const HOTEL_TYPES = ['BUDGET', 'STANDARD', 'PREMIUM', 'LUXURY', 'BOUTIQUE', 'RESORT', 'BUSINESS', 'HERITAGE']
const HOTEL_STATUS = ['DRAFT', 'PUBLISHED', 'INACTIVE']

function AddHotels() {

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      hotelType: 'STANDARD',
      status: 'PUBLISHED',
      coupleFriendly: false,
      localIdAccepted: false,
      amenityIds: [],
    },
  })

  const [categories, setCategories] = useState([])
  const [amenities, setAmenities] = useState([])
  const navigate = useNavigate()

  const getCategories = async () => {
    try {
      const response = await hotelApi.api.get('/categories')
      const payload = response.data
      const categoryList = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.content)
          ? payload.content
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?._embedded?.categories)
              ? payload._embedded.categories
              : []
      setCategories(categoryList)
    } catch (error) {
      console.log(error)
      alert('Failed to load categories')
    }
  }

  const getAmenities = async () => {
    try {
      const response = await amenityApi.getAllAmenities()
      const payload = response
      const amenityList = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.content)
          ? payload.content
          : Array.isArray(payload?.data)
            ? payload.data
            : []
      setAmenities(amenityList)
    } catch (error) {
      console.log('Failed to load amenities', error)
      alert('Failed to load amenities')
    }
  }

  useEffect(() => {
    getCategories()
    getAmenities()
  }, [])




  const onSubmit = async (data) => {
    try {
      const selectedCategory = categories.find((category) => String(category.id) === String(data.category))
      const amenityIds = Array.isArray(data.amenityIds)
        ? data.amenityIds.map((id) => Number(id))
        : data.amenityIds
          ? [Number(data.amenityIds)]
          : []

      if (amenityIds.length === 0) {
        alert('Please select at least one amenity')
        return
      }

      const createdHotel = await hotelApi.addHotel({
        hotelName: data.name,
        description: data.description,
        shortDescription: data.description?.substring(0, 120),
        hotelType: data.hotelType || 'STANDARD',
        categoryId: selectedCategory ? selectedCategory.id : null,
        city: data.city,
        area: data.area || '',
        address: data.address,
        status: data.status || 'PUBLISHED',
        coupleFriendly: Boolean(data.coupleFriendly),
        localIdAccepted: Boolean(data.localIdAccepted),
        amenityIds,
      })

      const hotelId = createdHotel?.id

      if (data.imageUrl && data.imageUrl.length > 0 && hotelId) {
        await hotelApi.uploadImage(hotelId, data.imageUrl[0])
      }

      alert('Hotel Added Successfully')
      navigate('/hotel-owner/dashboard')
    } catch (error) {
      console.error('Failed to add hotel:', error)
      const amenityError = error.response?.data?.errors?.amenityIds
      alert(amenityError || error.response?.data?.message || 'Something went wrong')
    }
  }

  return (
    <main className="cp-auth-page">

      <section className="cp-auth-card">

        <h2>Add a Hotel</h2>

        <p>
          Provide the hotel details below.
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>

          <label>Hotel Name *</label>

          <input
            type="text"
            placeholder="Hotel Name"
            {...register("name", {
              required: "Hotel name is required"
            })}
          />

          {errors.name &&
            <small className="cp-error">
              {errors.name.message}
            </small>
          }

          <label>Description *</label>

          <textarea
            rows="4"
            placeholder="Hotel Description"
            {...register("description", {
              required: "Description is required"
            })}
          />

          {errors.description &&
            <small className="cp-error">
              {errors.description.message}
            </small>
          }

          <label>City *</label>
          <input
            type="text"
            placeholder="City"
            {...register('city', { required: 'City is required' })}
          />
          {errors.city && <small className="cp-error">{errors.city.message}</small>}

          <label>Area</label>
          <input
            type="text"
            placeholder="Area / locality"
            {...register('area')}
          />

          <label>Address *</label>
          <textarea
            rows="2"
            placeholder="Hotel address"
            {...register('address', { required: 'Address is required' })}
          />
          {errors.address && <small className="cp-error">{errors.address.message}</small>}

          <label>Hotel Type *</label>
          <select {...register('hotelType', { required: 'Hotel type is required' })}>
            {HOTEL_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <label>Status *</label>
          <select {...register('status', { required: 'Please select a status' })}>
            {HOTEL_STATUS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

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

          <label>Category *</label>

<select
  {...register("category", {
    required: "Please select a category"
  })}
>
  <option value="">Select Category</option>

  { categories && categories.map((category) => (
    <option key={category.id} value={category.id}>
      {category.name}
    </option>
  ))}
</select>

{errors.category && (
  <small className="cp-error">
    {errors.category.message}
  </small>
)}

          <label>Couple Friendly</label>
          <label className="cp-checkbox-label">
            <input type="checkbox" {...register('coupleFriendly')} />
            Allows couple stay
          </label>

          <label>Local ID Accepted</label>
          <label className="cp-checkbox-label">
            <input type="checkbox" {...register('localIdAccepted')} />
            Accepts local ID bookings
          </label>

          <label>Hotel Image</label>

          <input
            type="file"
            accept="image/*"
            {...register("imageUrl")}
          />

          <button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Create Hotel"}
          </button>

        </form>

      </section>

    </main>
  )
}

export default AddHotels
