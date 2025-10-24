import React, { ReactNode, useState } from "react";

import { FaMapMarkerAlt } from "react-icons/fa";

interface CardProps {
  image: string;
  name: string;
  title: string;
  address: ReactNode;
  total_reviews: number;
  id: string;
  userId: string;
  average_rating: number;
  onCardClick: (id: string, userId: string) => void;
}

const Card: React.FC<CardProps> = ({ image, name, title, address, total_reviews, id, userId, onCardClick }) => {
  const [imageError, setImageError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);
  
  // Check if we have a valid image URL (not empty, not 'Profile Picture', and no error)
  const hasValidImage = image && image.trim() !== '' && image !== 'Profile Picture' && !imageError;
  
  // Define the fallback image
  const defaultImage = '/images/agent-2.jpg';
  
  // Always try to show an image unless both original and fallback failed
  const shouldShowImage = !fallbackError;
  const imageToShow = hasValidImage ? image : defaultImage;

  const handleClick = () => {
    onCardClick(id, userId);
  };

  return (
    <div className="group cursor-pointer bg-white rounded-xl shadow-lg px-3 pb-8 pt-4 w-full max-w-[400px] max-h-[580px] transform transition-all duration-300 hover:-translate-y-3" onClick={handleClick}>
      <div className="bg-[#03254c] p-4 rounded-xl h-[360px] text-center relative">
        <div className="flex justify-center">
          <div className="relative w-full max-w-[155px] mt-4 h-[155px] rounded-md overflow-hidden bg-gray-200">
            {shouldShowImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={imageToShow} 
                alt="Profile Picture" 
                className="w-full h-full object-cover"
                onError={() => {
                  if (hasValidImage) {
                    // If the original image failed, try the default
                    setImageError(true);
                  } else {
                    // If even the default image failed, show placeholder
                    setFallbackError(true);
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 bg-white rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600 font-medium">No Image</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <h2 className="text-white text-[20px] font-roboto font-bold mt-5 group-hover:text-[#1477BC] duration-300">
          {name}
        </h2>
        <div className="flex items-center justify-center w-full">
          <div className="bg-white font-roboto text-[#647082] font-normal px-5 py-1 text-md rounded-full mt-2">
            {title}
          </div>
        </div>
      </div>

      <div className="p-4 text-center flex w-full items-start justify-between">
        <div className="flex flex-col items-start justify-center text-secondary text-lg text-left font-roboto max-w-[60%]">
          <div className="flex flex-col items-start">
            <FaMapMarkerAlt className="mr-2 mt-1 flex-shrink-0" fill="#333333" size={16} />
            <span className="text-sm text-gray-600 leading-tight overflow-hidden text-ellipsis" style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              maxHeight: '2.5rem'
            }}>
              {typeof address === 'string' && address.length > 40 
                ? `${address.substring(0, 40)}...` 
                : address || 'Location not specified'
              }
            </span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between">
          <div className="mt-2">
            <span className="text-yellow-500 text-sm">★★★★★</span>
            <span className="text-gray-600 text-md font-medium ml-1">({total_reviews})</span>
          </div>
          <span className="text-[#647082] font-roboto text-md font-normal mt-1 inline-block">
          Bewertungen
          </span>
        </div>
      </div>
      <div className="border-[2px] border-[#03254c] mt-2"></div>
      <div className="p-4">
        <div className="w-full bg-[#03254c] hover:bg-secondary duration-300 text-white py-2 rounded-lg text-lg font-roboto font-semibold text-center">
          Profil ansehen
        </div>
      </div>
    </div>
  );
};

export default Card;
