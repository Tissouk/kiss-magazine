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
  badges: UserBadge[];
  preferences: UserPreferences;
  createdAt: string
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

export interface UserPreferences {
  language: string;
  currency: string;
  categories: string[];
  notifications: NotificationSettings;
  export interface NotificationSettings {
  email: boolean;
  push: boolean;
  newProducts: boolean;
  communityUpdates: boolean;
  promotions: boolean;
}

export interface Influencer {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  followerCount: number;
  platform: 'instagram' | 'tiktok' | 'youtube';
  featuredProducts: Product[];
  discountCode: string;
  commissionRate: number;
  isActive: boolean;
}

export interface CommunityPost {
  id: string;
  userId: string;
  user: User;
  content: string;
  images: string[];
  tags: string[];
  likes: number;
  comments: CommunityComment[];
  pointsEarned: number;
  createdAt: Date;
  verified?: boolean;
}

export interface CommunityComment {
  id: string;
  userId: string;
  user: User;
  content: string;
  likes: number;
  createdAt: Date;
}

export interface LoyaltyTransaction {
  id: string;
  userId: string;
  points: number;
  type: 'earn' | 'redeem';
  action: string;
  description: string;
  createdAt: Date;

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  currency: 'USD' | 'EUR' | 'CNY' | 'JPY';
  category: string
  isKoreanBrand: boolean
  published: boolean
  featured: boolean
  rating: number
  reviewCount: number
  images: ProductImage[]
  sizes: string[];
  colors: ProductColor[];
  stockQuantity: number;
  badges: ProductBadge[];
  rating: number;
  reviewCount: number;
  createdAt: string
  shipping: ShippingInfo;
}

export interface ProductImage {
  id: string
  url: string
  alt: string
  isPrimary: boolean
}

export interface ProductColor {
  name: string;
  value: string;
  images: string[];
}

export interface ProductBadge {
  type: 'new' | 'trending' | 'limited' | 'korea-exclusive' | 'idol-approved';
  text: string;
  color: string;
}

export interface ShippingInfo {
  freeShippingThreshold: number;
  estimatedDays: number;
  countries: string[];
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

export interface Article {
  id: string;
  title: string;
  slug: string;
  category: 'K-POP' | 'K-DRAMA' | 'K-FASHION' | 'K-BEAUTY' | 'K-PLACES' | 'K-NEWS';
  excerpt: string;
  content: string;
  featuredImage: string;
  images?: string[];
  author: Author;
  publishedAt: Date;
  readTime: number;
  tags: string[];
  trending?: boolean;
  featured?: boolean;
}

export interface Author {
  id: string;
  name: string;
  avatar: string;
  bio: string;
}