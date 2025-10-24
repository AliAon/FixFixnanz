"use client";
import ContractDashboard from "@/components/dashboard-sections/category";
import {  fetchCustomersProfileData } from "@/redux/slices/customersSlice";
import { AppDispatch, RootState } from "@/redux/store";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { TbEdit } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";

interface CircularProgressProps {
  value: number;
  maxValue: number;
  color: string;
  title: string;
}
const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  maxValue,
  color,
  title,
}) => {
  const [displayAmount, setDisplayAmount] = useState<number>(0);
  const percentage = (value / maxValue) * 100;
  const circumference = 2 * Math.PI * 55;
  const offset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    const duration = 1000;
    const frameDuration = 1000 / 60;
    const totalFrames = Math.round(duration / frameDuration);
    let frame = 0;

    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const currentCount = Math.round(value * progress);

      setDisplayAmount(currentCount);

      if (frame === totalFrames) {
        clearInterval(counter);
        setDisplayAmount(value);
      }
    }, frameDuration);

    return () => clearInterval(counter);
  }, [value]);

  return (
    <div className="bg-white px-6 py-8 rounded-lg shadow-md flex flex-col items-center">
      <h2 className="text-[16px] font-roboto font-medium pb-6">{title}</h2>
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="w-full h-full absolute" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="55"
            fill="none"
            stroke="#f0f0f0"
            strokeWidth="3"
          />
        </svg>

        <svg
          className="w-full h-full absolute rotate-[-90deg]"
          viewBox="0 0 120 120"
        >
          <circle
            cx="60"
            cy="60"
            r="55"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
          />
        </svg>

        <div
          className="text-lg font-bold font-roboto text-center flex items-center justify-center"
          style={{ color: color }}
        >
          {displayAmount.toFixed(2)} €
        </div>
      </div>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  // const income = 2500;
  // const expenses = 1800;
  // const overall = income - expenses;

  const maxIncome = 5000;
  const maxExpenses = 3000;
  const maxOverall = 5000;

  const userData = {
    firstName: "Test",
    surname: "App",
    email: "test@gmail.com",
    telephone: "",
    dateOfBirth: "Feb 15, 2007",
    state: "Hesse",
    placeOfResidence: "Germany",
    postcode: "63110",
    address: "worthysdfgh",
    maritalStatus: "",
    profession: "",
    nationality: "Germany",
    employer: "",
    employmentStatus: "",
    monthlyIncome: "0.00 €",
    monthlyExpenses: "0.00 €",
    housingSituation: "",
  };


  // fetchCustomerProfile
  const dispatch = useDispatch<AppDispatch>();
  // const data1 = useSelector(
  //   (state: RootState) => state.customers.customerProfile
  // );

  const data = useSelector(
    (state: RootState) => state.customers.customerProfileData
  );

  useEffect(() => {
    async function fetchData() {
      // Wait a bit to ensure tokens are properly set after login
      const user = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      
      if (!user || !token) {
        // If user or token not yet available, wait a bit and retry
        setTimeout(() => {
          const retryUser = localStorage.getItem("user");
          const retryToken = localStorage.getItem("token");
          if (retryUser && retryToken) {
            try {
              const parsedUser = JSON.parse(retryUser);
              if (parsedUser.id) {
                dispatch(fetchCustomersProfileData({ id: String(parsedUser.id) }));
              }
            } catch (error) {
              console.error('Error parsing user data:', error);
            }
          }
        }, 500); // Wait 500ms for tokens to be set
        return;
      }

      try {
        const parsedUser = JSON.parse(user);
        if (parsedUser.id) {
          await dispatch(fetchCustomersProfileData({
            id: String(parsedUser.id)
          }));
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    fetchData();
  }, [dispatch]);


  // console.log("data", data);


  return (
    <div className="w-full h-full space-y-8">
      <div className="bg-[#E6E7E7] p-4 rounded-lg w-full">
        <div className="grid grid-cols-3 sm:grid-cols-1 sm:gap-4 xsm:grid-cols-1 xsm:gap-4 gap-12">
          <CircularProgress
            value={data == null ? 0 : data?.monthly_income == null ? 0 : data?.monthly_income - (data == null ? 0 : data?.monthly_expenses == null ? 0 : data?.monthly_expenses)}
            maxValue={maxOverall}
            color="#4682B4"
            title="Overall"
          />

          <CircularProgress
            value={data == null ? 0 : data?.monthly_income == null ? 0 : data?.monthly_income}
            maxValue={maxIncome}
            color="#32CD32"
            title="My income"
          />

          <CircularProgress
            value={data == null ? 0 : data?.monthly_expenses == null ? 0 : data?.monthly_expenses}
            maxValue={maxExpenses}
            color="#FF6347"
            title="My expenses"
          />
        </div>
        <div className="pt-5 sm:pt-4 xsm:pt-4">
          <ContractDashboard />
        </div>
      </div>
      <div className="bg-white rounded-lg p-12 shadow-lg shadow-[#b7afaf] ">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[24px] font-roboto font-bold text-secondary">
            Personal information
          </h2>
          <Link href="/my-profile" className="bg-[#1C1F23] font-roboto text-white px-4 py-2 rounded-md flex items-center">
            <TbEdit size={20} className="mr-2" />
            Edit profile
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-1 xsm:grid-cols-1 gap-x-12 gap-y-4">
          {/* Left column */}
          <div className="space-y-4">
            <div className="flex">
              <p className="text-[16px] font-roboto text-[#647082] w-48">
                First name :
              </p>
              <p className="text-[16px] font-roboto text-secondary">
                {data ? data.first_name : userData.firstName}
              </p>
            </div>
            <div className="flex">
              <p className="text-[16px] font-roboto text-[#647082] w-48">
                Surname :
              </p>
              <p className="text-[16px] font-roboto text-secondary">
                {data ? data.last_name : userData.surname}
              </p>
            </div>
            <div className="flex">
              <p className="text-[16px] font-roboto text-[#647082] w-48">
                Email:
              </p>
              <p className="text-[16px]  overflow-x-auto font-roboto text-secondary">
                {data ? data.email : userData.email}
              </p>
            </div>
            <div className="flex">
              <p className="text-[16px] font-roboto text-[#647082] w-48">
                Telephone number:
              </p>
              <p className="text-[16px] font-roboto text-secondary">
                {data ? data.phone : userData.telephone}
              </p>
            </div>
            <div className="flex">
              <p className="text-[16px] font-roboto text-[#647082] w-48">
                Date of birth:
              </p>
              <p className="text-[16px] font-roboto text-secondary">
                {data ? data.dob : userData.dateOfBirth}
              </p>
            </div>
            <div className="flex">
              <p className="text-[16px] font-roboto text-[#647082] w-48">
                State :
              </p>
              <p className="text-[16px] font-roboto text-secondary">
                {data ? data.state : userData.state}
              </p>
            </div>
            <div className="flex">
              <p className="text-[16px] font-roboto text-[#647082] w-48">
                Place of residence:
              </p>
              <p className="text-[16px] font-roboto text-secondary">
                {data ? data.city : userData.placeOfResidence}
              </p>
            </div>
            <div className="flex">
              <p className="text-[16px] font-roboto text-[#647082] w-48">
                Postcode / town
              </p>
              <p className="text-[16px] font-roboto text-secondary">
                {data ? data.postal_code : userData.postcode}
              </p>
            </div>
            <div className="flex">
              <p className="text-[16px] font-roboto text-[#647082] w-48">
                Address :
              </p>
              <p className="text-[16px] font-roboto text-secondary">
                {data ? data.address : userData.address}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex">
              <p className="text-[16px] font-roboto text-[#647082] w-48">
                Marital status:
              </p>
              <p className="text-[16px] font-roboto text-secondary">
                {data ? data.marital_status : userData.maritalStatus}
              </p>
            </div>
            <div className="flex">
              <p className="text-[16px] font-roboto text-[#647082] w-48">
                Profession:
              </p>
              <p className="text-[16px] font-roboto text-secondary">
                {data ? data.occupation : userData.profession}
              </p>
            </div>
            <div className="flex">
              <p className="text-[16px] font-roboto text-[#647082] w-48">
                Nationality:
              </p>
              <p className="text-[16px] font-roboto text-secondary">
                {data ? data.nationality : userData.nationality}
              </p>
            </div>
            <div className="flex">
              <p className="text-[16px] font-roboto text-[#647082] w-48">
                Employer:
              </p>
              <p className="text-[16px] font-roboto text-secondary">
                {data ? data.employer : userData.employer}
              </p>
            </div>
            <div className="flex">
              <p className="text-[16px] font-roboto text-[#647082] w-48">
                Employment status:
              </p>
              <p className="text-[16px] font-roboto text-secondary">
                {data ? data.employment_status : userData.employmentStatus}
              </p>
            </div>
            <div className="flex">
              <p className="text-[16px] font-roboto text-[#647082] w-48">
                Monthly income:
              </p>
              <p className="text-[16px] font-roboto text-secondary">
                {data ? data.monthly_income : userData.monthlyIncome}
              </p>
            </div>
            <div className="flex">
              <p className="text-[16px] font-roboto text-[#647082] w-48">
                Monthly expenses:
              </p>
              <p className="text-[16px] font-roboto text-secondary">
                {data ? data.monthly_expenses : userData.monthlyExpenses}
              </p>
            </div>
            <div className="flex">
              <p className="text-[16px] font-roboto text-[#647082] w-48">
                Housing situation:
              </p>
              <p className="text-[16px] font-roboto text-secondary">
                {data ? data.housing_situation : userData.housingSituation}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
