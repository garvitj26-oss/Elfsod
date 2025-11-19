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
"[project]/app/api/categories/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
        // Get city parameter from query string
        const { searchParams } = new URL(request.url);
        const city = searchParams.get('city');
        let supabase;
        try {
            supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
        } catch (clientError) {
            console.error('❌ Failed to create Supabase client:', clientError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Failed to connect to database',
                message: 'Please check your Supabase configuration. Frontend will try direct connection.',
                fallback: true
            }, {
                status: 500
            });
        }
        let data, error;
        try {
            // First, fetch all categories
            const categoriesResult = await supabase.from('categories').select('*').order('name', {
                ascending: true
            });
            if (categoriesResult.error) {
                throw categoriesResult.error;
            }
            const categories = categoriesResult.data || [];
            // Count ad spaces per category, filtered by location if city is provided
            // Logic: category + location = count of cards that will show
            const countsMap = {};
            for (const cat of categories){
                // Build query with category filter
                let query = supabase.from('ad_spaces').select('*', {
                    count: 'exact',
                    head: true
                }).eq('category_id', cat.id).eq('availability_status', 'available');
                // If city is provided, filter by location
                if (city) {
                    // Join with locations table to filter by city
                    // We need to use a different approach since Supabase doesn't support joins in count queries
                    // Instead, we'll fetch location_ids for the city first, then count
                    const { data: locations } = await supabase.from('locations').select('id').eq('city', city);
                    if (locations && locations.length > 0) {
                        const locationIds = locations.map((loc)=>loc.id);
                        query = query.in('location_id', locationIds);
                    } else {
                        // No locations found for this city, count is 0
                        countsMap[cat.id] = 0;
                        continue;
                    }
                }
                const { count, error: countError } = await query;
                if (!countError) {
                    countsMap[cat.id] = count || 0;
                } else {
                    countsMap[cat.id] = 0;
                }
            }
            // For parent categories, also count child category ad spaces
            // This implements: Filter by parent category (gets all child categories)
            const parentCountsMap = {};
            categories.forEach((cat)=>{
                if (cat.parent_category_id === null) {
                    // This is a parent category - count all child categories' ad spaces
                    const childCategories = categories.filter((c)=>c.parent_category_id === cat.id);
                    let totalCount = countsMap[cat.id] || 0;
                    childCategories.forEach((child)=>{
                        totalCount += countsMap[child.id] || 0;
                    });
                    parentCountsMap[cat.id] = totalCount;
                }
            });
            // Add counts to categories
            // Parent categories show sum of their children + their own
            // Child categories show only their own count
            data = categories.map((cat)=>({
                    ...cat,
                    ad_space_count: cat.parent_category_id === null ? parentCountsMap[cat.id] || countsMap[cat.id] || 0 : countsMap[cat.id] || 0
                }));
            error = null;
        } catch (fetchError) {
            // Handle fetch/network errors (like SSL certificate issues)
            console.error('❌ Supabase fetch error (likely SSL/network issue):', fetchError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Failed to fetch categories',
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
                details: error instanceof Error ? error.message : String(error)
            }, {
                status: 500
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: data || [],
            count: data?.length || 0
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
                message: 'Please check your Supabase configuration.'
            }, {
                status: 500
            });
        }
        const body = await request.json();
        const { name, description, icon_url } = body;
        if (!name || !name.trim()) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Category name is required'
            }, {
                status: 400
            });
        }
        // Check if category already exists
        const { data: existing } = await supabase.from('categories').select('id, name').eq('name', name.trim()).maybeSingle();
        if (existing) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Category already exists',
                data: existing
            }, {
                status: 400
            });
        }
        // Create category
        const { data: newCategory, error: insertError } = await supabase.from('categories').insert({
            name: name.trim(),
            description: description?.trim() || null,
            icon_url: icon_url || null
        }).select().single();
        if (insertError) {
            console.error('❌ Error creating category:', insertError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Failed to create category',
                details: insertError.message
            }, {
                status: 500
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: newCategory,
            message: 'Category created successfully'
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

//# sourceMappingURL=%5Broot-of-the-server%5D__88af95a7._.js.map