import React from "react";
import Button from "../shared/Button";

const ReCard: React.FC = () => {
  const handleSubmit = () => {
    window.location.href = `/login`;
  };
  return (
    <div className="px-[20px] pt-[20px] sm:hidden xsm:hidden max-w-[1330px] mx-auto">
      <div
        className="relative w-full h-[350px] rounded-2xl flex items-center justify-center bg-cover bg-center z-40"
        style={{ backgroundImage: "url('/images/background-1.jpg')" }}
      >
        <div className="absolute inset-0" />
        <div className="relative z-10 flex justify-between items-center w-full px-[50px]">
          <div className="max-w-2xl text-left">
            <h2 className="text-2xl font-semibold text-secondary font-roboto mb-4">
              Register now as a financial expert and receive new qualified
              customer inquiries
            </h2>
            <Button
              onClick={handleSubmit}
              text="Now for free register"
              className="py-2 px-8"
            />
          </div>
          <div className="w-1/2 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/bg-upper.png"
              alt="Financial Expert"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReCard;
