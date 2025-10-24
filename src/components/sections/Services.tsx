"use client";
import React, { useEffect } from "react";
import InsuranceCard from "../shared/ServiceCard/page";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchCategories } from "@/redux/slices/categoriesSlice";

const Services: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, isLoading } = useSelector(
    (state: RootState) => state.categories
  );

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleSubmit = () => {
    window.location.href = `/financial-services`;
  };

  return (
    <div className="inflanar-section-shape inflanar-bg-cover py-28 px-[20px] relative">
      <div className="flex flex-col items-center justify-center">
        <h1 className="font-ppagrandir text-[26px] text-white">Services</h1>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/in-section-vector.svg"
          alt="vector"
          width={120}
          height={7}
        />
      </div>

      <h1 className="text-[#fff] font-roboto text-center font-bold text-[40px] mt-3">
        Current Financial Services
      </h1>

      <div className="max-w-[1330px] mx-auto grid grid-cols-4 sm:grid-cols-2 xsm:flex xsm:flex-col xsm:items-center xsm:justify-center gap-6 py-[50px]">
        {isLoading ? (
          <p className="text-white">Loading...</p>
        ) : (
          categories
            .slice(0, 4)
            .map((category) => (
              <InsuranceCard
                key={category.id}
                title={category.name}
                image={
                  typeof category.image === "string"
                    ? category.image
                    : "/placeholder.jpg"
                }
                categoryId={category.id}
              />
            ))
        )}
      </div>

      <div className="flex items-center z-50 justify-center w-full pb-5">
        <button
          onClick={handleSubmit}
          className="px-12 py-2 text-secondary bg-white font-roboto rounded-md text-center"
        >
          View all
        </button>
      </div>
    </div>
  );
};

export default Services;
