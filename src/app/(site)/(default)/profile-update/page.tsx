"use client";
import { useState, useRef, ChangeEvent, FormEvent, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import Datepicker from "@/components/shared/DatePicker";
import ConfirmationDialog from "@/components/shared/ConfirmationDialouge";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { updateCustomersProfileData, fetchCustomersProfileData, uploadProfileImage } from "@/redux/slices/customersSlice";
import { updatePassword } from "@/redux/slices/profileSlice";
import { toast } from "react-toastify";

interface ProfileFormData {
  firstName: string;
  surname: string;
  dateOfBirth: Date | null;
  email: string;
  telephone: string;
  directNumber: string;
  zip: string;
  residence: string;
  state: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfileUpdatePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const profileData = useSelector(
    (state: RootState) => state.customers.customerProfileData
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [profileImage, setProfileImage] = useState<string>(
    "/images/agent-2.jpg"
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);

  // Fetch profile data on component mount
  useEffect(() => {
    async function fetchData() {
      await dispatch(fetchCustomersProfileData({
        id: String(JSON.parse(localStorage.getItem("user") || "").id || "")
      }));
    }
    fetchData();
  }, [dispatch]);

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    surname: "",
    dateOfBirth: null,
    email: "",
    telephone: "",
    directNumber: "",
    zip: "",
    residence: "",
    state: "",
  });

  // Update form fields when profile data is fetched
  useEffect(() => {
    if (profileData) {
      setFormData({
        firstName: profileData.first_name || "",
        surname: profileData.last_name || "",
        dateOfBirth: profileData.date_of_birth ? new Date(profileData.date_of_birth) : null,
        email: profileData.email || "",
        telephone: profileData.phone || "",
        directNumber: profileData.address || "",
        zip: profileData.postal_code || "",
        residence: profileData.city || "",
        state: profileData.state || "",
      });
      setSelectedDate(profileData.date_of_birth ? new Date(profileData.date_of_birth) : null);
      
      // Update profile image if available
      if (profileData.avatar_url) {
        setProfileImage(profileData.avatar_url);
      }
    }
  }, [profileData]);

  // Cleanup object URLs on component unmount
  useEffect(() => {
    return () => {
      if (profileImage && profileImage.startsWith('blob:')) {
        URL.revokeObjectURL(profileImage);
      }
    };
  }, [profileImage]);

  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    console.log("Profile deleted");
    setShowDeleteDialog(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  const handleProfileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Prevent email updates for security reasons
    if (name === 'email') {
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Prevent email updates for security reasons (email field is read-only anyway)
    if (name === 'email') {
      return;
    }
    
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
        return;
      }

      // Store the file for later upload and show preview
      setPendingImageFile(file);
      
      // Clean up previous object URL to prevent memory leaks
      if (profileImage && profileImage.startsWith('blob:')) {
        URL.revokeObjectURL(profileImage);
      }
      
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmittingProfile(true);

    try {
      let uploadedImageUrl: string | null = null;

      // Step 1: Upload image if there's a pending file
      if (pendingImageFile) {
        try {
          const imageResult = await dispatch(
            uploadProfileImage({
              imageFile: pendingImageFile,
            })
          );

          if (uploadProfileImage.fulfilled.match(imageResult)) {
            uploadedImageUrl = imageResult.payload?.avatar_url || null;
            // Update the preview with server URL
            if (uploadedImageUrl) {
              setProfileImage(uploadedImageUrl);
            }
          } else {
            toast.error("Failed to upload profile image");
            return;
          }
        } catch (error) {
          toast.error("An error occurred while uploading the image");
          console.error("Image upload error:", error);
          return;
        }
      }

      // Step 2: Prepare profile update data with only changed fields
      const profileUpdateData: Partial<{
        first_name: string;
        last_name: string;
        phone: string;
        address: string;
        postal_code: string;
        city: string;
        state: string;
        date_of_birth: string;
        avatar_url: string;
      }> = {};

      // Compare and include only changed fields
      if (formData.firstName.trim() !== (profileData?.first_name || "")) {
        profileUpdateData.first_name = formData.firstName.trim();
      }

      if (formData.surname.trim() !== (profileData?.last_name || "")) {
        profileUpdateData.last_name = formData.surname.trim();
      }

      if (formData.telephone.trim() !== (profileData?.phone || "")) {
        profileUpdateData.phone = formData.telephone.trim();
      }

      if (formData.directNumber.trim() !== (profileData?.address || "")) {
        profileUpdateData.address = formData.directNumber.trim();
      }

      if (formData.zip.trim() !== (profileData?.postal_code || "")) {
        profileUpdateData.postal_code = formData.zip.trim();
      }

      if (formData.residence.trim() !== (profileData?.city || "")) {
        profileUpdateData.city = formData.residence.trim();
      }

      if (formData.state.trim() !== (profileData?.state || "")) {
        profileUpdateData.state = formData.state.trim();
      }

      // Compare dates properly
      const currentDateString = selectedDate ? selectedDate.toISOString().split('T')[0] : null;
      const originalDateString = profileData?.date_of_birth || null;
      
      if (currentDateString !== originalDateString) {
        if (currentDateString) {
          profileUpdateData.date_of_birth = currentDateString;
        }
      }

      // Check if there are form field changes (excluding image)
      const hasFormFieldChanges = Object.keys(profileUpdateData).length > 0;

      // Include uploaded image URL if we just uploaded one
      if (uploadedImageUrl) {
        profileUpdateData.avatar_url = uploadedImageUrl;
      }

      // Check if there are any changes to submit (form fields OR image)
      if (!hasFormFieldChanges && !pendingImageFile) {
        toast.info("No changes detected to save");
        return;
      }

      // Step 3: Update profile data (always call if we have data to update)
      if (Object.keys(profileUpdateData).length > 0) {
        const result = await dispatch(
          updateCustomersProfileData({
            id: String(JSON.parse(localStorage.getItem("user") || "").id || ""),
            data: profileUpdateData,
          })
        );

        if (updateCustomersProfileData.fulfilled.match(result)) {
          // Clear pending image file after successful save
          setPendingImageFile(null);
          
          // Show appropriate success message based on what was updated
          if (hasFormFieldChanges && uploadedImageUrl) {
            toast.success("Profile updated successfully (including profile picture)!");
          } else if (hasFormFieldChanges) {
            toast.success("Profile updated successfully!");
          } else if (uploadedImageUrl) {
            toast.success("Profile picture updated successfully!");
          }
        } else if (updateCustomersProfileData.rejected.match(result)) {
          toast.error(result.payload as string || "Failed to update profile");
        }
      }
    } catch (error) {
      toast.error("An error occurred while updating your profile");
      console.error("Profile update error:", error);
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmittingPassword(true);

    try {
      // Validate passwords match
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error("New passwords do not match");
        return;
      }

      if (passwordData.newPassword.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
      }

      if (!passwordData.currentPassword) {
        toast.error("Current password is required");
        return;
      }

      // Call the updatePassword API
      const result = await dispatch(
        updatePassword({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
          confirm_password: passwordData.confirmPassword,
        })
      );

      if (updatePassword.fulfilled.match(result)) {
        toast.success("Password updated successfully!");
        
        // Reset form
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else if (updatePassword.rejected.match(result)) {
        toast.error(result.payload as string || "Failed to update password");
      }
    } catch (error) {
      toast.error("An error occurred while updating your password");
      console.error("Password update error:", error);
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4">
      <Head>
        <title>Profile Settings</title>
      </Head>

      <div className=" space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-end">
            <button
              onClick={handleDeleteClick}
              className="btn-shine bg-[#DC3545] px-8 py-2 text-md"
            >
              Deactivate account
            </button>
            <ConfirmationDialog
              isOpen={showDeleteDialog}
              title="Do you really want to delete your profile irrevocably?"
              message="This process will not undo."
              onConfirm={handleConfirmDelete}
              onCancel={handleCancelDelete}
              confirmText="Delete"
              cancelText="Cancel"
            />
          </div>
          <div className="flex flex-col items-center max-w-md justify-start mb-6">
            <div className="relative w-36 h-36 mb-2">
              <Image
                src={profileImage}
                alt="Profile"
                layout="fill"
                className="rounded-full object-cover"
              />
              {pendingImageFile && (
                <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  Unsaved
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={handleImageUploadClick}
              className="bg-[#6E767B] hover:bg-[#5A6267] text-white text-md font-semibold font-roboto py-1 px-3 rounded flex items-center space-x-1 transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              <span>{pendingImageFile ? "Change image" : "Upload image"}</span>
            </button>
            {pendingImageFile && (
              <p className="text-sm text-blue-600 mt-1 text-center">
                Image selected. Click &quot;Save profile&quot; to upload. 
              </p>
            )}
          </div>

          <form
            onSubmit={handleProfileSubmit}
            className="grid grid-cols-2 xsm:grid-cols-1 gap-6"
          >
            <div>
              <label
                htmlFor="firstName"
                className="block text-[16px] font-roboto"
              >
                First name*
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleProfileChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="surname"
                className="block text-[16px] font-roboto"
              >
                Last name
              </label>
              <input
                type="text"
                id="surname"
                name="surname"
                value={formData.surname}
                onChange={handleProfileChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="">
              <label
                htmlFor="dateOfBirth"
                className="block text-[16px] mb-1 font-roboto"
              >
                Date of birth
              </label>
              <Datepicker
                selectedDate={selectedDate}
                onChange={(date) => {
                  setSelectedDate(date);
                }}
                minDate={new Date(1900, 0, 1)} 
                maxDate={new Date()} 
                placeholder="Select date of birth"
                className="w-full "
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-[16px] font-roboto">
                Email* (Read-only)
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                readOnly
                disabled
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 px-3 bg-gray-100 text-gray-600 cursor-not-allowed"
                title="Email cannot be changed for security reasons"
              />
            </div>

            <div>
              <label
                htmlFor="telephone"
                className="block text-[16px] font-roboto"
              >
                Telephone number*
              </label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleProfileChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="directNumber"
                className="block text-[16px] font-roboto"
              >
                Street, house number
                </label>
              <input
                type="text"
                id="directNumber"
                name="directNumber"
                value={formData.directNumber}
                onChange={handleProfileChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="zip" className="block text-[16px] font-roboto">
              Postal code
              </label>
              <input
                type="text"
                id="zip"
                name="zip"
                value={formData.zip}
                onChange={handleProfileChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="residence"
                className="block text-[16px] font-roboto"
              >
                place of residence
              </label>
              <input
                type="text"
                id="residence"
                name="residence"
                value={formData.residence}
                onChange={handleProfileChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-[16px] font-roboto">
                state
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleProfileChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="pt-8 col-span-2 xsm:col-span-1">
              <button
                type="submit"
                disabled={isSubmittingProfile}
                className={`btn-shine min-h-[50px] py-0 font-medium font-roboto bg-[#1477BC] text-sm px-6 py-2 text-white rounded transition-all ${
                  isSubmittingProfile 
                    ? 'opacity-50 cursor-not-allowed bg-gray-400' 
                    : 'hover:bg-[#1778F2]'
                }`}
              >
                {isSubmittingProfile ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  "Save profile"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Password Change Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-[20px] font-roboto font-semibold mb-4">
            Change password
          </h2>

          <div className="border-t  my-4"></div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="passwordEmail"
                className="block text-[16px] font-roboto"
              >
                Email* (Read-only)
              </label>
              <input
                type="email"
                id="passwordEmail"
                name="email"
                value={formData.email}
                readOnly
                disabled
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 px-5 bg-gray-100 text-gray-600 cursor-not-allowed"
                title="Email cannot be changed for security reasons"
              />
            </div>

            <div>
              <label
                htmlFor="currentPassword"
                className="block text-[16px] font-roboto"
              >
                Current Password*
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 px-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-[16px] font-roboto"
              >
                New Password*
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 px-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-[16px] font-roboto"
              >
                New password (again)*
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 px-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="pt-8">
              <button
                type="submit"
                disabled={isSubmittingPassword}
                className={`btn-shine min-h-[50px] py-0 font-medium font-roboto bg-[#1477BC] text-sm px-6 py-2 text-white rounded transition-all ${
                  isSubmittingPassword 
                    ? 'opacity-50 cursor-not-allowed bg-gray-400' 
                    : 'hover:bg-[#1778F2]'
                }`}
              >
                {isSubmittingPassword ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  "Password update"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileUpdatePage;
