/* eslint-disable  @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { FaUser } from "react-icons/fa";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTiktok,
  FaTwitter,
} from "react-icons/fa";
import PasswordChangeForm from "../../components/form";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  fetchProfileData,
  updateBasicProfile,
  updateBusinessInfo,
  updatePassword,
  updateProfilePicture,
  updateSocialLinks,
} from "@/redux/slices/profileSlice";
import { ToastContainer, toast } from "react-toastify";
import SearchableDropdown from "@/components/dashboard-sections/Dropdown";
import SimpleAddressAutocomplete from "@/components/google-map/AddressAutocomplete";
import AVContractDisplay from "../../components/AVContract";
import { fetchCategories } from "@/redux/slices/categoriesSlice";
import { fetchCompanies } from "@/redux/slices/companiesSlice";
import {
  fetchUserAddresses,
  createUserAddress,
  updateUserAddress,
} from "@/redux/slices/userAddressSlice";
import {
  fetchAdvisorProfile,
  updateAdvisorProfile,
} from "@/redux/slices/advisorsSlice";

interface ProfileState {
  username: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
}

interface SocialLinks {
  facebook_url: string;
  instagram_url: string;
  linkedin_url: string;
  tiktok_url: string;
  twitter_url: string;
}

// const titleOptions: Option[] = [
//   { value: "none", label: "Select Consultant Field" },
//   { value: "constructionFinance", label: "Construction Finance" },
//   { value: "investment", label: "Investment" },
//   { value: "realEstate", label: "Real Estate" },
//   { value: "old-age", label: "Old-age Provision" },
//   { value: "insurance", label: "Insurance" },
//   { value: "electricity", label: "Electricity & Energy" },
//   { value: "business", label: "Business Insurance" },
//   { value: "funds", label: "Mutual Funds & ETF advice" },
// ];

// interface Advisor {
//   id: string;
//   user_id: string;
//   broker: boolean;
//   about: string | null;
//   service_category_id: string | null;
//   service_title: string | null;
//   service_details: string | null;
//   service_price: number | null;
//   is_visible: boolean;
//   company_id: string | null;
//   freelancer: boolean;
//   date_of_birth: string | null;
//   advisor_contract_accepted: boolean;
//   welcome_modal: boolean;
//   terms_and_conditions: boolean;
//   commission_level_settler: number;
//   commission_level_closer: number;
//   created_at: string;
//   updated_at: string;
//   website: string | null;
//   average_rating: number;
// }

const ManageProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  // Get user data and profile data from Redux store
  const { user } = useSelector((state: RootState) => state.auth);
  const { data } = useSelector((state: RootState) => state.profile);
  const { categories } = useSelector((state: RootState) => state.categories);
  const { companies } = useSelector((state: RootState) => state.companies);
  const { addresses } = useSelector((state: RootState) => state.userAddress);
  const { currentAdvisor } = useSelector((state: RootState) => state.advisors);
  // const [title, setTitle] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

  const [previewImage, setPreviewImage] = useState<string>(
    "/images/agent-2.jpg"
  );

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchCompanies({ limit: 100 }));
  }, [dispatch]);

  const [profile, setProfile] = useState<ProfileState>({
    username: "",
    first_name: "",
    last_name: "",
    avatar_url: "/profile-avatar.png",
  });

  const [links, setLinks] = useState<SocialLinks>({
    facebook_url: "",
    instagram_url: "",
    linkedin_url: "",
    tiktok_url: "",
    twitter_url: "",
  });

  const [activeTab, setActiveTab] = useState("profile");
  const [hasWebsite, setHasWebsite] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    address: "",
    address2: "",
    state: "",
    city: "",
    postal_code: "",
    phone: "",
    website: "",
    broker: false,
    country: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [offerFormData, setOfferFormData] = useState({
    about: "",
    service_title: "",
    service_details: "",
    service_category_id: "",
  });

  // Add coordinates state at the top with other state declarations
  const [coordinates, setCoordinates] = useState({
    lat: 0,
    lng: 0,
  });

  console.debug("Coordinates:", coordinates);

  const handleAddressSelected = (addressData: any) => {
    setFormData((prev) => ({
      ...prev,
      address: addressData.address,
      city: addressData.city,
      state: addressData.state,
      country: addressData.country,
      postal_code: addressData.postal_code,
    }));

    // Store lat/lng separately for saving
    setCoordinates({
      lat: addressData.lat,
      lng: addressData.lng,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Create a preview URL for immediate display
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
    }
  };
  useEffect(() => {
    if (user && user.id) {
      dispatch(fetchProfileData());
      dispatch(fetchUserAddresses(user.id));
      dispatch(fetchAdvisorProfile());
    }
  }, [dispatch, user]);
  useEffect(() => {
    // Check if we have profile data from the API
    if (user) {
      setProfile({
        username: user.username || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        avatar_url: user.avatar_url || "/profile-avatar.png",
      });
    }
  }, [user]);

  useEffect(() => {
    if (data.basic) {
      setProfile((prev) => ({
        ...prev,
        username: data.basic.username || prev.username,
        first_name: data.basic.first_name || prev.first_name,
        last_name: data.basic.last_name || prev.last_name,
      }));

      // Update preview image if avatar_url is available
      if (data.avatar_url) {
        setPreviewImage(data.avatar_url);
      }
    }

    if (data.social) {
      setLinks({
        facebook_url: data.social.facebook_url || "",
        instagram_url: data.social.instagram_url || "",
        linkedin_url: data.social.linkedin_url || "",
        tiktok_url: data.social.tiktok_url || "",
        twitter_url: data.social.twitter_url || "",
      });

      setHasWebsite(!!data.social.website);
    }

    if (data.business || data.social) {
      const website = data.social.website || "";
      setFormData({
        company_name: data.business.company_name || "",
        address: data.business.address || "",
        address2: data.business.address2 || "",
        state: data.business.state || "",
        city: data.business.city || "",
        postal_code: data.business.postal_code || "",
        phone: data.business.phone || "",
        website,
        broker: data.business.broker || false,
        country: data.business.country || "",
      });
      setHasWebsite(!!website);
    }
  }, [data]);

  useEffect(() => {
    // Only update form data if we have data and it's different from current form state
    if (addresses && addresses.length > 0) {
      const userAddress = addresses[0];
      setFormData((prev) => {
        // Only update if address data is actually different
        if (
          prev.address !== userAddress.address ||
          prev.city !== userAddress.city
        ) {
          return {
            ...prev,
            address: userAddress.address || "",
            address2: userAddress.address2 || "",
            city: userAddress.city || "",
            postal_code: userAddress.postal_code || "",
            state: userAddress.state || "",
            country: userAddress.country || "",
          };
        }
        return prev;
      });
    }

    if (currentAdvisor) {
      const website = currentAdvisor.website || "";
      const brokerStatus = currentAdvisor.broker || false;
      const companyId = currentAdvisor.company_id || "";

      // Only update if the data from backend is actually different from form state
      setFormData((prev) => {
        // Check if broker status or company changed
        const brokerChanged = prev.broker !== brokerStatus;
        const companyChanged = selectedCompanyId !== companyId;

        if (brokerChanged || companyChanged || prev.website !== website) {
          console.log("Updating form from advisor data:", {
            broker: brokerStatus,
            company_id: companyId,
          });

          return {
            ...prev,
            broker: brokerStatus,
            website,
            company_name: data?.business?.company_name || "",
            phone: data?.business?.phone || "",
          };
        }
        return prev;
      });

      // Only update selected company if it changed
      if (selectedCompanyId !== companyId) {
        setSelectedCompanyId(companyId);
      }

      setHasWebsite(!!website);
    }

    // IMPORTANT: Add isSubmitting to dependencies to prevent updates during submission
  }, [addresses, currentAdvisor, data, isSubmitting]);

  useEffect(() => {
    if (currentAdvisor) {
      setOfferFormData({
        about: currentAdvisor.about || "",
        service_title: currentAdvisor.service_title || "",
        service_details: currentAdvisor.service_details || "",
        service_category_id: currentAdvisor.service_category_id || "",
      });
      if (currentAdvisor.service_category_id) {
        setSelectedCategoryId(currentAdvisor.service_category_id);
      }
    }
  }, [currentAdvisor]);

  // Handle profile form submission
  // Add a separate state for tracking form submission

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Set submitting state to true
    setIsSubmitting(true);
    const updatePromises = [];

    // Dispatch the update action
    // dispatch(
    //   updateBasicProfile({
    //     username: profile.username,
    //     first_name: profile.first_name,
    //     last_name: profile.last_name,
    //   })
    // )
    //   .unwrap()
    //   .then(() => {
    //     toast.success("Your profile has been successfully updated!");
    //     setIsSubmitting(false); // Reset submitting state
    //   })
    //   .catch((error) => {
    //     toast.error(
    //       typeof error === "string"
    //         ? error
    //         : "Unable to update your profile. Please try again."
    //     );
    //     setIsSubmitting(false); // Reset submitting state
    //   });
    // Add profile data update if needed
    if (profile.first_name || profile.last_name || profile.username) {
      updatePromises.push(
        dispatch(
          updateBasicProfile({
            username: profile.username,
            first_name: profile.first_name,
            last_name: profile.last_name,
          })
        ).unwrap()
      );
    }

    const formData = new FormData();
    if (selectedFile) {
      // Append the file to formData
      formData.append("file", selectedFile);

      // Push only the dispatched action to updatePromises
      updatePromises.push(
        dispatch(updateProfilePicture(selectedFile)).unwrap()
      );
    }
    // Wait for all updates to complete
    Promise.all(updatePromises)
      .then(() => {
        toast.success("Your profile has been successfully updated!");
        setIsSubmitting(false);
        setSelectedFile(null); // Clear the selected file after successful upload
      })
      .catch((error) => {
        toast.error(
          typeof error === "string"
            ? error
            : "Unable to update your profile. Please try again."
        );
        setIsSubmitting(false);
      });
  };

  const handleBusinessInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // First handle the address
      if (addresses && addresses.length > 0) {
        const existingAddress = addresses[0];
        await dispatch(
          updateUserAddress({
            id: existingAddress.id,
            data: {
              address: formData.address,
              address2: formData.address2,
              city: formData.city,
              postal_code: formData.postal_code,
              state: formData.state,
              country: formData.country,
              lat: coordinates.lat || existingAddress.latitude || 0,
              lng: coordinates.lng || existingAddress.longitude || 0,
              is_deleted: false,
            },
          })
        ).unwrap();
      } else if (user?.id) {
        await dispatch(
          createUserAddress({
            userId: user.id,
            address: formData.address,
            address2: formData.address2,
            city: formData.city,
            postal_code: formData.postal_code,
            state: formData.state,
            country: formData.country,
            lat: coordinates.lat || 0,
            lng: coordinates.lng || 0,
            is_deleted: false,
          })
        ).unwrap();
      }

      // Determine final values based on mutual exclusivity
      const finalCompanyId = formData.broker ? null : selectedCompanyId || null;
      const finalBrokerStatus = selectedCompanyId ? false : formData.broker;

      // Prepare data with mutual exclusivity logic
      const businessData = {
        company_name: formData.company_name,
        address: formData.address,
        address2: formData.address2,
        phone: formData.phone,
        website: formData.website,
        city: formData.city,
        postal_code: formData.postal_code,
        state: formData.state,
        country: formData.country,
        company_id: finalCompanyId,
        broker: finalBrokerStatus,
      };

      console.log("Submitting business data:", businessData);

      // Update business info
      const result = await dispatch(updateBusinessInfo(businessData)).unwrap();

      console.log("Business info update result:", result);

      // IMPORTANT: Update local state immediately with the saved values
      // This prevents any useEffect from overwriting our changes
      setFormData((prev) => ({
        ...prev,
        broker: finalBrokerStatus,
      }));

      // Update selected company ID
      setSelectedCompanyId(finalCompanyId || "");

      // Also update the advisor profile in Redux without triggering useEffect
      await dispatch(fetchAdvisorProfile());

      toast.success("Business profile updated successfully");
    } catch (error: unknown) {
      console.error("Business info update error:", error);
      if (error instanceof Error) {
        toast.error(error.message || "Failed to update business profile");
      } else {
        toast.error("Failed to update business profile");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = useMemo(
    () =>
      categories?.map((category) => ({
        value: category.id,
        label: category.name,
      })),
    [categories]
  );

  // Add company options mapping
  const companyOptions = useMemo(
    () =>
      companies.map((company) => ({
        value: company.id,
        label: company.name,
      })),
    [companies]
  );

  const handleCompanyChange = (companyId: string) => {
    console.log("Company changed to:", companyId);

    setSelectedCompanyId(companyId);
    const selectedCompany = companies.find(
      (company) => company.id === companyId
    );

    if (selectedCompany) {
      setFormData((prev) => ({
        ...prev,
        company_name: selectedCompany.name,
        broker: false, // Uncheck broker when company is selected
      }));
    } else {
      // When clearing company selection
      setFormData((prev) => ({
        ...prev,
        company_name: "",
      }));
    }
  };

  // Handle social links submission
  const handleLinksSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    dispatch(
      updateSocialLinks({
        facebook_url: links.facebook_url,
        instagram_url: links.instagram_url,
        linkedin_url: links.linkedin_url,
        tiktok_url: links.tiktok_url,
        twitter_url: links.twitter_url,
        website: hasWebsite ? formData.website : undefined,
      })
    )
      .unwrap()
      .then(() => {
        toast.success(
          "Your social media profiles have been successfully updated!"
        );
      })
      .catch((error) => {
        console.error("Social links update error:", error);
        toast.error(
          typeof error === "string"
            ? error
            : "Failed to update social media profiles. Please try again."
        );
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleBrokerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;

    console.log("Broker changed to:", isChecked);

    setFormData((prev) => ({
      ...prev,
      broker: isChecked,
      company_name: isChecked ? "" : prev.company_name,
    }));

    // Clear company selection when broker is checked
    if (isChecked) {
      setSelectedCompanyId("");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  // const [offerformData] = useState({
  //   serviceCategory: "",
  //   aboutMe: "",
  //   offerSet: "",
  //   offerDescription: "",
  // });

  // const handleFormChange = (
  //   e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  // ) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  // };

  // const handleFormSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   setIsSubmitting(true);

  //   try {
  //     // First update the user's basic profile with category association
  //     await dispatch(updateBasicProfile({
  //       ...formData,
  //       category_id: selectedCategoryId
  //     })).unwrap();

  //     // If you also need to update the category itself
  //     // This depends on what your API requires
  //     if (selectedCategoryId) {
  //       await dispatch(updateCategory({
  //         id: selectedCategoryId,
  //         data: new FormData() // Create FormData object
  //       })).unwrap();
  //     }
  //     toast.success("Your profile has been successfully updated!");
  //   } catch (error) {
  //     toast.error(
  //       typeof error === "string"
  //         ? error
  //         : "Unable to update your profile. Please try again."
  //     );
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };
  useEffect(() => {
    if (data && data.basic && data.basic.category_id) {
      setSelectedCategoryId(data.basic.category_id);
      // setTitle(data.basic.category_id);
    }
  }, [data]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    // setTitle(categoryId);
  };
  const handleLinksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLinks((prevLinks) => ({
      ...prevLinks,
      [name]: value,
    }));
  };

  const handlePasswordChange = (data: {
    email: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    const passwordUpdateData = {
      current_password: data.currentPassword,
      new_password: data.newPassword,
      confirm_password: data.confirmPassword,
    };

    dispatch(updatePassword(passwordUpdateData))
      .unwrap()
      .then(() => {
        toast.success("Password updated successfully!");
      })
      .catch((error) => {
        toast.error(
          typeof error === "string"
            ? error
            : "Failed to update password. Please try again."
        );
      });
  };
  const tabs = [
    { id: "profile", label: "Mein Profil", href: "#profile" },
    { id: "company", label: "Mein Unternehmen", href: "#company" },
    { id: "offer", label: "Mein Angebot", href: "#offer" },
    { id: "social", label: "Social-Media Profile", href: "#social" },
    { id: "security", label: "Sicherheit", href: "#security" },
    { id: "contract", label: "AV Vertag", href: "#contract" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* Username section */}
            <div>
              <label
                htmlFor="username"
                className="block text-[16px] font-bold text-primary mb-1"
              >
                Username:
              </label>
              <p className="text-primary text-[16px] mb-2">
                Bachte, dass dein Username gleichzeitig deine Profil-URL ist.
                <br />
                Daduch kannst du in Suchmaschinen wie z.B. Google besser
                gefunden werden.
              </p>
              <input
                type="text"
                id="username"
                name="username"
                value={profile.username}
                onChange={(e) =>
                  setProfile({ ...profile, username: e.target.value })
                }
                className="w-full max-w-xl focus:ring-1 focus:outline-[#C2DBFE] p-2 border border-gray-300 rounded"
              />
            </div>

            <div className="grid w-full max-w-xl grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="first_name"
                  className="block text-[16px] text-primary font-bold mb-1"
                >
                  First name:
                </label>
                <input
                  type="text"
                  id="first_name"
                  placeholder="First name"
                  value={profile.first_name}
                  onChange={(e) =>
                    setProfile({ ...profile, first_name: e.target.value })
                  }
                  className="w-full p-2 focus:ring-1 focus:outline-[#C2DBFE] border border-gray-300 rounded"
                />
              </div>
              <div>
                <label
                  htmlFor="last_name"
                  className="block text-[16px] text-primary font-bold mb-1"
                >
                  Last name:
                </label>
                <input
                  type="text"
                  id="last_name"
                  placeholder="Last name"
                  value={profile.last_name}
                  onChange={(e) =>
                    setProfile({ ...profile, last_name: e.target.value })
                  }
                  className="w-full p-2 focus:ring-1 focus:outline-[#C2DBFE] border border-gray-300 rounded"
                />
              </div>
            </div>

            {/* Profile picture section */}
            <div>
              <label className="block text-[16px] text-primary font-bold mb-3">
                Profilbild:
              </label>
              <div className="flex flex-col ">
                <div className="relative w-32 h-32 bg-gray-100 rounded-full overflow-hidden mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewImage}
                    alt="Profile picture"
                    width={128}
                    height={128}
                    className="rounded-full"
                  />
                </div>

                {/* File upload UI that matches the design */}
                <div className="w-full max-w-xl mt-2">
                  <div className="border border-blue-300 rounded-md overflow-hidden flex">
                    <label
                      htmlFor="profile-image-upload"
                      className="bg-[#E9ECEF] hover:bg-[#DDE0E3] text-primary px-4 py-1 cursor-pointer border-r border-blue-300"
                    >
                      Choose File
                    </label>
                    <span className="block py-1 px-4 text-gray-500 flex-grow">
                      {selectedFile ? selectedFile.name : "No file chosen"}
                    </span>
                    <input
                      id="profile-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save button */}
            <div className="pt-4">
              <button
                disabled={isSubmitting}
                type="submit"
                className="bg-[#198754] hover:bg-[#157347] duration-0 text-white py-2 px-6 rounded font-medium"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </div>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </form>
        );
      // Replace the entire "company" case in renderTabContent()

      // Replace the entire "company" case in renderTabContent()

      case "company":
        return (
          <form onSubmit={handleBusinessInfoSubmit} className="max-w-xl py-4">
            <div className="mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={hasWebsite}
                  onChange={() => setHasWebsite(!hasWebsite)}
                  className="w-4 h-4"
                />
                <span className="text-[16px] font-bold text-primary">
                  Du hast du eine eigene Website ?
                </span>
              </label>
            </div>

            {hasWebsite && (
              <div className="mb-4">
                <label className="block text-[16px] font-bold text-primary mb-1">
                  Website
                </label>
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:outline-[#C2DBFE]"
                  placeholder="Enter your website URL"
                />
              </div>
            )}

            <div>
              <h1 className="text-[16px] font-bold text-primary">Impressum:</h1>
              <div className="text-[16px] text-primary pt-1">
                <b className="text-[16px] font-bold text-primary pr-1 ">
                  Achtung:
                </b>
                Dein Profil ist nur öffentlich sichtbar wenn du ein gültiges
                Impressum hinterlegt hast. Um die Echtheit unserer User sicher
                zu stellen, überprüfen wir alle User manuell. Wenn du Änderungen
                am Impressum vornimmst, wird dein Profil erneut überprüft. Bitte
                gebe hier deine aktuelle Geschäftsadresse ein.
              </div>
            </div>

            {/* Company Name and Broker - Two Column Layout */}
            <div className="grid grid-cols-2 gap-4 mt-12 xsm:grid-cols-1">
              {/* Company Dropdown */}
              <div>
                <label
                  htmlFor="company_name"
                  className="block text-[16px] font-bold text-primary mb-2"
                >
                  Unternehmensname
                </label>
                <div className="relative h-[42px]">
                  <SearchableDropdown
                    label="Company"
                    showSearchbar={false}
                    options={companyOptions}
                    value={selectedCompanyId}
                    onChange={handleCompanyChange}
                    disabled={!!formData.broker}
                    placeholder="Choose Company"
                  />
                  {formData.broker && (
                    <div className="absolute inset-0 bg-gray-50 bg-opacity-60 rounded-md cursor-not-allowed pointer-events-none" />
                  )}
                </div>
              </div>

              {/* Broker Checkbox */}
              <div>
                <label className="block text-[16px] font-bold text-primary mb-2">
                  Makler
                </label>
                <label
                  htmlFor="broker"
                  className="flex items-center justify-center space-x-2 h-[42px] px-4 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{
                    backgroundColor: formData.broker
                      ? "#e8f5e9"
                      : "transparent",
                    borderColor: formData.broker ? "#4caf50" : "#d1d5db",
                    height: "49px",
                  }}
                >
                  <input
                    type="checkbox"
                    id="broker"
                    name="broker"
                    checked={formData.broker}
                    onChange={handleBrokerChange}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <span className="text-[16px] font-bold text-primary whitespace-nowrap">
                    Ich bin Makler
                  </span>
                </label>
              </div>
            </div>

            {/* Address Section - Two Column Layout */}
            <div className="grid grid-cols-2 gap-4 mt-4 xsm:grid-cols-1">
              <div>
                <label
                  htmlFor="address"
                  className="block text-[16px] text-primary font-bold mb-2"
                >
                  Straße, Hausnummer
                </label>
                <SimpleAddressAutocomplete
                  value={formData.address}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, address: value }))
                  }
                  onAddressSelected={handleAddressSelected}
                  placeholder="Adresse eingeben..."
                  className="w-full p-2 border rounded-md border-gray-300 focus:ring-1 focus:outline-[#C2DBFE]"
                />
              </div>

              <div>
                <label
                  htmlFor="postal_code"
                  className="block text-[16px] text-primary font-bold mb-2"
                >
                  Postleitzahl
                </label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md border-gray-300 focus:ring-1 focus:outline-[#C2DBFE] bg-gray-50"
                  placeholder="Automatisch ausgefüllt"
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 xsm:grid-cols-1">
              <div>
                <label
                  htmlFor="country"
                  className="block text-[16px] text-primary font-bold mb-2"
                >
                  Bundesland
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md border-gray-300 focus:ring-1 focus:outline-[#C2DBFE] bg-gray-50"
                  placeholder="Automatisch ausgefüllt"
                  readOnly
                />
              </div>
              <div>
                <label
                  htmlFor="state"
                  className="block text-[16px] text-primary font-bold mb-2"
                >
                  Stadt
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md border-gray-300 focus:ring-1 focus:outline-[#C2DBFE] bg-gray-50"
                  placeholder="Automatisch ausgefüllt"
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 xsm:grid-cols-1">
              <div>
                <label
                  htmlFor="phone"
                  className="block text-[16px] text-primary font-bold mb-2"
                >
                  Telefonnummer
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md border-gray-300 focus:ring-1 focus:outline-[#C2DBFE]"
                  placeholder="Telefonnummer eingeben"
                />
              </div>
              <div>{/* Empty div to maintain grid spacing */}</div>
            </div>

            <div className="mt-6">
              <button
                disabled={isSubmitting}
                type="submit"
                className="bg-[#198754] hover:bg-[#157347] duration-0 text-white py-2 px-6 rounded font-medium"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </div>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </form>
        );

      case "offer":
        return (
          <div className="w-full max-w-xl">
            <form onSubmit={handleOfferSubmit}>
              {/* Service Category */}
              <div className="mb-6">
                <label className="block text-primary font-bold text-[16px] mb-2">
                  Servicekategorie:
                </label>
                <SearchableDropdown
                  label="Title"
                  options={categoryOptions}
                  value={selectedCategoryId}
                  onChange={handleCategoryChange}
                  placeholder="Select category"
                />
              </div>

              {/* About Me */}
              <div className="mb-6">
                <div className="mb-2">
                  <label className="block text-primary font-bold text-[16px] mb-2">
                    Über mich:
                  </label>
                  <p className="text-[16px] text-primary">
                    Über mich: Beschreibe dich und deinen Werdegang hier. Wir
                    empfehlen dir aus der 3. Perspektive zu schreiben.
                    (Singular)
                  </p>
                </div>
                <div className="mb-6 text-[16px] text-[#6C757D]">
                  &#34;Er / Sie ist seit (Anzahl) Jahren/Jahrzehnten erfolgreich
                  selbstständig tätig und verfügt über umfassende Kenntnisse in
                  (Fachgebiet). Er/Sie ist bekannt für seine/ihre (positive
                  Eigenschaft) und hat sich einen guten Ruf in der Branche
                  erarbeitet.&#34;
                </div>
                <textarea
                  name="about"
                  value={offerFormData.about}
                  onChange={handleOfferFormChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-[#C2DBFE]"
                ></textarea>
              </div>

              {/* Your Offer Set */}
              <div className="mb-6">
                <div className="mb-2">
                  <label className="block text-primary font-bold text-[16px] mb-2">
                    Dein Angebotssatz:
                  </label>
                  <p className="text-[16px] text-primary">
                    Beschreibe dein Angebot in einem kurzen Satz.
                  </p>
                </div>
                <input
                  type="text"
                  name="service_title"
                  value={offerFormData.service_title}
                  onChange={handleOfferFormChange}
                  placeholder="Offer set"
                  className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-[#C2DBFE]"
                />
              </div>

              {/* Offer Description */}
              <div className="mb-6">
                <div className="mb-2">
                  <label className="block text-primary font-bold text-[16px] mb-2">
                    Angebotsbeschreibung:
                  </label>
                  <p className="text-[16px] text-primary">
                    Hier kannst du dein Angebot im Detail erklären.
                  </p>
                </div>
                <textarea
                  name="service_details"
                  value={offerFormData.service_details}
                  onChange={handleOfferFormChange}
                  rows={5}
                  className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-[#C2DBFE]"
                ></textarea>
              </div>

              {/* Submit Button */}
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#198754] hover:bg-[#157347] duration-0 text-white py-2 px-6 rounded font-medium"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </div>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        );

      case "social":
        return (
          <div className="w-full max-w-xl">
            <form onSubmit={handleLinksSubmit}>
              <div className="space-y-6">
                {/* Facebook */}
                <div className="flex items-center">
                  <div className="flex-1">
                    <label
                      htmlFor="facebook_url"
                      className="flex items-center gap-2 text-[16px] font-bold text-primary"
                    >
                      <FaFacebook className="text-lg text-primary" />
                      Facebook profile / page - link:
                    </label>
                    <input
                      type="text"
                      id="facebook_url"
                      name="facebook_url"
                      value={links.facebook_url}
                      onChange={handleLinksChange}
                      className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm py-[6px] placeholder:text-primary px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="#"
                    />
                  </div>
                </div>

                {/* Instagram */}
                <div className="flex items-center">
                  <div className="flex-1">
                    <label
                      htmlFor="instagram_url"
                      className="flex items-center gap-2 text-[16px] font-bold text-primary"
                    >
                      <FaInstagram className="text-primary text-lg" />
                      Instagram - Account Link:
                    </label>
                    <input
                      type="text"
                      id="instagram_url"
                      name="instagram_url"
                      value={links.instagram_url}
                      onChange={handleLinksChange}
                      className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm py-[6px] placeholder:text-primary px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="#"
                    />
                  </div>
                </div>

                {/* LinkedIn */}
                <div className="flex items-center">
                  <div className="flex-1">
                    <label
                      htmlFor="linkedin_url"
                      className="flex items-center gap-2 text-[16px] font-bold text-primary"
                    >
                      <FaLinkedin className="text-primary text-lg" />
                      LinkedIn:
                    </label>
                    <input
                      type="text"
                      id="linkedin_url"
                      name="linkedin_url"
                      value={links.linkedin_url}
                      onChange={handleLinksChange}
                      className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm py-[6px] placeholder:text-primary px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="#"
                    />
                  </div>
                </div>

                {/* TikTok */}
                <div className="flex items-center">
                  <div className="flex-1">
                    <label
                      htmlFor="tiktok_url"
                      className="flex items-center gap-2 text-[16px] font-bold text-primary"
                    >
                      <FaTiktok className="text-primary text-lg" />
                      Tiktok:
                    </label>
                    <input
                      type="text"
                      id="tiktok_url"
                      name="tiktok_url"
                      value={links.tiktok_url}
                      onChange={handleLinksChange}
                      className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm py-[6px] placeholder:text-primary px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="#"
                    />
                  </div>
                </div>

                {/* Twitter */}
                <div className="flex items-center">
                  <div className="flex-1">
                    <label
                      htmlFor="twitter"
                      className="flex items-center gap-2 text-[16px] font-bold text-primary"
                    >
                      <FaTwitter className="text-primary text-lg" />
                      Twitter:
                    </label>
                    <input
                      type="text"
                      id="twitter_url"
                      name="twitter_url"
                      value={links.twitter_url}
                      onChange={handleLinksChange}
                      className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm py-[6px] placeholder:text-primary px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="#"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="bg-[#198754] hover:bg-[#157347] duration-0 text-white py-2 px-6 rounded font-medium"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </div>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        );
      case "security":
        return (
          <PasswordChangeForm
            onSubmit={handlePasswordChange}
            isSubmitting={isSubmitting}
          />
        );
      case "contract":
        return <AVContractDisplay />;
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  const handleOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await dispatch(
        updateAdvisorProfile({
          about: offerFormData.about,
          service_title: offerFormData.service_title,
          service_details: offerFormData.service_details,
          service_category_id: selectedCategoryId,
          // Preserve existing values
          broker: currentAdvisor?.broker || false,
          is_visible: currentAdvisor?.is_visible || true,
          freelancer: currentAdvisor?.freelancer || false,
          advisor_contract_accepted:
            currentAdvisor?.advisor_contract_accepted || false,
          terms_and_conditions: currentAdvisor?.terms_and_conditions || false,
          commission_level_settler:
            currentAdvisor?.commission_level_settler || 0,
          commission_level_closer: currentAdvisor?.commission_level_closer || 0,
        })
      ).unwrap();

      toast.success("Your offer has been successfully updated!");
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : "Unable to update your offer. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOfferFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setOfferFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="w-full my-4 p-4 xsm: px-[20px]">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Head>
        <title>Consultant Profile</title>
        <meta name="description" content="Consultant profile management page" />
      </Head>

      <div className="mb-6">
        <h1 className="text-3xl text-[#212529] font-semibold flex items-center">
          <span className="mr-2">
            <FaUser />
          </span>
          Consultant profile
        </h1>
      </div>

      <div className=" mb-4">
        <nav
          className="flex flex-wrap space-x-2"
          aria-label="Profile navigation"
        >
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={tab.href}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(tab.id);
              }}
              className={`py-2 px-3 text-[16px] font-medium ${
                activeTab === tab.id
                  ? "text-[#495057] border rounded-md border-[#DEE2E6] border-b-0"
                  : "text-[#0D6EFD] hover:text-[#0A58CA] border-b border-[#DEE2E6] "
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      <div>{renderTabContent()}</div>
    </div>
  );
};

export default ManageProfilePage;
