import React, { useState } from 'react';

export default function ProductCard({ product, onClick, onQuickAdd, isFavorite, onToggleFavorite }) {
  const isOutOfStock = product.quantity <= 0;

  // Calculate discount if originalPrice exists
  const originalPrice = product.originalPrice || Math.round(product.price * 1.4);
  const savePercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onToggleFavorite(product._id);
  };

  // Mock colors for dot selectors
  const getProductColors = () => {
    if (product.title.includes('Cardigan')) return ['#151515', '#8b5a2b', '#8c8c8c'];
    if (product.title.includes('Turtleneck')) return ['#151515', '#ffffff', '#333333'];
    if (product.title.includes('Pant')) return ['#333333', '#8c8c8c', '#151515'];
    if (product.title.includes('Beanie')) return ['#4682b4', '#151515', '#8c8c8c'];
    return ['#151515', '#8b5a2b', '#ffffff'];
  };

  // Mock materials attributes
  const getProductAttribute = () => {
    if (product.title.includes('Cardigan') || product.title.includes('Turtleneck') || product.title.includes('Polo')) {
      return 'ORGANIC COTTON';
    }
    if (product.title.includes('Pant') || product.title.includes('Jacket') || product.title.includes('Coat')) {
      return 'RENEWED MATERIALS';
    }
    return 'CLEANER CHEMISTRY';
  };

  const colors = getProductColors();
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);

  return (
    <div className="product-card" onClick={() => onClick(product)} style={{ border: 'none', background: 'none' }}>
      <div className="product-card-image-frame" style={{ borderRadius: '0px', border: '1px solid #f5f5f5', position: 'relative', width: '100%', height: 0, paddingBottom: '125%', overflow: 'hidden' }}>

        {/* Wishlist Trigger */}
        <button
          className={`wishlist-heart-btn ${isFavorite ? 'active' : ''}`}
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
          style={{ borderRadius: '50%', border: 'none', outline: 'none' }}
        >
          <i className={isFavorite ? "ri-heart-fill" : "ri-heart-line"}></i>
        </button>

        {/* Minimalist Sale Badge */}
        {isOutOfStock ? (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2
            }}
          >
            <span className="badge-sold" style={{ backgroundColor: 'var(--color-text-primary)', color: 'var(--color-bg-base)', padding: '6px 12px', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase' }}>Sold Out</span>
          </div>
        ) : savePercent > 0 ? (
          <span
            className="badge-era"
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              backgroundColor: 'var(--color-accent-red)',
              color: '#ffffff',
              fontSize: '0.65rem',
              fontWeight: '700',
              padding: '3px 6px',
              borderRadius: '0px',
              zIndex: 2
            }}
          >
            {savePercent}% OFF
          </span>
        ) : null}

        <img
          src={product.image}
          alt={product.title}
          className="product-card-image"
          loading="lazy"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      <div className="product-card-info" style={{ paddingTop: '8px' }}>
        <h3 className="product-card-title" style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
          {product.title}
        </h3>

        {/* Price Row */}
        <div className="product-card-price-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="product-price-current" style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
            ${product.price}
          </span>
          {savePercent > 0 && (
            <span className="product-price-original" style={{ fontSize: '0.8rem', textDecoration: 'line-through', color: 'var(--color-text-muted)' }}>
              ${originalPrice}
            </span>
          )}
        </div>

        {/* Color swatches */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
          {colors.map((hex, idx) => (
            <span
              key={hex}
              onClick={(e) => { e.stopPropagation(); setSelectedColorIdx(idx); }}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: hex,
                border: selectedColorIdx === idx ? '1.5px solid var(--color-text-primary)' : '1px solid #ddd',
                cursor: 'pointer',
                display: 'inline-block'
              }}
            />
          ))}
        </div>

        {/* Sustainability attribute label */}
        <span
          className="product-card-attribute"
          style={{
            fontSize: '0.65rem',
            letterSpacing: '0.12em',
            fontWeight: '700',
            color: 'var(--color-text-muted)'
          }}
        >
          {getProductAttribute()}
        </span>
      </div>
    </div>
  );
}
