import { useContext, useMemo, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BadgeCheck, Building2, Check, ChevronLeft, IndianRupee, LoaderCircle, MapPin, ShieldCheck, TicketPercent, CreditCard } from 'lucide-react'
import { LoginContext } from '../../context/LoginContext'
import { bookingApi } from '../../api/bookingApi'
import axios from 'axios'
import { money, dateTime } from '../../utils/formatters'

const PAYMENT_METHODS = [
  { id: 'RAZORPAY', label: 'Pay with Razorpay', description: 'Pay securely using UPI, cards, wallets or net banking', Icon: CreditCard },
  { id: 'CASH', label: 'Cash at hotel', description: 'Pay when you check in at the hotel', Icon: Building2 },
]

export default function Payment() {
  const navigate = useNavigate()
  const { isAuthenticated } = useContext(LoginContext)
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY')
  const [coupon, setCoupon] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success' | 'error' | 'info'
  const isProcessingRef = useRef(false)
  const booking = JSON.parse(sessionStorage.getItem('pendingBooking') || 'null')
  const guestDetails = booking?.guestDetails || { name: '', email: '', phone: '' }
  const price = Number(booking?.totalAmount || 0)
  const pricing = useMemo(() => {
    const taxes = Math.round(price * 0.12)
    const convenience = paymentMethod === 'CASH' ? 0 : 49
    const discount = couponApplied ? Math.min(Math.round(price * 0.1), 500) : 0
    return { taxes, convenience, discount, total: price + taxes + convenience - discount }
  }, [price, paymentMethod, couponApplied])

  // Validate guest details exist - check after all hooks are called
  const hasValidGuestDetails = booking && guestDetails.name && guestDetails.email && guestDetails.phone

  const resetProcessing = () => {
    setProcessing(false)
    isProcessingRef.current = false
  }

  const showSuccess = (msg) => {
    setMessage(msg)
    setMessageType('success')
  }

  const showError = (msg) => {
    setMessage(msg)
    setMessageType('error')
  }

  const showInfo = (msg) => {
    setMessage(msg)
    setMessageType('info')
  }

  const handlePaymentSuccess = async (response) => {
    console.log('Payment success callback triggered:', response)
    
    try {
      // Verify payment signature on backend
      console.log('Verifying payment signature on backend...')
      const verifyResponse = await axios.post('http://localhost:8080/api/payment/verify', {
        orderId: response.razorpay_order_id,
        paymentId: response.razorpay_payment_id,
        signature: response.razorpay_signature
      })

      console.log('Verification response:', verifyResponse.data)

      if (!verifyResponse.data.success) {
        throw new Error(verifyResponse.data.message || 'Payment verification failed')
      }

      // Create booking after successful payment verification
      console.log('Creating booking with payment details...')
      const bookingResponse = await bookingApi.create({
        roomId: booking.roomId,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        roomsBooked: booking.roomsBooked || 1,
        totalAmount: pricing.total,
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
        paymentStatus: 'PAID'
      })

      console.log('Booking created successfully:', bookingResponse)

      // Clear pending booking
      sessionStorage.removeItem('pendingBooking')
      
      // Stop processing
      resetProcessing()
      
      // Show success message
      showSuccess('Payment successful! Your booking is confirmed.')
      
      // Redirect to booking success page after a short delay
      setTimeout(() => {
        navigate('/booking-success', { 
          state: { 
            bookingId: bookingResponse.id,
            hotelName: booking.hotelName,
            amount: pricing.total,
            paymentMethod: 'RAZORPAY',
            roomName: booking.roomName,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            roomsBooked: booking.roomsBooked || 1,
            guests: booking.guests || 1
          } 
        })
      }, 2000)

    } catch (error) {
      console.error('Error in payment success handler:', error)
      resetProcessing()
      showError(error.response?.data?.message || error.message || 'Payment verification failed. Please contact support.')
    }
  }

  const handlePaymentFailure = (response) => {
    console.error('Payment failed:', response)
    resetProcessing()
    showError('Payment failed. Please try again or use a different payment method.')
  }

  const handlePaymentCancel = () => {
    console.log('Payment cancelled by user')
    resetProcessing()
    showInfo('Payment cancelled by user. You can try again.')
  }

  const handleRazorpayPayment = async () => {
    try {
      // Create Razorpay order
      console.log('Creating Razorpay order for amount:', pricing.total)
      const orderResponse = await axios.post('http://localhost:8080/api/payment/create-order', {
        amount: Math.round(pricing.total),
        receipt: `receipt_${Date.now()}`
      })

      console.log('Razorpay order created:', orderResponse.data)

      const options = {
        key: orderResponse.data.razorpayKeyId,
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        name: 'ComfortPlace',
        description: `Booking at ${booking.hotelName}`,
        order_id: orderResponse.data.orderId,
        handler: handlePaymentSuccess,
        prefill: {
          name: guestDetails?.name?.trim() || '',
          email: guestDetails?.email?.trim() || '',
          contact: guestDetails?.phone?.trim() || ''
        },
        theme: {
          color: '#f97316'
        },
        modal: {
          ondismiss: handlePaymentCancel,
          escape: true,
          backdropclose: true
        },
        notes: {
          bookingId: booking.roomId,
          hotelName: booking.hotelName
        }
      }

      console.log('Opening Razorpay checkout...')
      const razorpay = new window.Razorpay(options)
      razorpay.on('payment.failed', handlePaymentFailure)
      razorpay.open()

    } catch (error) {
      console.error('Error initiating Razorpay payment:', error)
      throw error
    }
  }

  const handleCashPayment = async () => {
    try {
      console.log('Processing cash payment booking...')
      const bookingResponse = await bookingApi.create({
        roomId: booking.roomId,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        roomsBooked: booking.roomsBooked || 1,
        totalAmount: pricing.total,
        paymentStatus: 'PENDING'
      })

      console.log('Cash booking created successfully:', bookingResponse)

      sessionStorage.removeItem('pendingBooking')
      resetProcessing()
      showSuccess('Booking confirmed! Pay cash at the hotel during check-in.')

      setTimeout(() => {
        navigate('/booking-success', { 
          state: { 
            bookingId: bookingResponse.id,
            hotelName: booking.hotelName,
            amount: pricing.total,
            paymentMethod: 'CASH',
            roomName: booking.roomName,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            roomsBooked: booking.roomsBooked || 1,
            guests: booking.guests || 1
          } 
        })
      }, 2000)

    } catch (error) {
      console.error('Error creating cash booking:', error)
      throw error
    }
  }

  const pay = async () => {
    // Prevent duplicate submissions
    if (isProcessingRef.current) {
      console.log('Payment already in progress, ignoring duplicate click')
      return
    }

    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setProcessing(true)
    isProcessingRef.current = true
    setMessage('')
    setMessageType('')

    console.log('Starting payment process with method:', paymentMethod)

    try {
      if (paymentMethod === 'CASH') {
        await handleCashPayment()
      } else {
        await handleRazorpayPayment()
      }
    } catch (error) {
      console.error('Payment process error:', error)
      resetProcessing()
      showError(error.response?.data?.message || error.message || 'Payment could not be completed. Please try again.')
    }
  }

  if (!booking) return <main className="min-h-[55vh] bg-slate-50 px-4 py-16"><section className="mx-auto max-w-md rounded-3xl bg-white p-8 text-center shadow-xl shadow-slate-200/60"><h1 className="text-2xl font-bold text-slate-900">No booking selected</h1><p className="mt-3 text-slate-600">Please choose a room before continuing to payment.</p><Link className="mt-6 inline-flex rounded-xl bg-orange-500 px-5 py-3 font-bold text-white" to="/hotels-in">Browse hotels</Link></section></main>

  if (!hasValidGuestDetails) return <main className="min-h-[55vh] bg-slate-50 px-4 py-16"><section className="mx-auto max-w-md rounded-3xl bg-white p-8 text-center shadow-xl shadow-slate-200/60"><h1 className="text-2xl font-bold text-slate-900">Missing guest details</h1><p className="mt-3 text-slate-600">Please complete guest details before proceeding to payment.</p><button type="button" onClick={() => navigate(-1)} className="mt-6 inline-flex rounded-xl bg-orange-500 px-5 py-3 font-bold text-white">Go back</button></section></main>

  return <main className="min-h-screen bg-[#fffaf5] px-4 py-8 text-slate-800 sm:px-6 lg:py-12">
    <div className="mx-auto max-w-6xl">
      <button type="button" onClick={() => navigate(-1)} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-orange-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500"><ChevronLeft size={18}/> Back to guest details</button>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-extrabold tracking-[.16em] text-orange-500">STEP 2 OF 2</p><h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Complete your booking</h1><p className="mt-2 text-slate-600">A secure checkout for your stay at {booking.hotelName}.</p></div><span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700"><ShieldCheck size={18}/> Secure checkout</span></div>
      
      {/* Message Display */}
      {message && (
        <div className={`mb-6 rounded-2xl p-4 ${
          messageType === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
          messageType === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          <p className="text-sm font-semibold">{message}</p>
        </div>
      )}
      
      <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-xl shadow-orange-950/[.04]"><div className="grid sm:grid-cols-[180px_1fr]"><img src={booking.hotelImage || 'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=800'} className="h-48 w-full object-cover sm:h-full" alt={booking.hotelName}/><div className="p-6"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-[.14em] text-orange-500">Your stay</p><h2 className="mt-2 text-xl font-extrabold text-slate-900">{booking.hotelName}</h2><p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500"><MapPin size={16} className="text-orange-500"/>{booking.address || 'Hotel address'}</p></div><BadgeCheck className="shrink-0 text-emerald-500" aria-label="Verified stay"/></div><div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 border-t border-slate-100 pt-5 text-sm"><div><span className="block text-slate-400">Room</span><b>{booking.roomName}</b></div><div><span className="block text-slate-400">Package</span><b>{booking.duration?.replaceAll('_', ' ')}</b></div><div><span className="block text-slate-400">Check-in</span><b>{dateTime(booking.checkIn)}</b></div><div><span className="block text-slate-400">Check-out</span><b>{dateTime(booking.checkOut)}</b></div><div><span className="block text-slate-400">Rooms & guests</span><b>{booking.roomsBooked || 1} room{(booking.roomsBooked || 1) > 1 ? 's' : ''}, {booking.guests || 1} guest{(booking.guests || 1) > 1 ? 's' : ''}</b></div><div><span className="block text-slate-400">Children</span><b>{booking.children || 0}</b></div></div></div></div></motion.section>
          <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-xl shadow-orange-950/[.04]"><div className="mb-5"><p className="text-xs font-extrabold uppercase tracking-[.14em] text-orange-500">Payment method</p><h2 className="mt-2 text-xl font-extrabold text-slate-900">How would you like to pay?</h2></div><div role="radiogroup" aria-label="Payment method" className="grid gap-3 sm:grid-cols-2">{PAYMENT_METHODS.map(({ id, label, description, Icon }) => <motion.button whileHover={{ y: -2 }} whileTap={{ scale: .98 }} type="button" role="radio" aria-checked={paymentMethod === id} key={id} onClick={() => setPaymentMethod(id)} disabled={processing} className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 ${paymentMethod === id ? 'border-orange-500 bg-orange-50 shadow-md shadow-orange-200/50' : 'border-slate-100 bg-white hover:border-orange-200 hover:bg-orange-50/40'} ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${paymentMethod === id ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'}`}><Icon size={21}/></span><span className="min-w-0 flex-1"><b className="block text-sm text-slate-900">{label}</b><small className="mt-0.5 block leading-5 text-slate-500">{description}</small></span>{paymentMethod === id && <span className="grid h-5 w-5 place-items-center rounded-full bg-orange-500 text-white"><Check size={14}/></span>}</motion.button>)}</div></section>
        </div>
        <motion.aside initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="sticky top-5 overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-2xl shadow-orange-950/[.10]"><div className="bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-5 text-white"><p className="text-sm font-bold opacity-90">Booking summary</p><h2 className="mt-1 text-2xl font-black">Total: ₹{money(pricing.total)}</h2></div><div className="space-y-5 p-6"><div className="space-y-3 text-sm"><div className="flex justify-between"><span className="text-slate-500">Room price</span><b>₹{money(price)}</b></div><div className="flex justify-between"><span className="text-slate-500">Taxes & GST</span><b>₹{money(pricing.taxes)}</b></div><div className="flex justify-between"><span className="text-slate-500">Convenience fee</span><b>{pricing.convenience ? `₹${money(pricing.convenience)}` : 'Free'}</b></div>{pricing.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Coupon discount</span><b>−₹{money(pricing.discount)}</b></div>}</div><div className="rounded-2xl bg-orange-50 p-3"><label className="mb-2 flex items-center gap-2 text-xs font-bold text-orange-700"><TicketPercent size={16}/> Coupon code</label><div className="flex gap-2"><input value={coupon} onChange={(event) => { setCoupon(event.target.value.toUpperCase()); setCouponApplied(false) }} placeholder="SAVE10" className="min-w-0 flex-1 rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"/><button type="button" onClick={() => setCouponApplied(coupon.trim().length > 0)} className="rounded-xl bg-orange-500 px-3 text-sm font-bold text-white transition hover:bg-orange-600 active:scale-95">Apply</button></div>{couponApplied && <p className="mt-2 text-xs font-semibold text-emerald-600">Coupon applied — you saved ₹{money(pricing.discount)}.</p>}</div><div className="flex items-end justify-between border-t border-slate-100 pt-4"><span className="font-bold text-slate-700">Total payable</span><span className="text-2xl font-black text-slate-900">₹{money(pricing.total)}</span></div><button type="button" onClick={pay} disabled={processing || messageType === 'success'} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-4 font-extrabold text-white shadow-lg shadow-orange-200 transition hover:from-orange-600 hover:to-amber-500 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60">{processing && <LoaderCircle className="animate-spin" size={19}/>}<IndianRupee size={18}/>{processing ? 'Processing payment...' : isAuthenticated ? `Pay ₹${money(pricing.total)}` : 'Login to pay'}</button><p className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-400"><ShieldCheck size={14}/> Your payment information is encrypted.</p></div></motion.aside>
      </div>
    </div>
  </main>
}
