export interface User {
  id: string
  email: string
  username?: string
  firstName?: string
  lastName?: string
  avatar?: string
  points: number
  level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond'
  koreanLanguageLearner: boolean
  preferredLanguage: string
  preferredCurrency: string
  countryCode?: string
  createdAt: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  currency: string
  category: string
  isKoreanBrand: boolean
  published: boolean
  featured: boolean
  rating: number
  reviewCount: number
  images: ProductImage[]
  createdAt: string
}

export interface ProductImage {
  id: string
  url: string
  alt: string
  isPrimary: boolean
}

export interface KoreanBrand {
  id: string
  name: string
  slug: string
  description?: string
  logoUrl?: string
  websiteUrl?: string
  instagramHandle?: string
  foundedYear?: number
  headquartersCity: string
  verified: boolean
}