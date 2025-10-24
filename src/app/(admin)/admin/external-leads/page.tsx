"use client";
import React, { useState } from "react";
import { FaFacebook } from "react-icons/fa";

interface FacebookAccount {
  id: string;
  name: string;
  status: "Active" | "Inactive";
  campaigns: Campaign[];
}

interface Campaign {
  id: string;
  name: string;
  status: "Active" | "Paused" | "Completed";
  budget: string;
  startDate: string;
  endDate?: string;
}

const ExternalLeadsPage = () => {
  const [accounts] = useState<FacebookAccount[]>([
    {
      id: "act_123456789",
      name: "Business Manager Account 1",
      status: "Active",
      campaigns: [
        {
          id: "camp_123",
          name: "Summer Promotion",
          status: "Active",
          budget: "€500",
          startDate: "2023-06-01",
        },
        {
          id: "camp_124",
          name: "New Product Launch",
          status: "Active",
          budget: "€1,200",
          startDate: "2023-07-15",
        },
      ],
    },
    {
      id: "act_987654321",
      name: "Business Manager Account 2",
      status: "Active",
      campaigns: [
        {
          id: "camp_456",
          name: "Holiday Special",
          status: "Paused",
          budget: "€800",
          startDate: "2023-11-01",
          endDate: "2023-12-25",
        },
      ],
    },
  ]);

  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const handleAccountSelect = (accountId: string) => {
    setSelectedAccount(accountId === selectedAccount ? null : accountId);
  };

  const selectedAccountData = accounts.find(
    (account) => account.id === selectedAccount
  );

  return (
    <div className="w-full px-6 py-8 bg-white">
      <div className="mb-10">
        <button className="bg-[#0866FF] hover:bg-[#0652c7] text-white font-medium py-2 px-4 rounded-md flex items-center">
          <FaFacebook className="mr-2" /> Facebook Connection
        </button>
      </div>

      <div className="flex sm:flex-col xsm:flex-col flex-row gap-8">
        <div className="w-full md:w-2/3">
          <h2 className="text-3xl font-semibold text-primary mb-6">
            All Accounts
          </h2>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {accounts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No Facebook accounts connected. Click the Facebook Connection
                button to get started.
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedAccount === account.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => handleAccountSelect(account.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {account.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          ID: {account.id}
                        </p>
                      </div>
                      <span
                        className={`py-1 px-3 rounded-md text-sm ${
                          account.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {account.status}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      {account.campaigns.length} campaigns
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Campaigns Panel */}
        <div className="w-full h-full md:w-1/3">
          <div className="border border-gray-200 rounded-lg overflow-hidden h-full">
            <div className="bg-[#00528B] text-white p-2">
              <h3 className="text-xl font-semibold">Campaigns</h3>
            </div>

            <div className="p-6">
              {!selectedAccount ? (
                <p className="text-gray-600">
                  Select an account to see more details.
                </p>
              ) : selectedAccountData?.campaigns.length === 0 ? (
                <p className="text-gray-600">
                  No campaigns found for this account.
                </p>
              ) : (
                <div className="space-y-4">
                  {selectedAccountData?.campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0"
                    >
                      <h4 className="font-semibold">{campaign.name}</h4>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                        <div>
                          <span className="text-gray-600">Status:</span>{" "}
                          <span
                            className={`py-0.5 px-2 rounded-md text-xs ${
                              campaign.status === "Active"
                                ? "bg-green-100 text-green-800"
                                : campaign.status === "Paused"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {campaign.status}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Budget:</span>{" "}
                          {campaign.budget}
                        </div>
                        <div>
                          <span className="text-gray-600">Start:</span>{" "}
                          {new Date(campaign.startDate).toLocaleDateString()}
                        </div>
                        {campaign.endDate && (
                          <div>
                            <span className="text-gray-600">End:</span>{" "}
                            {new Date(campaign.endDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExternalLeadsPage;
