import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import authRouter from './routes/auth.js';
import { dbFallback } from './utils/dbFallback.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Seeding Data Definition (60 Curated Clothes - exactly 15 items per category)
const seedProducts = [
  // --- Outerwear (15 items) ---
  {
    title: "The ReWool® Oversized Shirt Jacket",
    price: 167,
    category: "Outerwear",
    gender: "Unisex",
    era: "Modern",
    size: "M",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop",
    description: "Part shirt, part jacket, all style. Crafted from recycled wool blend with a structural handfeel, classic plaid pattern, and a boxy, oversized layering cut.",
    sellerName: "Everlane",
    quantity: 5
  },
  {
    title: "The Cloud Relaxed Cardigan",
    price: 132,
    category: "Outerwear",
    gender: "Unisex",
    era: "Modern",
    size: "L",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop",
    description: "Cloud-like softness in an easy cardigan silhouette. Made from a blend of premium organic cotton and fine alpaca wool for cozy breathability.",
    sellerName: "Everlane",
    quantity: 8
  },
  {
    title: "The Mac Coat",
    price: 148,
    category: "Outerwear",
    gender: "Unisex",
    era: "Modern",
    size: "M",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop",
    description: "Water-resistant classic cotton-blend Mac coat. Sleek hidden button placket, standard collar, and adjustable cuffs. The ultimate outer layer.",
    sellerName: "Everlane",
    quantity: 4
  },
  {
    title: "The Italian ReWool Overcoat",
    price: 298,
    category: "Outerwear",
    gender: "Women",
    era: "Modern",
    size: "S",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop",
    description: "Double-breasted overcoat tailored in Italy from recycled premium wool. Double-faced fabric provides warmth without added bulk.",
    sellerName: "Everlane",
    quantity: 3
  },
  {
    title: "The Cotton Canvas Bomber",
    price: 98,
    category: "Outerwear",
    gender: "Men",
    era: "Modern",
    size: "XL",
    condition: "Very Good",
    image: "https://images.unsplash.com/photo-1618335829737-2228915674e0?w=800&auto=format&fit=crop",
    description: "Tough cotton duck canvas bomber featuring ribbed trim, double welt hand pockets, and heavy-duty front zip closure.",
    sellerName: "Everlane",
    quantity: 6
  },
  {
    title: "The Cozy Boucle Jacket",
    price: 158,
    category: "Outerwear",
    gender: "Women",
    era: "Modern",
    size: "S",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1548624149-f7b31668831a?w=800&auto=format&fit=crop",
    description: "Textured nubby boucle jacket with a modern collarless design and patch pockets. Cozy warmth with a polished aesthetic.",
    sellerName: "Everlane",
    quantity: 5
  },
  {
    title: "The Denim Chore Jacket",
    price: 88,
    category: "Outerwear",
    gender: "Unisex",
    era: "Modern",
    size: "M",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop",
    description: "Durable classic denim work jacket with three patch utility pockets and heavy stitch details. Perfectly structured blue cotton denim.",
    sellerName: "Everlane",
    quantity: 7
  },
  {
    title: "The Felted Merino Cardigan",
    price: 110,
    category: "Outerwear",
    gender: "Women",
    era: "Modern",
    size: "M",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop",
    description: "Premium felted extra-fine merino wool cardigan. Thick knit construction with horn buttons and slightly cropped waist.",
    sellerName: "Everlane",
    quantity: 4
  },
  {
    title: "The Renew Anorak",
    price: 98,
    category: "Outerwear",
    gender: "Unisex",
    era: "Modern",
    size: "L",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&auto=format&fit=crop",
    description: "Lightweight hooded anorak jacket made entirely from recycled plastic bottles. Packs down tight, perfect for sudden showers.",
    sellerName: "Everlane",
    quantity: 10
  },
  {
    title: "The Quilted Liner Jacket",
    price: 128,
    category: "Outerwear",
    gender: "Unisex",
    era: "Modern",
    size: "M",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1608063615781-e2ef8c73d114?w=800&auto=format&fit=crop",
    description: "Diamond quilted lightweight shell liner jacket. Contrast bindings, press-stud front, ideal for mid-season layering.",
    sellerName: "Everlane",
    quantity: 9
  },
  {
    title: "The Oversized Velvet Blazer",
    price: 178,
    category: "Outerwear",
    gender: "Women",
    era: "Modern",
    size: "M",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop",
    description: "Rich cotton velvet blazer cut in an oversized menswear-inspired silhouette. Features double-breasted closure and padded shoulders.",
    sellerName: "Everlane",
    quantity: 3
  },
  {
    title: "The Leather Trench Coat",
    price: 398,
    category: "Outerwear",
    gender: "Women",
    era: "Modern",
    size: "M",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop",
    description: "Supple black nappa leather full length trench coat. Double-breasted with matching sash belt, storm flaps, and premium satin lining.",
    sellerName: "Everlane",
    quantity: 2
  },
  {
    title: "The Puffer Parka",
    price: 248,
    category: "Outerwear",
    gender: "Unisex",
    era: "Modern",
    size: "L",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop",
    description: "Thick winter puffer parka stuffed with recycled down insulation. Heavy hood and water-resistant shell to keep elements out.",
    sellerName: "Everlane",
    quantity: 5
  },
  {
    title: "The Sherpa Fleece Jacket",
    price: 110,
    category: "Outerwear",
    gender: "Unisex",
    era: "Modern",
    size: "M",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop",
    description: "Cozy recycled sherpa fleece jacket with a high-neck funnel zip and contrasting nylon chest pocket accent.",
    sellerName: "Everlane",
    quantity: 6
  },
  {
    title: "The Linen Blazer",
    price: 138,
    category: "Outerwear",
    gender: "Women",
    era: "Modern",
    size: "S",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1548624149-f7b31668831a?w=800&auto=format&fit=crop",
    description: "Structured double-breasted blazer made from breathable Belgian linen. Relaxed shoulders and a wide notch lapel structure.",
    sellerName: "Everlane",
    quantity: 4
  },

  // --- Tops (15 items) ---
  {
    title: "The Organic Cotton Long-Sleeve Turtleneck",
    price: 35,
    category: "Tops",
    gender: "Unisex",
    era: "Modern",
    size: "M",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop",
    description: "Slim-fit turtleneck top crafted in thick ribbed organic cotton. Wonderfully breathable and highly versatile.",
    sellerName: "Everlane",
    quantity: 15
  },
  {
    title: "The Air Henley",
    price: 45,
    category: "Tops",
    gender: "Men",
    era: "Modern",
    size: "L",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop",
    description: "Featherweight organic cotton slub henley featuring a clean three-button placket and relaxed casual drape.",
    sellerName: "Everlane",
    quantity: 12
  },
  {
    title: "The Pima Micro-Rib Tee",
    price: 30,
    category: "Tops",
    gender: "Women",
    era: "Modern",
    size: "S",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&auto=format&fit=crop",
    description: "Extra-soft Peruvian Pima cotton ribbed crewneck tee. Extremely comfortable stretchy rib knit fits close to body.",
    sellerName: "Everlane",
    quantity: 14
  },
  {
    title: "The Silky Cotton Lantern Shirt",
    price: 68,
    category: "Tops",
    gender: "Women",
    era: "Modern",
    size: "S",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&auto=format&fit=crop",
    description: "A popover shirt featuring structured lantern cuffs, crafted from a silky cotton blend. Relaxed fit and rounded hem.",
    sellerName: "Everlane",
    quantity: 7
  },
  {
    title: "The Linen Workwear Shirt",
    price: 78,
    category: "Tops",
    gender: "Men",
    era: "Modern",
    size: "L",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop",
    description: "Midweight linen utility shirt featuring double breast patch pockets and buttons made of genuine coconuts.",
    sellerName: "Everlane",
    quantity: 8
  },
  {
    title: "The Clean Silk Charmeuse Shirt",
    price: 148,
    category: "Tops",
    gender: "Women",
    era: "Modern",
    size: "S",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&auto=format&fit=crop",
    description: "Glossy pure silk button-down shirt made in an ethically certified silk mill. Clean hidden front button placket.",
    sellerName: "Everlane",
    quantity: 5
  },
  {
    title: "The Cotton Box-Cut Tee",
    price: 25,
    category: "Tops",
    gender: "Women",
    era: "Modern",
    size: "XS",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=800&auto=format&fit=crop",
    description: "Classic box-cut crewneck tee in high-quality combed cotton. Slightly cropped hem fits perfectly with high rise pants.",
    sellerName: "Everlane",
    quantity: 20
  },
  {
    title: "The Heavyweight Overshirt",
    price: 88,
    category: "Tops",
    gender: "Men",
    era: "Modern",
    size: "L",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop",
    description: "Heavy cotton canvas workwear shirt. Thick structured layer to wear over tees or button-downs during cool weather.",
    sellerName: "Everlane",
    quantity: 11
  },
  {
    title: "The Texture Cotton Crew",
    price: 88,
    category: "Tops",
    gender: "Unisex",
    era: "Modern",
    size: "M",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop",
    description: "Midweight cotton sweater in a beautiful waffled stitch knit. Extremely breathable texture and relaxed drape.",
    sellerName: "Everlane",
    quantity: 9
  },
  {
    title: "The Pima Pocket Tee",
    price: 30,
    category: "Tops",
    gender: "Men",
    era: "Modern",
    size: "XL",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop",
    description: "Buttery soft Pima cotton crew neck shirt with a single left chest pocket design. Standard classic daily fit.",
    sellerName: "Everlane",
    quantity: 16
  },
  {
    title: "The Cashmere Crewneck Sweater",
    price: 138,
    category: "Tops",
    gender: "Women",
    era: "Modern",
    size: "M",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop",
    description: "Eco-friendly premium cashmere wool sweater. Incredibly warm and soft knit featuring classic crew neckline.",
    sellerName: "Everlane",
    quantity: 6
  },
  {
    title: "The Striped Sailor Tee",
    price: 35,
    category: "Tops",
    gender: "Women",
    era: "Modern",
    size: "S",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=800&auto=format&fit=crop",
    description: "French naval inspired striped long sleeve tee. Boat neck collar and soft combed organic cotton yarn.",
    sellerName: "Everlane",
    quantity: 10
  },
  {
    title: "The Puffed Sleeve Blouse",
    price: 58,
    category: "Tops",
    gender: "Women",
    era: "Modern",
    size: "S",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&auto=format&fit=crop",
    description: "Breathable cotton lawn blouse featuring romantic puff sleeves and elegant button details along cuffs.",
    sellerName: "Everlane",
    quantity: 5
  },
  {
    title: "The French Terry Crewneck",
    price: 68,
    category: "Tops",
    gender: "Unisex",
    era: "Modern",
    size: "L",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop",
    description: "Heavy loopback French terry sweatshirt. Classic sporty casual fit with ribbed collar, hem, and cuffs.",
    sellerName: "Everlane",
    quantity: 13
  },
  {
    title: "The Organic Cotton Polo",
    price: 48,
    category: "Tops",
    gender: "Men",
    era: "Modern",
    size: "M",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop",
    description: "Pique knit organic cotton polo shirt. Ribbed collar and classic flat two-button placket. Sharp and clean.",
    sellerName: "Everlane",
    quantity: 10
  },

  // --- Bottoms (15 items) ---
  {
    title: "The Wool Flannel Pant",
    price: 97,
    category: "Bottoms",
    gender: "Unisex",
    era: "Modern",
    size: "M",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop",
    description: "Tailored trouser crafted in Italian-sourced recycled wool flannel. Cozy insulation with a sharp drape silhouette.",
    sellerName: "Everlane",
    quantity: 7
  },
  {
    title: "The Way-High® Jean",
    price: 98,
    category: "Bottoms",
    gender: "Women",
    era: "Modern",
    size: "26",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop",
    description: "Our highest rise denim. Stretchy organic cotton denim wraps waist comfortably and tapers straight down the legs.",
    sellerName: "Everlane",
    quantity: 12
  },
  {
    title: "The Utility Barrel Pant",
    price: 88,
    category: "Bottoms",
    gender: "Women",
    era: "Modern",
    size: "27",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&auto=format&fit=crop",
    description: "Features a modern curved leg shape, high rise crop, and large side patch pockets. Tough canvas finish.",
    sellerName: "Everlane",
    quantity: 9
  },
  {
    title: "The Performance Chino",
    price: 88,
    category: "Bottoms",
    gender: "Men",
    era: "Modern",
    size: "32",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop",
    description: "Technical stretch chino pants. Moisture-wicking cotton twill blend with invisible security pocket design.",
    sellerName: "Everlane",
    quantity: 11
  },
  {
    title: "The Easy Pant",
    price: 68,
    category: "Bottoms",
    gender: "Unisex",
    era: "Modern",
    size: "M",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop",
    description: "Pull-on pant featuring a comfortable elastic waistband and drawstring details. Light and breathable cotton poplin.",
    sellerName: "Everlane",
    quantity: 15
  },
  {
    title: "The Corduroy Flare",
    price: 98,
    category: "Bottoms",
    gender: "Women",
    era: "Modern",
    size: "26",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&auto=format&fit=crop",
    description: "Retro flares styled in fine-wale soft organic corduroy. High rise stretch fit with dramatic flare hems.",
    sellerName: "Everlane",
    quantity: 5
  },
  {
    title: "The Pleated Wide-Leg Slacks",
    price: 118,
    category: "Bottoms",
    gender: "Men",
    era: "Modern",
    size: "30",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop",
    description: "High-grade wool slacks featuring double front pleats and side adjusting tabs. Wide leg drape styling.",
    sellerName: "Everlane",
    quantity: 6
  },
  {
    title: "The Linen Easy Shorts",
    price: 48,
    category: "Bottoms",
    gender: "Unisex",
    era: "Modern",
    size: "M",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop",
    description: "Lightweight, breathable Belgian linen shorts with elastic waist cords. Ideal beach and warm weather wear.",
    sellerName: "Everlane",
    quantity: 14
  },
  {
    title: "The Carpenter Dungarees",
    price: 128,
    category: "Bottoms",
    gender: "Women",
    era: "Modern",
    size: "S",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop",
    description: "Classic utility worker dungarees. Hammer loops, tool pockets, adjust straps, and deep blue denim wash.",
    sellerName: "Everlane",
    quantity: 4
  },
  {
    title: "The Track Pant",
    price: 78,
    category: "Bottoms",
    gender: "Unisex",
    era: "Modern",
    size: "M",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&auto=format&fit=crop",
    description: "Sporty track pants crafted in smooth organic cotton knit. Features zip pockets and cuffs.",
    sellerName: "Everlane",
    quantity: 9
  },
  {
    title: "The Patchwork A-Line Skirt",
    price: 88,
    category: "Bottoms",
    gender: "Women",
    era: "Modern",
    size: "S",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop",
    description: "Medium length A-line skirt styled in contrasting tones of organic cotton denim panels.",
    sellerName: "Everlane",
    quantity: 5
  },
  {
    title: "The Clean Silk Midi Skirt",
    price: 138,
    category: "Bottoms",
    gender: "Women",
    era: "Modern",
    size: "S",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop",
    description: "Fluid, bias-cut midi skirt in premium sandwashed silk charmeuse. Soft elastic interior waist.",
    sellerName: "Everlane",
    quantity: 3
  },
  {
    title: "The Straight Leg Carpenter Pant",
    price: 98,
    category: "Bottoms",
    gender: "Men",
    era: "Modern",
    size: "32",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop",
    description: "Heavy canvas worker pants featuring double-front knee reinforcements and utility carpenter layout.",
    sellerName: "Everlane",
    quantity: 8
  },
  {
    title: "The Stretch Legging",
    price: 58,
    category: "Bottoms",
    gender: "Women",
    era: "Modern",
    size: "XS",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&auto=format&fit=crop",
    description: "Thick double-knit interlock leggings. Sturdy compression fit with smooth high rise waist band.",
    sellerName: "Everlane",
    quantity: 15
  },
  {
    title: "The Wide-Leg Worker Pants",
    price: 88,
    category: "Bottoms",
    gender: "Unisex",
    era: "Modern",
    size: "M",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop",
    description: "Super wide-leg worker trousers in durable midweight cotton canvas. Earthy olive green tone.",
    sellerName: "Everlane",
    quantity: 7
  },

  // --- Accessories (15 items) ---
  {
    title: "The Good Merino Wool Beanie",
    price: 35,
    category: "Accessories",
    gender: "Unisex",
    era: "Modern",
    size: "One Size",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1576871337622-98d48d4aa53e?w=800&auto=format&fit=crop",
    description: "Chambray blue cozy rib beanie. Knit from ethically sourced extra-soft merino wool for temperature regulation.",
    sellerName: "Everlane",
    quantity: 30
  },
  {
    title: "The Day Glove Flats",
    price: 118,
    category: "Accessories",
    gender: "Women",
    era: "Modern",
    size: "7",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=800&auto=format&fit=crop",
    description: "Buttery soft Italian leather flats that mold to your foot like a glove. Elasticized back for all-day comfort.",
    sellerName: "Everlane",
    quantity: 12
  },
  {
    title: "The Form Bag",
    price: 188,
    category: "Accessories",
    gender: "Women",
    era: "Modern",
    size: "M",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop",
    description: "Elegant saddle bag shape in premium Italian pebbled leather. Features an adjustable webbing shoulder strap.",
    sellerName: "Everlane",
    quantity: 6
  },
  {
    title: "The Modern Loafer",
    price: 148,
    category: "Accessories",
    gender: "Women",
    era: "Modern",
    size: "8",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=800&auto=format&fit=crop",
    description: "Clean, pointed toe loafer tailored in Italy. Hardwearing leather sole and polished box calf upper.",
    sellerName: "Everlane",
    quantity: 8
  },
  {
    title: "The Cactus Leather Tote",
    price: 168,
    category: "Accessories",
    gender: "Unisex",
    era: "Modern",
    size: "L",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop",
    description: "Eco-friendly tote bag crafted from organic, bio-based cactus leather. Sleek design fits a 15-inch laptop.",
    sellerName: "Everlane",
    quantity: 5
  },
  {
    title: "The Cotton Bucket Hat",
    price: 32,
    category: "Accessories",
    gender: "Unisex",
    era: "Modern",
    size: "M",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=800&auto=format&fit=crop",
    description: "Garment-washed cotton twill bucket hat. Soft sweatband strip and breathable vents.",
    sellerName: "Everlane",
    quantity: 18
  },
  {
    title: "The Court Sneaker",
    price: 98,
    category: "Accessories",
    gender: "Unisex",
    era: "Modern",
    size: "9",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=800&auto=format&fit=crop",
    description: "Minimalist leather tennis sneakers. Recycled rubber sole and comfortable cork footbed.",
    sellerName: "Everlane",
    quantity: 14
  },
  {
    title: "The Wool Check Pattern Scarf",
    price: 45,
    category: "Accessories",
    gender: "Unisex",
    era: "Modern",
    size: "One Size",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&auto=format&fit=crop",
    description: "Plaid tartan fringed scarf in 100% fine lambswool. Beautiful charcoal grey and red check tones.",
    sellerName: "Everlane",
    quantity: 25
  },
  {
    title: "The Silk Square Scarf",
    price: 38,
    category: "Accessories",
    gender: "Women",
    era: "Modern",
    size: "One Size",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&auto=format&fit=crop",
    description: "Square scarf in lightweight silk twill. Hand-rolled edges and minimalist geo grid tile print.",
    sellerName: "Everlane",
    quantity: 11
  },
  {
    title: "The Leather Flight Cap",
    price: 70,
    category: "Accessories",
    gender: "Unisex",
    era: "Modern",
    size: "M",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop",
    description: "Aviator flight cap in distressed sheepskin leather. Includes warm shearling ear flaps.",
    sellerName: "Everlane",
    quantity: 4
  },
  {
    title: "The Leather Western Boots",
    price: 165,
    category: "Accessories",
    gender: "Men",
    era: "Modern",
    size: "10",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=800&auto=format&fit=crop",
    description: "Cognac brown pointed-toe cowboy boots featuring traditional hand-stitched Western details.",
    sellerName: "Everlane",
    quantity: 5
  },
  {
    title: "The Day Crossover Sandal",
    price: 78,
    category: "Accessories",
    gender: "Women",
    era: "Modern",
    size: "8",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=800&auto=format&fit=crop",
    description: "Flat crossover strap sandals in soft premium leather. Perfect everyday summer wear.",
    sellerName: "Everlane",
    quantity: 15
  },
  {
    title: "The Transit Backpack",
    price: 75,
    category: "Accessories",
    gender: "Unisex",
    era: "Modern",
    size: "L",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop",
    description: "Water-resistant recycled polyester backpack. Padded laptop compartment and expandable side pockets.",
    sellerName: "Everlane",
    quantity: 13
  },
  {
    title: "The Utility Leather Belt",
    price: 48,
    category: "Accessories",
    gender: "Unisex",
    era: "Modern",
    size: "34",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop",
    description: "Thick vegetable-tanned leather belt with solid brass square buckle. Durable workwear style.",
    sellerName: "Everlane",
    quantity: 19
  },
  {
    title: "The Canvas Duffle Bag",
    price: 95,
    category: "Accessories",
    gender: "Unisex",
    era: "Modern",
    size: "L",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop",
    description: "Heavy cotton canvas travel weekender bag. Complete with leather accents and details.",
    sellerName: "Everlane",
    quantity: 7
  }
];

// Mock Tailoring Vendors
const mockVendors = [
  { id: 'v1', name: 'Savile Row Tailors', rating: 4.9, location: 'London, UK', basePrice: 250, leadTime: '3-4 weeks', desc: 'Crafting premium bespoke suits with classic British cuts since 1921.' },
  { id: 'v2', name: 'Heritage Weavers & Co.', rating: 4.8, location: 'Edinburgh, Scotland', basePrice: 220, leadTime: '2-3 weeks', desc: 'Authentic Celtic weavers specializing in heavy tweed and alpaca wool blends.' },
  { id: 'v3', name: 'Milanese Retro Cutters', rating: 4.7, location: 'Milan, Italy', basePrice: 280, leadTime: '4 weeks', desc: 'Italian tailored drape suits featuring luxurious velvet and silk-blends.' },
  { id: 'v4', name: 'Brooklyn Vintage Stitchers', rating: 4.6, location: 'New York, USA', basePrice: 180, leadTime: '1-2 weeks', desc: 'Local workshop recreating retro 70s corduroy flares and oversized suits.' }
];

// Seed Function
const seedDB = async () => {
  try {
    // Drop existing seed items first to populate the updated 60 clothes clean
    await Product.deleteMany({});
    await Product.insertMany(seedProducts);
    console.log('MongoDB successfully seeded with updated 60 vintage clothes.');
  } catch (err) {
    console.error('Error seeding MongoDB:', err);
  }
};

// Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/vintagestitch';
console.log('Connecting to MongoDB...');
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Successfully connected to MongoDB.');
    await seedDB();
  })
  .catch(async (err) => {
    console.warn('WARNING: MongoDB connection failed. Falling back to local JSON database.');
    console.warn(`Connection Error details: ${err.message}`);
    // Clear and seed the local JSON fallback with updated 60 clothes
    await dbFallback.seedProducts([]); 
    await dbFallback.seedProducts(seedProducts);
  });

// Routes Hookup
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);

// Vendors endpoint
app.get('/api/vendors', (req, res) => {
  res.json(mockVendors);
});

// Health Status Check
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    database: mongoose.connection.readyState === 1 ? 'MongoDB' : 'Local JSON Fallback',
    time: new Date()
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Express Server running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}/api`);
});
