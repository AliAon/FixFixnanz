import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import { Meeting as ReduxMeeting } from "@/redux/slices/meetingsSlice";

// Import LocationData interface from Map component
// You should define this interface in a shared types file
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

const Map = dynamic(() => import("../../app/(admin)/components/Map"), { ssr: false });

// Valid source types that match database constraints
enum MeetingSourceType {
  GoogleMeet = "Google Meet",
  Zoom = "Zoom",
  MicrosoftTeams = "Microsoft Teams",
  OfficeLocation = "Office Location",
}

// Helper function to map database values to UI-friendly names
const getSourceDisplay = (dbSource: string): string => {
  switch (dbSource) {
    case MeetingSourceType.GoogleMeet:
      return "Google Meet";
    case MeetingSourceType.Zoom:
      return "Zoom";
    case MeetingSourceType.MicrosoftTeams:
      return "Microsoft Teams";
    case MeetingSourceType.OfficeLocation:
      return "Office Location";
    default:
      return dbSource
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
  }
};

// Helper function to map UI-friendly names to database values
const getSourceValue = (uiSource: string): string => {
  switch (uiSource) {
    case "Google Meet":
      return MeetingSourceType.GoogleMeet;
    case "Zoom":
      return MeetingSourceType.Zoom;
    case "Microsoft Teams":
      return MeetingSourceType.MicrosoftTeams;
    case "Office Location":
      return MeetingSourceType.OfficeLocation;
    default:
      return uiSource.toLowerCase().replace(" ", "_");
  }
};

interface EditMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: ReduxMeeting | null;
  onSave: (meeting: Partial<ReduxMeeting>) => void;
}

const EditMeetingModal: React.FC<EditMeetingModalProps> = ({
  isOpen,
  onClose,
  meeting,
  onSave,
}) => {
  const [title, setTitle] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [meetingLink, setMeetingLink] = useState<string>("");
  const [showMap, setShowMap] = useState<boolean>(false);
  const [locationData, setLocationData] = useState<LocationData | null>(null);

  useEffect(() => {
    if (meeting) {
      setTitle(meeting.title);
      const sourceDisplay = getSourceDisplay(meeting.source);
      setSelectedLocation(sourceDisplay);
      
      if (meeting.source === MeetingSourceType.OfficeLocation && meeting) {
        // Initialize location data from meeting
        const location: LocationData = {
          address1: meeting.address1 || "",
          address2: meeting.address2 || "",
          city: meeting.city || "",
          state: meeting.state || "",
          zip: meeting.zip || "",
          country: meeting.country || "",
          latitude: meeting.latitude || 0,
          longitude: meeting.longitude || 0,
          formatted_address: meeting.address1 || "",
        };
        
        setLocationData(location);
        setMeetingLink(location.formatted_address);
        setShowMap(true);
      } else {
        setMeetingLink(meeting.link || "");
        setLocationData(null);
        setShowMap(false);
      }
    }
  }, [meeting]);

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);

    if (
      location === "Google Meet" ||
      location === "Zoom" ||
      location === "Microsoft Teams"
    ) {
      setMeetingLink("");
      setShowMap(false);
      setLocationData(null);
    } else if (location === "Office Location") {
      setMeetingLink("");
      setShowMap(true);
    }
  };

  // Update to accept LocationData
  const handleMapLocationSelect = (data: LocationData) => {
    setLocationData(data);
    setMeetingLink(data.formatted_address);
  };

  const handleSubmit = () => {
    if (!selectedLocation || !title) {
      toast.warning("Please enter meeting title and select a location");
      return;
    }

    const sourceValue = getSourceValue(selectedLocation);
    
    const meetingData: Partial<ReduxMeeting> = {
      id: meeting?.id,
      title: title,
      source: sourceValue,
    };

    if (sourceValue === MeetingSourceType.OfficeLocation) {
      // For office locations, ensure we have location data
      if (!locationData) {
        toast.warning("Please select a location from the map");
        return;
      }
      meetingData.link = "";
      meetingData.location = {
        address1: locationData.address1,
        address2: locationData.address2,
        city: locationData.city,
        state: locationData.state,
        zip: locationData.zip,
        country: locationData.country,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      };
    } else {
      if (!meetingLink) {
        toast.warning("Please enter a meeting link");
        return;
      }

      let formattedLink = meetingLink;
      if (!meetingLink.startsWith("http://") && !meetingLink.startsWith("https://")) {
        formattedLink = "https://" + meetingLink;
      }

      // Additional validation for common platforms
      if (sourceValue === MeetingSourceType.Zoom && !formattedLink.includes("zoom.us")) {
        if (!formattedLink.includes(".") || formattedLink === "https://") {
          formattedLink = "https://zoom.us/j/123456789";
        }
      } else if (sourceValue === MeetingSourceType.GoogleMeet && !formattedLink.includes("meet.google")) {
        if (!formattedLink.includes(".") || formattedLink === "https://") {
          formattedLink = "https://meet.google.com/abc-defg-hij";
        }
      } else if (sourceValue === MeetingSourceType.MicrosoftTeams && !formattedLink.includes("teams.microsoft")) {
        if (!formattedLink.includes(".") || formattedLink === "https://") {
          formattedLink = "https://teams.microsoft.com/l/meetup-join/sample-link";
        }
      }

      meetingData.link = formattedLink;
      meetingData.address1 = undefined;
      meetingData.address2 = undefined;
      meetingData.city = undefined;
      meetingData.country = undefined;
      meetingData.state = undefined;
      meetingData.zip = undefined;
      meetingData.latitude = undefined;
      meetingData.longitude = undefined;
    }

    onSave(meetingData);
  };

  if (!isOpen || !meeting) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-primary">Edit Meeting</h3>
          <button
            onClick={onClose}
            className="text-black hover:text-gray-600 bg-transparent p-0 border-0"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          {/* Meeting Title */}
          <div className="mb-4">
            <label htmlFor="editMeetingTitle" className="block mb-2 font-medium">
              Meeting Title
            </label>
            <input
              type="text"
              id="editMeetingTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter meeting title"
            />
          </div>

          {/* Location Options */}
          <div className="mb-4">
            <label className="block mb-2 font-medium">Meeting Platform</label>
            <div className="grid grid-cols-4 sm:grid-cols-2 gap-2">
              <div
                className={`bg-blue-100 p-3 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-blue-200 transition ${
                  selectedLocation === "Google Meet" ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => handleLocationSelect("Google Meet")}
              >
                <div className="text-center text-[#32325D] font-medium">
                  Google Meet
                </div>
              </div>

              <div
                className={`bg-blue-100 p-3 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-blue-200 transition ${
                  selectedLocation === "Zoom" ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => handleLocationSelect("Zoom")}
              >
                <div className="text-center text-[#32325D] font-medium">
                  Zoom
                </div>
              </div>

              <div
                className={`bg-blue-100 p-3 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-blue-200 transition ${
                  selectedLocation === "Microsoft Teams" ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => handleLocationSelect("Microsoft Teams")}
              >
                <div className="text-center text-[#32325D] font-medium">
                  Microsoft Teams
                </div>
              </div>

              <div
                className={`bg-blue-100 p-3 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-blue-200 transition ${
                  selectedLocation === "Office Location" ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => handleLocationSelect("Office Location")}
              >
                <div className="text-center text-[#32325D] font-medium">
                  Office Location
                </div>
              </div>
            </div>
          </div>

          {/* Meeting Link or Office Address */}
          {selectedLocation === "Office Location" ? (
            <div className="mb-4">
              <label htmlFor="officeAddress" className="block mb-2 font-medium">
                Office Address
              </label>
              
              {showMap && (
                <div className="h-80 border border-gray-300 rounded-md overflow-hidden shadow-lg">
                  <Map 
                    onSelectLocation={handleMapLocationSelect} 
                    initialLocation={locationData || undefined}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="mb-4">
              <label htmlFor="meetingLink" className="block mb-2 font-medium">
                Meeting Link
              </label>
              <input
                type="url"
                id="meetingLink"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter meeting link (e.g., https://zoom.us/...)"
              />
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-[#198754] hover:bg-[#157347] text-white rounded-md transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMeetingModal;