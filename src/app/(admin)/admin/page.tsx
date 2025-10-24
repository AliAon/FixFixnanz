"use client";
import AdminCard from "@/components/shared/AdminCard";
import { fetchCategoryById, fetchCategories } from "@/redux/slices/categoriesSlice";
import { fetchAdvisorStats } from "@/redux/slices/advisorsSlice";
import { RootState, AppDispatch } from "@/redux/store";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { FaStar } from "react-icons/fa";
import { GoClockFill } from "react-icons/go";
import { useDispatch, useSelector } from "react-redux";
import Loader from "@/components/shared/Loader/Loader";
import { fetchCustomerCount } from "@/redux/slices/customersSlice";
import {
  getAdvisorContract,
} from "@/redux/slices/advisorContractSlice";
import {
  fetchAdvisorProfile
} from "@/redux/slices/advisorsSlice";
import ContractModal from "@/app/(admin)/components/AVContractModal";

const Dashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { advisorStats, isLoading: advisorStatsLoading, currentAdvisor } = useSelector(
    (state: RootState) => state.advisors
  );
  const { categories, category, isLoading: categoriesLoading } = useSelector(
    (state: RootState) => state.categories
  );
  const { customerCount, isLoading: customerCountLoading } = useSelector(
    (state: RootState) => state.customers
  );
  const { contract, isLoading: contractLoading } = useSelector(
    (state: RootState) => state.advisorContract
  );
  const dispatch = useDispatch<AppDispatch>();

  // Contract Modal State
  const [showContractModal, setShowContractModal] = useState(false);

  // Email verification states
  const [isEmailVerified, setIsEmailVerified] = React.useState<boolean>(true);
  const [showEmailBanner, setShowEmailBanner] = React.useState<boolean>(false);

  console.debug(isEmailVerified);

  // Load contract data
  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchAdvisorProfile()).unwrap();
        const contractData = await dispatch(getAdvisorContract()).unwrap();
        console.debug("Fetched contract data:", contractData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [dispatch, user?.role]);

  // Update modal visibility based on advisor data
  useEffect(() => {
    if (currentAdvisor) {
      const hasNotAccepted =
        !currentAdvisor.advisor_contract_accepted ||
        !currentAdvisor.contract_accepted_at;
      setShowContractModal(hasNotAccepted);
    }
  }, [currentAdvisor]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showContractModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showContractModal]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const emailVerified = parsedUser.email_verified !== false;
        setIsEmailVerified(emailVerified);

        if (user?.role === "financial-advisor" && !emailVerified && !showContractModal) {
          setShowEmailBanner(true);
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        setIsEmailVerified(true);
      }
    }

    if (user?.isEmailVerified !== undefined) {
      const emailVerified = user.isEmailVerified;
      setIsEmailVerified(emailVerified);

      if (user?.role === "financial-advisor" && !emailVerified && !showContractModal) {
        setShowEmailBanner(true);
      }
    }
  }, [user, showContractModal]);

  const shouldFetchData = useMemo(
    () => ({
      category: Boolean(user?.category_id),
      advisorStats: Boolean(user?.advisor?.id),
      customerCount: Boolean(user?.id),
    }),
    [user?.category_id, user?.advisor?.id, user?.id]
  );

  useEffect(() => {
    const fetchData = async () => {
      const fetchPromises = [];

      if (shouldFetchData.category && user?.category_id) {
        fetchPromises.push(dispatch(fetchCategoryById(user.category_id)));
        if (categories.length === 0) {
          fetchPromises.push(dispatch(fetchCategories()));
        }
      }

      if (shouldFetchData.advisorStats && user?.advisor?.id) {
        fetchPromises.push(dispatch(fetchAdvisorStats({ id: user.advisor.id })));
      }

      if (shouldFetchData.customerCount && user?.id) {
        fetchPromises.push(dispatch(fetchCustomerCount({ consultantId: user.id })));
      }

      await Promise.all(fetchPromises);
    };

    fetchData();
  }, [dispatch, shouldFetchData, user?.category_id, user?.advisor?.id, user?.id, categories.length]);

  const getCategoryName = () => {
    if (!user || user.role === "admin" || user.role !== "financial-advisor" || !user.category_id) {
      return "";
    }

    if (category && category.id === user.category_id) {
      return category.name;
    }

    const foundCategory = categories.find((cat) => cat.id === user.category_id);
    if (foundCategory) {
      return foundCategory.name;
    }

    return "";
  };

  const handleContractAccepted = () => {
    setShowContractModal(false);
  };

  // const handleContractModalClose = () => {
  //   setShowContractModal(false);
  //   toast.info("You can accept the contract later from your profile settings.");
  // };

  if (advisorStatsLoading || categoriesLoading || customerCountLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  return (
    <>
      {/* Contract Modal */}
      {showContractModal && (
        <ContractModal
          contract={contract}
          isLoading={contractLoading}
          user={user}
          currentAdvisor={currentAdvisor}
          onAccept={handleContractAccepted}
        />
      )}

      {/* Dashboard Content */}
      <div className="my-8 px-[20px]">
        {/* Email Verification Banner */}
        {showEmailBanner && !showContractModal && (
          <div className="mb-6 bg-[#fff3cd] border-2 border-[#ffc107] p-4 rounded-lg shadow-sm relative">
            <button
              onClick={() => setShowEmailBanner(false)}
              className="absolute bg-transparent p-0 border-0 top-2 right-2 text-gray-500 hover:text-gray-700 text-[30px] font-normal"
              aria-label="Close"
            >
              ×
            </button>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 text-yellow-600 mt-0.5">⚠️</div>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-semibold text-yellow-800">
                  E-Mail Bestätigung erforderlich!
                  <span className="text-sm text-yellow-700 font-normal ml-1">
                    Bitte bestätige deine E-Mail, um auf alle Funktionen zugreifen zu:
                  </span>
                </h3>
                <ul className="text-sm text-yellow-700 space-y-1 mb-4">
                  <li>• Kalender</li>
                  <li>• Vertrag</li>
                  <li>• E-Mail-Vorlagen / E-Mail-Marketing</li>
                  <li>• Pipeline</li>
                  <li>• Facebook-Verbindung / Leads-Verbindung</li>
                  <li>• Bewertungen</li>
                </ul>
                <div className="flex justify-end items-center">
                  <Link
                    href="/unverified-user"
                    className="bg-[#03254c] hover:bg-secondary duration-300 text-white py-2 px-3 rounded-lg text-base font-roboto font-normal text-center"
                  >
                    Jetzt verifizieren
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 sm:grid-cols-2 xsm:grid-cols-1 gap-6">
          <AdminCard
            title="BEWERTUNGEN"
            count={advisorStats?.total_reviews || 0}
            additionalCount={`(${advisorStats?.total_reviews || 0})`}
            icon={<FaStar className="text-white" size={16} />}
            description="Bewertungen"
          />
          <AdminCard
            title="Kontakte"
            count={customerCount}
            additionalCount={`(${customerCount})`}
            icon={<GoClockFill className="text-white" size={16} />}
            description="Kontakte"
          />
          <AdminCard
            title="Profil ansehen"
            count={advisorStats?.total_views || 0}
            additionalCount={`(${advisorStats?.total_views || 0})`}
            icon={<GoClockFill className="text-white" size={16} />}
            description="Profil ansehen"
          />
        </div>

        <div className="flex sm:flex-col xsm:flex-col gap-4 w-full h-auto">
          <div className="bg-white rounded-lg my-6 shadow-xl w-full h-full">
            <div className="px-4 py-2">
              <Link
                href="/admin/overview"
                className="bg-[#212529] text-[1rem] hover:bg-[#424649] duration-100 text-white px-4 py-2 rounded-md"
              >
                Pipeline Overview
              </Link>
            </div>

            <div className="grid grid-cols-[150px_1fr_1fr_1fr] border-b py-2 px-4 font-bold text-[16px] text-[#212529]">
              <div>Profile</div>
              <div>Name</div>
              <div>Telefon</div>
              <div>E-mail</div>
            </div>

            {advisorStatsLoading ? (
              <div className="p-4 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="mt-2 text-gray-500">Loading contacts...</p>
              </div>
            ) : !advisorStats?.customers?.customers ||
              advisorStats.customers.customers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No contacts available
              </div>
            ) : (
              <div>
                {advisorStats.customers.customers.map((customer) => (
                  <div
                    key={customer?.id}
                    className="grid grid-cols-[150px_1fr_1fr_1fr] border-b py-3 px-4"
                  >
                    <div className="flex items-center">
                      {customer?.avatar_url && customer.avatar_url !== '' && customer.avatar_url !== 'example.com' ? (
                        <Image
                          src={customer.avatar_url}
                          alt={`${customer?.first_name} ${customer?.last_name}`}
                          width={32}
                          height={32}
                          className="w-12 h-12 rounded-full object-cover mr-2"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 mr-2"></div>
                      )}
                    </div>
                    <div className="flex items-center">
                      {customer?.first_name} {customer?.last_name}
                    </div>
                    <div className="flex items-center">
                      {customer?.lead_phone || "N/A"}
                    </div>
                    <div className="flex items-center">
                      {customer?.lead_email || "N/A"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="group cursor-pointer bg-white mt-6 rounded-xl shadow-lg px-3 pb-8 pt-4 w-full max-w-[240px] xl:max-w-[400px] sm:max-w-full xsm:max-w-full h-full transform transition-all duration-300 hover:-translate-y-3">
            {user?.id && user?.role === "financial-advisor" ? (
              <Link href={`/experts/profile/${user.id}`} className="block">
                <div className="bg-[#03254c] p-4 rounded-xl h-[260px] text-center relative">
                  <div className="flex justify-center">
                    <div className="relative w-full max-w-[155px] mt-4 h-[155px] rounded-full overflow-hidden">
                      {user?.avatar_url && user.avatar_url !== '' && user.avatar_url !== 'example.com' ? (
                        <img
                          src={user.avatar_url}
                          alt="Profile Picture"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <h2 className="text-white text-[20px] font-roboto font-bold mt-5 group-hover:text-[#1477BC] duration-300">
                    {user?.first_name}
                  </h2>
                </div>
              </Link>
            ) : (
              <div className="bg-[#03254c] p-4 rounded-xl h-[260px] text-center relative">
                <div className="flex justify-center">
                  <div className="relative w-full max-w-[155px] mt-4 h-[155px] rounded-full overflow-hidden">
                    {user?.avatar_url && user.avatar_url !== '' && user.avatar_url !== 'example.com' ? (
                      <img
                        src={user.avatar_url}
                        alt="Profile Picture"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded-full"></div>
                    )}
                  </div>
                </div>
                <h2 className="text-white text-[20px] font-roboto font-bold mt-5">
                  {user?.first_name}
                </h2>
              </div>
            )}
            <div className="py-4 text-center flex w-full items-center justify-between">
              <div className="flex items-center justify-center text-[#1778F2] font-medium text-md text-left font-roboto">
                <img src="/images/icons/labe.svg" alt="" />
                {user?.role === "admin" ? "Admin" : (categoriesLoading ? "Loading..." : (getCategoryName() || "Finance Advisor"))}
              </div>
              <div className="flex flex-col items-center  justify-between">
                <div className="mt-2">
                  <span className="text-yellow-500 text-sm">
                    {advisorStats?.average_rating
                      ? "★".repeat(Math.round(advisorStats.average_rating)) +
                      "☆".repeat(5 - Math.round(advisorStats.average_rating))
                      : "☆☆☆☆☆"}
                  </span>
                </div>
                <span className="text-[#647082] ml-3 font-roboto text-[11px] mt-1 inline-block">
                  ({advisorStats?.total_reviews || 0})Bewertungen
                </span>
              </div>
            </div>
            <div className="border-t-[0.5px] border-[#DDDDDD] mt-2"></div>
            <div className={`py-4 ${user?.role === "financial-advisor" ? "space-y-2" : ""}`}>
              {user?.role === "financial-advisor" && user?.id ? (
                <Link href={`/experts/profile/${user.id}`} className="block">
                  <div className="w-full bg-[#03254c] hover:bg-secondary duration-300 text-white py-2 rounded-lg text-lg font-roboto font-semibold text-center">
                    Profile View
                  </div>
                </Link>
              ) : null}
              <Link href={`/admin/manage-profile`} className="block">
                <div className="w-full bg-[#E0E0E0] hover:text-[#1778F2] duration-300  py-2 rounded-lg text-lg font-semibold text-center">
                  Edit Profile
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;