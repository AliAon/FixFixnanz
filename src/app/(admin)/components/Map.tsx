"use client";
/// <reference types="@types/google.maps" />
import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Script from "next/script";

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = "AIzaSyCyxRFJUBD8FoaQr6OzTeMFadxFMau08RA";

// Fix Leaflet icon for better visibility
const icon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const defaultPosition: [number, number] = [51.1657, 10.4515]; // Germany center coordinates

// Define location data interface
export interface LocationData {
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  latitude: number;
  longitude: number;
  formatted_address: string;
}

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface MapProps {
  onSelectLocation: (locationData: LocationData) => void;
  initialLocation?: LocationData;
}

// MapController component for handling animated map movements
const MapController: React.FC<{
  targetPosition: [number, number] | null;
  onAnimationComplete?: () => void;
}> = ({ targetPosition, onAnimationComplete }) => {
  const map = useMap();
  
  useEffect(() => {
    if (targetPosition) {
      // Animate to the target position with smooth flyTo
      map.flyTo(targetPosition, 16, {
        duration: 1.5, // 1.5 seconds animation
        easeLinearity: 0.1
      });
      
      // Call completion callback after animation
      if (onAnimationComplete) {
        const timeout = setTimeout(onAnimationComplete, 1600);
        return () => clearTimeout(timeout);
      }
    }
  }, [targetPosition, map, onAnimationComplete]);
  
  return null;
};

// Google Places Autocomplete component with smart input control
const PlacesAutocomplete: React.FC<{
  onPlaceSelect: (locationData: LocationData) => void;
  initialValue?: string;
  inputValue: string;
  setInputValue: (value: string) => void;
  onLocationSearch: (position: [number, number]) => void;
  scriptReady?: boolean;
}> = ({ onPlaceSelect, initialValue = "", inputValue, setInputValue, onLocationSearch, scriptReady = false }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const [currentValue, setCurrentValue] = useState(inputValue || initialValue || "");
  const [isTyping, setIsTyping] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Optimized input change handler with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentValue(value);
    setInputValue(value);
    setIsTyping(true);
    
    // Clear previous debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Set typing indicator off after user stops typing
    debounceTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 150); // Reduced from 300ms to 150ms for faster response
  };

  // Clear input function
  const handleClear = () => {
    setCurrentValue("");
    setInputValue("");
    setIsTyping(false);
    
    // Clear debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    if (inputRef.current) {
      inputRef.current.value = "";
      // Disable autocomplete temporarily to prevent interference
      if (autocompleteRef.current) {
        google.maps.event.clearListeners(autocompleteRef.current, 'place_changed');
        setTimeout(() => {
          if (autocompleteRef.current) {
            initializePlaceChangedListener();
          }
        }, 50); // Reduced timeout for faster response
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Separated place changed listener for reuse
  const initializePlaceChangedListener = () => {
    if (!autocompleteRef.current) return;
    
    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current!.getPlace();

      if (!place.geometry || !place.geometry.location) {
        return;
      }

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      // Extract address components
      let street = "";
      let streetNumber = "";
      let city = "";
      let state = "";
      let postalCode = "";
      let country = "";

      place.address_components?.forEach((component) => {
        const types = component.types;

        if (types.includes("street_number")) {
          streetNumber = component.long_name;
        } else if (types.includes("route")) {
          street = component.long_name;
        } else if (types.includes("locality")) {
          city = component.long_name;
        } else if (types.includes("administrative_area_level_1")) {
          state = component.long_name;
        } else if (types.includes("postal_code")) {
          postalCode = component.long_name;
        } else if (types.includes("country")) {
          country = component.long_name;
        }
      });

      const locationData: LocationData = {
        address1: streetNumber ? `${streetNumber} ${street}` : street,
        address2: "",
        city,
        state,
        zip: postalCode,
        country,
        latitude: lat,
        longitude: lng,
        formatted_address: place.formatted_address || place.name || "",
      };

      const displayAddress = place.formatted_address || place.name || "";
      setCurrentValue(displayAddress);
      setInputValue(displayAddress);
      onLocationSearch([lat, lng]);
      onPlaceSelect(locationData);
    });
  };

  // Check if Google Maps API is available globally
  const isGoogleMapsLoaded = () => {
    return typeof window !== 'undefined' && 
           window.google && 
           window.google.maps && 
           window.google.maps.places && 
           window.google.maps.places.Autocomplete;
  };

  // Initialize autocomplete with retry mechanism
  const initializeAutocomplete = () => {
    if (!inputRef.current || autocompleteRef.current) return;
    
    if (!isGoogleMapsLoaded()) {
      // Retry initialization after a short delay
      setTimeout(() => {
        initializeAutocomplete();
      }, 100);
      return;
    }

    try {
      // Create session token for faster API responses and better billing
      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
      
      const options = {
        componentRestrictions: { country: "de" }, // Restrict to Germany
        fields: ["address_components", "geometry", "formatted_address"], // Minimal fields for speed
        types: ['geocode'], // Only geocoded results for faster response
        strictBounds: false, // Allow flexible bounds for better results
        sessionToken: sessionTokenRef.current, // Use session token for faster responses
      };

      const autocomplete = new google.maps.places.Autocomplete(
        inputRef.current,
        options
      );

      // Performance optimizations for faster suggestions
      const perfOptions: google.maps.places.AutocompleteOptions = {
        types: ['geocode', 'establishment'], // Include establishments for faster local results
      };

      autocomplete.setOptions(perfOptions);

      // Reduce delay between keypress and API call by restricting bounds
      if (typeof autocomplete.getPlace === 'function') {
        autocomplete.setBounds(
          new google.maps.LatLngBounds(
            new google.maps.LatLng(47.270, 5.866), // Southwest Germany
            new google.maps.LatLng(55.058, 15.042) // Northeast Germany
          )
        );
      }

      autocompleteRef.current = autocomplete;
      initializePlaceChangedListener();
    } catch (error) {
      console.error('Error initializing autocomplete:', error);
      // Retry after a longer delay if there's an error
      setTimeout(() => {
        initializeAutocomplete();
      }, 500);
    }
  };

  // Initialize Google Places Autocomplete when script is ready
  useEffect(() => {
    if ((scriptReady || scriptLoaded) && inputRef.current && !autocompleteRef.current) {
      initializeAutocomplete();
    }
  }, [scriptReady, scriptLoaded, onPlaceSelect, setInputValue, onLocationSearch]);

  // Also try to initialize when the script might already be loaded
  useEffect(() => {
    if (!scriptLoaded && isGoogleMapsLoaded() && inputRef.current && !autocompleteRef.current) {
      setScriptLoaded(true);
      initializeAutocomplete();
    }
  }, []);

  // Additional initialization check on input ref changes
  useEffect(() => {
    if (inputRef.current && !autocompleteRef.current) {
      if (isGoogleMapsLoaded()) {
        setScriptLoaded(true);
        initializeAutocomplete();
      }
    }
  }, [inputRef.current]);

  // Sync with parent input value changes
  useEffect(() => {
    if (inputValue !== currentValue) {
      setCurrentValue(inputValue);
    }
  }, [inputValue]);

  // Update input value if initialValue changes
  useEffect(() => {
    if (initialValue && !currentValue) {
      setCurrentValue(initialValue);
      setInputValue(initialValue);
    }
  }, [initialValue]);

  return (
    <>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={currentValue}
          onChange={handleInputChange}
          placeholder="Search for a location in Germany..."
          className={`w-full p-2 pr-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            isTyping ? 'border-blue-400 shadow-sm bg-blue-50' : ''
          }`}
          autoComplete="off"
          spellCheck="false"
        />
        
        {/* Loading indicator */}
        {isTyping && (
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        )}
        
        {currentValue && !isTyping && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
            type="button"
            title="Clear search"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </>
  );
};

const LocationMarker: React.FC<{
  onSelectLocation: (locationData: LocationData) => void;
  initialPosition?: [number, number];
  setInputValue: (value: string) => void;
  searchPosition?: [number, number] | null;
}> = ({ onSelectLocation, initialPosition, setInputValue, searchPosition }) => {
  const [position, setPosition] = useState<L.LatLng | null>(
    initialPosition ? L.latLng(initialPosition[0], initialPosition[1]) : null
  );

  const map = useMapEvents({
    click(e: L.LeafletMouseEvent) {
      setPosition(e.latlng);

      // Use Google Maps API for reverse geocoding
      fetchAddressFromCoordinates(e.latlng.lat, e.latlng.lng);
    },
  });

  const fetchAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        const result = data.results[0];
        const { address_components, formatted_address } = result;

        let street = "";
        let streetNumber = "";
        let city = "";
        let state = "";
        let postalCode = "";
        let country = "";

        // Extract address components
        address_components.forEach((component: AddressComponent) => {
          const { types, long_name } = component;

          if (types.includes("street_number")) {
            streetNumber = long_name;
          } else if (types.includes("route")) {
            street = long_name;
          } else if (types.includes("locality")) {
            city = long_name;
          } else if (types.includes("administrative_area_level_1")) {
            state = long_name;
          } else if (types.includes("postal_code")) {
            postalCode = long_name;
          } else if (types.includes("country")) {
            country = long_name;
          }
        });

        const locationData: LocationData = {
          address1: streetNumber ? `${streetNumber} ${street}` : street,
          address2: "",
          city,
          state,
          zip: postalCode,
          country,
          latitude: lat,
          longitude: lng,
          formatted_address,
        };

        // Update the input field with the formatted address
        setInputValue(formatted_address);

        // Call the onSelectLocation callback
        onSelectLocation(locationData);
      }
    } catch (error) {
      console.error("Error fetching address:", error);

      // Fallback to coordinates if geocoding fails
      const fallbackData: LocationData = {
        address1: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        address2: "",
        city: "",
        state: "",
        zip: "",
        country: "",
        latitude: lat,
        longitude: lng,
        formatted_address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      };

      setInputValue(fallbackData.formatted_address);
      onSelectLocation(fallbackData);
    }
  };

  // Handle search position updates
  useEffect(() => {
    if (searchPosition) {
      const newPosition = L.latLng(searchPosition[0], searchPosition[1]);
      setPosition(newPosition);
      fetchAddressFromCoordinates(searchPosition[0], searchPosition[1]);
    }
  }, [searchPosition]);

  // Initialize with initial position if provided
  useEffect(() => {
    if (initialPosition && !position) {
      setPosition(L.latLng(initialPosition[0], initialPosition[1]));
      map.setView(initialPosition, 16);
      fetchAddressFromCoordinates(initialPosition[0], initialPosition[1]);
    }
  }, [initialPosition, map]);

  return position === null ? null : (
    <Marker 
      position={position} 
      icon={icon}
      eventHandlers={{
        add: (e) => {
          // Add smooth fade-in animation for marker
          const marker = e.target;
          marker.getElement()?.style.setProperty('opacity', '0');
          setTimeout(() => {
            if (marker.getElement()) {
              marker.getElement().style.transition = 'opacity 0.3s ease-in-out';
              marker.getElement().style.opacity = '1';
            }
          }, 100);
        }
      }}
    />
  );
};

// Global script loading state to avoid multiple loads
let isGlobalGoogleMapsScriptLoading = false;
let isGlobalGoogleMapsScriptLoaded = false;

const Map: React.FC<MapProps> = ({ onSelectLocation, initialLocation }) => {
  const initialPosition = initialLocation
    ? ([initialLocation.latitude, initialLocation.longitude] as [
        number,
        number
      ])
    : undefined;

  const [inputValue, setInputValue] = useState<string>(
    initialLocation?.formatted_address || ""
  );
  const [targetPosition, setTargetPosition] = useState<[number, number] | null>(null);
  const [searchPosition, setSearchPosition] = useState<[number, number] | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [scriptReady, setScriptReady] = useState(isGlobalGoogleMapsScriptLoaded);

  console.debug(isAnimating);

  // Check for script readiness on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 
        window.google && 
        window.google.maps && 
        window.google.maps.places) {
      isGlobalGoogleMapsScriptLoaded = true;
      setScriptReady(true);
    }
  }, []);

  const handleLocationSearch = (position: [number, number]) => {
    setIsAnimating(true);
    setTargetPosition(position);
    setSearchPosition(position);
  };

  const handleScriptLoad = () => {
    isGlobalGoogleMapsScriptLoaded = true;
    isGlobalGoogleMapsScriptLoading = false;
    setScriptReady(true);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-shrink-0 mb-4">
        {!isGlobalGoogleMapsScriptLoaded && !isGlobalGoogleMapsScriptLoading && (
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`}
            onLoad={handleScriptLoad}
            onError={(error) => {
              console.error('Failed to load Google Maps script:', error);
              isGlobalGoogleMapsScriptLoading = false;
            }}
            strategy="lazyOnload"
            onReady={() => {
              isGlobalGoogleMapsScriptLoading = true;
            }}
          />
        )}
        <PlacesAutocomplete
          onPlaceSelect={(data) => {
            onSelectLocation(data);
          }}
          initialValue={initialLocation?.formatted_address}
          inputValue={inputValue}
          setInputValue={setInputValue}
          onLocationSearch={handleLocationSearch}
          scriptReady={scriptReady}
        />
      </div>

      <div className="flex-1 w-full relative overflow-hidden rounded-md">
        <div className="absolute inset-0">
          <MapContainer
            center={initialPosition || defaultPosition}
            zoom={initialPosition ? 16 : 6}
            scrollWheelZoom={true}
            style={{ 
              height: "100%", 
              width: "100%", 
              position: "relative",
              zIndex: 0
            }}
          >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController 
            targetPosition={targetPosition}
            onAnimationComplete={() => {
              setTargetPosition(null);
              setIsAnimating(false);
            }}
          />
          <LocationMarker
            onSelectLocation={onSelectLocation}
            initialPosition={initialPosition}
            setInputValue={setInputValue}
            searchPosition={searchPosition}
          />
          </MapContainer>
        </div>
        
        <div className="absolute bottom-2 left-2 right-2 z-10">
          <div className="bg-white bg-opacity-90 text-xs text-gray-600 p-2 rounded shadow-sm">
            Search for a location above or click on the map to select a precise location
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
