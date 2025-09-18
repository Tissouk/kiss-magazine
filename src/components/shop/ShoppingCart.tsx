'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  XMarkIcon,
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
  TruckIcon,
  StarIcon,
  GiftIcon
} from '@heroicons/react/24/outline';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  currency: string;
  selectedSize?: string;
  selectedColor?: string;
  quantity: number;
  koreanBrand: boolean;
  maxQuantity: number;
}

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShoppingCart({ isOpen, onClose }: ShoppingCartProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  // Mock cart data
  useEffect(() => {
    const mockItems: CartItem[] = [
      {
        id: '1',
        productId: 'korean-glass-skin-serum',
        name: 'Korean Glass Skin Serum Set',
        slug: 'korean-glass-skin-serum-set',
        image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=200',
        price: 79.99,
        currency: 'USD',
        selectedSize: '50ml',
        quantity: 1,
        koreanBrand: true,
        maxQuantity: 5
      },
      {
        id: '2',
        productId: 'oversized-korean-hoodie',
        name: 'Oversized Korean Streetwear Hoodie',
        slug: 'oversized-korean-streetwear-hoodie',
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200',
        price: 89.99,
        currency: 'USD',
        selectedSize: 'L',
        selectedColor: 'Black',
        quantity: 2,
        koreanBrand: true,
        maxQuantity: 3
      }
    ];
    setCartItems(mockItems);
  }, []);

  const updateQuantity = (itemId: string, newQuantity: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === itemId
          ? { ...item, quantity: Math.max(0, Math.min(newQuantity, item.maxQuantity)) }
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  const removeItem = (itemId: string) => {
    setCartItems(items => items.filter(item => item.id !== itemId));
  };

  const applyPromoCode = () => {
    const validCodes = ['KBEAUTY10', 'SEOUL20', 'NEWBIE15'];
    if (validCodes.includes(promoCode.toUpperCase())) {
      setAppliedPromo(promoCode.toUpperCase());
      setPromoCode('');
    }
  };

  const getPromoDiscount = () => {
    const discounts = {
      'KBEAUTY10': 0.10,
      'SEOUL20': 0.20,
      'NEWBIE15': 0.15
    };
    return appliedPromo ? discounts[appliedPromo as keyof typeof discounts] || 0 : 0;
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const promoDiscount = subtotal * getPromoDiscount();
  const shippingCost = subtotal >= 50 ? 0 : 12.99;
  const total = subtotal - promoDiscount + shippingCost;

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={onClose}
        />
      )}

      {/* Cart Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <ShoppingBagIcon className="h-6 w-6" />
              <span>Your Cart ({cartItems.length})</span>
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBagIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-6">Discover amazing Korean products to add</p>
                <Link
                  href="/shop"
                  onClick={onClose}
                  className="bg-korean-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-korean-600 transition-colors"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <Link
                            href={`/shop/${item.slug}`}
                            onClick={onClose}
                            className="font-medium text-gray-900 hover:text-korean-500 transition-colors line-clamp-2"
                          >
                            {item.name}
                          </Link>
                          
                          {item.koreanBrand && (
                            <span className="inline-block bg-korean-100 text-korean-700 px-2 py-1 rounded-full text-xs font-medium mt-1">
                              🇰🇷 Korean Brand
                            </span>
                          )}
                          
                          <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
                            {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                            {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <XMarkIcon className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-korean-500 transition-colors"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          
                          <span className="font-medium text-gray-900 min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.maxQuantity}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-korean-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <span className="font-bold text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Promo Code Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                    <GiftIcon className="h-5 w-5 text-korean-500" />
                    <span>Promo Code</span>
                  </h3>
                  
                  {appliedPromo ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-green-700 font-medium">{appliedPromo}</span>
                          <p className="text-green-600 text-sm">
                            {(getPromoDiscount() * 100).toFixed(0)}% discount applied
                          </p>
                        </div>
                        <button
                          onClick={() => setAppliedPromo(null)}
                          className="text-green-700 hover:text-green-800"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Enter promo code"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-korean-500 focus:border-transparent"
                      />
                      <button
                        onClick={applyPromoCode}
                        className="bg-korean-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-korean-600 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                  
                  <div className="mt-3 text-sm text-gray-500">
                    Try: KBEAUTY10, SEOUL20, NEWBIE15
                  </div>
                </div>

                {/* Shipping Info */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TruckIcon className="h-5 w-5 text-blue-500" />
                    <span className="font-medium text-blue-900">Shipping from Seoul</span>
                  </div>
                  {shippingCost > 0 ? (
                    <p className="text-blue-700 text-sm">
                      Add {formatPrice(50 - subtotal)} more for free shipping!
                    </p>
                  ) : (
                    <p className="text-blue-700 text-sm">
                      🎉 You qualify for free international shipping!
                    </p>
                  )}
                  <p className="text-blue-600 text-xs mt-1">
                    Estimated delivery: 10-14 business days
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 p-6 space-y-4">
              {/* Order Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedPromo})</span>
                    <span>-{formatPrice(promoDiscount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shippingCost > 0 ? formatPrice(shippingCost) : 'Free'}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                onClick={onClose}
                className="w-full bg-korean-500 text-white py-4 px-6 rounded-lg font-medium hover:bg-korean-600 transition-colors text-center block"
              >
                Proceed to Checkout
              </Link>
              
              <Link
                href="/shop"
                onClick={onClose}
                className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center block"
              >
                Continue Shopping
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}