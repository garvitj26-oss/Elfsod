module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/supabase/server.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
;
;
async function createClient() {
    // Check environment variables first
    const supabaseUrl = ("TURBOPACK compile-time value", "https://vavubezjuqnkrvndtowt.supabase.co");
    const supabaseKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhdnViZXpqdXFua3J2bmR0b3d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MDExNzUsImV4cCI6MjA3ODk3NzE3NX0.KZauqlbSrO9UD3QWGEVXQq4CBoOMbQom_RkwQ-e7smU");
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
        // Create a custom fetch that handles SSL properly
        // The Supabase client will use this for all requests
        const customFetch = (url, options = {})=>{
            // For Node.js environments, we need to ensure SSL certificates are verified
            // The @supabase/ssr client should handle this, but we can add extra configuration
            return fetch(url, {
                ...options
            });
        };
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServerClient"])(supabaseUrl, supabaseKey, {
            cookies: {
                getAll () {
                    return cookieStore.getAll();
                },
                setAll (cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options })=>cookieStore.set(name, value, options));
                    } catch  {
                    // The `setAll` method was called from a Server Component.
                    // This can be ignored if you have middleware refreshing
                    // user sessions.
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating Supabase server client:', error);
        throw error;
    }
}
}),
"[project]/app/api/ad-spaces/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server.ts [app-route] (ecmascript)");
;
;
async function GET(request) {
    try {
        let supabase;
        try {
            supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
        } catch (clientError) {
            console.error('❌ Failed to create Supabase client:', clientError);
            // Return error but don't crash - let frontend fallback handle it
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Failed to connect to database',
                message: 'Please check your Supabase configuration. Frontend will try direct connection.',
                fallback: true
            }, {
                status: 500
            });
        }
        const searchParams = request.nextUrl.searchParams;
        const city = searchParams.get('city');
        const categoryId = searchParams.get('categoryId');
        const publisherId = searchParams.get('publisherId');
        const displayType = searchParams.get('displayType');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const minFootfall = searchParams.get('minFootfall');
        const maxFootfall = searchParams.get('maxFootfall');
        const searchQuery = searchParams.get('searchQuery');
        const limit = parseInt(searchParams.get('limit') || '100');
        const availabilityStatus = searchParams.get('availabilityStatus') || 'available';
        // Build query
        let query = supabase.from('ad_spaces').select(`
        *,
        category:categories(id, name, icon_url, description),
        location:locations(id, city, state, country, address, latitude, longitude),
        publisher:publishers(id, name, description, verification_status)
      `);
        // Apply filters
        if (categoryId) {
            query = query.eq('category_id', categoryId);
        }
        if (publisherId) {
            if (publisherId.includes(',')) {
                query = query.in('publisher_id', publisherId.split(','));
            } else {
                query = query.eq('publisher_id', publisherId);
            }
        }
        if (displayType) {
            query = query.eq('display_type', displayType);
        }
        if (minPrice) {
            query = query.gte('price_per_day', parseFloat(minPrice));
        }
        if (maxPrice) {
            query = query.lte('price_per_day', parseFloat(maxPrice));
        }
        if (minFootfall) {
            query = query.gte('daily_impressions', parseInt(minFootfall));
        }
        if (maxFootfall) {
            query = query.lte('daily_impressions', parseInt(maxFootfall));
        }
        if (searchQuery) {
            query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }
        if ("TURBOPACK compile-time truthy", 1) {
            query = query.eq('availability_status', availabilityStatus);
        }
        query = query.limit(limit).order('created_at', {
            ascending: false
        });
        let data, error;
        try {
            const result = await query;
            data = result.data;
            error = result.error;
        } catch (fetchError) {
            // Handle fetch/network errors (like SSL certificate issues)
            console.error('❌ Supabase fetch error (likely SSL/network issue):', fetchError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Failed to fetch ad spaces',
                message: fetchError instanceof Error ? fetchError.message : String(fetchError),
                fallback: true,
                details: 'Server-side connection failed. Frontend will use direct browser connection.'
            }, {
                status: 500
            });
        }
        if (error) {
            console.error('❌ Supabase query error:', error);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Database query failed',
                details: error.message
            }, {
                status: 500
            });
        }
        // Transform data
        let spaces = (data || []).map((space)=>{
            // Parse JSON fields if they're strings
            let images = space.images;
            if (typeof images === 'string') {
                try {
                    images = JSON.parse(images);
                } catch  {
                    images = [];
                }
            }
            if (!Array.isArray(images)) {
                images = [];
            }
            let dimensions = space.dimensions;
            if (typeof dimensions === 'string') {
                try {
                    dimensions = JSON.parse(dimensions);
                } catch  {
                    dimensions = {};
                }
            }
            if (!dimensions || typeof dimensions !== 'object') {
                dimensions = {};
            }
            return {
                ...space,
                images,
                dimensions,
                route: space.route || null
            };
        });
        // Apply city filter after fetching (since it's a relationship)
        if (city) {
            spaces = spaces.filter((space)=>space.location?.city === city);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: spaces,
            count: spaces.length
        });
    } catch (error) {
        console.error('API error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : String(error)
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        let supabase;
        try {
            supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
        } catch (clientError) {
            console.error('❌ Failed to create Supabase client:', clientError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Failed to connect to database',
                message: 'Please check your Supabase configuration.',
                fallback: true
            }, {
                status: 500
            });
        }
        const body = await request.json();
        const { title, description, categoryId, locationId, publisherId, displayType, pricePerDay, pricePerMonth, dailyImpressions = 0, monthlyFootfall = 0, latitude, longitude, images = [], dimensions = {}, availabilityStatus = 'available', targetAudience } = body;
        // Validation
        if (!title || !description) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Title and description are required'
            }, {
                status: 400
            });
        }
        if (!categoryId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Category ID is required'
            }, {
                status: 400
            });
        }
        if (!displayType) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Display type is required'
            }, {
                status: 400
            });
        }
        if (pricePerDay === undefined || pricePerDay === null) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Price per day is required'
            }, {
                status: 400
            });
        }
        if (pricePerMonth === undefined || pricePerMonth === null) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Price per month is required'
            }, {
                status: 400
            });
        }
        if (latitude === undefined || longitude === undefined) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Latitude and longitude are required'
            }, {
                status: 400
            });
        }
        // Verify category exists
        const { data: category, error: categoryError } = await supabase.from('categories').select('id, name').eq('id', categoryId).single();
        if (categoryError || !category) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Invalid category ID',
                details: categoryError?.message
            }, {
                status: 400
            });
        }
        // Prepare data for insertion
        const adSpaceData = {
            title: title.trim(),
            description: description.trim(),
            category_id: categoryId,
            display_type: displayType,
            price_per_day: parseFloat(pricePerDay),
            price_per_month: parseFloat(pricePerMonth),
            daily_impressions: parseInt(dailyImpressions) || 0,
            monthly_footfall: parseInt(monthlyFootfall) || 0,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            availability_status: availabilityStatus,
            images: Array.isArray(images) ? images : [],
            dimensions: typeof dimensions === 'object' ? dimensions : {}
        };
        // Optional fields
        if (locationId) {
            adSpaceData.location_id = locationId;
        }
        if (publisherId) {
            adSpaceData.publisher_id = publisherId;
        }
        if (targetAudience) {
            adSpaceData.target_audience = targetAudience;
        }
        // Insert ad space
        const { data: newAdSpace, error: insertError } = await supabase.from('ad_spaces').insert(adSpaceData).select(`
        *,
        category:categories(id, name, icon_url, description),
        location:locations(id, city, state, country, address, latitude, longitude),
        publisher:publishers(id, name, description, verification_status)
      `).single();
        if (insertError) {
            console.error('❌ Error creating ad space:', insertError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Failed to create ad space',
                details: insertError.message
            }, {
                status: 500
            });
        }
        // Parse JSON fields
        let parsedImages = newAdSpace.images;
        if (typeof parsedImages === 'string') {
            try {
                parsedImages = JSON.parse(parsedImages);
            } catch  {
                parsedImages = [];
            }
        }
        if (!Array.isArray(parsedImages)) {
            parsedImages = [];
        }
        let parsedDimensions = newAdSpace.dimensions;
        if (typeof parsedDimensions === 'string') {
            try {
                parsedDimensions = JSON.parse(parsedDimensions);
            } catch  {
                parsedDimensions = {};
            }
        }
        if (!parsedDimensions || typeof parsedDimensions !== 'object') {
            parsedDimensions = {};
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: {
                ...newAdSpace,
                images: parsedImages,
                dimensions: parsedDimensions
            },
            message: 'Ad space created successfully'
        }, {
            status: 201
        });
    } catch (error) {
        console.error('API error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : String(error)
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__39232e1c._.js.map