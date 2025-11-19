'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Search, Filter } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamic import for coverage selector (uses map, client-side only)
const CoverageAreaSelector = dynamic(
  () => import('@/components/admin/CoverageAreaSelector'),
  { ssr: false }
);

interface Category {
  id: string;
  name: string;
  icon_url?: string;
  description?: string;
  parent_category_id?: string;
}

interface Location {
  id: string;
  city: string;
  state: string;
  country: string;
  address: string;
  latitude: number;
  longitude: number;
  area?: string;
}

interface AdSpaceForm {
  title: string;
  location_city: string;
  location_area: string;
  location_address: string;
  location_id: string; // Selected location ID from locations table
  price_per_day: number;
  daily_impressions: number;
  display_type: string;
  width: number;
  height: number;
  category_id: string;
  image_url: string;
  availability_status: 'available' | 'booked' | 'maintenance';
  // Coverage data for movable ads
  route?: {
    center_location: { latitude: number; longitude: number; address: string };
    base_coverage_km: number;
    additional_coverage_km: number;
  };
}

const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Kolkata', 'Ahmedabad', 'Pune', 'Chandigarh', 'Kochi'];

export default function AdminDashboard() {
  const [adSpaces, setAdSpaces] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const [formData, setFormData] = useState<AdSpaceForm>({
    title: '',
    location_city: 'Mumbai',
    location_area: '',
    location_address: '',
    location_id: '', // Selected location ID
    price_per_day: 5000,
    daily_impressions: 10000,
    display_type: 'static_billboard',
    width: 10,
    height: 20,
    category_id: '',
    image_url: '',
    availability_status: 'available',
  });

  useEffect(() => {
    fetchAdSpaces();
    fetchCategories();
  }, []);

  // Set default category when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !formData.category_id) {
      setFormData(prev => ({ ...prev, category_id: categories[0].id }));
    }
  }, [categories]);

  // Fetch locations when city changes
  useEffect(() => {
    if (isFormOpen && formData.location_city) {
      fetchLocationsByCity(formData.location_city);
    }
  }, [formData.location_city, isFormOpen]);

  const fetchLocationsByCity = async (city: string) => {
    setLocationsLoading(true);
    try {
      const response = await fetch(`/api/locations?city=${encodeURIComponent(city)}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setLocations(result.data);
          // Auto-select first location if only one exists
          if (result.data.length === 1 && !formData.location_id) {
            setFormData(prev => ({ ...prev, location_id: result.data[0].id }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      setLocations([]);
    } finally {
      setLocationsLoading(false);
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setCategories(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchAdSpaces = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ad-spaces');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAdSpaces(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching ad spaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.title.trim()) {
      alert('Please enter a title');
      return;
    }
    
    if (!formData.category_id || formData.category_id.trim() === '') {
      alert('Please select a category');
      return;
    }
    
    if (!formData.display_type) {
      alert('Please select a display type');
      return;
    }
    
    if (!formData.price_per_day || formData.price_per_day <= 0) {
      alert('Please enter a valid price per day');
      return;
    }

    // Location validation - must have either location_id or address
    if (!formData.location_id && !formData.location_address?.trim()) {
      alert('Please either select a location from the database or enter an address to create a new location');
      return;
    }
    
    setLoading(true);

    try {
      // Get coordinates for the city (default coordinates)
      const cityCoordinates: Record<string, { lat: number; lng: number }> = {
        'Mumbai': { lat: 19.0760, lng: 72.8777 },
        'Delhi': { lat: 28.6139, lng: 77.2090 },
        'Bengaluru': { lat: 12.9716, lng: 77.5946 },
        'Chennai': { lat: 13.0827, lng: 80.2707 },
        'Kolkata': { lat: 22.5726, lng: 88.3639 },
        'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
        'Pune': { lat: 18.5204, lng: 73.8567 },
        'Chandigarh': { lat: 30.7333, lng: 76.7794 },
        'Kochi': { lat: 9.9312, lng: 76.2673 },
      };
      
      const coords = cityCoordinates[formData.location_city] || cityCoordinates['Mumbai'];
      
      // Use selected location_id from form, or create new location if not selected
      let locationId: string | undefined = formData.location_id?.trim() || undefined;
      
      // If no location is selected but address is provided, create a new location
      if (!locationId && formData.location_address?.trim()) {
        try {
          // Get state from city
          const cityToState: Record<string, string> = {
            'Mumbai': 'Maharashtra',
            'Delhi': 'Delhi',
            'Bengaluru': 'Karnataka',
            'Chennai': 'Tamil Nadu',
            'Kolkata': 'West Bengal',
            'Ahmedabad': 'Gujarat',
            'Pune': 'Maharashtra',
            'Chandigarh': 'Chandigarh',
            'Kochi': 'Kerala',
          };
          const state = cityToState[formData.location_city] || 'Maharashtra';
          
          const address = formData.location_address.trim() || formData.location_area?.trim() || `${formData.location_city}, India`;
          
          console.log('📍 Creating new location:', { city: formData.location_city, address, state });
          
          const locationResponse = await fetch('/api/locations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              city: formData.location_city,
              address: address,
              state: state,
              latitude: coords.lat,
              longitude: coords.lng,
              country: 'India',
            }),
          });

          if (locationResponse.ok) {
            const locationResult = await locationResponse.json();
            if (locationResult.success && locationResult.data?.id) {
              locationId = locationResult.data.id;
              console.log('✅ New location created with ID:', locationId);
            } else {
              console.error('❌ Location creation response missing ID:', locationResult);
              alert('Failed to create location. Please try again.');
              setLoading(false);
              return;
            }
          } else {
            const errorData = await locationResponse.json().catch(() => ({}));
            console.error('❌ Could not create location:', errorData);
            alert(`Failed to create location: ${errorData.error || 'Unknown error'}. Please try again.`);
            setLoading(false);
            return;
          }
        } catch (locationError) {
          console.error('❌ Location creation failed:', locationError);
          alert('Failed to create location. Please try again.');
          setLoading(false);
          return;
        }
      } else if (locationId) {
        console.log('✅ Using selected location_id:', locationId);
      } else {
        console.warn('⚠️ No location_id and no address provided - location_id will be null');
      }
      
      // Transform form data to API format
      const apiData = {
        title: formData.title.trim(),
        description: (formData.title.trim() + ' - ' + (formData.location_address || formData.location_area || formData.location_city)).trim(),
        categoryId: formData.category_id.trim(),
        displayType: formData.display_type,
        pricePerDay: Number(formData.price_per_day),
        pricePerMonth: Number(formData.price_per_day) * 30, // Calculate monthly price
        dailyImpressions: Number(formData.daily_impressions) || 0,
        monthlyFootfall: (Number(formData.daily_impressions) || 0) * 30, // Estimate monthly footfall
        latitude: coords.lat,
        longitude: coords.lng,
        images: formData.image_url ? [formData.image_url.trim()] : [],
        dimensions: {
          width: Number(formData.width) || 10,
          height: Number(formData.height) || 20,
        },
        availabilityStatus: formData.availability_status || 'available',
        ...(locationId && { locationId }), // Include locationId if we have it
        ...(formData.route && { route: formData.route }),
      };

      console.log('Submitting ad space:', {
        ...apiData,
        locationId: locationId || 'NOT SET - will be null'
      }); // Debug log

      const url = editingId ? `/api/ad-spaces/${editingId}` : '/api/ad-spaces';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      });

      const responseData = await response.json().catch(() => ({}));
      
      if (response.ok) {
        await fetchAdSpaces();
        resetForm();
        setIsFormOpen(false);
        alert(editingId ? 'Ad space updated successfully!' : 'Ad space created successfully!');
      } else {
        console.error('API Error Response:', response.status, responseData);
        const errorMessage = responseData.error || responseData.message || responseData.details || 'Unknown error';
        alert(`Failed to save ad space: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error saving ad space:', error);
      alert('Error saving ad space: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ad space? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/ad-spaces/${id}`, {
        method: 'DELETE',
      });

      const responseData = await response.json().catch(() => ({}));

      if (response.ok) {
        await fetchAdSpaces();
        alert('Ad space deleted successfully!');
      } else {
        const errorMessage = responseData.error || responseData.message || responseData.details || 'Unknown error';
        console.error('Delete API Error:', response.status, responseData);
        alert(`Failed to delete ad space: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error deleting ad space:', error);
      alert('Error deleting ad space: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleEdit = (adSpace: any) => {
    setFormData({
      title: adSpace.title || '',
      location_city: adSpace.location?.city || 'Mumbai',
      location_area: adSpace.location?.area || '',
      location_address: adSpace.location?.address || '',
      location_id: adSpace.location_id || '', // Use location_id from ad space
      price_per_day: adSpace.price_per_day || 5000,
      daily_impressions: adSpace.daily_impressions || 10000,
      display_type: adSpace.display_type || 'static_billboard',
      width: adSpace.dimensions?.width || 10,
      height: adSpace.dimensions?.height || 20,
      category_id: adSpace.category?.id || (categories.length > 0 ? categories[0].id : ''),
      image_url: adSpace.images?.[0] || '',
      availability_status: adSpace.availability_status || 'available',
      route: adSpace.route || undefined,
    });
    setEditingId(adSpace.id);
    setIsFormOpen(true);
    // Fetch locations for the city when editing
    if (adSpace.location?.city) {
      fetchLocationsByCity(adSpace.location.city);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      location_city: 'Mumbai',
      location_area: '',
      location_address: '',
      location_id: '', // Reset location_id
      price_per_day: 5000,
      daily_impressions: 10000,
      display_type: 'static_billboard',
      width: 10,
      height: 20,
      category_id: categories.length > 0 ? categories[0].id : '',
      image_url: '',
      availability_status: 'available',
    });
    setEditingId(null);
    setLocations([]); // Clear locations
  };

  const filteredAdSpaces = adSpaces.filter((space) => {
    const matchesSearch = searchQuery === '' || 
      space.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      space.location?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      space.location?.address?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || 
      space.category?.id === filterCategory ||
      (filterCategory !== 'all' && !space.category && filterCategory === 'uncategorized');
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage advertising inventory and ad spaces</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Total Ad Spaces</div>
            <div className="text-3xl font-bold text-gray-900">{adSpaces.length}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Available</div>
            <div className="text-3xl font-bold text-green-600">
              {adSpaces.filter(s => s.availability_status === 'available').length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Booked</div>
            <div className="text-3xl font-bold text-blue-600">
              {adSpaces.filter(s => s.availability_status === 'booked').length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Categories</div>
            <div className="text-3xl font-bold text-purple-600">{categories.length}</div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search ad spaces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                />
              </div>

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                disabled={categoriesLoading}
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Add Button */}
            <button
              onClick={() => {
                resetForm();
                setIsFormOpen(true);
              }}
              className="bg-[#E91E63] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#F50057] transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add New Ad Space
            </button>
          </div>
        </div>

        {/* Ad Spaces Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ad Space
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Price/Day
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Impressions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : filteredAdSpaces.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No ad spaces found. Create your first one!
                    </td>
                  </tr>
                ) : (
                  filteredAdSpaces.map((space) => (
                    <tr key={space.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {space.image_url && (
                            <img
                              src={space.image_url}
                              alt={space.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <div className="font-semibold text-gray-900">{space.title}</div>
                            <div className="text-sm text-gray-500">{space.display_type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-700">{space.category?.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{space.location?.city || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{space.location?.area || ''}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ₹{space.price_per_day?.toLocaleString() || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {space.daily_impressions?.toLocaleString() || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            space.availability_status === 'available'
                              ? 'bg-green-100 text-green-800'
                              : space.availability_status === 'booked'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {space.availability_status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(space)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(space.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setIsFormOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingId ? 'Edit Ad Space' : 'Create New Ad Space'}
                </h2>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                    placeholder="e.g., Premium Billboard at MG Road"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                    disabled={categoriesLoading}
                  >
                    {categoriesLoading ? (
                      <option>Loading categories...</option>
                    ) : categories.length === 0 ? (
                      <option>No categories available</option>
                    ) : (
                      categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City *
                  </label>
                  <select
                    required
                    value={formData.location_city}
                    onChange={(e) => {
                      setFormData({ ...formData, location_city: e.target.value, location_id: '' });
                      fetchLocationsByCity(e.target.value);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                  >
                    {CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location Selector - Show locations from database */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Location from Database {locations.length === 0 && formData.location_address ? '(Optional)' : '*'}
                  </label>
                  {locationsLoading ? (
                    <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                      Loading locations...
                    </div>
                  ) : locations.length > 0 ? (
                    <select
                      value={formData.location_id}
                      onChange={(e) => {
                        const selectedLocation = locations.find(loc => loc.id === e.target.value);
                        setFormData({ 
                          ...formData, 
                          location_id: e.target.value,
                          location_address: selectedLocation?.address || formData.location_address,
                          location_area: selectedLocation?.address?.split(',')[0] || formData.location_area,
                        });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                    >
                      <option value="">-- Select a location (or enter address below) --</option>
                      {locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.address} {location.area ? `(${location.area})` : ''} - {location.city}, {location.state}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="px-4 py-2 border border-gray-300 rounded-lg bg-yellow-50 text-yellow-700 text-sm">
                      No locations found for {formData.location_city}. Please enter an address below to create a new location.
                    </div>
                  )}
                </div>

                {/* Address fields - for creating new location if not selected from database */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Area
                    </label>
                    <input
                      type="text"
                      value={formData.location_area}
                      onChange={(e) => setFormData({ ...formData, location_area: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                      placeholder="e.g., MG Road"
                      disabled={!!formData.location_id} // Disable if location is selected
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address {!formData.location_id && '*'}
                    </label>
                    <input
                      type="text"
                      required={!formData.location_id}
                      value={formData.location_address}
                      onChange={(e) => setFormData({ ...formData, location_address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63] disabled:bg-gray-100"
                      placeholder="Full address"
                      disabled={!!formData.location_id} // Disable if location is selected
                    />
                    {formData.location_id && (
                      <p className="text-xs text-gray-500 mt-1">
                        Address is set from selected location. To change, select a different location or clear selection.
                      </p>
                    )}
                  </div>
                </div>

                {/* Price and Impressions */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Price per Day (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.price_per_day}
                      onChange={(e) => setFormData({ ...formData, price_per_day: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Daily Impressions *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.daily_impressions}
                      onChange={(e) => setFormData({ ...formData, daily_impressions: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                    />
                  </div>
                </div>

                {/* Display Type and Dimensions */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Display Type *
                    </label>
                    <select
                      required
                      value={formData.display_type}
                      onChange={(e) => setFormData({ ...formData, display_type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                    >
                      <optgroup label="Static Displays">
                        <option value="static_billboard">Static Billboard</option>
                        <option value="backlit_panel">Backlit Panel</option>
                        <option value="vinyl_banner">Vinyl Banner</option>
                      </optgroup>
                      <optgroup label="Digital Displays">
                        <option value="digital_screen">Digital Screen</option>
                        <option value="led_display">LED Display</option>
                      </optgroup>
                      <optgroup label="Movable/Transit Ads">
                        <option value="auto_rickshaw">🛺 Auto Rickshaw</option>
                        <option value="bike">🏍️ Bike</option>
                        <option value="cab">🚖 Cab</option>
                        <option value="transit_branding">🚌 Bus/Transit</option>
                      </optgroup>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Width (ft) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.width}
                      onChange={(e) => setFormData({ ...formData, width: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Height (ft) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                    />
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Coverage Area Selector for Movable Ads */}
                {['auto_rickshaw', 'bike', 'cab', 'transit_branding'].includes(formData.display_type) && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Coverage Area Setup 📍
                    </h3>
                    <CoverageAreaSelector
                      initialCenter={formData.route?.center_location}
                      initialBaseRadius={formData.route?.base_coverage_km}
                      initialAdditionalRadius={formData.route?.additional_coverage_km}
                      displayType={formData.display_type}
                      onChange={(data) => {
                        setFormData({ 
                          ...formData, 
                          route: {
                            center_location: data.center_location,
                            base_coverage_km: data.base_coverage_km,
                            additional_coverage_km: data.additional_coverage_km,
                            coverage_radius: data.base_coverage_km, // Initial radius
                          } as any
                        });
                      }}
                    />
                  </div>
                )}

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Availability Status *
                  </label>
                  <select
                    required
                    value={formData.availability_status}
                    onChange={(e) => setFormData({ ...formData, availability_status: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                  >
                    <option value="available">Available</option>
                    <option value="booked">Booked</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#E91E63] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#F50057] transition-colors inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

