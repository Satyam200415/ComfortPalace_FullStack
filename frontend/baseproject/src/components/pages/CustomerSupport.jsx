import { useState } from 'react'

const faqs = [
  ['How do I change or cancel a booking?', 'Open your profile, select the booking, and contact us before the check-in time.'],
  ['When will I receive my booking confirmation?', 'Confirmed bookings appear in your profile immediately after the hotel accepts them.'],
  ['How can I contact the hotel?', 'Send a request below with your booking details and our support team will help you.'],
]

export default function CustomerSupport() {
  const [openFaq, setOpenFaq] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ subject: 'Booking help', message: '' })
  const submit = (event) => { event.preventDefault(); setSubmitted(true) }

  return <main className="cp-support-page">
    <section className="cp-support-hero"><p>COMFORTPLACE SUPPORT</p><h1>How can we help?</h1><span>Get quick answers, booking support, and help with your stay.</span></section>
    <section className="cp-support-options"><article><b>?</b><h2>Booking support</h2><p>Need help with a booking, cancellation, or check-in?</p><a href="#request">Get booking help</a></article><article><b>@</b><h2>Email us</h2><p>Send us a message and our team will get back to you.</p><a href="mailto:support@comfortplace.com">support@comfortplace.com</a></article><article><b>24</b><h2>Always here</h2><p>Use the support form anytime. We aim to reply within 24 hours.</p><a href="#faq">Browse FAQs</a></article></section>
    <section className="cp-support-grid"><section id="request" className="cp-support-card"><p className="cp-support-kicker">SEND A REQUEST</p><h2>Tell us what you need</h2>{submitted ? <div className="cp-support-success"><strong>Request received</strong><p>Thanks for contacting ComfortPlace. Our team will reply to you soon.</p><button type="button" onClick={() => { setSubmitted(false); setForm({ subject: 'Booking help', message: '' }) }}>Send another request</button></div> : <form onSubmit={submit}><label>What do you need help with?<select value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })}><option>Booking help</option><option>Payment issue</option><option>Hotel or room question</option><option>Account support</option><option>Other</option></select></label><label>Message<textarea required rows="6" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Share your booking ID and explain how we can help." /></label><button className="cp-button cp-button-primary">Submit request</button></form>}</section><section id="faq" className="cp-support-card"><p className="cp-support-kicker">COMMON QUESTIONS</p><h2>Frequently asked questions</h2><div className="cp-support-faqs">{faqs.map(([question, answer], index) => <article key={question}><button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)}><span>{question}</span><b>{openFaq === index ? '-' : '+'}</b></button>{openFaq === index && <p>{answer}</p>}</article>)}</div></section></section>
  </main>
}
