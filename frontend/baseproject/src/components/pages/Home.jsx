import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

const CITY_OPTIONS = ['Mumbai', 'Pune', 'Lucknow', 'Delhi', 'Kolkata', 'Hyderabad', 'Chennai']
const TIME_SLOTS = ['06:00 AM', '09:00 AM', '12:00 PM', '03:00 PM', '06:00 PM', '09:00 PM']
const HERO_HIGHLIGHTS = ['3, 6, 12 hrs & 1 day stays', 'Prime city locations', 'Luxury rooms with instant booking']
const CITY_SHOWCASE = [
  {
    name: 'Mumbai',
    image:
      'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80',
    blurb: 'Sea-link views, airport hotels, and premium short stays.',
  },
  {
    name: 'Pune',
    image:
      'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80',
    blurb: 'Business travel rooms and flexible city stopovers.',
  },
  {
    name: 'Lucknow',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    blurb: 'Elegant short stays with calm interiors and easy access.',
  },
  {
    name: 'Delhi',
    image:
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
    blurb: 'Airport, metro, and city-centre bookings in one place.',
  },
  {
    name: 'Kolkata',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    blurb: 'Classic comfort with premium rooms across busy districts.',
  },
  {
    name: 'Hyderabad',
    image:
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80',
    blurb: 'Modern hotel stays near tech parks and airport roads.',
  },
  {
    name: 'Chennai',
    image:
      'https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=1200&q=80',
    blurb: 'Coastal city stays with clean rooms and flexible timing.',
  },
  {
    name: 'All Cities',
    image:
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
    blurb: 'Browse every available destination and hotel category.',
    isAllCities: true,
  },
]
const BENEFITS = [
  'Freedom of anytime check-in',
  'Hourly hotels across major cities',
  'Budget, premium and luxury properties',
  'Couple-friendly stays',
]
const TESTIMONIALS = [
  {
    text: 'Great concept. Efficient and very economical for short stays.',
    name: 'Shraddha Thakur',
  },
  {
    text: 'Flexible check-in and pay only for hours stayed is perfect for work travel.',
    name: 'Somendra Singh',
  },
  {
    text: 'Couple-friendly and affordable prices. Smooth check-in experience.',
    name: 'Kanishka Verma',
  },
]
const FAQS = [
  'Why should we book rooms with ComfortPalace?',
  'In which cities is hourly booking available?',
  'Are couple-friendly hotels available?',
  'Can guests with local ID book hotels?',
]
const GALLERY_ITEMS = [
  {
    title: 'Luxury Hotel Exterior',
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Premium Room',
    image:
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Luxury Washroom',
    image:
      'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    title: 'Grand Hall',
    image:
      'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    title: 'Elegant Bedroom',
    image:
      'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    title: 'Executive Suite',
    image:
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80',
  },
]
const FALLBACK_IMAGE =
  'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=1200'

function formatDateInputValue(date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function Home() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedData, setSubmittedData] = useState(null)
  const today = new Date()
  const minBookingDate = formatDateInputValue(today)
  const maxDate = new Date(today)
  maxDate.setFullYear(maxDate.getFullYear() + 1)
  const maxBookingDate = formatDateInputValue(maxDate)

  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      stayType: 'hourly',
      city: '',
      date: '',
      time: '',
    },
  })
  const selectedCity = watch('city')

  const onSubmit = async (data) => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    setSubmittedData(data)
    setIsSubmitted(true)
    if (data.city) {
      navigate(`/hotels-in/${data.city.toLowerCase()}`)
    }
    reset({ stayType: 'hourly', city: '', date: '', time: '' })
  }

  return (
    <main className="cp-homepage">
      <section className="cp-home-hero">
        <div className="cp-home-hero-inner">
          <div className="cp-home-hero-copy">
            <p className="cp-home-kicker">Curated Stays Across India</p>
            <h1 style={{color:"white"}}>
              Hourly Hotels
              <span>#SHORTSTAY</span> with ComfortPalace
            </h1>
            <p>Book safe, flexible rooms for 3, 6 or 12 hours and pay only for what you use.</p>
            <div className="cp-home-highlight-row">
              {HERO_HIGHLIGHTS.map((item) => (
                <span key={item} className="cp-home-highlight-pill">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="cp-home-hero-visual">
            <article className="cp-home-hero-card cp-home-hero-card-main">
              <img
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
                alt="Luxury hotel room"
              />
              <div>
                <strong>Luxury Rooms</strong>
                <span>Premium interiors with flexible hourly and day stays.</span>
              </div>
            </article>
            <div className="cp-home-hero-mini-grid">
              <article className="cp-home-hero-card">
                <img
                  src="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80"
                  alt="Elegant short stay room"
                />
                <div>
                  <strong>Couple Friendly</strong>
                  <span>Verified stays in top city locations.</span>
                </div>
              </article>
              <article className="cp-home-hero-card">
                <img
                  src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80"
                  alt="Executive hotel suite"
                />
                <div>
                  <strong>Instant Booking</strong>
                  <span>Fast search, smooth check-in, and premium comfort.</span>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="cp-booking-strip">
        <form className="cp-search-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <fieldset className="cp-toggle-wrap">
            <legend className="cp-sr-only">Stay Type</legend>
            <label className="cp-toggle">
              <input type="radio" value="hourly" {...register('stayType')} />
              <span>Hourly Stay</span>
            </label>
            <label className="cp-toggle">
              <input type="radio" value="fullday" {...register('stayType')} />
              <span>Full-Day Stay</span>
            </label>
          </fieldset>

          <div className="cp-search-grid">
            <div className="cp-search-field">
              <label htmlFor="city">Where?</label>
              <select id="city" {...register('city', { required: 'Please select a city' })}>
                <option value="">Select city</option>
                {CITY_OPTIONS.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {errors.city && <small className="cp-error">{errors.city.message}</small>}
            </div>
            <div className="cp-search-field">
              <label htmlFor="date">When?</label>
              <input
                id="date"
                type="date"
                min={minBookingDate}
                max={maxBookingDate}
                {...register('date', {
                  required: 'Select date',
                  validate: {
                    notPast: (value) =>
                      !value || value >= minBookingDate || 'Past dates are not allowed',
                    withinOneYear: (value) =>
                      !value ||
                      value <= maxBookingDate ||
                      'Please select a date within the next year',
                  },
                })}
              />
              {errors.date && <small className="cp-error">{errors.date.message}</small>}
            </div>
            <div className="cp-search-field">
              <label htmlFor="time">What time?</label>
              <select id="time" {...register('time', { required: 'Select check-in time' })}>
                <option value="">Select time</option>
                {TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              {errors.time && <small className="cp-error">{errors.time.message}</small>}
            </div>
            <div className="cp-search-action">
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </form>

        <div className="cp-popular-cities-wrap">
          <div className="cp-popular-cities-head">
            <p className="cp-popular-cities-kicker">Trending Destinations</p>
            <h3>Pick a city and explore premium short stays</h3>
          </div>
          <div className="cp-popular-cities">
            {CITY_SHOWCASE.map((city) => (
              <button
                key={city.name}
                type="button"
                className={
                  selectedCity === city.name ? 'cp-city-chip cp-city-chip-active' : 'cp-city-chip'
                }
                onClick={() => {
                  if (city.isAllCities) {
                    setValue('city', '', { shouldValidate: true, shouldDirty: true })
                    navigate('/hotels-in')
                    return
                  }
                  setValue('city', city.name, { shouldValidate: true, shouldDirty: true })
                  navigate(`/hotels-in/${city.name.toLowerCase()}`)
                }}
              >
                <img className="cp-city-chip-image" src={city.image} alt="" />
                <span className="cp-city-chip-dot"></span>
                <span className="cp-city-chip-content">
                  <strong>{city.name}</strong>
                  <small>{city.blurb}</small>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {isSubmitted && submittedData && (
        <section className="cp-success-banner">
          <h3>Searching Hotels...</h3>
          <p>
            {submittedData.stayType === 'hourly' ? 'Hourly' : 'Full-day'} results in{' '}
            <strong>{submittedData.city}</strong> for <strong>{submittedData.date}</strong> at{' '}
            <strong>{submittedData.time}</strong>.
          </p>
        </section>
      )}

      <section className="cp-info-grid">
        <article className="cp-info-card cp-new-launch">
          <p className="cp-chip">NEW LAUNCH</p>
          <h3>Introducing Full-Day Bookings</h3>
          <p>Now you can book longer stays across India with ComfortPalace.</p>
          <button type="button">Explore Hotels</button>
        </article>
        <article className="cp-info-card cp-offers">
          <p className="cp-chip">FOR YOU</p>
          <h3>Exciting Offers</h3>
          <p>Create a booking and enjoy cashback and discounts on every stay.</p>
          <button type="button">Explore Offers</button>
        </article>
      </section>

      <section className="cp-promo-banner">
        <div className="cp-promo-copy">
          <p className="cp-chip">FEATURED CAMPAIGN</p>
          <h2 style={{color:"white"}}>Stay Like A Star</h2>
          <p>
            Experience premium rooms, instant booking, and luxury comfort with a bold
            cinema-inspired campaign crafted for modern short stays.
          </p>
          <div className="cp-promo-actions">
            <button type="button">Book Premium Stay</button>
            <button type="button" className="cp-promo-secondary">
              Explore Cities
            </button>
          </div>
        </div>
        <div className="cp-promo-visual">
          <img
            src="/salman-khan-promo.jpg"
            alt="Featured campaign portrait"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.onerror = null
              event.currentTarget.src = FALLBACK_IMAGE
            }}
          />
        </div>
      </section>

      <section className="cp-gallery">
        <h2>Explore Our Spaces</h2>
        <p>Handpicked visuals of our partner hotels, rooms, luxury washrooms, halls, and bedrooms.</p>
        <div className="cp-gallery-grid">
          {GALLERY_ITEMS.map((item) => (
            <article key={item.title} className="cp-gallery-card">
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.onerror = null
                  event.currentTarget.src = FALLBACK_IMAGE
                }}
              />
              <h4>{item.title}</h4>
            </article>
          ))}
        </div>
      </section>

      <section className="cp-benefits">
        <h2>Benefits of ComfortPalace</h2>
        <div className="cp-benefit-grid">
          {BENEFITS.map((benefit) => (
            <div key={benefit} className="cp-benefit-card">
              <span>v</span>
              <p>{benefit}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cp-milestones">
        <h2>Our Milestones</h2>
        <div className="cp-metrics">
          <div>
            <h4>9</h4>
            <p>Amazing Years</p>
          </div>
          <div>
            <h4>200+</h4>
            <p>Cities</p>
          </div>
          <div>
            <h4>10000+</h4>
            <p>Hotels</p>
          </div>
          <div>
            <h4>5M+</h4>
            <p>Happy Customers</p>
          </div>
        </div>
      </section>

      <section className="cp-testimonials">
        <h2>Our Testimonials</h2>
        <div className="cp-testimonial-grid">
          {TESTIMONIALS.map((item) => (
            <article key={item.name} className="cp-testimonial-card">
              <p>"{item.text}"</p>
              <h4>{item.name}</h4>
            </article>
          ))}
        </div>
      </section>

      <section className="cp-faqs">
        <h2>FAQs about Hotel Registration</h2>
        <div className="cp-faq-list">
          {FAQS.map((q) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>
                ComfortPalace offers flexible short-stay options with secure partner hotels and
                transparent pricing.
              </p>
            </details>
          ))}
        </div>
      </section>
    </main>
  )
}

export default Home
