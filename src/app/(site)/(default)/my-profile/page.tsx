"use client";
import React, { useState, useEffect } from "react";
import SearchableDropdown from "../../../../components/dashboard-sections/Dropdown";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { updateCustomersProfileData, fetchCustomersProfileData } from "@/redux/slices/customersSlice";
import { setCredentials } from "@/redux/slices/authSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok, FaTwitter } from "react-icons/fa";

interface Option {
  value: string;
  label: string;
}

interface SocialLinks {
  facebook_url: string;
  instagram_url: string;
  linkedin_url: string;
  tiktok_url: string;
  twitter_url: string;
}

const MyProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const data = useSelector(
    (state: RootState) => state.customers.customerProfileData
  );
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Separate loading state for form submission only
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSocialSubmitting, setIsSocialSubmitting] = useState(false);
  const [hasRecentSocialUpdate, setHasRecentSocialUpdate] = useState(false);
  
  // Check if user is a financial advisor
  const isFinancialAdvisor = user?.role === 'financial-advisor';
  
  // Social media links state (only for financial advisors)
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    facebook_url: "",
    instagram_url: "",
    linkedin_url: "",
    tiktok_url: "",
    twitter_url: "",
  });

  // Fetch profile data on component mount
  useEffect(() => {
    async function fetchData() {
      await dispatch(fetchCustomersProfileData({
        id: String(JSON.parse(localStorage.getItem("user") || "").id || "")
      }));
      
      // Also fetch social media links for financial advisors
      if (isFinancialAdvisor && !hasRecentSocialUpdate) {
        try {
          const token = localStorage.getItem("token");
          
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/advisor-social/profile`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          
          if (response.ok) {
            const socialData = await response.json();
            setSocialLinks({
              facebook_url: socialData.facebook_url ?? "",
              instagram_url: socialData.instagram_url ?? "",
              linkedin_url: socialData.linkedin_url ?? "",
              tiktok_url: socialData.tiktok_url ?? "",
              twitter_url: socialData.twitter_url ?? "",
            });
          } else if (response.status !== 404) {
            console.error('Failed to fetch social media links');
          }
        } catch (error) {
          console.error('Error fetching social media links:', error);
        }
      }
    }
    fetchData();
  }, [dispatch, isFinancialAdvisor, hasRecentSocialUpdate]);

  // Update form fields when data is fetched from API
  useEffect(() => {
    if (data) {
      setTitle(data.title || "");
      setMaritalStatus(data.marital_status || "");
      setProfession(data.occupation || "");
      setNationality(data.nationality || "");
      setEmployer(data.employer || "");
      setEmploymentStatus(data.employment_status || "");
      setMonthlyIncome(data.monthly_income ? String(data.monthly_income) : "");
      setMonthlyExpenses(data.monthly_expenses ? String(data.monthly_expenses) : "");
      setHousingStatus(data.housing_situation || "");
    }
  }, [data]);

  console.log(data);
  const [title, setTitle] = useState<string>("");
  const [maritalStatus, setMaritalStatus] = useState<string>("");
  const [profession, setProfession] = useState<string>("");
  const [nationality, setNationality] = useState<string>("");
  const [employer, setEmployer] = useState<string>("");
  const [employmentStatus, setEmploymentStatus] = useState<string>("");
  const [monthlyIncome, setMonthlyIncome] = useState<string>("");
  const [monthlyExpenses, setMonthlyExpenses] = useState<string>("");
  const [housingStatus, setHousingStatus] = useState<string>("");

  const titleOptions: Option[] = [
    { value: "mr", label: "Mr." },
    { value: "mrs", label: "Mrs." },
    { value: "ms", label: "Ms." },
    { value: "dr", label: "Dr." },
  ];

  const maritalStatusOptions: Option[] = [
    { value: "married", label: "Married" },
    { value: "single", label: "Single" },
    { value: "divorced", label: "Divorced" },
    { value: "widowed", label: "Widowed" },
  ];

  const employmentStatusOptions: Option[] = [
    { value: "fulltime", label: "Full Time" },
    { value: "parttime", label: "Part Time" },
    { value: "selfemployed", label: "Self-employed" },
    { value: "unemployed", label: "Unemployed" },
    { value: "retired", label: "Retired" },
  ];

  const housingOptions: Option[] = [
    { value: "own", label: "Own" },
    { value: "rent", label: "Rent" },
    { value: "living_with_family", label: "Living with family" },
    { value: "other", label: "Other" },
  ];

  const nationalityOptions: Option[] = [
    { value: "belgium", label: "Belgium" },
    { value: "france", label: "France" },
    { value: "germany", label: "Germany" },
    { value: "netherlands", label: "Netherlands" },
    { value: "luxembourg", label: "Luxembourg" },
    { value: "uk", label: "United Kingdom" },
  ];

  // Handle social links change
  const handleSocialLinksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSocialLinks(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Basic URL validation helper
  /*const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return true; // Empty URLs are okay
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };*/

  // Handle social links submission
  const handleSocialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSocialSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      
      // Prepare data to send - include all fields (empty strings will clear existing data)
      // This allows users to clear/remove social media links by submitting empty inputs
      const dataToSend: SocialLinks = {
        facebook_url: socialLinks.facebook_url.trim(),
        instagram_url: socialLinks.instagram_url.trim(),
        linkedin_url: socialLinks.linkedin_url.trim(),
        tiktok_url: socialLinks.tiktok_url.trim(),
        twitter_url: socialLinks.twitter_url.trim(),
      };
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/advisor-social/profile`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        
        // Handle validation errors specifically
        if (response.status === 400 && errorData.message) {
          if (Array.isArray(errorData.message)) {
            // Multiple validation errors
            const errorMessages = errorData.message.join(', ');
            console.error('Validation errors:', errorMessages);
            throw new Error(`Validation errors: ${errorMessages}`);
          } else {
            // Single validation error
            console.error('Single validation error:', errorData.message);
            throw new Error(`Validation error: ${errorData.message}`);
          }
        }
        
        throw new Error(errorData.message || 'Failed to save social media profile');
      }

      await response.json();
      
      // Update state with what we actually sent, not what the server returned
      // This ensures the UI reflects the user's intent immediately
      setSocialLinks({
        facebook_url: dataToSend.facebook_url,
        instagram_url: dataToSend.instagram_url,
        linkedin_url: dataToSend.linkedin_url,
        tiktok_url: dataToSend.tiktok_url,
        twitter_url: dataToSend.twitter_url,
      });

      // Set flag to prevent immediate re-fetch and reset after some time
      setHasRecentSocialUpdate(true);
      setTimeout(() => setHasRecentSocialUpdate(false), 5000); // Reset after 5 seconds

      toast.success('Social media links updated successfully!');
    } catch (error) {
      console.error('Error saving social media links:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save social media links');
    } finally {
      setIsSocialSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const profileData = {
        title,
        marital_status: maritalStatus,
        occupation: profession,
        nationality,
        employer,
        employment_status: employmentStatus,
        monthly_income: Number(monthlyIncome),
        monthly_expenses: Number(monthlyExpenses),
        housing_situation: housingStatus,
      };

      const result = await dispatch(
        updateCustomersProfileData({
          id: String(JSON.parse(localStorage.getItem("user") || "").id || ""),
          data: profileData,
        })
      );

      if (updateCustomersProfileData.fulfilled.match(result)) {
        toast.success("Profile updated successfully!");
        
        // Update localStorage with updated timestamp to reflect profile changes
        try {
          const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
          const currentToken = localStorage.getItem("token") || "";
          const currentRefreshToken = localStorage.getItem("refreshToken") || "";
          
          const updatedUser = {
            ...currentUser,
            // Update timestamp to reflect that profile data was changed
            updated_at: new Date().toISOString(),
          };
          
          localStorage.setItem("user", JSON.stringify(updatedUser));
          
          // Update Redux auth state to stay in sync
          dispatch(setCredentials({
            user: updatedUser,
            token: currentToken,
            refreshToken: currentRefreshToken,
          }));
          
                  console.log("localStorage and Redux state user timestamp updated after profile changes");
      } catch (error) {
        console.error("Error updating localStorage and Redux state:", error);
      }
      
      // Refetch profile data to ensure UI is in sync with server
      await dispatch(fetchCustomersProfileData({
        id: String(JSON.parse(localStorage.getItem("user") || "").id || "")
      }));
      } else if (updateCustomersProfileData.rejected.match(result)) {
        toast.error(result.payload as string || "Failed to update profile");
      }
    } catch (error) {
      toast.error("An error occurred while updating your profile");
      console.error("Profile update error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 w-full">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-roboto font-medium mb-6">
          Personal information
        </h2>

        <div className="border-t-[1.5px] border-[#F2F2F2] my-4"></div>

        <form onSubmit={handleSubmit} className="w-full">
          <div className="grid xsm:grid-cols-1 grid-cols-2 gap-6 ">
            <div className="">
              <label className="block font-roboto text-[16px]  text-secondary mb-1">
                Title
              </label>
              <SearchableDropdown
                label="Title"
                options={titleOptions}
                value={title}
                onChange={setTitle}
                placeholder="Select title"
              />
            </div>
            <div>
              <label className="block font-roboto text-[16px]  text-secondary mb-1">
                Marital status
              </label>
              <SearchableDropdown
                label="Marital status"
                options={maritalStatusOptions}
                value={maritalStatus}
                onChange={setMaritalStatus}
                placeholder="Select marital status"
              />
            </div>

            <div>
              <label className="block font-roboto text-[16px]  text-secondary mb-1">
                Profession
              </label>
              <input
                type="text"
                className="w-full px-3 py-3 placeholder:text-[#6C757D] border border-gray-300 rounded text-[16px] font-roboto"
                placeholder="Current job"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-roboto text-[16px]  text-secondary mb-1">
                Nationality
              </label>
              <SearchableDropdown
                label="Nationality"
                options={nationalityOptions}
                value={nationality}
                onChange={setNationality}
                placeholder="Select nationality"
              />
            </div>

            <div>
              <label className="block font-roboto text-[16px]  text-secondary mb-1">
                Employer
              </label>
              <input
                type="text"
                className="w-full px-3 py-3 placeholder:text-[#6C757D] border border-gray-300 rounded text-[16px] font-roboto"
                placeholder="Employer"
                value={employer}
                onChange={(e) => setEmployer(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-roboto text-[16px]  text-secondary mb-1">
                Employment status
              </label>
              <SearchableDropdown
                label="Employment status"
                options={employmentStatusOptions}
                value={employmentStatus}
                onChange={setEmploymentStatus}
                placeholder="Select employment status"
              />
            </div>

            <div>
              <label className="block font-roboto text-[16px]  text-secondary mb-1">
                Monthly income (net)
              </label>
              <input
                type="text"
                className="w-full px-3 py-3 placeholder:text-[#6C757D]  border border-gray-300 rounded text-[16px] font-roboto"
                placeholder="0.00"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-roboto text-[16px]  text-secondary mb-1">
                Monthly expenses
              </label>
              <input
                type="text"
                className="w-full px-3 py-3 placeholder:text-[#6C757D]  border border-gray-300 rounded text-[16px] font-roboto"
                placeholder="0.00"
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-roboto text-[16px]  text-secondary mb-1">
              Living situation 
              </label>
              <SearchableDropdown
                label="Living situation"
                options={housingOptions}
                value={housingStatus}
                onChange={setHousingStatus}
                placeholder="Select living situation"
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`btn-shine min-h-[50px] py-0 font-medium font-roboto bg-[#1477BC] text-sm px-4 py-1 text-white rounded transition-all ${
                isSubmitting 
                  ? 'opacity-50 cursor-not-allowed bg-gray-400' 
                  : 'hover:bg-[#1778F2]'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                "Profile save"
              )}
            </button>
                    </div>
        </form>
      </div>
      
      {/* Social Media Links Section - Only for Financial Advisors */}
      {isFinancialAdvisor && (
        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h2 className="text-xl font-roboto font-medium mb-6">
            Social Media Profiles
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Connect your social media accounts to help clients find and connect with you.
          </p>

          <div className="border-t-[1.5px] border-[#F2F2F2] my-4"></div>

          <form onSubmit={handleSocialSubmit} className="w-full">
            <div className="grid xsm:grid-cols-1 grid-cols-2 gap-6">
              {/* Facebook */}
              <div>
                <label className="block font-roboto text-[16px] text-secondary mb-1 flex items-center gap-2">
                  <FaFacebook className="text-lg text-blue-600" />
                  Facebook
                </label>
                <input
                  type="text"
                  name="facebook_url"
                  className="w-full px-3 py-3 placeholder:text-[#6C757D] border border-gray-300 rounded text-[16px] font-roboto focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://facebook.com/yourprofile"
                  value={socialLinks.facebook_url}
                  onChange={handleSocialLinksChange}
                />
              </div>
              
              {/* Instagram */}
              <div>
                <label className="block font-roboto text-[16px] text-secondary mb-1 flex items-center gap-2">
                  <FaInstagram className="text-lg text-pink-500" />
                  Instagram
                </label>
                <input
                  type="text"
                  name="instagram_url"
                  className="w-full px-3 py-3 placeholder:text-[#6C757D] border border-gray-300 rounded text-[16px] font-roboto focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://instagram.com/yourprofile"
                  value={socialLinks.instagram_url}
                  onChange={handleSocialLinksChange}
                />
              </div>
              
              {/* LinkedIn */}
              <div>
                <label className="block font-roboto text-[16px] text-secondary mb-1 flex items-center gap-2">
                  <FaLinkedin className="text-lg text-blue-700" />
                  LinkedIn
                </label>
                <input
                  type="text"
                  name="linkedin_url"
                  className="w-full px-3 py-3 placeholder:text-[#6C757D] border border-gray-300 rounded text-[16px] font-roboto focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={socialLinks.linkedin_url}
                  onChange={handleSocialLinksChange}
                />
              </div>
              
              {/* TikTok */}
              <div>
                <label className="block font-roboto text-[16px] text-secondary mb-1 flex items-center gap-2">
                  <FaTiktok className="text-lg text-black" />
                  TikTok
                </label>
                <input
                  type="text"
                  name="tiktok_url"
                  className="w-full px-3 py-3 placeholder:text-[#6C757D] border border-gray-300 rounded text-[16px] font-roboto focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://tiktok.com/@yourprofile"
                  value={socialLinks.tiktok_url}
                  onChange={handleSocialLinksChange}
                />
              </div>
              
              {/* Twitter */}
              <div>
                <label className="block font-roboto text-[16px] text-secondary mb-1 flex items-center gap-2">
                  <FaTwitter className="text-lg text-blue-400" />
                  Twitter/X
                </label>
                <input
                  type="text"
                  name="twitter_url"
                  className="w-full px-3 py-3 placeholder:text-[#6C757D] border border-gray-300 rounded text-[16px] font-roboto focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://twitter.com/yourprofile"
                  value={socialLinks.twitter_url}
                  onChange={handleSocialLinksChange}
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={isSocialSubmitting}
                className={`btn-shine min-h-[50px] py-0 font-medium font-roboto bg-[#1477BC] text-sm px-4 py-1 text-white rounded transition-all ${
                  isSocialSubmitting 
                    ? 'opacity-50 cursor-not-allowed bg-gray-400' 
                    : 'hover:bg-[#1778F2]'
                }`}
              >
                {isSocialSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  "Save Social Media Links"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
    
  );
};

export default MyProfilePage;
