import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from './ProductCard';

export default function ProductDetailView({ 
  productId, 
  onBack, 
  onAddToCart, 
  onProductClick, 
  favorites, 
  onToggleFavorite 
}) {
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSimilar, setLoadingSimilar] = useState(true);

  // Detail Choices
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('M');
  const [activeThumbnail, setActiveThumbnail] = useState(0);
  const [isAddedToBag, setIsAddedToBag] = useState(false);

  // Fetch product data
  useEffect(() => {
    setLoading(true);
    setLoadingSimilar(true);
    
    fetch(`http://localhost:5001/api/products/${productId}`)
      .then(res => {
        if (!res.ok) throw new Error('Product not found');
        return res.json();
      })
      .then(data => {
        setProduct(data);
        setSelectedColor(data.title.includes('Beanie') ? 'Chambray Blue' : data.title.includes('Cardigan') ? 'Brown' : 'Charcoal Plaid');
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    fetch(`http://localhost:5001/api/products/${productId}/similar`)
      .then(res => res.json())
      .then(data => {
        setSimilarProducts(data);
        setLoadingSimilar(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingSimilar(false);
      });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId]);

  if (loading) {
    return (
      <div className="stitch-loader-container">
        <div className="stitch-loader"></div>
        <p className="loader-text">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '6rem 2rem' }}>
        <i className="ri-error-warning-line" style={{ fontSize: '3rem', color: 'var(--color-accent-red)' }}></i>
        <h2 style={{ marginTop: '1.5rem', fontWeight: '400' }}>Item Not Found</h2>
        <button className="btn-pill solid" style={{ marginTop: '2rem' }} onClick={onBack}>Back to Shop</button>
      </div>
    );
  }

  const isOutOfStock = product.quantity <= 0;
  const isFavorite = favorites.includes(product._id);
  const originalPrice = product.originalPrice || Math.round(product.price * 1.4);
  const savePercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  // Gallery array using high-quality fashion portraits
  const galleryImages = [
    product.image,
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop',
  ];

  const handleNextThumbnail = () => {
    setActiveThumbnail((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrevThumbnail = () => {
    setActiveThumbnail((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleAddToCartClick = () => {
    onAddToCart({
      ...product,
      size: selectedSize,
      color: selectedColor
    });
    setIsAddedToBag(true);
    setTimeout(() => {
      setIsAddedToBag(false);
    }, 2000);
  };

  return (
    <motion.main 
      className="container pdp-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Breadcrumbs link */}
      <div className="pdp-breadcrumb" style={{ fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '2rem' }}>
        Home &gt; {product.gender} &gt; {product.category} &gt; <strong style={{ color: 'var(--color-text-primary)' }}>{product.title}</strong>
      </div>

      <div className="pdp-layout">
        {/* Left Column Gallery (Everlane vertical/grid list) */}
        <div className="pdp-gallery-frame">
          <div className="pdp-main-image-container" style={{ borderRadius: '0px', border: '1px solid #f5f5f5' }}>
            {/* Gallery Control arrows */}
            <button 
              onClick={handlePrevThumbnail}
              style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', background: '#ffffff', border: '1px solid var(--color-border)', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 3 }}
              aria-label="Previous image"
            >
              <i className="ri-arrow-left-s-line"></i>
            </button>
            <button 
              onClick={handleNextThumbnail}
              style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: '#ffffff', border: '1px solid var(--color-border)', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 3 }}
              aria-label="Next image"
            >
              <i className="ri-arrow-right-s-line"></i>
            </button>

            {/* Floating Heart Wishlist Trigger */}
            <button 
              className={`wishlist-heart-btn ${isFavorite ? 'active' : ''}`}
              onClick={() => onToggleFavorite(product._id)}
              style={{ position: 'absolute', top: '15px', right: '15px', borderRadius: '50%', border: 'none' }}
              aria-label="Toggle wishlist"
            >
              <i className={isFavorite ? "ri-heart-fill" : "ri-heart-line"}></i>
            </button>

            <img 
              src={galleryImages[activeThumbnail]} 
              alt={product.title} 
              className="pdp-main-image" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div className="pdp-thumbnails-row">
            {galleryImages.map((img, idx) => (
              <img 
                key={idx}
                src={img} 
                alt="thumbnail" 
                className={`pdp-thumbnail ${idx === activeThumbnail ? 'active' : ''}`} 
                onClick={() => setActiveThumbnail(idx)}
                style={{ borderRadius: '0px', border: idx === activeThumbnail ? '1px solid var(--color-text-primary)' : '1px solid transparent' }}
              />
            ))}
          </div>
        </div>

        {/* Right Column Details */}
        <div className="pdp-details-pane">
          <span className="pdp-brand-name" style={{ letterSpacing: '0.15em', fontWeight: '700' }}>EVERLANE</span>
          <h1 className="pdp-title-name" style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: '400', marginBottom: '0.5rem' }}>{product.title}</h1>

          <div className="pdp-price-rating-line" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              ${product.price}
            </span>
            {savePercent > 0 && (
              <>
                <span style={{ fontSize: '1.1rem', textDecoration: 'line-through', color: 'var(--color-text-muted)' }}>
                  ${originalPrice}
                </span>
                <span style={{ backgroundColor: 'var(--color-accent-red)', color: '#ffffff', fontSize: '0.65rem', fontWeight: '700', padding: '3px 6px' }}>
                  ({savePercent}% Off)
                </span>
              </>
            )}

            <span style={{ color: 'var(--color-text-muted)' }}>|</span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
              <i className="ri-star-fill rating-star-icon" style={{ color: 'var(--color-accent-gold)' }}></i>
              <strong>4.8</strong>
              <span className="pdp-sales-count">(124 Reviews)</span>
            </div>
          </div>

          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: '1.7' }}>
            {product.description}
          </p>

          <div className="pdp-divider-line"></div>

          {/* Color Selector */}
          <div className="pdp-swatches-group">
            <div className="pdp-swatches-label" style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Color: <span style={{ fontWeight: '400', textTransform: 'none', color: 'var(--color-text-secondary)' }}>{selectedColor}</span>
            </div>
            <div className="color-swatches-row" style={{ marginTop: '8px' }}>
              {[
                { name: 'Charcoal Plaid', hex: '#333333' },
                { name: 'Chambray Blue', hex: '#4682b4' },
                { name: 'Brown', hex: '#8b5a2b' },
                { name: 'Black', hex: '#151515' }
              ].map((c) => (
                <button
                  key={c.name}
                  className={`color-swatch-btn ${selectedColor === c.name ? 'active' : ''}`}
                  style={{ backgroundColor: c.hex, width: '32px', height: '32px', borderRadius: '50%', border: selectedColor === c.name ? '2px solid var(--color-text-primary)' : '1px solid #ddd' }}
                  onClick={() => setSelectedColor(c.name)}
                  title={c.name}
                  aria-label={`Select color ${c.name}`}
                />
              ))}
            </div>
          </div>

          {/* Size Selector */}
          <div className="pdp-swatches-group" style={{ marginTop: '2rem' }}>
            <div className="pdp-swatches-label" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span>Size: {selectedSize}</span>
              <span style={{ textDecoration: 'underline', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '400', textTransform: 'none' }}>Size Guide</span>
            </div>
            <div className="size-swatches-grid" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              {['XS', 'S', 'M', 'L', 'XL'].map((s) => (
                <button
                  key={s}
                  className={`size-swatch-btn ${selectedSize === s ? 'active' : ''}`}
                  onClick={() => setSelectedSize(s)}
                  style={{ 
                    flex: 1, 
                    padding: '12px', 
                    borderRadius: '0px', 
                    border: selectedSize === s ? '1px solid var(--color-text-primary)' : '1px solid var(--color-border)',
                    backgroundColor: selectedSize === s ? 'var(--color-text-primary)' : 'transparent',
                    color: selectedSize === s ? '#ffffff' : 'var(--color-text-primary)',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Action Row Add to bag */}
          <div className="pdp-actions-row" style={{ display: 'flex', gap: '12px', marginTop: '2.5rem', marginBottom: '2rem' }}>
            <button 
              className="btn-pill solid"
              onClick={handleAddToCartClick}
              disabled={isOutOfStock}
              style={{ 
                flex: 2, 
                padding: '15px', 
                borderRadius: '0px', 
                fontSize: '0.85rem',
                backgroundColor: isAddedToBag ? '#2b3a2a' : 'var(--color-text-primary)',
                borderColor: isAddedToBag ? '#2b3a2a' : 'var(--color-text-primary)'
              }}
            >
              {isAddedToBag ? 'Added to Bag ✓' : 'Add To Bag'}
            </button>
            <button 
              className="btn-pill outlined"
              onClick={onBack}
              style={{ flex: 1, padding: '15px', borderRadius: '0px', fontSize: '0.85rem' }}
            >
              Back To Shop
            </button>
          </div>

          {/* Shipping & Returns labels */}
          <div className="pdp-delivery-notices" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
            <div><i className="ri-truck-line" style={{ marginRight: '8px' }}></i> <strong>Free Shipping:</strong> On orders over $75</div>
            <div><i className="ri-arrow-go-back-line" style={{ marginRight: '8px' }}></i> <strong>Easy Returns:</strong> 30-day return policy</div>
            <div><i className="ri-shield-check-line" style={{ marginRight: '8px' }}></i> <strong>Ethically Sourced:</strong> Certified factory production</div>
          </div>
        </div>
      </div>

      {/* Review Summary (Everlane style) */}
      <div style={{ marginTop: '5rem', borderTop: '1px solid var(--color-border)', paddingTop: '4rem' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: '400', marginBottom: '3rem', textAlign: 'center' }}>Reviews</h2>
        
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="reviews-breakout-box" style={{ borderRadius: '0px' }}>
            <div className="reviews-score-col">
              <div className="reviews-score-large">4.8</div>
              <div className="reviews-stars-row">
                <i className="ri-star-fill rating-star-icon"></i>
                <i className="ri-star-fill rating-star-icon"></i>
                <i className="ri-star-fill rating-star-icon"></i>
                <i className="ri-star-fill rating-star-icon"></i>
                <i className="ri-star-fill rating-star-icon"></i>
              </div>
              <span className="reviews-score-sub">Based on 124 reviews</span>
            </div>

            {/* Everlane Fit Scale Slider */}
            <div className="reviews-bars-list" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700', marginBottom: '1.5rem' }}>Fit & Sizing</h3>
              
              <div className="fit-scale-slider-box">
                <div className="fit-slider-label">
                  <span>Runs Small</span>
                  <span style={{ fontWeight: '700' }}>True to Size</span>
                  <span>Runs Large</span>
                </div>
                <div className="fit-slider-bar">
                  <div className="fit-slider-marker"></div>
                </div>
                <div className="fit-slider-ends">
                  <span>Spot on (10%)</span>
                  <span>Perfect (75%)</span>
                  <span>Generous (15%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Review Lists */}
          <div className="reviews-customer-list" style={{ borderTop: 'none', marginTop: '2rem' }}>
            {[
              { name: 'Sarah M.', date: 'July 5, 2026', stars: 5, text: 'This shirt jacket is gorgeous! The wool has a nice structural drape, and it runs slightly oversized which is exactly what I wanted. Perfect for layering over turtlenecks.' },
              { name: 'David K.', date: 'June 28, 2026', stars: 5, text: 'Extremely well-made. The plaids line up nicely at the seams, and the inner lining is soft on the skin. Outstanding quality!' },
              { name: 'Elena R.', date: 'June 20, 2026', stars: 4, text: 'Beautiful wool weight and pattern. Runs a bit large, so I recommend sizing down if you prefer a standard tailored fit.' }
            ].map((rev) => (
              <div className="review-customer-item" key={rev.name} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '2rem' }}>
                <div className="review-customer-header" style={{ marginBottom: '8px' }}>
                  <span className="review-customer-name" style={{ fontWeight: '700' }}>{rev.name}</span>
                  <span className="review-customer-date" style={{ color: 'var(--color-text-muted)' }}>{rev.date}</span>
                </div>
                <div className="review-customer-stars" style={{ marginBottom: '10px', color: 'var(--color-accent-gold)' }}>
                  {Array.from({ length: rev.stars }).map((_, i) => (
                    <i className="ri-star-fill" key={i}></i>
                  ))}
                </div>
                <p className="review-customer-text" style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>{rev.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Products Grid */}
      <div style={{ marginTop: '6rem', paddingTop: '4rem', borderTop: '1px solid var(--color-border)' }}>
        <div className="section-header-row">
          <h2 className="section-title-large" style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: '400' }}>People Also Loved</h2>
          <button className="btn-pill outlined" onClick={onBack} style={{ borderRadius: '0px' }}>View All</button>
        </div>

        {loadingSimilar ? (
          <div className="stitch-loader-container"><div className="stitch-loader"></div></div>
        ) : (
          <div className="products-grid">
            {similarProducts.map(p => (
              <ProductCard 
                key={p._id}
                product={p}
                onClick={(item) => onProductClick(item._id)}
                onQuickAdd={onAddToCart}
                isFavorite={favorites.includes(p._id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </motion.main>
  );
}
