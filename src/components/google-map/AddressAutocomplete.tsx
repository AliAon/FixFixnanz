/* eslint-disable  @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';

interface SimpleAddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelected: (addressData: any) => void;
  placeholder?: string;
  className?: string;
}

const AddressAutocomplete: React.FC<SimpleAddressAutocompleteProps> = ({
  value,
  onChange,
  onAddressSelected,
  placeholder = "Enter your address...",
  className = "w-full p-2 border rounded-md border-gray-300 focus:ring-1 focus:outline-[#C2DBFE]"
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? 'AIzaSyCyxRFJUBD8FoaQr6OzTeMFadxFMau08RA';
    
    if (!apiKey) {
      setIsLoading(false);
      return;
    }

    // Load Google Maps script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      (window as any).initMap = () => {
        setIsLoading(false);
        initializeAutocomplete();
      };
      
      script.onerror = () => {
        setIsLoading(false);
      };

      document.head.appendChild(script);
    } else {
      setIsLoading(false);
      initializeAutocomplete();
    }
  }, []);

  const initializeAutocomplete = () => {
    if (!inputRef.current || !window.google) return;

    try {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['address'],
          componentRestrictions: { country: 'de' },
          fields: ['address_components', 'formatted_address', 'geometry']
        }
      );

      // Hide "Powered by Google" logo with CSS
      setTimeout(() => {
        const pacContainer = document.querySelector('.pac-container');
        if (pacContainer) {
          const style = document.createElement('style');
          style.textContent = `
            .pac-container {
              border-radius: 8px;
              border: 1px solid #d1d5db;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            .pac-container::after {
              display: none !important;
            }
            .pac-logo::after {
              display: none !important;
            }
            .pac-item {
              border: none;
              padding: 12px 16px;
              cursor: pointer;
            }
            .pac-item:hover {
              background-color: #f3f4f6;
            }
            .pac-item-selected {
              background-color: #e5e7eb;
            }
            .pac-matched {
              font-weight: 600;
              color: #1f2937;
            }
          `;
          document.head.appendChild(style);
        }
      }, 100);

      // Listen for place selection
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        
        if (!place.address_components) return;

        // Extract address parts
        let streetNumber = '';
        let route = '';
        let city = '';
        let state = '';
        let country = '';
        let postalCode = '';

        place.address_components.forEach((component: any) => {
          const types = component.types;
          
          if (types.includes('street_number')) {
            streetNumber = component.long_name;
          }
          if (types.includes('route')) {
            route = component.long_name;
          }
          if (types.includes('locality')) {
            city = component.long_name;
          }
          if (types.includes('administrative_area_level_1')) {
            country = component.long_name; // Bundesland
          }
          if (types.includes('administrative_area_level_2')) {
            state = component.long_name; // Stadt
          }
          if (types.includes('postal_code')) {
            postalCode = component.long_name;
          }
        });

        // Create address object with lat/lng
        const addressData = {
          address: `${route} ${streetNumber}`.trim(),
          city: city,
          state: state || city,
          country: country,
          postal_code: postalCode,
          lat: place.geometry?.location?.lat() || 0,
          lng: place.geometry?.location?.lng() || 0
        };

        onAddressSelected(addressData);
      });

    } catch (err) {
      console.error('Error initializing autocomplete:', err);
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={isLoading ? "Loading..." : placeholder}
        className={className}
        disabled={isLoading}
        autoComplete="off"
      />
      
      {isLoading && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;