export interface User {
  id: string
  email: string
  username: string
  full_name?: string
  avatar_url?: string
  loyalty_points: number
  loyalty_tier: 'bronze' | 'silver' | 'gold' | 'diamond'
  korean_culture_interests?: string[]
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  category: string
  brand: string
  korean_brand: boolean
  images: string[]
  in_stock: boolean
  stock_quantity: number
  tags: string[]
  seoul_shipping: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  currency: string
  shipping_address: Record<string, unknown>
  order_items: OrderItem[]
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  product?: Product
}

export interface CommunityPost {
  id: string
  user_id: string
  content: string
  images?: string[]
  tags?: string[]
  likes_count: number
  comments_count: number
  created_at: string
  user?: User
}

export interface LoyaltyReward {
  id: string
  name: string
  description: string
  points_required: number
  category: string
  available: boolean
  limited_quantity?: number
  image_url?: string
}

export interface SeoulTripRaffle {
  id: string
  name: string
  description: string
  start_date: string
  end_date: string
  max_entries: number
  current_entries: number
  winner_id?: string
  status: 'upcoming' | 'active' | 'ended'
}