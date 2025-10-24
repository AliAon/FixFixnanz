"use client";
import React from "react";
import { FaUser } from "react-icons/fa";

interface InsuranceCardProps {
  image: string;
  title: string;
  categoryId: string;
}
const handleSubmit = ({ categoryId }: { categoryId: string }) => {
  window.location.href = `/experts?categoryId=${categoryId}`;
};
const InsuranceCard: React.FC<InsuranceCardProps> = ({
  image,
  title,
  categoryId,
}) => {
  return (
    <div className="bg-white rounded-2xl group cursor-pointer shadow-lg px-6 pb-6 w-full transform transition-all duration-300 hover:-translate-y-3">
      <div className="relative overflow-hidden flex justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt="Insurance"
          className="w-auto h-52 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1"
        />
      </div>
      <h2 className="mt-6 text-lg capitalize font-semibold text-secondary font-roboto duration-300 group-hover:text-[#1477BC]">
        {title}
      </h2>
      <div className="border-[#EAEAEA] border-t my-7"></div>

      <div className="flex items-center justify-between w-full">
        <div className="mt-2 text-blue-600 flex justify-center items-center space-x-2">
          <span className="text-base font-medium gap-1 flex items-center">
            <FaUser size={16} />
            (9)
          </span>
        </div>
        <button
          onClick={handleSubmit.bind(null, { categoryId })}
          className="mt-4 bg-[#295178] text-white font-semibold text-lg px-5 sm:px-2 sm:text-sm md:text-sm md:px-2 py-1 rounded-lg"
        >
          Find an expert
        </button>
      </div>
    </div>
  );
};

export default InsuranceCard;
