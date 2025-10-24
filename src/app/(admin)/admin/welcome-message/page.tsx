"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { 
  fetchWelcomeMessage, 
  updateWelcomeMessage 
} from "@/redux/slices/supportWelcomeMessageSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Button Loader Component
const ButtonLoader = () => (
  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
      Loading...
    </span>
  </div>
);

const WelcomeMessagePreviewPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector(
    (state: RootState) => state.supportWelcomeMessage
  );
  const [message, setMessage] = useState("");
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    setIsFetching(true);
    dispatch(fetchWelcomeMessage())
      .unwrap()
      .then((response) => {
        setMessage(response.message);
      })
      .catch((error) => {
        toast.error(error || "Failed to fetch welcome message");
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, [dispatch]);

  const handleSaveChanges = async () => {
    if (!message.trim()) {
      toast.error("Welcome message cannot be empty");
      return;
    }

    try {
      await dispatch(updateWelcomeMessage({ message })).unwrap();
      toast.success("Welcome message updated successfully");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to update welcome message");
      } else {
        toast.error("Failed to update welcome message");
      }
    }
  };

  return (
    <div className="py-10 px-4 bg-gray-50 min-h-screen">
      <ToastContainer />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Welcome Message</h1>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6 w-full max-w-2xl">
            <label className="block text-gray-700 mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-4 min-h-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your welcome message..."
              disabled={isFetching}
            />
          </div>
          <button 
            onClick={handleSaveChanges}
            disabled={isLoading || isFetching}
            className={`bg-[#0D6EFD] hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${(isLoading || isFetching) ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? <ButtonLoader /> : null}
            <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeMessagePreviewPage;
