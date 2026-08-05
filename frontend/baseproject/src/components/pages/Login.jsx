import { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../api/api'
import { LoginContext } from '../../context/LoginContext'

export default function Login() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm()
  const { login } = useContext(LoginContext)
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [loginError, setLoginError] = useState(null)

  const onSubmit = async ({ email, password }) => {
    setSubmitting(true); setLoginError(null)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      const token = data?.token || data?.accessToken
      const user = data?.userDto || data?.user
      if (!token || !user) throw new Error('Unexpected authentication response.')
      login(token, user)
      navigate(user.role === 'ROLE_ADMIN' ? '/admin' : user.role === 'ROLE_OWNER' ? '/hotel-owner/dashboard' : '/hotels-in/mumbai')
    } catch (error) {
      const response = error.response?.data
      const code = response?.error
      const message = code === 'ACCOUNT_SUSPENDED' ? 'Your account has been suspended. Please contact support.' : code === 'ACCOUNT_DISABLED' ? 'Your account has been disabled.' : error.response?.status === 401 ? 'Invalid email or password.' : response?.message || 'Something went wrong. Please try again later.'
      setLoginError({ message })
      setValue('password', '')
    } finally { setSubmitting(false) }
  }

  return <main className="cp-auth-page"><section className="cp-auth-card">
    <div className="text-center mb-4"><span className="login-mark">CP</span><h1 className="h3 fw-bold mt-3 mb-2">Welcome back</h1><p>Log in to manage your ComfortPlace account.</p></div>
    {loginError && <div className="alert alert-danger" role="alert">{loginError.message}</div>}
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div><label htmlFor="loginEmail">Email address</label><input id="loginEmail" type="email" autoComplete="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`} placeholder="you@example.com" {...register('email', { required: 'Email is required' })}/>{errors.email && <div className="invalid-feedback">{errors.email.message}</div>}</div>
      <div><label htmlFor="loginPassword">Password</label><input id="loginPassword" type="password" autoComplete="current-password" className={`form-control ${(errors.password || loginError) ? 'is-invalid' : ''}`} placeholder="Enter your password" {...register('password', { required: 'Password is required' })}/>{errors.password ? <div className="invalid-feedback">{errors.password.message}</div> : loginError && <div className="invalid-feedback d-block">{loginError.message}</div>}</div>
      <button className="cp-button cp-button-primary w-100 d-flex align-items-center justify-content-center gap-2" type="submit" disabled={submitting}>{submitting && <span className="spinner-border spinner-border-sm" aria-hidden="true"/>}{submitting ? 'Signing in...' : 'Sign in'}</button>
    </form>
    <p className="cp-auth-link-row">Don't have an account? <Link to="/register">Create one</Link></p>
  </section></main>
}
