'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, CheckCircle, Eye, Users, Target, ArrowLeft, Calendar, Share2, Heart, Building } from 'lucide-react';
import { AdSpace } from '@/types';
import { getAdSpaceById } from '@/lib/supabase/services';
import { useCartStore } from '@/store/useCartStore';
import CartNotification from '@/components/common/CartNotification';
import dynamic from 'next/dynamic';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

export default function AdSpaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [adSpace, setAdSpace] = useState<AdSpace | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [mounted, setMounted] = useState(false);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    setMounted(true);
    if (params.id) {
      fetchAdSpace(params.id as string);
    }
  }, [params.id]);

  const fetchAdSpace = async (id: string) => {
    try {
      const space = await getAdSpaceById(id);
      if (space) {
        setAdSpace(space);
      }
    } catch (error) {
      console.error('Error fetching ad space:', error);
      setAdSpace(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!adSpace || !startDate || !endDate) {
      alert('Please select start and end dates');
      return;
    }
    try {
      addItem(adSpace, startDate, endDate);
      setShowCartNotification(true);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E91E63] border-t-transparent" />
      </div>
    );
  }

  if (!adSpace) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Ad space not found</p>
          <button onClick={() => router.back()} className="text-[#E91E63] font-medium">
                Go back
              </button>
            </div>
          </div>
        );
      }

  return (
    <div className="bg-white min-h-screen">
      {/* Sticky Header */}
      <div className="sticky top-16 bg-white border-b border-gray-200 z-20">
        <div className="container-app px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to results
            </button>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Heart className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app px-6 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="col-span-2 space-y-4">
            {/* Main Image */}
            <div className="w-full h-[500px] bg-gray-200 rounded-2xl overflow-hidden">
              {adSpace.images && adSpace.images.length > 0 ? (
                <img
                  src={adSpace.images[0]}
                  alt={adSpace.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Building className="w-24 h-24" />
                </div>
              )}
            </div>

            {/* Info Sections */}
            <div className="space-y-6">
              {/* Title and Location */}
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{adSpace.title}</h1>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-5 h-5 text-[#E91E63]" />
                      <span className="text-lg">{adSpace.location?.address}</span>
                    </div>
                  </div>
                  {adSpace.category && (
                    <span className="bg-[#E91E63] text-white px-4 py-2 rounded-full text-sm font-medium">
                      {adSpace.category.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 leading-relaxed">{adSpace.description}</p>
              </div>

              {/* Audience & Reach */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Audience & Reach</h2>
                {(() => {
                  const days = startDate && endDate 
                    ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
                    : 1;
                  
                  // Get base values from ad space
                  const baseDailyImpressions = adSpace.daily_impressions || 0;
                  const baseMonthlyFootfall = adSpace.monthly_footfall || 0;
                  const baseDailyFootfall = Math.round(baseMonthlyFootfall / 30); // Convert monthly to daily
                  
                  // For movable ads with coverage area, scale by area (radius²)
                  let dailyImpressions = baseDailyImpressions;
                  let dailyFootfall = baseDailyFootfall;
                  
                  if (adSpace.route) {
                    const coverageRadius = adSpace.route.coverage_radius || adSpace.route.base_coverage_km || 5;
                    const baseCoverage = adSpace.route.base_coverage_km || 5;
                    
                    // Coverage area scales with radius squared (πr²)
                    // If radius doubles, area quadruples
                    const areaMultiplier = Math.pow(coverageRadius / baseCoverage, 2);
                    
                    // Scale impressions and footfall by area multiplier
                    dailyImpressions = Math.round(baseDailyImpressions * areaMultiplier);
                    dailyFootfall = Math.round(baseDailyFootfall * areaMultiplier);
                  }
                  
                  // Calculate totals based on campaign duration
                  const totalImpressions = dailyImpressions * days;
                  const totalFootfall = dailyFootfall * days;
                  
                  return (
                    <div className="grid grid-cols-3 gap-4">
                      <div className={`bg-blue-50 rounded-xl p-4 border transition-all duration-300 ${
                        days > 1 ? 'border-blue-300 shadow-md scale-[1.02]' : 'border-blue-100'
                      } relative`}>
                        {days > 1 && (
                          <div className="absolute -top-2 -right-2 bg-[#4CAF50] text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
                            ×{days}
                          </div>
                        )}
                        <Eye className="w-8 h-8 text-blue-600 mb-3" />
                        <div className={`text-2xl font-bold mb-1 transition-all duration-300 ${
                          days > 1 ? 'text-blue-700 scale-105' : 'text-gray-900'
                        }`}>
                          {(() => {
                            const value = days > 1 ? totalImpressions : dailyImpressions;
                            if (value >= 1000) {
                              return `${(value / 1000).toFixed(0)}K+`;
                            } else if (value > 0) {
                              return `${value.toFixed(0)}+`;
                            } else {
                              return 'N/A';
                            }
                          })()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {days > 1 ? 'Total Impressions' : 'Daily Impressions'}
                        </div>
                        {adSpace.route && (
                          <div className="text-xs text-gray-600 mt-1">
                            Base: {(baseDailyImpressions / 1000).toFixed(0)}K → {(dailyImpressions / 1000).toFixed(0)}K
                          </div>
                        )}
                        {days > 1 && (
                          <div className="text-xs text-[#E91E63] font-medium mt-2">
                            {days} days × {dailyImpressions >= 1000 
                              ? `${(dailyImpressions / 1000).toFixed(0)}K` 
                              : dailyImpressions}/day
                          </div>
                        )}
                      </div>
                      <div className={`bg-purple-50 rounded-xl p-4 border transition-all duration-300 ${
                        days > 1 ? 'border-purple-300 shadow-md scale-[1.02]' : 'border-purple-100'
                      } relative`}>
                        {days > 1 && (
                          <div className="absolute -top-2 -right-2 bg-[#4CAF50] text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
                            ×{days}
                          </div>
                        )}
                        <Users className="w-8 h-8 text-purple-600 mb-3" />
                        <div className={`text-2xl font-bold mb-1 transition-all duration-300 ${
                          days > 1 ? 'text-purple-700 scale-105' : 'text-gray-900'
                        }`}>
                          {(() => {
                            const value = days > 1 ? totalFootfall : dailyFootfall;
                            if (value >= 1000) {
                              return `${(value / 1000).toFixed(0)}K+`;
                            } else if (value > 0) {
                              return `${value.toFixed(0)}+`;
                            } else {
                              return '0K+';
                            }
                          })()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {days > 1 ? 'Total Footfall' : 'Daily Footfall'}
                        </div>
                        {adSpace.route && (
                          <div className="text-xs text-gray-600 mt-1">
                            Base: {(baseDailyFootfall / 1000).toFixed(0)}K → {(dailyFootfall / 1000).toFixed(0)}K
                          </div>
                        )}
                        {days > 1 && (
                          <div className="text-xs text-[#E91E63] font-medium mt-2">
                            {days} days × {dailyFootfall >= 1000 
                              ? `${(dailyFootfall / 1000).toFixed(0)}K` 
                              : dailyFootfall}/day
                          </div>
                        )}
                      </div>
                      <div className="bg-pink-50 rounded-xl p-4 border border-pink-100">
                        <Target className="w-8 h-8 text-pink-600 mb-3" />
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {adSpace.target_audience}
                        </div>
                        <div className="text-sm text-gray-600">Target Audience</div>
                      </div>
                    </div>
                  );
                })()}
                {(() => {
                  const coverageRadius = adSpace.route?.coverage_radius || 5;
                  const baseCoverage = adSpace.route?.base_coverage_km || 5;
                  const increasePercent = ((coverageRadius - baseCoverage) / baseCoverage * 100).toFixed(1);
                  
                  if (coverageRadius > baseCoverage) {
                    return (
                      <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-[#4CAF50] rounded-full"></div>
                          <p className="text-sm font-semibold text-green-800">
                            Coverage Increased by {coverageRadius - baseCoverage} km
                          </p>
                        </div>
                        <p className="text-xs text-green-700">
                          Your reach has increased by {increasePercent}% due to expanded coverage area
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}
                {startDate && endDate && (() => {
                  const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
                  if (days > 1) {
                    return (
                      <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-[#E91E63]" />
                          <p className="text-sm font-semibold text-blue-800">
                            Campaign Duration: {days} days
                          </p>
                        </div>
                        <p className="text-xs text-blue-700">
                          Total impressions will be {days}x the daily impressions for your campaign period
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Location Map */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Location</h2>
                <div className="h-64 bg-gray-200 rounded-xl overflow-hidden">
                  {mounted && (
                    <MapContainer
                      center={[adSpace.latitude, adSpace.longitude]}
                      zoom={15}
                      style={{ height: '100%', width: '100%' }}
                      scrollWheelZoom={false}
                    >
                      <TileLayer
                        attribution='&copy; OpenStreetMap'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[adSpace.latitude, adSpace.longitude]} />
                    </MapContainer>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 card-shadow-lg">
                {/* Price */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatPrice(adSpace.price_per_day)}
                    </span>
                    <span className="text-gray-600">/day</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatPrice(adSpace.price_per_month)} per month
                  </div>
                </div>

                {/* Availability */}
                {adSpace.availability_status === 'available' && (
                  <div className="flex items-center gap-2 text-[#4CAF50] mb-6 pb-6 border-b border-gray-200">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Available for booking</span>
                  </div>
                )}

                {/* Date Selection */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1 text-[#E91E63]" />
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1 text-[#E91E63]" />
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || new Date().toISOString().split('T')[0]}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                    />
                  </div>
                </div>

                {/* Total Calculation */}
                {startDate && endDate && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium text-gray-900">
                        {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Cost</span>
                      <span className="font-bold text-lg text-gray-900">
                        {formatPrice(
                          adSpace.price_per_day *
                          Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {/* Book Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={!startDate || !endDate}
                  className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
                    startDate && endDate
                      ? 'bg-gradient-to-r from-[#E91E63] to-[#F50057] text-white hover:shadow-lg active:scale-[0.98]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Add to Cart
                </button>

                {/* Quick Info */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#4CAF50]" />
                    <span>Instant confirmation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#4CAF50]" />
                    <span>Flexible cancellation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#4CAF50]" />
                    <span>24/7 support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Notification */}
      <CartNotification
        isVisible={showCartNotification}
        onClose={() => setShowCartNotification(false)}
        adSpaceTitle={adSpace?.title}
      />
    </div>
  );
}
