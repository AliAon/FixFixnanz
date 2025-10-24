"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchMeetings,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  Meeting as ReduxMeeting,
} from "@/redux/slices/meetingsSlice";
import { AppDispatch, RootState } from "@/redux/store";
import DeleteConfirmationModal from "../../../../components/modal/DeleteConfirmationModal";
import EditMeetingModal from "@/components/modal/EditMeetingModal";
import { LocationData } from "../../components/Map";

const Map = dynamic(() => import("../../components/Map"), { ssr: false });

// Valid source types that match database constraints
enum MeetingSourceType {
  GoogleMeet = "Google Meet",
  Zoom = "Zoom",
  MicrosoftTeams = "Microsoft Teams",
  OfficeLocation = "Office Location",
}

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

// Helper function to map database values to UI-friendly names
// const getSourceDisplay = (dbSource: string): string => {
//   switch (dbSource) {
//     case MeetingSourceType.GoogleMeet:
//       return "Google Meet";
//     case MeetingSourceType.Zoom:
//       return "Zoom";
//     case MeetingSourceType.MicrosoftTeams:
//       return "Microsoft Teams";
//     case MeetingSourceType.OfficeLocation:
//       return "Office Location";
//     default:
//       return dbSource
//         .split("_")
//         .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//         .join(" ");
//   }
// };

// Create a more specific interface for the component
// interface ExtendedMeeting extends ReduxMeeting {
//   // Additional properties from your old implementation
//   meetingLink?: string;
//   officeLocation?: string;
//   location_object?: {
//     address1: string;
//     address2?: string;
//     city: string;
//     state: string;
//     zip: string;
//     country: string;
//     latitude: number;
//     longitude: number;
//   };
// }

// Location Types
// const LOCATION_TYPES = [
//   {
//     name: "Google Meet",
//     icon: "/images/icons/google.png",
//   },
//   {
//     name: "Zoom",
//     icon: "/images/icons/zoom.png",
//   },
//   {
//     name: "Microsoft Teams",
//     icon: "/images/icons/microsoft.png",
//   },
//   {
//     name: "Office Location",
//     icon: "/images/icons/office.png",
//   },
// ];

// Main Meeting Page Component
const MeetingPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { meetings, loading, error } = useSelector(
    (state: RootState) => state.meetings
  );

  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [meetingLink, setMeetingLink] = useState<string>("");
  const [showMap, setShowMap] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [meetingTitle, setMeetingTitle] = useState<string>("");

  // Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [meetingToDelete, setMeetingToDelete] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [meetingToEdit, setMeetingToEdit] = useState<ReduxMeeting | null>(null);
  // Fetch meetings on component mount
  useEffect(() => {
    dispatch(fetchMeetings())
      .unwrap()
      .catch((error) => {
        toast.error(`Error loading meetings: ${error}`);
      });
  }, [dispatch]);

  // Show error toast when Redux error state changes
  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error}`);
    }
  }, [error]);

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);

    if (
      location === "Google Meet" ||
      location === "Zoom" ||
      location === "Microsoft Teams"
    ) {
      setMeetingLink("");
      setShowMap(false);
    } else if (location === "Office Location") {
      setMeetingLink("");
      setShowMap(true);
    }
  };

  const [locationData, setLocationData] = useState<LocationData | null>(null);


  const handleMapLocationSelect = (data: LocationData) => {
    setLocationData(data);
    setMeetingLink(data.formatted_address);
  };
  const handleSave = () => {
    if (!selectedLocation || !meetingTitle) {
      toast.warning("Please enter meeting title and select a location");
      return;
    }
  
    // Create the meeting data based on the selected location type
    // Convert UI-friendly location names to database-friendly values
    const sourceValue = getSourceValue(selectedLocation);
  
    let meetingData: Partial<ReduxMeeting> = {
      title: meetingTitle,
      source: sourceValue,
    };
  
    if (sourceValue === MeetingSourceType.OfficeLocation) {
      // For office locations, ensure we have all required location data
      if (!locationData) {
        toast.warning("Please select a location from the map");
        return;
      }

      // Set all required location fields inside a location object
      meetingData = {
        ...meetingData,
        link: "",
        location: {
          address1: locationData.address1,
          address2: locationData.address2 || "",
          city: locationData.city,
          state: locationData.state,
          zip: locationData.zip,
          country: locationData.country,
          latitude: locationData.latitude,
          longitude: locationData.longitude
        }
      };
    } else {
      // For virtual meetings (Zoom, Google Meet, Teams)
      if (!meetingLink) {
        toast.warning("Please enter a meeting link");
        return;
      }
  
      // Make sure the link has a valid format with protocol
      let formattedLink = meetingLink;
      if (!meetingLink.startsWith("http://") && !meetingLink.startsWith("https://")) {
        formattedLink = "https://" + meetingLink;
      }
  
      meetingData.link = formattedLink;
    }
  
    if (isEditing && editingId) {
      dispatch(updateMeeting({ id: editingId, data: meetingData }))
        .unwrap()
        .then(() => {
          toast.success("Meeting updated successfully!");
          resetForm();
        })
        .catch((error) => {
          toast.error(`Failed to update meeting: ${error}`);
        });
    } else {
      dispatch(createMeeting(meetingData as ReduxMeeting))
        .unwrap()
        .then(() => {
          toast.success("Meeting saved successfully!");
          resetForm();
        })
        .catch((error) => {
          toast.error(`Failed to save meeting: ${error}`);
        });
    }
  };
  // const handleEdit = (meeting: ReduxMeeting) => {
  //   // Convert database source value to UI-friendly display name
  //   const sourceDisplay = getSourceDisplay(meeting.source);

  //   setMeetingTitle(meeting.title);
  //   setSelectedLocation(sourceDisplay);

  //   // Handle meeting link based on the meeting type
  //   if (meeting.source === MeetingSourceType.OfficeLocation) {
  //     setMeetingLink(meeting.address1 || "");
  //   } else {
  //     setMeetingLink(meeting.link || "");
  //   }

  //   setShowMap(meeting.source === MeetingSourceType.OfficeLocation);
  //   setIsEditing(true);
  //   setEditingId(meeting.id);

  //   window.scrollTo({ top: 0, behavior: "smooth" });
  // };

  const handleEditClick = (meeting: ReduxMeeting) => {
    setMeetingToEdit(meeting);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setMeetingToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (meetingToDelete) {
      dispatch(deleteMeeting(meetingToDelete))
        .unwrap()
        .then(() => {
          toast.success("Meeting deleted successfully!");
          if (isEditing && editingId === meetingToDelete) {
            resetForm();
          }
        })
        .catch((error) => {
          toast.error(`Failed to delete meeting: ${error}`);
        });
    }
  };

  // const handleDelete = (id: string) => {
  //   if (window.confirm("Are you sure you want to delete this meeting?")) {
  //     dispatch(deleteMeeting(id))
  //       .unwrap()
  //       .then(() => {
  //         toast.success("Meeting deleted successfully!");
  //         if (isEditing && editingId === id) {
  //           resetForm();
  //         }
  //       })
  //       .catch((error) => {
  //         toast.error(`Failed to delete meeting: ${error}`);
  //       });
  //   }
  // };

  // Cancel Editing Handler
  const handleCancel = () => {
    resetForm();
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setSelectedLocation("");
    setMeetingLink("");
    setMeetingTitle("");
    setShowMap(false);
    setLocationData(null);
  };

  // Helper function to safely get the location display text
  const getLocationDisplay = (meeting: ReduxMeeting): string => {
    if (meeting.source === MeetingSourceType.OfficeLocation) {
      return meeting.address1 || "";
    } else {
      return meeting.link || "";
    }
  };

  return (
    <div className="py-4 px-[20px]">
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Meeting"
        message="Are you sure you want to delete this meeting? This action cannot be undone."
      />
      <EditMeetingModal
  isOpen={isEditModalOpen}
  onClose={() => setIsEditModalOpen(false)}
  meeting={meetingToEdit}
  onSave={(updatedMeeting: Partial<ReduxMeeting>) => {
    if (updatedMeeting.id) {
      dispatch(
        updateMeeting({
          id: updatedMeeting.id,
          data: updatedMeeting
        })
      )
        .unwrap()
        .then(() => {
          toast.success("Meeting updated successfully!");
          setIsEditModalOpen(false);
        })
        .catch((error) => {
          toast.error(`Failed to update meeting: ${error}`);
        });
    } else {
      toast.error("Meeting ID is missing");
    }
  }}
/>
      <h1 className="text-[32px] font-medium text-primary mb-6">Meetings</h1>

      <div className="grid grid-cols-4 sm:grid-cols-2 xsm:grid-cols-1 gap-4 mb-8 w-full">
        <div
          className={`bg-blue-100 p-4 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-blue-200 transition ${
            selectedLocation === "Google Meet" ? "ring-2 ring-blue-500" : ""
          }`}
          onClick={() => handleLocationSelect("Google Meet")}
        >
          <div className="mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/icons/google.png"
              alt="Google Meet"
              className="w-full h-[100px]"
            />
          </div>
          <p className="text-center text-[#32325D] text-[20px] font-medium">
            Google Meet
          </p>
        </div>

        <div
          className={`bg-blue-100 p-4 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-blue-200 transition ${
            selectedLocation === "Zoom" ? "ring-2 ring-blue-500" : ""
          }`}
          onClick={() => handleLocationSelect("Zoom")}
        >
          <div className="mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/icons/zoom.png"
              alt="Zoom"
              className="w-full h-[100px] object-contain"
            />
          </div>
          <p className="text-center text-[#32325D] text-[20px] font-medium">
            Zoom
          </p>
        </div>

        <div
          className={`bg-blue-100 p-4 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-blue-200 transition ${
            selectedLocation === "Microsoft Teams" ? "ring-2 ring-blue-500" : ""
          }`}
          onClick={() => handleLocationSelect("Microsoft Teams")}
        >
          <div className="mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/icons/microsoft.png"
              alt="Microsoft Teams"
              className="w-full h-[100px] object-contain"
            />
          </div>
          <p className="text-center text-[#32325D] text-[20px] font-medium">
            Microsoft Teams
          </p>
        </div>

        <div
          className={`bg-blue-100 p-4 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-blue-200 transition ${
            selectedLocation === "Office Location" ? "ring-2 ring-blue-500" : ""
          }`}
          onClick={() => handleLocationSelect("Office Location")}
        >
          <div className="mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/icons/office.png"
              alt="Office Location"
              className="w-full h-[100px] object-contain"
            />
          </div>
          <p className="text-center text-[#32325D] text-[20px] font-medium">
            Office Location
          </p>
        </div>
      </div>

      <div className="flex gap-4 sm:flex-col xsm:flex-col">
        <div className="w-full max-w-xs sm:max-w-full xsm:max-w-full">
          <div className="mb-8">
            <div className="mb-4">
              <label htmlFor="meetingTitle" className="block mb-2 font-medium">
                Meeting Title
              </label>
              <input
                type="text"
                id="meetingTitle"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter meeting title"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="selectLocation"
                className="block mb-2 font-medium"
              >
                Selected Location
              </label>
              <input
                type="text"
                id="selectLocation"
                value={selectedLocation}
                readOnly
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            {selectedLocation === "Office Location" ? (
              <div className="mb-4">
                <label
                  htmlFor="officeAddress"
                  className="block mb-2 font-medium"
                >
                  Office Address
                </label>
                {/* <div className="relative">
                  <input
                    type="text"
                    id="officeAddress"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Search for a location or select from map"
                  />
                </div> */}

                {showMap && (
                  <div className="mt-4 h-80 border border-gray-300 rounded-md overflow-hidden shadow-lg">
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

            <div className="flex justify-end space-x-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-[#198754] text-white px-4 py-2 rounded-md hover:bg-[#157347] transition disabled:bg-gray-400"
              >
                {loading ? "Processing..." : isEditing ? "Update" : "Save"}
              </button>

                {isEditing && (
                  <button
                    onClick={handleCancel}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

          {/* {showMap && (
            <div className="mb-8 h-64 border border-gray-300 rounded-md overflow-hidden">
              <Map onSelectLocation={handleMapLocationSelect} />
            </div>
          )} */}
        </div>

        <div className="overflow-x-auto border border-gray-300 rounded-md w-full">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b text-left">#</th>
                <th className="px-4 py-2 border-b text-left">Title</th>
                <th className="px-4 py-2 border-b text-left">Platform</th>
                <th className="px-4 py-2 border-b text-left">Link/Location</th>
                <th className="px-4 py-2 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {meetings.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    {loading
                      ? "Loading meetings..."
                      : "No meetings found. Create one to get started."}
                  </td>
                </tr>
              ) : (
                meetings.map((meeting, index) => (
                  <tr key={meeting.id}>
                    <td className="px-4 py-2 border-b">{index + 1}</td>
                    <td className="px-4 py-2 border-b">{meeting.title}</td>
                    <td className="px-4 py-2 border-b">{meeting.source}</td>
                    <td className="px-4 py-2 border-b">
                      {getLocationDisplay(meeting)}
                    </td>
                    <td className="px-4 py-2 border-b">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditClick(meeting)}
                          className="bg-[#0DCAF0] hover:bg-[#31D2F2] px-3 py-1 rounded-md text-primary"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(meeting.id)}
                          className="bg-[#DC3545] hover:bg-[#BB2D3B] px-3 py-1 rounded-md text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MeetingPage;
