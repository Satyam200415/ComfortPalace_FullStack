import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../api/api'
import { hotelApi } from '../../api/hotelApi'

const HOTEL_IMAGE_FALLBACK =
  'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=1200'

function createGallery(seedImages) {
  return seedImages.map((image) => ({ image }))
}

const CITY_PAGE_DATA = {
  mumbai: {
    resultCount: 561,
    bannerImage:
      'https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=1400&q=80',
    tags: ['Couple Friendly', 'Pay At Hotel'],
    filterAreas: [
      'Amboli, Andheri West',
      'Andheri East',
      'Andheri West',
      'Asalpha, Andheri East',
      'Bandra West',
      'Bhandup',
      'Borivali East',
      'Borivali West',
      'Byculla, South Mumbai',
      'Goregaon West',
      'Khar West',
      'Marol, Andheri East',
      'Mira Bhayander',
      'Powai',
      'Vile Parle East',
      'Worli, South Mumbai',
    ],
    hotels: [
      {
        name: 'Bloom Hotel - Saki Vihar',
        locality: 'Powai',
        rating: '4.5',
        reviews: 127,
        badge: 'PREMIUM',
        offer: 'Get 100% OFF with Brevi Cash',
        tags: ['Couple Friendly', 'Pay At Hotel'],
        features: ['Couple Friendly', 'Accepts Local ID'],
        amenities: ['Parking', 'AC', 'Bottle', 'Dining', 'TV', 'Wi-Fi'],
        moreAmenities: 8,
        gallery: createGallery([
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
        ]),
        pricing: [
          { duration: '3 Hrs', price: 'Rs 2520' },
          { duration: '6 Hrs', price: 'Rs 2835' },
          { duration: '1 Day Stay', price: 'Rs 5250' },
        ],
        availability: 'Unavailable',
      },
      {
        name: 'Ginger Mumbai Airport',
        locality: 'Vile Parle East',
        rating: '4.6',
        reviews: 8,
        badge: 'PREMIUM',
        offer: 'Get 100% OFF with Brevi Cash',
        tags: ['Couple Friendly'],
        features: ['Couple Friendly', 'Accepts Local ID'],
        amenities: ['Parking', 'AC', 'Bottle', 'Dining', 'TV', 'Lounge'],
        moreAmenities: 12,
        gallery: createGallery([
          'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=1200&q=80',
        ]),
        pricing: [
          { duration: '3 Hrs', price: 'Rs 2494' },
          { duration: '6 Hrs', price: 'Rs 3491' },
          { duration: '1 Day Stay', price: 'Rs 5899' },
        ],
        availability: 'Unavailable',
      },
      {
        name: 'Ginger Mumbai, Andheri East',
        locality: 'Andheri East',
        rating: '2.9',
        reviews: 2,
        badge: 'PREMIUM',
        offer: 'Get 100% OFF with Brevi Cash',
        tags: ['Couple Friendly', 'Pay At Hotel'],
        features: ['Couple Friendly', 'Accepts Local ID'],
        amenities: ['Parking', 'AC', 'Bottle', 'Dining', 'TV', 'Wi-Fi'],
        moreAmenities: 11,
        gallery: createGallery([
          'https://images.unsplash.com/photo-1568495248636-6432b97bd949?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1617103996702-96ff29b1c467?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
        ]),
        pricing: [
          { duration: '3 Hrs', price: 'Rs 3308' },
          { duration: '6 Hrs', price: 'Rs 3308' },
          { duration: '1 Day Stay', price: 'Rs 6120' },
        ],
        availability: 'Unavailable',
      },
      {
        name: 'Oriental Residency',
        locality: 'Khar West',
        rating: '4.3',
        reviews: 32,
        badge: 'PREMIUM',
        offer: 'Get 100% OFF with Brevi Cash',
        tags: ['Couple Friendly'],
        features: ['Couple Friendly', 'Accepts Local ID'],
        amenities: ['Parking', 'AC', 'Bottle', 'Dining', 'TV', 'Wi-Fi'],
        moreAmenities: 10,
        gallery: createGallery([
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
        ]),
        pricing: [
          { duration: '3 Hrs', price: 'Rs 2315' },
          { duration: '6 Hrs', price: 'Rs 2813' },
          { duration: '1 Day Stay', price: 'Rs 4899' },
        ],
        availability: 'Unavailable',
      },
      {
        name: 'Indie Stays Mumbai International Airport',
        locality: 'Marol, Andheri East',
        rating: '4.6',
        reviews: 21,
        badge: 'PREMIUM',
        offer: 'Get 100% OFF with Brevi Cash',
        tags: ['Couple Friendly', 'Pay At Hotel'],
        features: ['Couple Friendly', 'Accepts Local ID'],
        amenities: ['Parking', 'AC', 'Bottle', 'Dining', 'TV', 'Wi-Fi'],
        moreAmenities: 7,
        gallery: createGallery([
          'https://images.unsplash.com/photo-1444201983204-c43cbd584d93?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1521783988139-89397d761dce?auto=format&fit=crop&w=1200&q=80',
        ]),
        pricing: [
          { duration: '3 Hrs', price: 'Rs 2625' },
          { duration: '6 Hrs', price: 'Rs 3675' },
          { duration: '1 Day Stay', price: 'Rs 5999' },
        ],
        availability: 'Unavailable',
      },
      {
        name: 'Hotel Solitaire',
        locality: 'Andheri East',
        rating: '4.5',
        reviews: 0,
        badge: 'PREMIUM',
        offer: 'Get 100% OFF with Brevi Cash',
        tags: ['Couple Friendly'],
        features: ['Couple Friendly', 'Accepts Local ID'],
        amenities: ['Parking', 'AC', 'Bottle', 'Dining', 'TV', 'Wi-Fi'],
        moreAmenities: 8,
        gallery: createGallery([
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
        ]),
        pricing: [
          { duration: '3 Hrs', price: 'Rs 2730' },
          { duration: '6 Hrs', price: 'Rs 3360' },
          { duration: '1 Day Stay', price: 'Rs 5490' },
        ],
        availability: 'Unavailable',
      },
      {
        name: 'Freesia By Express Inn',
        locality: 'Mira Bhayander',
        rating: '4.4',
        reviews: 192,
        badge: 'PREMIUM',
        offer: 'Get 100% OFF with Brevi Cash',
        tags: ['Couple Friendly', 'Pay At Hotel'],
        features: ['Couple Friendly', 'Accepts Local ID'],
        amenities: ['Parking', 'AC', 'Bottle', 'Dining', 'TV', 'Wi-Fi'],
        moreAmenities: 10,
        gallery: createGallery([
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
        ]),
        pricing: [
          { duration: '3 Hrs', price: 'Rs 2100' },
          { duration: '6 Hrs', price: 'Rs 2599' },
          { duration: '12 Hrs', price: 'Rs 3000' },
          { duration: '1 Day Stay', price: 'Rs 4299' },
        ],
        availability: 'View Deal',
      },
      {
        name: 'Ginger Mumbai, Andheri MIDC',
        locality: 'Andheri East',
        rating: '3.5',
        reviews: 4,
        badge: 'PREMIUM',
        offer: 'Get 100% OFF with Brevi Cash',
        tags: ['Couple Friendly'],
        features: ['Couple Friendly', 'Accepts Local ID'],
        amenities: ['Parking', 'AC', 'Bottle', 'Dining', 'TV', 'Wi-Fi'],
        moreAmenities: 6,
        gallery: createGallery([
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80',
        ]),
        pricing: [
          { duration: '3 Hrs', price: 'Rs 2834' },
          { duration: '6 Hrs', price: 'Rs 2834' },
          { duration: '1 Day Stay', price: 'Rs 5180' },
        ],
        availability: 'Unavailable',
      },
      {
        name: 'Indie Stays - Goregaon',
        locality: 'Goregaon West',
        rating: '4.4',
        reviews: 18,
        badge: 'PREMIUM',
        offer: 'Get 100% OFF with Brevi Cash',
        tags: ['Couple Friendly', 'Pay At Hotel'],
        features: ['Couple Friendly', 'Accepts Local ID'],
        amenities: ['Parking', 'AC', 'Bottle', 'Dining', 'TV', 'Wi-Fi'],
        moreAmenities: 5,
        gallery: createGallery([
          'https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1444201983204-c43cbd584d93?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1521783988139-89397d761dce?auto=format&fit=crop&w=1200&q=80',
        ]),
        pricing: [
          { duration: '3 Hrs', price: 'Rs 2468' },
          { duration: '6 Hrs', price: 'Rs 2993' },
          { duration: '1 Day Stay', price: 'Rs 4980' },
        ],
        availability: 'Unavailable',
      },
      {
        name: 'Bloom Hotel - Worli',
        locality: 'Worli, South Mumbai',
        rating: '4.5',
        reviews: 26,
        badge: 'PREMIUM',
        offer: 'Get 100% OFF with Brevi Cash',
        tags: ['Couple Friendly'],
        features: ['Couple Friendly', 'Accepts Local ID'],
        amenities: ['Parking', 'AC', 'Bottle', 'Dining', 'TV', 'Wi-Fi'],
        moreAmenities: 3,
        gallery: createGallery([
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
        ]),
        pricing: [
          { duration: '3 Hrs', price: 'Rs 2625' },
          { duration: '6 Hrs', price: 'Rs 2940' },
          { duration: '1 Day Stay', price: 'Rs 5199' },
        ],
        availability: 'Unavailable',
      },
      {
        name: 'Hotel Amber Amboli',
        locality: 'Amboli, Andheri West',
        rating: '4.1',
        reviews: 16,
        badge: 'TOP PICK',
        offer: 'Special savings on short stays',
        tags: ['Couple Friendly', 'Pay At Hotel'],
        features: ['Couple Friendly', 'Accepts Local ID'],
        amenities: ['Parking', 'AC', 'Bottle', 'Dining', 'TV', 'Wi-Fi'],
        moreAmenities: 5,
        gallery: createGallery([
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1200&q=80',
        ]),
        pricing: [
          { duration: '3 Hrs', price: 'Rs 1899' },
          { duration: '6 Hrs', price: 'Rs 2399' },
          { duration: '1 Day Stay', price: 'Rs 3899' },
        ],
        availability: 'View Deal',
      },
      {
        name: 'Metro Stay Andheri West',
        locality: 'Andheri West',
        rating: '4.2',
        reviews: 29,
        badge: 'PREMIUM',
        offer: 'Limited-time weekday offer',
        tags: ['Couple Friendly'],
        features: ['Couple Friendly', 'Accepts Local ID'],
        amenities: ['Parking', 'AC', 'Bottle', 'Dining', 'TV', 'Wi-Fi'],
        moreAmenities: 6,
        gallery: createGallery([
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
        ]),
        pricing: [
          { duration: '3 Hrs', price: 'Rs 2149' },
          { duration: '6 Hrs', price: 'Rs 2699' },
          { duration: '1 Day Stay', price: 'Rs 4399' },
        ],
        availability: 'View Deal',
      },
      {
        name: 'Asalpha Comfort Inn',
        locality: 'Asalpha, Andheri East',
        rating: '4.0',
        reviews: 11,
        badge: 'TOP PICK',
        offer: 'Book now and save more',
        tags: ['Couple Friendly', 'Pay At Hotel'],
        features: ['Couple Friendly', 'Accepts Local ID'],
        amenities: ['Parking', 'AC', 'Bottle', 'Dining', 'TV', 'Wi-Fi'],
        moreAmenities: 4,
        gallery: createGallery([
          'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=1200&q=80',
        ]),
        pricing: [
          { duration: '3 Hrs', price: 'Rs 1990' },
          { duration: '6 Hrs', price: 'Rs 2480' },
          { duration: '1 Day Stay', price: 'Rs 4099' },
        ],
        availability: 'View Deal',
      },
      {
        name: 'Bandra Bay Residency',
        locality: 'Bandra West',
        rating: '4.4',
        reviews: 45,
        badge: 'PREMIUM',
        offer: 'Exclusive discount with app booking',
        tags: ['Couple Friendly'],
        features: ['Couple Friendly', 'Accepts Local ID'],
        amenities: ['Parking', 'AC', 'Bottle', 'Dining', 'TV', 'Wi-Fi'],
        moreAmenities: 9,
        gallery: createGallery([
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
        ]),
        pricing: [
          { duration: '3 Hrs', price: 'Rs 2899' },
          { duration: '6 Hrs', price: 'Rs 3599' },
          { duration: '1 Day Stay', price: 'Rs 6399' },
        ],
        availability: 'Unavailable',
      },
      {
        name: 'Bhandup Lake View Hotel',
        locality: 'Bhandup',
        rating: '4.1',
        reviews: 13,
        badge: 'TOP PICK',
        offer: 'Comfort stays at wallet-friendly rates',
        tags: ['Couple Friendly', 'Pay At Hotel'],
        features: ['Couple Friendly', 'Accepts Local ID'],
        amenities: ['Parking', 'AC', 'Bottle', 'Dining', 'TV', 'Wi-Fi'],
        moreAmenities: 5,
        gallery: createGallery([
          'https://images.unsplash.com/photo-1505693536294-233b40443d5c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1521783988139-89397d761dce?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80',
        ]),
        pricing: [
          { duration: '3 Hrs', price: 'Rs 1799' },
          { duration: '6 Hrs', price: 'Rs 2299' },
          { duration: '1 Day Stay', price: 'Rs 3799' },
        ],
        availability: 'View Deal',
      },
      {
        name: 'Borivali East Grand',
        locality: 'Borivali East',
        rating: '4.2',
        reviews: 22,
        badge: 'PREMIUM',
        offer: 'Get extra value on longer bookings',
        tags: ['Couple Friendly'],
        features: ['Couple Friendly', 'Accepts Local ID'],
        amenities: ['Parking', 'AC', 'Bottle', 'Dining', 'TV', 'Wi-Fi'],
        moreAmenities: 6,
        gallery: createGallery([
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        ]),
        pricing: [
          { duration: '3 Hrs', price: 'Rs 2050' },
          { duration: '6 Hrs', price: 'Rs 2550' },
          { duration: '1 Day Stay', price: 'Rs 4299' },
        ],
        availability: 'View Deal',
      },
      {
        name: 'Borivali West Comfort Rooms',
        locality: 'Borivali West',
        rating: '4.0',
        reviews: 18,
        badge: 'TOP PICK',
        offer: 'Quick stays near transit points',
        tags: ['Couple Friendly', 'Pay At Hotel'],
        features: ['Couple Friendly', 'Accepts Local ID'],
        amenities: ['Parking', 'AC', 'Bottle', 'Dining', 'TV', 'Wi-Fi'],
        moreAmenities: 4,
        gallery: createGallery([
          'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=1200&q=80',
        ]),
        pricing: [
          { duration: '3 Hrs', price: 'Rs 1950' },
          { duration: '6 Hrs', price: 'Rs 2440' },
          { duration: '1 Day Stay', price: 'Rs 3999' },
        ],
        availability: 'View Deal',
      },
      {
        name: 'Royal Byculla Palace',
        locality: 'Byculla, South Mumbai',
        rating: '4.3',
        reviews: 27,
        badge: 'PREMIUM',
        offer: 'Elegant rooms with city access',
        tags: ['Couple Friendly'],
        features: ['Couple Friendly', 'Accepts Local ID'],
        amenities: ['Parking', 'AC', 'Bottle', 'Dining', 'TV', 'Wi-Fi'],
        moreAmenities: 7,
        gallery: createGallery([
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
        ]),
        pricing: [
          { duration: '3 Hrs', price: 'Rs 2760' },
          { duration: '6 Hrs', price: 'Rs 3340' },
          { duration: '1 Day Stay', price: 'Rs 5799' },
        ],
        availability: 'Unavailable',
      },
    ],
  },
  pune: {
    resultCount: 214,
    bannerImage:
      'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1400&q=80',
    tags: ['Couple Friendly', 'Free Cancellation'],
    filterAreas: ['Baner', 'Hinjawadi', 'Koregaon Park', 'Shivaji Nagar', 'Viman Nagar', 'Wakad'],
    hotels: [
      {
        name: 'Parklane Retreat',
        locality: 'Koregaon Park',
        rating: '4.4',
        reviews: 64,
        badge: 'PREMIUM',
        offer: 'Flat Rs 500 OFF on first stay',
        tags: ['Couple Friendly'],
        features: ['Couple Friendly', 'Pay At Hotel'],
        amenities: ['Parking', 'AC', 'Bottle', 'Dining', 'TV', 'Wi-Fi'],
        moreAmenities: 6,
        gallery: createGallery([
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80',
        ]),
        pricing: [
          { duration: '3 Hrs', price: 'Rs 1999' },
          { duration: '6 Hrs', price: 'Rs 2499' },
          { duration: '1 Day Stay', price: 'Rs 4199' },
        ],
        availability: 'View Deal',
      },
    ],
  },
  lucknow: {
    resultCount: 98,
    bannerImage:
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1400&q=80',
    tags: ['Budget Stays', 'Family Friendly'],
    filterAreas: ['Alambagh', 'Charbagh', 'Gomti Nagar', 'Hazratganj', 'Mahanagar'],
    hotels: [
      {
        name: 'Gomti Grand Rooms',
        locality: 'Gomti Nagar',
        rating: '4.3',
        reviews: 39,
        badge: 'TOP PICK',
        offer: 'Save more on weekday bookings',
        tags: ['Family Friendly'],
        features: ['Family Friendly', 'Local ID Accepted'],
        amenities: ['Parking', 'AC', 'Bottle', 'Dining', 'TV', 'Wi-Fi'],
        moreAmenities: 5,
        gallery: createGallery([
          'https://images.unsplash.com/photo-1505693536294-233b40443d5c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1521783988139-89397d761dce?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
        ]),
        pricing: [
          { duration: '3 Hrs', price: 'Rs 1499' },
          { duration: '6 Hrs', price: 'Rs 1899' },
          { duration: '1 Day Stay', price: 'Rs 3299' },
        ],
        availability: 'View Deal',
      },
    ],
  },
}

const DEFAULT_CITY_PAGE = {
  resultCount: 326,
  bannerImage:
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1400&q=80',
  tags: ['Couple Friendly', 'Pay At Hotel'],
  filterAreas: ['Airport Road', 'Business District', 'City Centre', 'Market Area'],
  hotels: [
    {
      name: 'ComfortPalace Signature Stay',
      locality: 'City Centre',
      rating: '4.4',
      reviews: 56,
      badge: 'PREMIUM',
      offer: 'Smart rates for hourly bookings',
      tags: ['Couple Friendly', 'Pay At Hotel'],
      features: ['Couple Friendly', 'Accepts Local ID'],
      amenities: ['Parking', 'AC', 'Bottle', 'Dining', 'TV', 'Wi-Fi'],
      moreAmenities: 7,
      gallery: createGallery([
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
      ]),
      pricing: [
        { duration: '3 Hrs', price: 'Rs 1899' },
        { duration: '6 Hrs', price: 'Rs 2299' },
        { duration: '1 Day Stay', price: 'Rs 3999' },
      ],
      availability: 'View Deal',
    },
  ],
}

const AMENITY_ICONS = {
  Parking: 'P',
  AC: 'AC',
  Bottle: 'B',
  Dining: 'D',
  TV: 'TV',
  'Wi-Fi': 'Wi',
  Lounge: 'L',
}

function formatCity(city) {
  if (!city) return 'All Cities'
  return city
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

function normalizeValue(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function matchesAreaFilter(hotel, area) {
  const normalizedArea = normalizeValue(area)
  const hotelText = normalizeValue(`${hotel.locality} ${hotel.name}`)
  return normalizedArea
    .split(' ')
    .filter(Boolean)
    .every((part) => hotelText.includes(part))
}

function CityHotels() {
  const { city } = useParams()
  const pageCity = formatCity(city)
  const [hotels, setHotels] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTags, setSelectedTags] = useState([])
  const [areaSearch, setAreaSearch] = useState('')
  const [selectedAreas, setSelectedAreas] = useState([])
  const [selectedDurations, setSelectedDurations] = useState([])
  const [activeImages, setActiveImages] = useState({})

  useEffect(() => {
    let isMounted = true

    const loadHotels = async () => {
      try {
        setIsLoading(true)
        const cityKey = pageCity || ''
        let response = null

        console.log('Loading hotels for city:', cityKey)

        if (cityKey) {
          response = await hotelApi.getPublishedHotelsByCity(cityKey).catch((err) => {
            console.error('Error fetching published hotels:', err)
            return null
          })
          if (!response) {
            response = await hotelApi.getHotelsByCity(cityKey).catch((err) => {
              console.error('Error fetching hotels by city:', err)
              return null
            })
          }
        } else {
          response = await hotelApi.searchHotels('').catch((err) => {
            console.error('Error searching hotels:', err)
            return null
          })
        }

        console.log('API response:', response)

        const normalizedHotels = Array.isArray(response)
          ? response
          : Array.isArray(response?.content)
            ? response.content
            : Array.isArray(response?.data)
              ? response.data
              : []

        console.log('Normalized hotels:', normalizedHotels)

        if (isMounted) {
          setHotels(normalizedHotels)
        }
      } catch (error) {
        console.error('Error in loadHotels:', error)
        if (isMounted) {
          setHotels([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadHotels()

    return () => {
      isMounted = false
    }
  }, [pageCity])

  const cityData = useMemo(() => {
    const base = city ? CITY_PAGE_DATA[city.toLowerCase()] ?? DEFAULT_CITY_PAGE : DEFAULT_CITY_PAGE
    const apiHotels = hotels.map((hotel) => {
      const hasUploadedImage = Boolean(hotel.thumbnailImage || hotel.coverImage)
      const hotelImageUrl = hotel.id && hasUploadedImage ? hotelApi.getHotelImage(hotel.id) : null

      return {
        name: hotel.hotelName ?? hotel.name ?? 'Unnamed Hotel',
        locality: hotel.area || hotel.address || hotel.city || 'City location',
        rating: Number(hotel.rating ?? 0).toFixed(1),
        reviews: hotel.totalReviews ?? 0,
        badge: hotel.hotelType ?? 'NEW',
        offer: 'Freshly listed on ComfortPlace',
        tags: [
          ...(hotel.coupleFriendly ? ['Couple Friendly'] : []),
          ...(hotel.localIdAccepted ? ['Accepts Local ID'] : []),
        ],
        features: [
          ...(hotel.coupleFriendly ? ['Couple Friendly'] : []),
          ...(hotel.localIdAccepted ? ['Accepts Local ID'] : []),
        ],
        amenities: (hotel.amenities ?? []).map((amenity) => amenity.name).filter(Boolean),
        moreAmenities: 0,
        id: hotel.id,
        imageUrl: hotel.imageUrl,
        gallery: createGallery(
          hotelImageUrl
            ? [hotelImageUrl]
            : [HOTEL_IMAGE_FALLBACK, HOTEL_IMAGE_FALLBACK, HOTEL_IMAGE_FALLBACK, HOTEL_IMAGE_FALLBACK]
        ),
        pricing: [
          { duration: '3 Hrs', price: 'Contact hotel' },
          { duration: '6 Hrs', price: 'Contact hotel' },
          { duration: '1 Day Stay', price: 'Contact hotel' },
        ],
        availability: 'View Deal',
      }
    })

    return {
      ...base,
      hotels: hotels.length > 0 ? apiHotels : [],
    }
  }, [city, hotels])

  const visibleAreas = cityData.filterAreas.filter((area) =>
    normalizeValue(area).includes(normalizeValue(areaSearch))
  )

  const filteredHotels = cityData.hotels.filter((hotel) => {
    const hotelTags = hotel.tags ?? []
    const tagMatch =
      selectedTags.length === 0 || selectedTags.every((tag) => hotelTags.includes(tag))
    const areaMatch =
      selectedAreas.length === 0 || selectedAreas.some((area) => matchesAreaFilter(hotel, area))
    const durationMatch =
      selectedDurations.length === 0 ||
      selectedDurations.every((duration) =>
        hotel.pricing.some((option) => option.duration === duration)
      )

    return tagMatch && areaMatch && durationMatch
  })

  const toggleValue = (value, selectedValues, setter) => {
    setter(
      selectedValues.includes(value)
        ? selectedValues.filter((item) => item !== value)
        : [...selectedValues, value]
    )
  }

  const getHotelKey = (hotel, index) => hotel.id ?? hotel.name ?? `hotel-${index}`

  const getActiveImageIndex = (hotel, index) => activeImages[getHotelKey(hotel, index)] ?? 0

  const changeHotelImage = (hotel, imageCount, direction, index) => {
    const key = getHotelKey(hotel, index)
    setActiveImages((current) => {
      const activeIndex = current[key] ?? 0
      const nextIndex = (activeIndex + direction + imageCount) % imageCount
      return { ...current, [key]: nextIndex }
    })
  }

  const selectHotelImage = (hotel, index, hotelIndex) => {
    const key = getHotelKey(hotel, hotelIndex)
    setActiveImages((current) => ({ ...current, [key]: index }))
  }

  return (
    <main className="cp-city-hotels-page">
      <div className="cp-city-results-wrap">
        <nav className="cp-city-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>&gt;</span>
          <span>{pageCity} Hotels</span>
        </nav>

        <div className="cp-city-results-layout">
          <aside className="cp-city-filters">
            <section className="cp-filter-card">
              <div className="cp-filter-header">
                <h3>Popular Tags</h3>
                <button type="button" onClick={() => setSelectedTags([])}>
                  Clear
                </button>
              </div>
              <div className="cp-tag-list">
                {cityData.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={
                      selectedTags.includes(tag)
                        ? 'cp-filter-pill cp-filter-pill-active'
                        : 'cp-filter-pill'
                    }
                    onClick={() => toggleValue(tag, selectedTags, setSelectedTags)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </section>

            <section className="cp-filter-card">
              <div className="cp-filter-header">
                <h3>Areas</h3>
                <button
                  type="button"
                  onClick={() => {
                    setAreaSearch('')
                    setSelectedAreas([])
                  }}
                >
                  Clear
                </button>
              </div>
              <label className="cp-filter-search">
                <span>o</span>
                <input
                  type="text"
                  value={areaSearch}
                  onChange={(event) => setAreaSearch(event.target.value)}
                  placeholder={`Search areas in ${pageCity.toLowerCase()}`}
                  aria-label={`Search areas in ${pageCity}`}
                />
              </label>
              <div className="cp-area-filter-list">
                {visibleAreas.map((area) => (
                  <label key={area} className="cp-filter-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedAreas.includes(area)}
                      onChange={() => toggleValue(area, selectedAreas, setSelectedAreas)}
                    />
                    <span>{area}</span>
                  </label>
                ))}
              </div>
            </section>

            <section className="cp-filter-card">
              <div className="cp-filter-header">
                <h3>Price</h3>
                <button type="button" onClick={() => setSelectedDurations([])}>
                  Clear
                </button>
              </div>
              <div className="cp-duration-list">
                {['3 Hrs', '6 Hrs', '12 Hrs', '1 Day Stay'].map((duration) => (
                  <label key={duration} className="cp-filter-checkbox cp-filter-checkbox-inline">
                    <input
                      type="checkbox"
                      checked={selectedDurations.includes(duration)}
                      onChange={() => toggleValue(duration, selectedDurations, setSelectedDurations)}
                    />
                    <span>{duration}</span>
                  </label>
                ))}
              </div>
              <p className="cp-filter-sort">Sort By Price</p>
            </section>
          </aside>

          <section className="cp-city-results-main">
            <div className="cp-city-banner">
              <img className="cp-city-banner-image" src={cityData.bannerImage} alt="" />
              <h2>Book From Best Hourly Hotels In {pageCity}</h2>
            </div>

            <header className="cp-city-results-header">
              <h1>
                {isLoading
                  ? `Loading hotels in ${pageCity}...`
                  : `Showing ${filteredHotels.length} Hourly Hotels in ${pageCity}`}
              </h1>
            </header>

            {isLoading && (
              <div className="cp-no-results">
                <h3>Loading hotels...</h3>
                <p>Please wait while we fetch the latest options for {pageCity}.</p>
              </div>
            )}

            {!isLoading && filteredHotels.length > 0 && (
              <div className="cp-city-results-list">
                {filteredHotels.map((hotel, hotelIndex) => {
                  const activeImageIndex = getActiveImageIndex(hotel, hotelIndex)
                  const primaryImage = hotel.gallery[activeImageIndex]
                  const thumbs = hotel.gallery.map((thumb, index) => ({ ...thumb, index }))
                  const hotelKey = getHotelKey(hotel, hotelIndex)

                  return (
                    <article key={hotelKey} className="cp-results-card">
                    <div className="cp-results-gallery">
                      <div className="cp-results-main-image-wrap">
                        <button
                          type="button"
                          className="cp-gallery-nav cp-gallery-nav-left"
                          onClick={() => changeHotelImage(hotel, hotel.gallery.length, -1, hotelIndex)}
                        >
                          {'<'}
                        </button>
                        <img
                          className="cp-results-main-image"
                          src={primaryImage.image}
                          alt={`${hotel.name} room preview`}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.onerror = null
                            event.currentTarget.src = HOTEL_IMAGE_FALLBACK
                          }}
                        />
                        <button
                          type="button"
                          className="cp-gallery-nav cp-gallery-nav-right"
                          onClick={() => changeHotelImage(hotel, hotel.gallery.length, 1, hotelIndex)}
                        >
                          {'>'}
                        </button>
                      </div>

                      <div className="cp-results-thumbs">
                        {thumbs.map((thumb) => (
                          <button
                            key={`${hotelKey}-${thumb.index}`}
                            type="button"
                            className={
                              thumb.index === activeImageIndex
                                ? 'cp-results-thumb-button cp-results-thumb-button-active'
                                : 'cp-results-thumb-button'
                            }
                            onClick={() => selectHotelImage(hotel, thumb.index, hotelIndex)}
                          >
                            <img
                              className="cp-results-thumb"
                              src={thumb.image}
                              alt={`${hotel.name} thumbnail ${thumb.index + 1}`}
                              loading="lazy"
                              onError={(event) => {
                                event.currentTarget.onerror = null
                                event.currentTarget.src = HOTEL_IMAGE_FALLBACK
                              }}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="cp-results-content">
                      <div className="cp-results-topline">
                        <span className="cp-rating-badge">
                          Rating {hotel.rating} ({hotel.reviews})
                        </span>
                        <span className="cp-premium-badge">{hotel.badge}</span>
                      </div>

                      {hotel.id ? <Link className="cp-results-hotel-link" to={`/hotels/${hotel.id}`}>{hotel.name}</Link> : <h3>{hotel.name}</h3>}
                      <p className="cp-results-locality">{hotel.locality}</p>

                      <div className="cp-results-feature-row">
                        {hotel.features.map((feature) => (
                          <span key={feature} className="cp-results-feature">
                            {feature}
                          </span>
                        ))}
                      </div>

                      <div className="cp-results-amenities">
                        {hotel.amenities.map((amenity) => (
                          <span key={amenity} className="cp-results-amenity" title={amenity}>
                            <span className="cp-results-amenity-icon">
                              {AMENITY_ICONS[amenity] ?? amenity.charAt(0)}
                            </span>
                            <span>{amenity}</span>
                          </span>
                        ))}
                        <span className="cp-results-more">+{hotel.moreAmenities} more</span>
                      </div>

                      <div className="cp-results-pricing-row">
                        <div className="cp-results-price-list">
                          {hotel.pricing.map((option) => (
                            <article key={option.duration} className="cp-price-box">
                              <strong>{option.price}</strong>
                              <span>{option.duration}</span>
                            </article>
                          ))}
                          <article className="cp-price-box cp-price-box-unavailable">
                            <strong>Unavailable</strong>
                            <span>9 Hrs</span>
                          </article>
                        </div>
                      </div>
                      {hotel.id && <Link className="cp-results-view-rooms" to={`/hotels/${hotel.id}`}>View rooms & details →</Link>}
                    </div>
                    </article>
                  )
                })}
              </div>
            )}

            {!isLoading && filteredHotels.length === 0 && (
              <div className="cp-no-results">
                <h3>No hotels match these filters.</h3>
                <p>Try clearing one or two filters to see more stays in {pageCity}.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}

export default CityHotels
