// components/OfferTable.tsx
import React, { useState } from "react";
import AddOfferModal from "../components/AddOfferModal";
import { IoAdd } from "react-icons/io5";
import { MdDelete } from "react-icons/md";

interface Offer {
  id: string;
  title: string;
  oneTime: number;
  monthly: number;
  duration: number;
  typeMonthly: boolean;
  typeOneTime: boolean;
  status: "Active" | "Inactive";
}

export default function OfferTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([
    {
      id: "1",
      title: "Digitale-Neukunden für Finanzberater - 6 Monate",
      oneTime: 3000,
      monthly: 9000,
      duration: 6,
      typeMonthly: true,
      typeOneTime: true,
      status: "Active",
    },
    {
      id: "2",
      title: "Digitale-Neukunden für Finanzberater - 3 Monate",
      oneTime: 2000,
      monthly: 4500,
      duration: 3,
      typeMonthly: true,
      typeOneTime: true,
      status: "Active",
    },
  ]);

  const handleDelete = (id: string) => {
    setOffers(offers.filter((offer) => offer.id !== id));
  };

  const handleAddOffer = (newOffer: Omit<Offer, "id">) => {
    const offer: Offer = {
      ...newOffer,
      id: Math.random().toString(36).substr(2, 9),
    };
    setOffers([...offers, offer]);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-semibold text-[#32325D]">
          Offer Management
        </h1>
        <button
          className="px-2 py-2 text-white bg-[#0D6EFD] font-medium rounded-lg flex items-center"
          onClick={() => setIsModalOpen(true)}
        >
          <span className="text-xl mr-2">
            <IoAdd />
          </span>
          Add Offer
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="py-3 text-left text-primary font-bold whitespace-nowrap px-4">
                Title
              </th>
              <th className="py-3 text-left text-primary font-bold whitespace-nowrap px-4">
                One-Time
              </th>
              <th className="py-3 text-left text-primary font-bold whitespace-nowrap px-4">
                Monthly
              </th>
              <th className="py-3 text-left text-primary font-bold whitespace-nowrap px-4">
                Duration
              </th>
              <th className="py-3 text-left text-primary font-bold px-4">
                Type Monthly
              </th>
              <th className="py-3 text-left text-primary font-bold px-4">
                Type Onetime
              </th>
              <th className="py-3 text-left text-primary font-bold whitespace-nowrap px-4">
                Status
              </th>
              <th className="py-3 text-left text-primary font-bold whitespace-nowrap px-4">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {offers.map((offer) => (
              <tr key={offer.id} className="border-b border-gray-200">
                <td className="py-4 px-4 text-gray-900 whitespace-nowrap">
                  {offer.title}
                </td>
                <td className="py-4 px-4 text-gray-900">{offer.oneTime}€</td>
                <td className="py-4 px-4 text-gray-900">{offer.monthly}€</td>
                <td className="py-4 px-4 text-gray-900">
                  {offer.duration} months
                </td>
                <td className="py-4 px-4 items-center">
                  {offer.typeMonthly ? (
                    <span className="px-2 text-xs font-bold py-1 bg-[#0D6EFD] text-white rounded-md">
                      Yes
                    </span>
                  ) : (
                    <span className="px-2 text-xs font-bold py-1 bg-gray-300 text-gray-700 rounded-md">
                      No
                    </span>
                  )}
                </td>
                <td className="py-4 px-4">
                  {offer.typeOneTime ? (
                    <span className="px-1 font-bold tex-xs py-1 bg-[#0D6EFD] text-white rounded-md">
                      Yes
                    </span>
                  ) : (
                    <span className="px-1 font-bold tex-xs py-1 bg-gray-300 text-gray-700 rounded-md">
                      No
                    </span>
                  )}
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`px-1 font-bold text-xs py-1 rounded-md ${
                      offer.status === "Active"
                        ? "bg-[#198754] text-white"
                        : "bg-gray-300 text-gray-700"
                    }`}
                  >
                    {offer.status}
                  </span>
                </td>
                <td className="py-4 px-4 flex flex-wrap gap-2 items-start">
                  <button className="px-3 py-1 bg-[#0D6EFD] text-white rounded-md">
                    Edit
                  </button>
                  <button
                    className="px-2 py-1 bg-[#DC3545] text-white rounded-md flex items-center"
                    onClick={() => handleDelete(offer.id)}
                  >
                    <span className="mr-1">
                      <MdDelete />
                    </span>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddOfferModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddOffer}
      />
    </div>
  );
}
