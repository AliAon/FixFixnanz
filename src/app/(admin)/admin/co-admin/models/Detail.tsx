import Link from "next/link";
import React, { useState } from "react";
import { LiaTimesSolid } from "react-icons/lia";

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserDetails | null;
}

interface UserDetails {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  state?: string;
  city?: string;
  company?: string;
  commissionSettler?: number;
  commissionCloser?: number;
  totalVacation?: number;
  remainingVacation?: number;
  vacationYear?: number;
  vacationsTaken?: VacationEntry[];
}

interface VacationEntry {
  type: string;
  count: number;
  date: string;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  isOpen,
  onClose,
  userData,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [settlerCommission, setSettlerCommission] = useState(
    userData?.commissionSettler || 5
  );
  const [closerCommission, setCloserCommission] = useState(
    userData?.commissionCloser || 0
  );
  const [totalVacation, setTotalVacation] = useState(
    userData?.totalVacation || 1
  );
  const [vacationYear, setVacationYear] = useState(
    userData?.vacationYear || 2025
  );
  const [newVacationDays, setNewVacationDays] = useState("");

  // Mocked vacation data if not provided
  const vacationsTaken = userData?.vacationsTaken || [
    { type: "Days", count: 10, date: "06.02.2025" },
    { type: "Days", count: 1, date: "06.02.2025" },
    { type: "Days", count: 1, date: "06.02.2025" },
  ];

  const totalUsedVacation = vacationsTaken.reduce(
    (total, v) => total + v.count,
    0
  );
  const remainingVacation =
    userData?.remainingVacation !== undefined
      ? userData.remainingVacation
      : -11; // Default value from the screenshot

  if (!isOpen || !userData) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSaveCommission = () => {
    // Here you would implement the logic to save the commission data
    console.log("Saving commission data:", {
      settlerCommission,
      closerCommission,
    });
  };

  const handleSubmitVacation = () => {
    // Here you would implement the logic to submit vacation data
    console.log("Submitting vacation data:", { totalVacation, vacationYear });
  };

  const handleSubmitNewVacation = () => {
    // Here you would implement the logic to add new vacation
    console.log("Adding new vacation:", { days: newVacationDays });
    setNewVacationDays("");
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl my-8">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-800">
            Hubspot User Details
          </h2>
          <Link
            href=""
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <LiaTimesSolid size={24} />
          </Link>
        </div>

        {/* Main content */}
        <div className="flex sm:flex-col xsm:flex-col overflow-x-auto bg-[#ebebeb]">
          {/* Left Side - User Profile */}
          <div className="w-full max-w-xs m-4 rounded-md shadow-lg p-6 bg-gray-50">
            <div className="flex flex-col items-center mb-6">
              <div className="w-40 h-40 bg-gray-100 rounded-full overflow-hidden mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/agent-2.jpg"
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://via.placeholder.com/150?text=User";
                  }}
                />
              </div>
              <h3 className="text-xl font-semibold text-center">Co-Admin</h3>
              <h4 className="text-lg font-medium text-gray-700 text-center mb-6">
                {userData.firstName} {userData.lastName}
              </h4>

              <div className="w-full space-y-4">
                <div>
                  <span className="text-gray-500">Email: </span>
                  <span className="text-gray-700">{userData.email}</span>
                </div>
                <div>
                  <span className="text-gray-500">Phone: </span>
                  <span className="text-gray-700">{userData.phone || ""}</span>
                </div>
                <div>
                  <span className="text-gray-500">Address: </span>
                  <span className="text-gray-700">
                    {userData.address || ""}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">State: </span>
                  <span className="text-gray-700">{userData.state || ""}</span>
                </div>
                <div>
                  <span className="text-gray-500">City: </span>
                  <span className="text-gray-700">{userData.city || ""}</span>
                </div>
                <div>
                  <span className="text-gray-500">Company: </span>
                  <span className="text-gray-700">
                    {userData.company || ""}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Details Tabs */}
          <div className="w-full m-4 rounded-md p-0">
            {/* Tabs */}
            <div className="flex border-b border-gray-400 pb-3">
              <button
                className={`px-5 py-2 text-sm font-medium rounded-none duration-0 ${
                  activeTab === "overview"
                    ? "bg-[#112A73] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("overview")}
              >
                Überblick
              </button>
              <button
                className={`px-5 py-2 text-sm font-medium rounded-none duration-0 ${
                  activeTab === "commission"
                    ? "bg-[#112A73] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("commission")}
              >
                Commission
              </button>
              <button
                className={`px-5 py-2 text-sm font-medium rounded-none duration-0 ${
                  activeTab === "vacation"
                    ? "bg-[#112A73] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("vacation")}
              >
                Vacation
              </button>
            </div>

            {/* Tab Content */}
            <div className="py-6">
              {activeTab === "overview" && (
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <h3 className="text-lg font-medium mb-4">User Info</h3>

                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-500">Email: </span>
                      <span className="text-gray-700">{userData.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Phone: </span>
                      <span className="text-gray-700">
                        {userData.phone || ""}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Address: </span>
                      <span className="text-gray-700">
                        {userData.address || ""}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">State: </span>
                      <span className="text-gray-700">
                        {userData.state || ""}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">City: </span>
                      <span className="text-gray-700">
                        {userData.city || ""}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Company: </span>
                      <span className="text-gray-700">
                        {userData.company || ""}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "commission" && (
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <h3 className="text-md font-medium mb-6">User Commission</h3>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-base text-primary  mb-3">
                        Commission for Settler
                      </h4>
                      <div className="flex items-center">
                        <input
                          type="number"
                          className="w-full max-w-sm border border-gray-300 rounded p-2 mr-2"
                          value={settlerCommission}
                          onChange={(e) =>
                            setSettlerCommission(Number(e.target.value))
                          }
                        />
                        <span className="text-lg">%</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-base text-primary mb-3">
                        Commission for Closer
                      </h4>
                      <div className="flex items-center">
                        <input
                          type="number"
                          className="w-full max-w-sm border border-gray-300 rounded p-2 mr-2"
                          value={closerCommission}
                          onChange={(e) =>
                            setCloserCommission(Number(e.target.value))
                          }
                        />
                        <span className="text-lg">%</span>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded"
                        onClick={handleSaveCommission}
                      >
                        Speichern
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "vacation" && (
                <div className="space-y-6">
                  {/* Vacation Top Section */}
                  <div className="bg-white p-4 rounded-xl shadow-lg">
                    <h3 className="text-md font-medium mb-6">User Vacation</h3>

                    <div className="mb-6">
                      <div className="flex flex-wrap gap-6 mb-4">
                        <div className="flex-1 min-w-[200px]">
                          <h4 className="text-base text-primary mb-3">
                            Total Vacation
                          </h4>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded p-2"
                            value={totalVacation}
                            onChange={(e) =>
                              setTotalVacation(Number(e.target.value))
                            }
                          />
                        </div>

                        <div className="flex-1 min-w-[200px]">
                          <h4 className="text-base text-primary mb-3">
                            Vacation Year
                          </h4>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded p-2"
                            value={vacationYear}
                            onChange={(e) =>
                              setVacationYear(Number(e.target.value))
                            }
                          />
                        </div>

                        <div className="flex items-end">
                          <button
                            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded"
                            onClick={handleSubmitVacation}
                          >
                            Submit
                          </button>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-base text-primary">
                          Remaining Vacation:{" "}
                          <span className="font-bold">
                            {remainingVacation} Days
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Vacation Taken Section */}
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-base text-primary mb-6">
                      User Vacation Taken
                    </h3>

                    <div className="flex items-center gap-4 mb-6">
                      <input
                        type="number"
                        className="flex-1 border w-full max-w-[200px] border-gray-300 rounded p-2"
                        placeholder="Enter vacation days"
                        value={newVacationDays}
                        onChange={(e) => setNewVacationDays(e.target.value)}
                      />
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded"
                        onClick={handleSubmitNewVacation}
                      >
                        Submit
                      </button>
                    </div>

                    {/* Vacation Table */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-b border-gray-300">
                        <thead>
                          <tr className="bg-white border-b-2 border-primary">
                            <th className="text-left py-3 px-4 font-bold">
                              Vacation taken
                            </th>
                            <th className="text-left py-3 px-4 font-bold">
                              Count
                            </th>
                            <th className="text-left py-3 px-4 font-bold">
                              Vacation Taken Date
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {vacationsTaken.map((vacation, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-200"
                            >
                              <td className="py-3 px-4">{vacation.type}</td>
                              <td className="py-3 px-4">{vacation.count}</td>
                              <td className="py-3 px-4">{vacation.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-lg">
                        Total used vacation:{" "}
                        <span className="font-bold">{totalUsedVacation}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
