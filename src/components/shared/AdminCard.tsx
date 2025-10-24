import React, { ReactNode } from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";

interface AdminCardProps {
  title: string;
  count: number;
  additionalCount?: string;
  icon: ReactNode;
  description: string;
}

const AdminCard: React.FC<AdminCardProps> = ({
  title,
  count,
  additionalCount,
  icon,
  description,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-5 py-2 flex justify-between items-center">
        <div>
          <h2 className="text-[#212529] text-[16px] pt-1 font-semibold uppercase">
            {title}
          </h2>
          <p className="text-[28px] font-semibold text-[#6c757d] ">
            {title === "BEWERTUNGEN" ? (
              <>
                {count}{" "}
                {additionalCount && (
                  <span className="text-[#6c757d] text-[28px]">
                    {additionalCount}
                  </span>
                )}
              </>
            ) : (
              count
            )}
          </p>

        </div>
        <div className="bg-base w-[50px] h-[50px] rounded-full flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="bg-base text-white p-2 flex items-center justify-center">
        <IoMdInformationCircleOutline className="text-[16px] mr-2" />
        <p>Die Anzahl deiner {description}</p>
      </div>
    </div>
  );
};

export default AdminCard;
