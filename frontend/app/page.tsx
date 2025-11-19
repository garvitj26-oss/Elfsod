'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, SlidersHorizontal, Palette, Wand2 } from 'lucide-react';
import AdSpaceCard from '@/components/common/AdSpaceCard';
import FilterPanel from '@/components/filters/FilterPanel';
import { AdSpace } from '@/types';
import { getAdSpaces, getCategories } from '@/lib/supabase/services';
import { useLocationStore } from '@/store/useLocationStore';
import { useCampaignDatesStore } from '@/store/useCampaignDatesStore';
import Link from 'next/link';

interface FilterState {
  priceRange: { min: number; max: number };
  footfallRange: { min: number; max: number };
  sortBy: 'none' | 'price_low' | 'price_high' | 'footfall_low' | 'footfall_high';
  location?: string;
  locationCategories?: string[];
  displayType?: string;
  publisher?: string;
  publishers?: string[];
  purchaseCategories?: string[];
  audienceTypes?: string[];
  affluenceTiers?: string[];
  ageGroups?: string[];
  weekBias?: string[];
  spendLevels?: string[];
}

export default function HomePage() {
  const [adSpaces, setAdSpaces] = useState<AdSpace[]>([]);
  const [filteredAdSpaces, setFilteredAdSpaces] = useState<AdSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterState | null>(null);
  const selectedCity = useLocationStore((state) => state.selectedCity);
  const { startDate, endDate } = useCampaignDatesStore();

  useEffect(() => {
    fetchAdSpaces();
  }, [selectedCity]); // Refetch when city changes

  // Filter ad spaces when dates or filters change
  useEffect(() => {
    if (adSpaces.length > 0) {
      let filtered = [...adSpaces]; // Start with all ad spaces
      
      // City filter is already applied in fetchAdSpaces, so we don't need to filter again
      
      // Filter by availability dates if dates are selected
      // Note: In a real app, you'd check against bookings table
      // For now, we'll just filter by availability_status
      if (startDate && endDate) {
        // Filter spaces that are available
        filtered = filtered.filter(space => 
          space.availability_status === 'available'
        );
      }
      
      // Apply additional filters
      if (appliedFilters) {
        // Price range filter
        filtered = filtered.filter(space =>
          space.price_per_day >= appliedFilters.priceRange.min &&
          space.price_per_day <= appliedFilters.priceRange.max
        );
        
        // Footfall range filter
        filtered = filtered.filter(space =>
          space.daily_impressions >= appliedFilters.footfallRange.min &&
          space.daily_impressions <= appliedFilters.footfallRange.max
        );
        
        // Location filter (if different from selected city)
        if (appliedFilters.location && appliedFilters.location !== selectedCity) {
          filtered = filtered.filter(space =>
            space.location?.city === appliedFilters.location
          );
        }
        
        // Display type filter
        if (appliedFilters.displayType) {
          filtered = filtered.filter(space =>
            space.display_type === appliedFilters.displayType
          );
        }
        
        // Publishers filter
        if (appliedFilters.publishers && appliedFilters.publishers.length > 0) {
          filtered = filtered.filter(space =>
            appliedFilters.publishers!.includes(space.publisher_id)
          );
        }
        
        // Sort
        if (appliedFilters.sortBy !== 'none') {
          filtered = [...filtered].sort((a, b) => {
            switch (appliedFilters.sortBy) {
              case 'price_low':
                return a.price_per_day - b.price_per_day;
              case 'price_high':
                return b.price_per_day - a.price_per_day;
              case 'footfall_low':
                return a.daily_impressions - b.daily_impressions;
              case 'footfall_high':
                return b.daily_impressions - a.daily_impressions;
              default:
                return 0;
            }
          });
        }
      }
      
      setFilteredAdSpaces(filtered.length > 0 ? filtered : adSpaces);
    } else {
      // If no ad spaces loaded yet, set empty array
      setFilteredAdSpaces([]);
    }
  }, [adSpaces, appliedFilters, startDate, endDate]);

  const fetchAdSpaces = async () => {
    setLoading(true);
    try {
      const filters: any = {
        availabilityStatus: 'available',
      };

      if (selectedCity) {
        filters.city = selectedCity;
      }

      console.log('🔍 Fetching ad spaces with filters:', filters);
      
      // Use Next.js API route (server-side, no CORS issues)
      let spaces: AdSpace[] = [];
      
      try {
        // Use Next.js API route (built into the app)
        const params = new URLSearchParams();
        if (filters.city) params.append('city', filters.city);
        if (filters.categoryId) params.append('categoryId', filters.categoryId);
        if (filters.publisherId) {
          const publisherIds = Array.isArray(filters.publisherId) 
            ? filters.publisherId.join(',') 
            : filters.publisherId;
          params.append('publisherId', publisherIds);
        }
        if (filters.displayType) params.append('displayType', filters.displayType);
        if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
        if (filters.minFootfall) params.append('minFootfall', filters.minFootfall.toString());
        if (filters.maxFootfall) params.append('maxFootfall', filters.maxFootfall.toString());
        if (filters.searchQuery) params.append('searchQuery', filters.searchQuery);
        if (filters.availabilityStatus) params.append('availabilityStatus', filters.availabilityStatus);
        params.append('limit', '100');

        // Try Next.js API route first, fallback to direct service
        try {
          const response = await fetch(`/api/ad-spaces?${params.toString()}`);
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              spaces = result.data;
              console.log('✅ Fetched', spaces.length, 'ad spaces via Next.js API route:', spaces);
            } else {
              throw new Error('Next.js API route returned unsuccessful response');
            }
          } else {
            throw new Error(`Next.js API route returned ${response.status}`);
          }
        } catch (apiError) {
          console.warn('⚠️ Next.js API route failed, trying direct service:', apiError);
          try {
            // Fallback to direct Supabase service call (browser-side)
            console.log('🔄 Attempting browser-side direct connection...');
            spaces = await getAdSpaces(filters);
            console.log('✅ Fetched', spaces.length, 'ad spaces via direct service:', spaces);
          } catch (directError) {
            console.error('❌ All connection methods failed:', directError);
            console.error('Error details:', {
              message: directError instanceof Error ? directError.message : String(directError),
              name: directError instanceof Error ? directError.name : 'Unknown',
            });
            
            // Check if it's a CORS error
            const errorMessage = directError instanceof Error ? directError.message : String(directError);
            if (errorMessage.includes('CORS') || errorMessage.includes('cors') || errorMessage.includes('Access-Control')) {
              console.error('🚫 CORS Error detected! Supabase may be blocking browser requests.');
              console.error('💡 Solution: Configure CORS in Supabase dashboard or check project status.');
            }
            
            throw directError;
          }
        }
        
        setAdSpaces(spaces);
        setFilteredAdSpaces(spaces);
      } catch (error) {
        console.error('❌ Error fetching ad spaces:', error);
        setAdSpaces([]);
        setFilteredAdSpaces([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch categories from database - use Next.js API route
  // Refetch when city changes to update counts
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        let cats = [];
        
        try {
          // Use Next.js API route with city parameter for accurate counts
          // Logic: category + location = count of cards that will show
          const url = selectedCity 
            ? `/api/categories?city=${encodeURIComponent(selectedCity)}`
            : '/api/categories';
          
          const response = await fetch(url);
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              cats = result.data;
              console.log('✅ Fetched', cats.length, 'categories via API route', selectedCity ? `for ${selectedCity}` : '');
            } else {
              throw new Error('API route returned unsuccessful response');
            }
          } else {
            throw new Error(`API route returned ${response.status}`);
          }
        } catch (apiError) {
          console.warn('⚠️ API route failed, trying direct service:', apiError);
          // Fallback to direct service call
          try {
            cats = await getCategories();
            console.log('✅ Fetched', cats.length, 'categories via direct service');
          } catch (directError) {
            console.error('❌ Both API route and direct service failed:', directError);
            cats = [];
          }
        }

        // Map category names to emojis
        const getCategoryEmoji = (name: string): string => {
          const nameLower = name.toLowerCase();
          if (nameLower.includes('billboard')) return '📢';
          if (nameLower.includes('bus')) return '🚌';
          if (nameLower.includes('cinema') || nameLower.includes('film')) return '🎬';
          if (nameLower.includes('digital') || nameLower.includes('screen')) return '📺';
          if (nameLower.includes('pos') || nameLower.includes('point of sale') || nameLower.includes('retail')) return '🛒';
          if (nameLower.includes('transit') || nameLower.includes('metro') || nameLower.includes('train')) return '🚇';
          if (nameLower.includes('airport')) return '✈️';
          if (nameLower.includes('corporate') || nameLower.includes('office')) return '🏢';
          if (nameLower.includes('cafe') || nameLower.includes('restaurant')) return '☕';
          if (nameLower.includes('auto') || nameLower.includes('rickshaw')) return '🛺';
          if (nameLower.includes('mall')) return '🏬';
          return '📍'; // Default emoji
        };

        setCategories(cats.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          count: cat.ad_space_count || 0, // Use count from API (already filtered by location)
          parent_category_id: cat.parent_category_id || null, // Store parent_category_id to detect parent categories
          icon: null, // Can be added later
          emoji: getCategoryEmoji(cat.name), // Emoji fallback
          icon_url: cat.icon_url, // Store icon_url from database
          color: 'from-gray-600 to-gray-700',
          bgColor: 'bg-gray-50'
        })));
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, [selectedCity]); // Refetch categories when city changes to update counts

  // Use categories from database with updated counts
  const displayCategories = categories.length > 0 ? categories : [];

  const handleCategoryClick = async (categoryId: string, categoryName?: string) => {
    // Toggle selection: if clicking the same category, deselect it
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
      setLoading(true);
      
      // Fetch all ad spaces (reset filter)
      try {
        await fetchAdSpaces();
        console.log('✅ Category deselected - showing all ad spaces');
      } catch (error) {
        console.error('Error fetching all ad spaces:', error);
      } finally {
        setLoading(false);
      }
      return;
    }
    
    // Select new category
    setSelectedCategory(categoryId);
    setLoading(true);
    
    try {
      // Check if this is a parent category (has no parent_category_id)
      const clickedCategory = categories.find(cat => cat.id === categoryId);
      const isParentCategory = clickedCategory && (clickedCategory.parent_category_id === null || clickedCategory.parent_category_id === undefined);
      
      // Use the filter API to filter ad spaces by category
      const params = new URLSearchParams();
      if (categoryName) {
        // If it's a parent category, use parentCategoryName, otherwise use categoryName
        if (isParentCategory) {
          params.append('parentCategoryName', categoryName);
        } else {
          params.append('categoryName', categoryName);
        }
      } else {
        params.append('categoryIds', categoryId);
      }
      if (selectedCity) {
        params.append('city', selectedCity);
      }
      params.append('availabilityStatus', 'available');
      params.append('limit', '100');

      const response = await fetch(`/api/ad-spaces/filter?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setAdSpaces(result.data);
          setFilteredAdSpaces(result.data);
          console.log('✅ Filtered', result.data.length, 'ad spaces by', isParentCategory ? 'parent category' : 'category', ':', categoryName || categoryId);
        } else {
          console.warn('⚠️ No ad spaces found for category:', categoryName || categoryId);
          setAdSpaces([]);
          setFilteredAdSpaces([]);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Filter API error:', errorData);
        setAdSpaces([]);
        setFilteredAdSpaces([]);
      }
    } catch (error) {
      console.error('Error filtering ad spaces by category:', error);
      setAdSpaces([]);
      setFilteredAdSpaces([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#E91E63] via-[#F50057] to-[#E91E63] text-white">
        <div className="container-app px-6 py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered Campaign Planning</span>
            </div>
            <h1 className="text-5xl font-bold mb-4 leading-tight">
              Find Perfect Ad Spaces for Your Campaign
          </h1>
            <p className="text-xl text-white/90 mb-8">
              Discover, plan, and book advertising inventory across India with our intelligent platform
            </p>
            <div className="flex gap-4">
              <Link 
                href="/search"
                className="bg-white text-[#E91E63] px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
              >
                Explore Ad Spaces
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/ai-planner"
                className="bg-white/10 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
              >
                Try AI Planner
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container-app px-6 py-6">
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">500+</div>
              <div className="text-sm text-gray-600">Ad Spaces</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">50+</div>
              <div className="text-sm text-gray-600">Cities</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">1M+</div>
              <div className="text-sm text-gray-600">Daily Impressions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">98%</div>
              <div className="text-sm text-gray-600">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>


      <div className="container-app px-6 py-8">
        {/* Categories Grid - Always Show */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
              <p className="text-gray-600">Choose the type of advertising space you need</p>
            </div>
          </div>
          
          {categoriesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-50 p-6 rounded-2xl border-2 border-transparent animate-pulse">
                  <div className="w-16 h-16 bg-gray-200 rounded-xl mb-4 mx-auto"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : displayCategories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {displayCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id, category.name)}
                  className={`${category.bgColor} p-6 rounded-2xl border-2 transition-all group relative overflow-hidden ${
                    selectedCategory === category.id 
                      ? 'border-[#E91E63] shadow-lg scale-[1.02]' 
                      : 'border-transparent hover:border-gray-200 hover:shadow-md'
                  }`}
                >
                  {selectedCategory === category.id && (
                    <div className="absolute inset-0 bg-[#E91E63]/5" />
                  )}
                  <div className="relative">
                    <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center text-white mb-4 mx-auto group-hover:scale-110 transition-transform shadow-md p-3`}>
                      {category.icon_url ? (
                        <img 
                          src={category.icon_url} 
                          alt={category.name}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            // Fallback to emoji if image fails to load
                            e.currentTarget.style.display = 'none';
                            const emojiSpan = e.currentTarget.parentElement?.querySelector('.category-emoji');
                            if (emojiSpan) emojiSpan.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <span className={`text-3xl category-emoji ${category.icon_url ? 'hidden' : ''}`}>
                        {category.emoji || '📍'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm text-center">{category.name}</h3>
                    <p className="text-xs text-gray-600 text-center">{category.count} spaces</p>
                    {selectedCategory === category.id && (
                      <div className="mt-2 text-xs text-[#E91E63] font-medium text-center">
                        ✓ Selected
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
              <p className="text-gray-600 mb-2">No categories available</p>
              <p className="text-sm text-gray-500">Categories will appear here once they are added to the database.</p>
            </div>
          )}
        </section>

        {/* Featured Banner */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium mb-4">
                Limited Time Offer
              </div>
              <h2 className="text-3xl font-bold mb-3">Get 20% Off Your First Campaign</h2>
              <p className="text-lg text-white/90 mb-6">
                Book your ad spaces now and save big on your first campaign with our platform
              </p>
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                Claim Offer
              </button>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/10 to-transparent" />
          </div>
        </section>

        {/* All Ad Spaces - Single List */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Available Ad Spaces</h2>
              <p className="text-gray-600">Explore our complete inventory across India</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-[#E91E63] hover:text-[#E91E63] transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {appliedFilters && (() => {
                  let count = 0;
                  if (appliedFilters.priceRange.min !== 0 || appliedFilters.priceRange.max !== 100000) count++;
                  if (appliedFilters.footfallRange.min !== 0 || appliedFilters.footfallRange.max !== 1000000) count++;
                  if (appliedFilters.sortBy !== 'none') count++;
                  if (appliedFilters.location) count++;
                  if (appliedFilters.locationCategories && appliedFilters.locationCategories.length > 0) count++;
                  if (appliedFilters.displayType) count++;
                  if (appliedFilters.publishers && appliedFilters.publishers.length > 0) count++;
                  if (appliedFilters.purchaseCategories && appliedFilters.purchaseCategories.length > 0) count++;
                  if (appliedFilters.audienceTypes && appliedFilters.audienceTypes.length > 0) count++;
                  if (appliedFilters.affluenceTiers && appliedFilters.affluenceTiers.length > 0) count++;
                  if (appliedFilters.ageGroups && appliedFilters.ageGroups.length > 0) count++;
                  if (appliedFilters.weekBias && appliedFilters.weekBias.length > 0) count++;
                  if (appliedFilters.spendLevels && appliedFilters.spendLevels.length > 0) count++;
                  return count > 0 ? (
                    <span className="bg-[#E91E63] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {count}
                    </span>
                  ) : null;
                })()}
              </button>
              <Link 
                href="/search" 
                className="text-[#E91E63] font-medium hover:text-[#F50057] inline-flex items-center gap-1"
              >
                View on map
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white rounded-xl h-80 animate-pulse card-shadow" />
              ))}
            </div>
          ) : filteredAdSpaces.length === 0 ? (
            <div className="col-span-4 text-center py-12">
              <p className="text-gray-500 mb-2">
                {loading 
                  ? 'Loading ad spaces...'
                  : selectedCity 
                    ? `No ad spaces found in ${selectedCity}` 
                    : adSpaces.length === 0
                      ? 'No ad spaces available. Please check your database connection.'
                      : 'No ad spaces match your filters'}
              </p>
              <p className="text-sm text-gray-400">
                {loading 
                  ? 'Please wait...'
                  : selectedCity 
                    ? 'Try selecting a different city or clearing filters' 
                    : adSpaces.length === 0
                      ? 'Make sure you have run the seed_data.sql file in Supabase'
                      : 'Try adjusting your filters or selecting a location'}
              </p>
              {!loading && adSpaces.length === 0 && (
                <div className="mt-4 text-xs text-gray-500">
                  <p>Debug: Check browser console for errors</p>
                  <p>Total ad spaces in state: {adSpaces.length}</p>
                  <p>Filtered ad spaces: {filteredAdSpaces.length}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-6">
              {filteredAdSpaces.map((space) => (
                <AdSpaceCard key={space.id} adSpace={space} />
              ))}
            </div>
          )}
          
          {/* Location info */}
          {!loading && filteredAdSpaces.length > 0 && (
            <div className="mt-4 text-center text-sm text-gray-500">
              {selectedCity 
                ? `Showing ${filteredAdSpaces.length} ad spaces in ${selectedCity}`
                : `Showing ${filteredAdSpaces.length} ad spaces (select location to filter)`}
            </div>
          )}
        </section>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={(filters) => {
          setAppliedFilters(filters);
          setShowFilters(false);
        }}
        initialFilters={appliedFilters || undefined}
      />
    </div>
  );
}
