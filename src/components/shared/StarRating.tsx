"use client";
import React, { useState } from "react";

interface StarRatingProps {
  initialRating?: number;
  totalStars?: number;
  size?: "sm" | "md" | "lg";
  onChange?: (rating: number) => void;
  interactive?: boolean;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  initialRating = 0,
  totalStars = 5,
  size = "md",
  onChange,
  interactive = true,
  className = "",
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (index: number) => {
    if (!interactive) return;

    const newRating = index + 1;
    setRating(newRating);
    if (onChange) {
      onChange(newRating);
    }
  };

  const handleMouseEnter = (index: number) => {
    if (!interactive) return;
    setHoverRating(index + 1);
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    setHoverRating(0);
  };

  // Determine star size based on the size prop
  const starSize = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-8 h-8",
  }[size];

  return (
    <div className={`flex ${className}`}>
      {[...Array(totalStars)].map((_, index) => {
        const isActive = (hoverRating || rating) > index;

        return (
          <svg
            key={index}
            className={`${starSize} ${
              isActive ? "text-yellow-400" : "text-gray-300"
            } ${interactive ? "cursor-pointer" : ""}`}
            fill="currentColor"
            viewBox="0 0 20 20"
            onClick={() => handleClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      })}
    </div>
  );
};

export default StarRating;
