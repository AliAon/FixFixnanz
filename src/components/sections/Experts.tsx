"use client";

import React, { useEffect } from "react";
import Card from "../shared/ExpertCard/page";
import "../../app/globals.css";
import Button from "../shared/Button";
import AOS from "aos";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchPublicAdvisors } from "@/redux/slices/advisorsSlice";

const Experts: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const publicAdvisors = useSelector(
    (state: RootState) => state.advisors.publicAdvisors
  );

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
    dispatch(fetchPublicAdvisors({}));
  }, [dispatch]);

  const handleSubmit = () => {
    window.location.href = `/experts`;
  };

  const handleCardClick = (id: string, userId: string) => {
    window.location.href = `/experts/profile/${id}?userId=${userId}`;
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center w-full">
        <div className="relative inline-block text-secondary text-2xl">
          <span className="font-ppagrandir">our</span>
          <svg
            className="absolute left-0 w-[100%] bottom-0"
            viewBox="0 0 100 20"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5,15 Q50,5 95,15"
              stroke="#ff3b5c"
              strokeWidth="6"
              fill="none"
            />
          </svg>
        </div>
        <h1 className="text-secondary font-bold text-center text-[36px] xsm:mb-4 xsm:mt-8 mb-16">
          Top financial experts
        </h1>
      </div>

      <div className="max-w-[1330px] mx-auto grid grid-cols-4 sm:grid-cols-2 expert-layout gap-6 px-[10px] sm:px-[20px] xsm:px-[20px] w-full xsm:flex xsm:flex-col xsm:items-center xsm:justify-center">
        {publicAdvisors.slice(0, 4).map((expert) => (
          <Card
            key={expert.id}
            image={expert.avatar_url}
            title={expert.categories.name}
            address={expert.location || "N/A"}
            name={`${expert.first_name} ${expert.last_name}`}
            total_reviews={expert.total_reviews}
            id={expert.id}
            userId={expert.user_id}
            average_rating={expert.average_rating}
            onCardClick={handleCardClick}
          />
        ))}
      </div>

      <div className="flex items-center justify-center w-full my-12">
        <Button onClick={handleSubmit} text="View all" className="px-16 py-3" />
      </div>
    </>
  );
};

export default Experts;
