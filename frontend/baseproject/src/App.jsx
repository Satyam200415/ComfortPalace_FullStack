import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/common/Layout'
import Home from './components/pages/Home'
import Login from './components/pages/Login'
import Register from './components/pages/Register'
import CityHotels from './components/pages/CityHotels'
import Profile from './components/pages/Profile'
import { LoginProvider } from './context/LoginContext'
import AdminDashboard from './components/pages/AdminDashboard'
import HotelOwnerDashboard from './components/pages/HotelOwnerDashboard'
import AddHotels from './components/pages/AddHotels'
import OwnerRooms from './components/pages/OwnerRooms'
import HotelRooms from './components/pages/HotelRooms'
import CustomerSupport from './components/pages/CustomerSupport'
import Payment from './components/pages/Payment'
import BookingSuccess from './components/pages/BookingSuccess'
import AdminRoute from './components/common/AdminRoute'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'profile', element: <Profile /> },
      { path: 'hotels-in/:city', element: <CityHotels /> },
      { path: 'hotels-in', element: <CityHotels /> },
      { path: '/admin', element: <AdminRoute><AdminDashboard/></AdminRoute>},
      { path: '/hotel-owner/dashboard', element: <HotelOwnerDashboard/>},
      { path: '/hotel-owner/hotels/:hotelId/rooms', element: <OwnerRooms/>},
      { path: '/hotels/:hotelId', element: <HotelRooms/>},
      { path: '/support', element: <CustomerSupport/>},
      { path: '/payment', element: <Payment/>},
      { path: '/booking-success', element: <BookingSuccess/>},
      { path: '/hotels/add', element: <AddHotels/>}
    ],
  },
])

function App() {
  return (
    <LoginProvider>
          <RouterProvider router={router} />

    </LoginProvider>
  )
}

export default App
