"use client";
import React, { useEffect } from "react";
import InsuranceCard from "@/components/shared/ServiceCard/page";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchCategories } from "@/redux/slices/categoriesSlice";

const ServicesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, isLoading } = useSelector(
    (state: RootState) => state.categories
  );

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <div className="py-52 px-[20px] max-w-[1330px] mx-auto">
      <div className="grid grid-cols-4 sm:grid-cols-2 xsm:grid-cols-1 gap-6">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          categories?.map((category) => (
            <Link href="/experts" key={category.id}>
              <InsuranceCard
                image={
                  typeof category.image === "string"
                    ? category.image
                    : "/placeholder.jpg"
                }
                title={category.name}
                categoryId={category.id}
              />
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
