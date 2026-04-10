import React from 'react';

function StarRating({ rating, totalStars = 5 }) {
  return (
    <div className="star-rating">
      {[...Array(totalStars)].map((_, i) => (
        <span key={i} className={i < rating ? "star filled" : "star"}>★</span>
      ))}
    </div>
  );
}

export default StarRating;