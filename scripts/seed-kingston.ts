/**
 * Seed Kingston with real business data.
 * This bypasses the scraper and directly inserts curated listings.
 * Run: npx tsx scripts/seed-kingston.ts
 */

import { createClient } from '@supabase/supabase-js'
import { MeiliSearch } from 'meilisearch'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:8000'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const MEILI_URL = process.env.MEILI_URL || 'http://localhost:7700'
const MEILI_KEY = process.env.MEILI_MASTER_KEY || ''

const KINGSTON_PLACES = [
  // Restaurants
  { name: 'Chez Piggy', slug: 'chez-piggy', category_id: 'restaurant', description: 'Upscale Canadian restaurant in a historic limestone building with a beautiful courtyard patio. Known for locally sourced ingredients and seasonal menus since 1979.', street_address: '68R Princess St', city: 'Kingston', province: 'ON', postal_code: 'K7L 1A5', rating: 4.5, review_count: 127, is_featured: true, phone: '(613) 549-7673', website: 'https://chezpiggy.com' },
  { name: "Dianne's Fish Shack & Smokehouse", slug: 'diannes-fish-shack', category_id: 'restaurant', description: 'Casual waterfront seafood spot with fish tacos, smoked meat, and craft beer. Great views of Lake Ontario from the outdoor patio.', street_address: '195 Ontario St', city: 'Kingston', province: 'ON', postal_code: 'K7L 2Y6', rating: 4.3, review_count: 89, is_featured: false, phone: '(613) 507-3474' },
  { name: 'AquaTerra', slug: 'aqua-terra', category_id: 'restaurant', description: 'Fine dining with panoramic views of the St. Lawrence River. Contemporary Canadian cuisine with Asian influences. Located in the Delta Hotel.', street_address: '1 Johnson St', city: 'Kingston', province: 'ON', postal_code: 'K7L 5H7', rating: 4.6, review_count: 93, is_featured: true, phone: '(613) 549-6243', website: 'https://www.aquaterrarestaurant.com', price_range: '$$$$' },
  { name: 'Pan Chancho Bakery & Cafe', slug: 'pan-chancho', category_id: 'restaurant', description: 'Artisan bakery and cafe famous for fresh bread, pastries, and hearty sandwiches. A Kingston institution since 1994.', street_address: '44 Princess St', city: 'Kingston', province: 'ON', postal_code: 'K7L 1A3', rating: 4.5, review_count: 178, is_featured: true, phone: '(613) 544-7790', website: 'https://panchancho.com', price_range: '$$' },
  { name: 'Le Chien Noir Bistro', slug: 'le-chien-noir', category_id: 'restaurant', description: 'French-inspired bistro with a warm ambiance, excellent wine list, and seasonal prix fixe menus in the heart of downtown.', street_address: '69 Brock St', city: 'Kingston', province: 'ON', postal_code: 'K7L 1R8', rating: 4.4, review_count: 156, is_featured: false, phone: '(613) 549-5635', website: 'https://www.lechiennoir.com', price_range: '$$$' },
  { name: 'Woodenheads Gourmet Pizza', slug: 'woodenheads', category_id: 'restaurant', description: 'Gourmet wood-fired pizza with creative toppings and a funky, art-covered interior. BYOB-friendly.', street_address: '192 Ontario St', city: 'Kingston', province: 'ON', postal_code: 'K7L 2Y8', rating: 4.3, review_count: 210, is_featured: false, phone: '(613) 549-1812', price_range: '$$' },
  { name: 'Tango Nuevo', slug: 'tango-nuevo', category_id: 'restaurant', description: 'Latin American fusion cuisine with tapas plates, creative cocktails, and a vibrant downtown atmosphere.', street_address: '331 King St E', city: 'Kingston', province: 'ON', postal_code: 'K7L 3B1', rating: 4.2, review_count: 98, is_featured: false, phone: '(613) 542-2632', price_range: '$$$' },
  { name: 'Harper\'s Burger Bar', slug: 'harpers-burger-bar', category_id: 'restaurant', description: 'Craft burgers with locally sourced beef, creative toppings, and a great selection of craft beer and milkshakes.', street_address: '93 Princess St', city: 'Kingston', province: 'ON', postal_code: 'K7L 1A5', rating: 4.1, review_count: 134, is_featured: false, price_range: '$$' },

  // Cafes
  { name: 'Sipps Coffee Bar', slug: 'sipps-coffee-bar', category_id: 'cafe', description: 'Cozy independent coffee shop roasting their own beans. Popular with Queen\'s University students. Known for pour-overs and espresso drinks.', street_address: '57 Brock St', city: 'Kingston', province: 'ON', postal_code: 'K7L 1R8', rating: 4.7, review_count: 64, is_featured: true },
  { name: 'Juniper Cafe', slug: 'juniper-cafe', category_id: 'cafe', description: 'Modern cafe with excellent espresso, fresh juice bar, and plant-based food options in the hub district.', street_address: '393 Princess St', city: 'Kingston', province: 'ON', postal_code: 'K7L 1S3', rating: 4.4, review_count: 41, is_featured: false },
  { name: 'Northside Espresso', slug: 'northside-espresso', category_id: 'cafe', description: 'Specialty third-wave coffee shop in the north end. Known for single-origin espresso, cold brew on tap, and homemade pastries.', street_address: '875 Division St', city: 'Kingston', province: 'ON', postal_code: 'K7K 4C1', rating: 4.6, review_count: 37, is_featured: false },
  { name: 'Toast & Jam', slug: 'toast-and-jam', category_id: 'cafe', description: 'Brunch-focused cafe with artisanal toast boards, locally roasted coffee, and fresh-squeezed juices. Weekend brunch is a must.', street_address: '130 Princess St', city: 'Kingston', province: 'ON', postal_code: 'K7L 1A8', rating: 4.3, review_count: 55, is_featured: false, price_range: '$$' },

  // Bars
  { name: 'The Toucan Kirkpatrick', slug: 'the-toucan', category_id: 'bar', description: 'Iconic Irish pub with live music, great whiskey selection, and hearty pub fare in downtown Kingston. A staple since 1989.', street_address: '76 Princess St', city: 'Kingston', province: 'ON', postal_code: 'K7L 1A5', rating: 4.2, review_count: 201, is_featured: true, phone: '(613) 544-1966' },
  { name: 'The Mansion', slug: 'the-mansion', category_id: 'bar', description: 'Upscale cocktail bar in a converted Victorian mansion. Craft cocktails, tapas menu, and rooftop patio with city views.', street_address: '506 Princess St', city: 'Kingston', province: 'ON', postal_code: 'K7L 1C6', rating: 4.0, review_count: 88, is_featured: false },
  { name: 'Red House', slug: 'red-house', category_id: 'bar', description: 'Neighbourhood pub with rotating craft beer taps, pub trivia nights, and a welcoming atmosphere in the Williamsville district.', street_address: '369 King St E', city: 'Kingston', province: 'ON', postal_code: 'K7L 3B3', rating: 4.1, review_count: 76, is_featured: false },

  // Shopping
  { name: 'Novel Idea Bookstore', slug: 'novel-idea', category_id: 'shopping', description: 'Independent bookstore in downtown Kingston with a carefully curated selection and friendly, knowledgeable staff.', street_address: '156 Princess St', city: 'Kingston', province: 'ON', postal_code: 'K7L 1B2', rating: 4.8, review_count: 52, is_featured: true, website: 'https://www.novelideabooks.com' },
  { name: 'Kingston Public Market', slug: 'kingston-public-market', category_id: 'shopping', description: 'Historic outdoor farmers market operating since 1801. Local produce, baked goods, crafts, and artisan products every spring through fall.', street_address: 'Springer Market Square', city: 'Kingston', province: 'ON', postal_code: 'K7L 1E9', rating: 4.6, review_count: 189, is_featured: true },
  { name: 'Cooke\'s Fine Foods', slug: 'cookes-fine-foods', category_id: 'shopping', description: 'Specialty food shop with imported cheeses, charcuterie, olive oils, and gourmet pantry items. A foodie destination.', street_address: '61 Brock St', city: 'Kingston', province: 'ON', postal_code: 'K7L 1R8', rating: 4.5, review_count: 43, is_featured: false },

  // Attractions
  { name: 'Fort Henry National Historic Site', slug: 'fort-henry', category_id: 'attraction', description: '19th century British military fortification overlooking Kingston harbour. Daily military demonstrations, sunset ceremonies, and the famous Fort Fright in October.', street_address: '1 Fort Henry Dr', city: 'Kingston', province: 'ON', postal_code: 'K7K 5G8', rating: 4.4, review_count: 312, is_featured: true, website: 'https://www.forthenry.com', phone: '(613) 542-7388' },
  { name: 'Kingston Penitentiary Tours', slug: 'kingston-pen-tours', category_id: 'attraction', description: 'Guided tours of the historic Kingston Penitentiary, Canada\'s oldest maximum-security prison. Fascinating history and architecture.', street_address: '560 King St W', city: 'Kingston', province: 'ON', postal_code: 'K7L 4V7', rating: 4.6, review_count: 267, is_featured: true },
  { name: 'Agnes Etherington Art Centre', slug: 'agnes-art-centre', category_id: 'attraction', description: 'Queen\'s University art gallery with collections spanning from Renaissance to contemporary Canadian art. Free admission.', street_address: '36 University Ave', city: 'Kingston', province: 'ON', postal_code: 'K7L 3N6', rating: 4.3, review_count: 78, is_featured: false, website: 'https://agnes.queensu.ca' },
  { name: '1000 Islands Boat Cruises', slug: '1000-islands-cruises', category_id: 'attraction', description: 'Scenic boat tours through the 1000 Islands region. Multiple cruise options from 1-hour harbour tours to full-day island explorations.', street_address: '1 Brock St', city: 'Kingston', province: 'ON', postal_code: 'K7L 1R8', rating: 4.5, review_count: 203, is_featured: true, website: 'https://www.1000islandscruises.ca' },

  // Activities
  { name: 'Kingston Trolley Tours', slug: 'kingston-trolley-tours', category_id: 'activity', description: 'Hop-on hop-off guided tours of Kingston\'s historic downtown, waterfront, and Queen\'s University campus.', street_address: '209 Ontario St', city: 'Kingston', province: 'ON', postal_code: 'K7L 2Z1', rating: 4.1, review_count: 67, is_featured: false },
  { name: 'Ahoy Rentals', slug: 'ahoy-rentals', category_id: 'activity', description: 'Kayak, canoe, SUP, and bike rentals on the Kingston waterfront. Guided paddling tours available. Perfect for exploring the harbour.', street_address: '23 Ontario St', city: 'Kingston', province: 'ON', postal_code: 'K7L 2Y2', rating: 4.3, review_count: 45, is_featured: false },
  { name: 'Boiler Room Climbing Gym', slug: 'boiler-room', category_id: 'activity', description: 'Indoor rock climbing gym with bouldering walls, top-rope routes, and a fitness area. Beginner classes available.', street_address: '400 Princess St', city: 'Kingston', province: 'ON', postal_code: 'K7L 1S7', rating: 4.4, review_count: 33, is_featured: false },

  // Services
  { name: 'Mino\'s Village Barber', slug: 'minos-barber', category_id: 'service', description: 'Old-school barbershop with hot towel shaves, classic cuts, and a welcoming neighbourhood vibe. Cash only.', street_address: '71 Brock St', city: 'Kingston', province: 'ON', postal_code: 'K7L 1R8', rating: 4.7, review_count: 88, is_featured: false },
  { name: 'Kingston Handmade Market', slug: 'kingston-handmade', category_id: 'service', description: 'Pop-up artisan market featuring local makers, artists, and craftspeople. Seasonal events at various Kingston venues.', street_address: 'Various Locations', city: 'Kingston', province: 'ON', rating: 4.5, review_count: 29, is_featured: false },
]

async function main() {
  console.log('Connecting to Supabase and Meilisearch...')

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  const meili = new MeiliSearch({ host: MEILI_URL, apiKey: MEILI_KEY })

  // Delete existing seed data
  console.log('Clearing existing Kingston places...')
  await supabase.from('places').delete().eq('city_id', 'kingston')

  // Insert places
  console.log(`Inserting ${KINGSTON_PLACES.length} Kingston businesses...`)
  const places = KINGSTON_PLACES.map((p) => ({
    ...p,
    city_id: 'kingston',
    country: 'CA',
    is_active: true,
    is_verified: false,
    claim_status: 'unclaimed',
    source_metadata: { source: 'seed', seeded_at: new Date().toISOString() },
    ai_enrichment: {},
  }))

  const { data: inserted, error } = await supabase
    .from('places')
    .upsert(places, { onConflict: 'city_id,slug' })
    .select('id, city_id, category_id, slug, name, description, street_address, phone, website, rating, review_count, is_featured, is_active')

  if (error) {
    console.error('Insert error:', error)
    return
  }

  console.log(`Inserted ${inserted?.length ?? 0} places into Supabase`)

  // Sync to Meilisearch
  if (inserted && inserted.length > 0) {
    console.log('Syncing to Meilisearch...')
    const result = await meili.index('places').addDocuments(inserted)
    console.log(`Meilisearch sync task: ${result.taskUid}`)
  }

  // Verify
  const { count } = await supabase
    .from('places')
    .select('*', { count: 'exact', head: true })
    .eq('city_id', 'kingston')
    .eq('is_active', true)

  console.log(`\nKingston now has ${count} active listings`)
  console.log('Done! Refresh http://localhost:3000/places to see them.')
}

main().catch(console.error)
