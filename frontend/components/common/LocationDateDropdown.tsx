'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Search, MapPin, Calendar, Loader2 } from 'lucide-react';
import { useLocationStore } from '@/store/useLocationStore';
import { useCampaignDatesStore } from '@/store/useCampaignDatesStore';
import DateRangePicker from './DateRangePicker';
import { useRouter } from 'next/navigation';
import {
  getCityFromCoordinates,
  getCitySuggestions,
  checkApiKey,
} from '@/lib/googlePlaces';

interface LocationDateDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'location' | 'dates';
}

const cities = [
  { id: 'Mumbai', name: 'Mumbai', icon: '🏛️' },
  { id: 'Delhi', name: 'Delhi-NCR', icon: '🏛️' },
  { id: 'Bengaluru', name: 'Bengaluru', icon: '🏛️' },
  { id: 'Ahmedabad', name: 'Ahmedabad', icon: '🕌' },
  { id: 'Chandigarh', name: 'Chandigarh', icon: '✋' },
  { id: 'Chennai', name: 'Chennai', icon: '🛕' },
  { id: 'Kolkata', name: 'Kolkata', icon: '🏛️' },
  { id: 'Kochi', name: 'Kochi', icon: '🌴' },
  { id: 'Pune', name: 'Pune', icon: '🏛️' },
];

export default function LocationDateDropdown({ isOpen, onClose, mode = 'location' }: LocationDateDropdownProps) {
  const { selectedCity, setSelectedCity } = useLocationStore();
  const { startDate, endDate } = useCampaignDatesStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState<Array<{ name: string; placeId: string; description: string }>>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // City coordinates mapping
  const cityCoordinates: Record<string, { lat: number; lng: number }> = {
    'Mumbai': { lat: 19.0760, lng: 72.8777 },
    'Bengaluru': { lat: 12.9716, lng: 77.5946 },
    'Delhi': { lat: 28.6139, lng: 77.2090 },
    'Chennai': { lat: 13.0827, lng: 80.2707 },
    'Kolkata': { lat: 22.5726, lng: 88.3639 },
    'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
    'Chandigarh': { lat: 30.7333, lng: 76.7794 },
    'Kochi': { lat: 9.9312, lng: 76.2673 },
    'Pune': { lat: 18.5204, lng: 73.8567 },
  };

  // Fallback method using city coordinates (when Google API is not available)
  const getCityFromCoordinatesFallback = async (lat: number, lng: number): Promise<string | null> => {
    try {
      let nearestCity: string | null = null;
      let minDistance = Infinity;

      for (const [city, coords] of Object.entries(cityCoordinates)) {
        const distance = Math.sqrt(
          Math.pow(lat - coords.lat, 2) + Math.pow(lng - coords.lng, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestCity = city;
        }
      }

      return nearestCity;
    } catch (error) {
      console.error('Error getting city from coordinates:', error);
      return null;
    }
  };

  const handleDetectLocation = async () => {
    if (navigator.geolocation) {
      setIsDetecting(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Try Google Geocoding API first
          let city = await getCityFromCoordinates(latitude, longitude);
          
          // Fallback to distance-based method if Google API fails
          if (!city) {
            city = await getCityFromCoordinatesFallback(latitude, longitude);
          }
          
          if (city) {
            setSelectedCity(city);
            setSearchQuery('');
            onClose();
          }
          setIsDetecting(false);
        },
        (error) => {
          console.log('Location access denied or unavailable:', error);
          setIsDetecting(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    }
  };

  // Handle search query changes with Google Places Autocomplete
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length >= 2) {
        setIsLoadingSuggestions(true);
        setShowSuggestions(true); // Show loading state
        try {
          const suggestions = await getCitySuggestions(searchQuery);
          setCitySuggestions(suggestions);
          setShowSuggestions(suggestions.length > 0);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setCitySuggestions([]);
          setShowSuggestions(false);
        } finally {
          setIsLoadingSuggestions(false);
        }
      } else {
        setCitySuggestions([]);
        setShowSuggestions(false);
        setIsLoadingSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Filter popular cities based on search query
  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle city selection from Google suggestions
  const handleCitySuggestionClick = async (suggestion: { name: string; placeId: string; description: string }) => {
    setSelectedCity(suggestion.name);
    setSearchQuery('');
    setShowSuggestions(false);
    setCitySuggestions([]);
    onClose();
  };

  // Handle popular city selection
  const handlePopularCityClick = (cityId: string) => {
    setSelectedCity(cityId);
    setSearchQuery('');
    setShowSuggestions(false);
    setCitySuggestions([]);
    onClose();
  };

  const handleSearch = () => {
    router.push('/search');
    onClose();
  };

  // Check API key on mount (development only)
  useEffect(() => {
    if (isOpen && mode === 'location') {
      checkApiKey();
    }
  }, [isOpen, mode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Check if click is on suggestions dropdown
      if (suggestionsRef.current && suggestionsRef.current.contains(target)) {
        return;
      }
      
      // Close suggestions if clicking outside
      if (suggestionsRef.current && !suggestionsRef.current.contains(target)) {
        setShowSuggestions(false);
      }
      
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Check if click is not on the trigger button
        const isTriggerButton = target.closest('button[onclick*="setShowDropdown"]') || 
                               target.closest('[data-dropdown-trigger]');
        if (!isTriggerButton) {
          onClose();
          setShowSuggestions(false);
        }
      }
    };

    if (isOpen) {
      // Small delay to prevent immediate close on open
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl w-full max-w-[600px] mx-auto max-h-[80vh] overflow-y-auto z-50 border border-gray-200 animate-slide-down"
    >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'location' ? (selectedCity || 'Select Location') : 'Select Dates'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {mode === 'location' ? (
            <>
              {/* Search Bar */}
              <div className="relative" ref={suggestionsRef}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <input
                  type="text"
                  placeholder="Search for your city"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => {
                    if (citySuggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63] text-sm"
                />
                
                {/* Google Places Suggestions Dropdown */}
                {showSuggestions && searchQuery.length >= 2 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[60] max-h-60 overflow-y-auto">
                    {isLoadingSuggestions ? (
                      <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Searching...
                      </div>
                    ) : citySuggestions.length > 0 ? (
                      citySuggestions.map((suggestion) => (
                        <button
                          key={suggestion.placeId}
                          onClick={() => handleCitySuggestionClick(suggestion)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900">
                                {suggestion.name}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {suggestion.description}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        No cities found. Try a different search.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Detect Location */}
              <button
                onClick={handleDetectLocation}
                disabled={isDetecting}
                className="flex items-center gap-2 text-[#E91E63] hover:text-[#F50057] transition-colors disabled:opacity-50"
              >
                {isDetecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">Detecting...</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">Detect my location</span>
                  </>
                )}
              </button>

              {/* Popular Cities */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  Popular Cities
                </h3>
                {searchQuery.length < 2 && (
                  <div className="grid grid-cols-3 gap-4">
                    {filteredCities.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => handlePopularCityClick(city.id)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          selectedCity === city.id
                            ? 'border-[#E91E63] bg-[#E91E63]/5'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-3xl">{city.icon}</div>
                        <span className={`text-xs font-medium ${
                          selectedCity === city.id ? 'text-[#E91E63]' : 'text-gray-700'
                        }`}>
                          {city.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {searchQuery.length >= 2 && filteredCities.length === 0 && citySuggestions.length === 0 && !isLoadingSuggestions && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No cities found. Try searching with Google Places suggestions above.
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Date Selection */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-[#E91E63]" />
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    Select Campaign Dates
                  </h3>
                </div>
                <DateRangePicker />
              </div>
            </>
          )}
        </div>

        {/* Footer - Search Button */}
        {mode === 'location' && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
            <button
              onClick={handleSearch}
              className="w-full bg-gradient-to-r from-[#E91E63] to-[#F50057] text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all active:scale-[0.98]"
            >
              Search Billboards
            </button>
          </div>
        )}
    </div>
  );
}

