import { Link } from 'react-router-dom'

export default function Footer() {
  return <footer className="cp-site-footer">
    <div className="cp-footer-main"><section className="cp-footer-intro"><Link to="/" className="cp-footer-brand"><span>CP</span>ComfortPlace</Link><p>ComfortPlace helps you find welcoming hotel rooms for a few hours or an overnight stay. Book flexible stays that fit your schedule.</p><strong>Follow us</strong><div className="cp-footer-socials"><a href="https://facebook.com" aria-label="Facebook">f</a><a href="https://x.com" aria-label="X">X</a><a href="https://instagram.com" aria-label="Instagram">◎</a><a href="https://linkedin.com" aria-label="LinkedIn">in</a></div></section><section className="cp-footer-links"><div><Link to="/">About us</Link><Link to="/support">Contact us</Link><Link to="/support#faq">FAQs</Link></div><div><a href="#terms">Terms &amp; Conditions</a><a href="#privacy">Privacy Policy</a><a href="#careers">Careers <small>We are hiring</small></a></div></section><section className="cp-footer-owner"><h2>Are you a Hotelier?<br />Join ComfortPlace</h2><p>Join our growing hotel network and reach more guests looking for flexible stays.</p><Link to="/register" className="cp-footer-owner-button">List Your Hotel</Link></section></div>
    <div className="cp-footer-bottom"><span>© {new Date().getFullYear()} ComfortPlace. All rights reserved.</span><span>Secure payments accepted</span></div>
  </footer>
}
