"use client";
import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchPublicAdvisorProfile, fetchPublicAdvisorSocialProfile } from "@/redux/slices/advisorsSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Button from "@/components/shared/Button";
import { FaStar } from "react-icons/fa";
import { FaMessage } from "react-icons/fa6";
import { FaLink } from "react-icons/fa";
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok, FaTwitter } from "react-icons/fa";
import StarRating from "@/components/shared/StarRating";
import ContactDialog from "../../ContactDialouge";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchUserCalendarSettings,
} from "@/redux/slices/calendarSettingsSlice";

interface TimeSlot {
  day: string;
  slots: string[];
}

interface Address {
  street: string;
  city: string;
  region: string;
}

interface WeeklySchedule {
  weekday: string;
  start: string;
  end: string;
  is_available: boolean;
  booked_slots: Array<{
    start_time: string;
    end_time: string;
    status: string;
    appointment_id: string;
  }>;
}

interface Profile {
  id: string;
  name: string;
  title: string;
  rating: number;
  reviewCount: number;
  memberSince: string;
  address: Address;
  image: string;
  availableTimes?: TimeSlot[]; // Keep for backward compatibility
  weekly_schedule?: WeeklySchedule[]; // Add this
  description: string;
}

interface RatingFilterItem {
  id: number;
  rating: number;
  selected: boolean;
}

// Updated interface to match backend response
interface PublicAdvisorProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  avatar_url: string;
  about?: string;
  service_title?: string;
  service_details?: string;
  broker: boolean;
  freelancer: boolean;
  is_visible: boolean;
  created_at: string;
  average_rating: number;
  total_reviews: number;
  ratings: Array<{
    rating: number;
    review: string;
    created_at: string;
    user_name: string;
    user_avatar: string | null;
  }>;
  category_name?: string;
  category_image?: string | null;
  website?: string;
  weekly_schedule?: WeeklySchedule[];
  // Potential social media fields that might be included
  facebook_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  tiktok_url?: string;
}

const ProfilePage: React.FC = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const userId = searchParams.get("userId") || id;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const dispatch = useDispatch<AppDispatch>();
  const { currentAdvisor, currentPublicSocialProfile, isLoading, error } = useSelector(
    (state: RootState) => state.advisors
  );
  const { userCalendarSettings } = useSelector(
    (state: RootState) => state.calendarSettings
  );
  const { isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  // Type assertion with proper checking
  const advisorProfile = currentAdvisor as unknown as PublicAdvisorProfile;

  const toggleDialog = () => {
    setDialogOpen(!dialogOpen);
  };

  const handleBookAppointment = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to book an appointment");
      return;
    }
    router.push(`/experts/profile/appointment?id=${id}`);
  };

  // State for retry mechanism
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Fetch advisor data on component mount
  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          setIsRetrying(true);
          await Promise.all([
            dispatch(fetchPublicAdvisorProfile(id)).unwrap(),
            dispatch(fetchPublicAdvisorSocialProfile(id))
          ]);
        } catch (error) {
          console.error('Error fetching profile data:', error);
          // Auto-retry up to 2 times
          if (retryCount < 2) {
            console.log(`Retrying... attempt ${retryCount + 1}`);
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, 1000); // Wait 1 second before retry
          }
        } finally {
          setIsRetrying(false);
        }
      };
      
      fetchData();
    }
  }, [id, dispatch, retryCount]);

  useEffect(() => {
    dispatch(fetchUserCalendarSettings(id));
  }, [dispatch, id]);

  // ✅ Default weekdays order
  const weekdaysOrder = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  // Transform API data to component format
  useEffect(() => {
    if (advisorProfile && advisorProfile.id) {
      
      const transformedProfile: Profile = {
        id: advisorProfile.user_id,
        name:
          `${advisorProfile.first_name || ""} ${advisorProfile.last_name || ""}`.trim() ||
          "Unknown Advisor",
        title:
          advisorProfile.service_title ||
          advisorProfile.category_name ||
          "Financial Advisor",
        rating: advisorProfile.average_rating || 0,
        reviewCount: advisorProfile.total_reviews || 0,
        memberSince: advisorProfile.created_at
          ? `Member since ${new Date(advisorProfile.created_at).getFullYear()}`
          : "Recently joined",
        address: {
          street: "",
          city: "",
          region: "",
        },
        image: advisorProfile.avatar_url || "/images/agent-2.jpg",
        // Transform weekly_schedule to availableTimes for backward compatibility
        availableTimes: advisorProfile.weekly_schedule?.map((schedule) => ({
          day: schedule.weekday,
          slots: schedule.is_available
            ? [`${schedule.start} - ${schedule.end}`]
            : ["Closed"],
        })),
        weekly_schedule: advisorProfile.weekly_schedule, // Keep the original data
        description:
          advisorProfile.about ||
          advisorProfile.service_details ||
          "Professional financial advisor providing excellent services.",
      };

      setProfile(transformedProfile);
    }
  }, [advisorProfile]);

  const [ratingItems, setRatingItems] = useState<RatingFilterItem[]>([
    { id: 1, rating: 5, selected: false },
  ]);

  const handleRatingChange = (id: number, newRating: number) => {
    setRatingItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, rating: newRating } : item
      )
    );
  };

  // Helper function to get social media icons
  const getSocialMediaIcons = () => {
    // Use social media data from the dedicated social profile API
    // Falls back to checking main advisor profile if needed
    const socialData = currentPublicSocialProfile || advisorProfile;
    
    console.log('Getting social media icons...');
    console.log('currentPublicSocialProfile:', currentPublicSocialProfile);
    console.log('advisorProfile (fallback):', advisorProfile);
    console.log('socialData being used:', socialData);
    
    if (!socialData) {
      console.log('No social data available');
      return [];
    }
    
    const socialMediaPlatforms = [
      {
        name: 'Facebook',
        url: socialData.facebook_url,
        icon: FaFacebook,
        color: 'text-blue-600 hover:text-blue-700',
      },
      {
        name: 'Instagram', 
        url: socialData.instagram_url,
        icon: FaInstagram,
        color: 'text-pink-500 hover:text-pink-600',
      },
      {
        name: 'LinkedIn',
        url: socialData.linkedin_url,
        icon: FaLinkedin,
        color: 'text-blue-700 hover:text-blue-800',
      },
      {
        name: 'TikTok',
        url: socialData.tiktok_url,
        icon: FaTiktok,
        color: 'text-black hover:text-gray-800',
      },
      {
        name: 'Twitter',
        url: socialData.twitter_url,
        icon: FaTwitter,
        color: 'text-blue-400 hover:text-blue-500',
      },
    ];
    
    // Only return platforms with valid URLs from the database
    return socialMediaPlatforms.filter(platform => 
      platform.url && platform.url.trim() !== '' && platform.url !== 'undefined'
    );
  };

  const socialMediaIcons = getSocialMediaIcons();

  // Show error if there's an error
  if (error && !isRetrying) {
    return (
      <div className="my-32 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Profile
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          {retryCount > 0 && (
            <p className="text-blue-600 mb-4">Attempted {retryCount} automatic retries</p>
          )}
          <div className="bg-gray-100 p-4 rounded-lg mb-4 text-sm text-left">
            <p><strong>Debug Info:</strong></p>
            <p>Profile ID: {id}</p>
            <p>API URL: {process.env.NEXT_PUBLIC_API_URL}</p>
            <p>Full Endpoint: {process.env.NEXT_PUBLIC_API_URL}/advisors/public/{id}</p>
            <p>Social Endpoint: {process.env.NEXT_PUBLIC_API_URL}/advisor-social/public/{id}</p>
            <p>Retry Count: {retryCount}/2</p>
          </div>
          <Button
            text="Try Again"
            className="mt-4 px-6 bg-base mr-2"
            onClick={() => {
              setRetryCount(0);
              dispatch(fetchPublicAdvisorProfile(id));
              dispatch(fetchPublicAdvisorSocialProfile(id));
            }}
          />
          <Button
            text="Back to Experts"
            className="mt-4 px-6 bg-gray-500"
            onClick={() => router.push('/experts')}
          />
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading || !profile || isRetrying) {
    return (
      <div id="loading">
        <div id="loading-center">
          <div id="loading-center-absolute">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/favicon.png" alt="Loading" />
            {isRetrying && (
              <p className="text-center mt-4 text-gray-600">
                {retryCount > 0 ? `Retrying... (${retryCount + 1}/3)` : 'Loading profile...'}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-32">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
      />

      {dialogOpen && (
        <ContactDialog
          isOpen={dialogOpen}
          onClose={toggleDialog}
          recipientName={profile.name}
          advisorId={userId}
        />
      )}

      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/bg2.jpg"
          alt="Background"
          className="absolute -z-20 h-[350px] w-full"
        />
      </div>

      <div className="px-4 pt-28 max-w-[1330px] mx-auto">
        <div className="flex items-start justify-between">
          <div className="flex sm:flex-col xsm:flex-col gap-8 w-full">
            <div className="bg-base w-full max-w-[330px] sm:max-w-full xsm:max-w-full rounded-lg p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.image}
                alt={profile.name}
                className="rounded-lg h-[300px] w-full sm:object-top xsm:object-top sm:h-[350px] object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/images/agent-2.jpg";
                }}
              />
              {/* Social Media Icons */}
              <div className="pt-4">
                {socialMediaIcons.length > 0 ? (
                  <div className="flex items-center gap-3 mb-4">
                    {socialMediaIcons.map((platform, index) => {
                      const IconComponent = platform.icon;
                      return (
                        <a
                          key={index}
                          href={platform.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`
                            group relative w-12 h-12 rounded-full flex items-center justify-center
                            bg-gradient-to-br from-white to-gray-50 shadow-lg
                            border border-gray-200 hover:border-transparent
                            transform transition-all duration-300 ease-in-out
                            hover:scale-110 hover:shadow-xl hover:-translate-y-1
                            ${platform.name === 'Facebook' ? 'hover:from-blue-500 hover:to-blue-600' :
                              platform.name === 'Instagram' ? 'hover:from-pink-500 hover:to-purple-600' :
                              platform.name === 'LinkedIn' ? 'hover:from-blue-600 hover:to-blue-700' :
                              platform.name === 'TikTok' ? 'hover:from-gray-800 hover:to-black' :
                              'hover:from-blue-400 hover:to-blue-500'}
                          `}
                          title={`Visit ${platform.name} profile`}
                          aria-label={`Visit ${platform.name} profile`}
                        >
                          <IconComponent 
                            className={`
                              text-xl transition-all duration-300
                              ${platform.color}
                              group-hover:text-white group-hover:scale-110
                            `}
                          />
                          
                          {/* Animated ring on hover */}
                          <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-white/30 transition-all duration-300 animate-pulse opacity-0 group-hover:opacity-100"></div>
                          
                          {/* Tooltip */}
                          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
                            {platform.name}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[#647082] font-roboto text-sm mb-4 italic">
                    No social media accounts available.
                  </p>
                )}
                
                <div className="hidden sm:block xsm:block">
                  <Button
                    text={
                      <div className="flex items-center justify-center gap-2 font-roboto text-lg">
                        <FaMessage /> Send Message
                      </div>
                    }
                    className="px-8 bg-[#fff] text-base"
                    onClick={toggleDialog}
                  />
                </div>
              </div>
            </div>

            <div>
              <h1 className="font-roboto text-secondary font-bold text-[37px] sm:text-center sm:flex sm:flex-col xsm:flex xsm:flex-col xsm:text-center">
                {profile.name}
                <span className="sm:hidden xsm:hidden">|</span>
                <span className="text-[25px] font-bold">{profile.title}</span>
              </h1>

              <div className="flex items-center mt-3 sm:justify-center xsm:justify-center">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={`text-xl ${star <= profile.rating ? "text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-[#647082] font-roboto font-semibold text-md">
                  {profile.reviewCount} review
                  {profile.reviewCount !== 1 ? "s" : ""}
                </span>
              </div>

              <div>
                <h1 className="text-secondary font-roboto mt-2 sm:text-center xsm:text-center">
                  {profile.memberSince}
                </h1>
              </div>
            </div>
          </div>

          <div className="pt-16 sm:hidden xsm:hidden">
            <Button
              text={
                <div className="flex items-center w-[150px] justify-center gap-2 font-roboto text-lg">
                  <FaMessage /> Send Message
                </div>
              }
              className="px-8 bg-base"
              onClick={toggleDialog}
            />
          </div>
        </div>

        <div className="py-8 flex sm:flex-col xsm:flex-col gap-6">
          {/* Left sidebar */}
          <div className="w-full max-w-[300px] sm:max-w-full xsm:max-w-full h-full rounded-lg bg-white shadow-lg px-6 py-12">
            <h1 className="text-secondary font-roboto font-bold text-[22px]">
              My expertise
            </h1>
            <p className="text-[#647082] font-roboto text-[16px] mt-4">
              {profile.name} - Financial Advisor
            </p>
            <p className="font-roboto font-bold text-[16px] text-[#647082] duration-700 hover:text-[#1477BC] cursor-pointer my-6">
              Financial Services
            </p>

            {advisorProfile?.website && (
              <div className="mt-8">
                <h1 className="text-secondary font-roboto font-bold text-[22px]">
                  Contact
                </h1>
                <p className="flex items-center gap-2 font-roboto font-bold text-[#647082] duration-700 my-4 hover:text-[#1477BC]">
                  <FaLink fill="#1477BC" />
                  <a
                    href={advisorProfile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {advisorProfile.website}
                  </a>
                </p>
              </div>
            )}
          </div>

          {/* Main content */}
          <div className="w-full max-w-[610px] sm:max-w-full xsm:max-w-full h-full p-12 xsm:p-6 sm:p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-secondary font-roboto font-bold text-[24px]">
              About {profile.name}
            </h1>
            <p className="text-[#647082] font-roboto text-[16px] my-6">
              {profile.description}
            </p>

            {/* Recent Reviews */}
            {advisorProfile?.ratings && advisorProfile.ratings.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-secondary font-roboto font-bold text-[20px]">
                  Recent Reviews
                </h2>
                {advisorProfile.ratings.slice(0, 3).map((rating, index) => (
                  <div
                    key={index}
                    className="bg-[#F3F3F3] rounded-lg p-6 flex items-start justify-between xsm:flex-col"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            rating.user_avatar || "/images/default-avatar.png"
                          }
                          alt={rating.user_name}
                          className="w-[50px] h-[50px] rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/images/default-avatar.png";
                          }}
                        />
                        <div>
                          <p className="font-roboto font-semibold text-secondary">
                            {rating.user_name}
                          </p>
                          <p className="font-roboto text-[#647082] text-sm">
                            {new Date(rating.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="font-roboto text-[#647082]">
                        {rating.review}
                      </p>
                    </div>
                    <div>
                      <div className="flex pt-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar
                            key={star}
                            className={`text-xl ${star <= rating.rating ? "text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Write Review Section */}
            <div className="my-8">
              <h1 className="text-secondary font-roboto font-bold text-[24px]">
                Write a review for {profile.name}
              </h1>
              <div className="space-y-4 p-4">
                {ratingItems.map((item) => (
                  <div key={item.id}>
                    <StarRating
                      initialRating={item.rating}
                      onChange={(rating) => handleRatingChange(item.id, rating)}
                      size="md"
                    />
                  </div>
                ))}
              </div>
              <div className="mb-4">
                <label
                  htmlFor="experience"
                  className="block text-md font-roboto text-secondary mt-4 mb-2"
                >
                  Describe your Experience
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="experience"
                  className="w-full h-36 px-4 py-3 text-[#757575] font-roboto resize-none border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder={`Write a review for ${profile.name}`}
                  required
                />
              </div>
              <div>
                <Button
                  text="Submit Review"
                  className="px-8 text-[14px] bg-base"
                />
              </div>
            </div>
          </div>

          {/* Right sidebar - Appointment */}

          <div className="w-full max-w-[300px] sm:max-w-full xsm:max-w-full h-full rounded-lg bg-white shadow-lg">
            <div className="inflanar-psingle__head text-white font-roboto font-semibold text-2xl h-[130px] text-center flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-lg">
              Make an <br /> appointment
            </div>
            <div className="px-6">
              {/* Loop through weekly_schedule if it exists,
        otherwise fall back to availableTimes.
        Each entry represents one weekday's schedule.   */}
              {userCalendarSettings?.weekly_schedule ? (
                weekdaysOrder.map((day) => {
                  const schedule = userCalendarSettings.weekly_schedule.find(
                    (s) => s.weekday === day
                  );

                  const isAvailable = schedule?.is_available ?? false;
                  const timeDisplay =
                    isAvailable && schedule?.start && schedule?.end
                      ? `${schedule.start} - ${schedule.end}`
                      : "Closed";

                  return (
                    <div
                      key={day}
                      className="flex items-center justify-between py-2 border-b border-gray-100"
                    >
                      {/* Left side: dot + day */}
                      <div className="flex items-center gap-6">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            !isAvailable ? "bg-red-500" : "bg-[#27AE60]"
                          }`}
                        ></div>
                        <span className="text-[#647082] font-roboto text-md">
                          {day}
                        </span>
                      </div>

                      {/* Right side: time range or Closed */}
                      <div className="ml-auto text-right">
                        <span className="text-[#647082] font-roboto text-md">
                          {timeDisplay}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500">No schedule available</p>
              )}
            </div>

            <div className="flex items-center justify-center px-4 my-5">
              <button
                onClick={handleBookAppointment}
                className="px-6 text-white hover:btn-shine font-medium py-2 rounded-md font-roboto bg-base sm:w-full xsm:w-full transition-all duration-300 hover:bg-blue-700"
              >
                Book an appointment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
