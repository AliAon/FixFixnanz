// File: app/components/AgentOverviewModal.tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { TiArrowSortedDown } from "react-icons/ti";
import AddToPipelineModal from "./Advisor/AddToPipelineMode";
import EditContactModal from "./Advisor/EditContactModel";
import CreateOfferModal from "./Advisor/CreateOfferModel";
import { CashFlowChart } from "./Advisor/Chart";
import AddNoteModal from "./Advisor/AddNoteModel";

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  number?: string;
  profileImage: string;
  active: boolean;
  email: string;
  avVertag: string;
  roleName: string;
  contractStart?: string;
  contractEnd?: string;
}

// Payment data interface
interface Payment {
  date: string;
  invoiceNumber: string;
  total: number;
  status: string;
  service: number;
  paid: number;
  vat: number;
  pending: number;
}

// Payment history interface
interface PaymentHistory {
  offer: string;
  invoice: string;
  transactionId: string;
  date: string;
  note: string;
  amount: string;
  status: string;
}

// Grade interface
interface Grade {
  createdAt: string;
  grade: string;
}

interface AgentOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

const AgentOverviewModal = ({
  isOpen,
  onClose,
  customer,
}: AgentOverviewModalProps) => {
  const [activeTab, setActiveTab] = useState<
    "payments" | "paymentHistory" | "grade" | "graph"
  >("payments");

  const [showAddToPipeline, setShowAddToPipeline] = useState(false);
  const [showEditContact, setShowEditContact] = useState(false);
  const [showCreateOffer, setShowCreateOffer] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);

  if (!isOpen || !customer) return null;

  // Sample data for the payments tab
  const payments: Payment[] = [
    {
      date: "01/23/2025",
      invoiceNumber: "AB2014260",
      total: 6000.0,
      status: "Pending",
      service: 0.0,
      paid: 0,
      vat: 1140.0,
      pending: 7140,
    },
  ];

  // Sample data for the payment history tab
  const paymentHistory: PaymentHistory[] = [
    {
      offer: "Premium Package",
      invoice: "INV-20250123",
      transactionId: "TRX-789012",
      date: "01/23/2025",
      note: "Initial consultation",
      amount: "€7,140.00",
      status: "Pending",
    },
  ];

  // Sample data for the grade tab
  const grades: Grade[] = [
    {
      createdAt: "01/15/2025",
      grade: "A",
    },
  ];

  const handleAddToPipeline = () => {
    setShowAddToPipeline(true);
  };

  const handleEditContact = () => {
    setShowEditContact(true);
  };

  const handleCreateOffer = () => {
    setShowCreateOffer(true);
  };

  const renderPaymentsTab = () => {
    return (
      <>
        <div className="flex justify-end mb-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
            onClick={handleCreateOffer}
          >
            <span className="mr-2">+</span>
            Add offer
          </button>
        </div>

        {/* Payments Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-primary">
                <th className="py-2 px-4 border-b border-r text-left">Date</th>
                <th className="py-2 px-4 border-b border-r text-left">
                  I.Number
                </th>
                <th className="py-2 px-4 border-b border-r text-left">Total</th>
                <th className="py-2 px-4 border-b border-r text-left">
                  status
                </th>
                <th className="py-2 px-4 border-b border-r text-left">
                  service
                </th>
                <th className="py-2 px-4 border-b border-r text-left">Paid</th>
                <th className="py-2 px-4 border-b border-r text-left">Vat</th>
                <th className="py-2 px-4 border-b border-r text-left">
                  Pending
                </th>
                <th className="py-2 px-4 border-b text-left">Options</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b border-r">
                    {payment.date}
                  </td>
                  <td className="py-2 px-4 border-b border-r">
                    {payment.invoiceNumber}
                  </td>
                  <td className="py-2 px-4 border-b border-r">
                    {payment.total.toFixed(2)}
                  </td>
                  <td className="py-2 px-4 border-b border-r">
                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                      {payment.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b border-r">
                    {payment.service.toFixed(2)}
                  </td>
                  <td className="py-2 px-4 border-b border-r">
                    {payment.paid}
                  </td>
                  <td className="py-2 px-4 border-b border-r">
                    {payment.vat.toFixed(2)}
                  </td>
                  <td className="py-2 px-4 border-b border-r">
                    {payment.pending}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <div className="relative">
                      <button className="bg-gray-600 flex items-center gap-2 text-white px-4 py-1 rounded">
                        Actions <TiArrowSortedDown />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  // Render the payment history tab content
  const renderPaymentHistoryTab = () => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="text-left border-b border-gray-200">
              <th className="py-3 px-4 font-semibold">Offer</th>
              <th className="py-3 px-4 font-semibold">Invoice</th>
              <th className="py-3 px-4 font-semibold">Transaction ID</th>
              <th className="py-3 px-4 font-semibold">Date</th>
              <th className="py-3 px-4 font-semibold">Note</th>
              <th className="py-3 px-4 font-semibold">Amount</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {paymentHistory.map((item, index) => (
              <tr
                key={index}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="py-3 px-4">{item.offer}</td>
                <td className="py-3 px-4">{item.invoice}</td>
                <td className="py-3 px-4">{item.transactionId}</td>
                <td className="py-3 px-4">{item.date}</td>
                <td className="py-3 px-4">{item.note}</td>
                <td className="py-3 px-4">{item.amount}</td>
                <td className="py-3 px-4">
                  <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                    {item.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button className="bg-gray-600 text-white px-4 py-1 rounded">
                    Action
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  // Render the grade tab content
  const handleAddNote = (noteText: string, gradeValue: string) => {
    // Here you would typically update your grades state or call an API
    // For now, we'll just add it to the grades array
    const newGrade = {
      createdAt: new Date().toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      }),
      grade: gradeValue,
    };

    // This is just for demonstration - in a real app you'd use state or context
    grades.push(newGrade);

    // Force a re-render if using this approach
    setActiveTab("grade");
  };
  const renderGradeTab = () => {
    return (
      <>
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowAddNote(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Add note
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-left">Created At</th>
                <th className="py-2 px-4 border-b text-left">grade</th>
                <th className="py-2 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((grade, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 border-b">{grade.createdAt}</td>
                  <td className="py-2 px-4 border-b">{grade.grade}</td>
                  <td className="py-2 px-4 border-b">
                    <button className="bg-gray-600 text-white px-4 py-1 rounded">
                      Actions
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  // Render the graph tab content
  const renderGraphTab = () => {
    return (
      <div>
        <h2 className="text-3xl text-gray-700 mb-4">cash flow</h2>
        <div className="flex mb-4">
          <div className="mr-3">
            <input
              type="text"
              placeholder="mm/dd/yyyy"
              className="border border-gray-300 rounded p-2"
            />
          </div>
          <div className="mr-3">
            <input
              type="text"
              placeholder="mm/dd/yyyy"
              className="border border-gray-300 rounded p-2"
            />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Filter data
          </button>
        </div>

        <div className="bg-white p-4 rounded">
          <CashFlowChart />
        </div>
      </div>
    );
  };

  // Render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "payments":
        return renderPaymentsTab();
      case "paymentHistory":
        return renderPaymentHistoryTab();
      case "grade":
        return renderGradeTab();
      case "graph":
        return renderGraphTab();
      default:
        return null;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-700">
              Agency - overview
            </h2>
            <Link
              href=""
              onClick={(e) => {
                e.preventDefault();
                onClose();
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Link>
          </div>

          <div className="p-4 overflow-y-auto">
            {/* Agent Information Section */}
            <div className="bg-[#1477BC] p-6 rounded-md text-white flex items-start mb-6">
              <div className="relative mr-6">
                <div className="h-36 w-36 rounded-full overflow-hidden bg-white">
                  <Image
                    src={customer.profileImage}
                    alt={`${customer.firstName} ${customer.lastName}`}
                    width={144}
                    height={144}
                    className="object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/profile-placeholder.jpg";
                    }}
                  />
                </div>
              </div>

              <div className="flex-1 flex flex-wrap">
                {/* Financial Summary */}
                <div className="w-full flex justify-between mb-8">
                  <div className="bg-white w-full text-gray-800 p-4 rounded-md mr-4">
                    <h3 className="uppercase text-sm font-bold mb-2">
                      TOTAL SALES
                    </h3>
                    <p className="text-2xl font-semibold text-[#6C757D]">
                      7,140.00 €
                    </p>
                  </div>
                  <div className="bg-white w-full text-gray-800 p-4 rounded-md mr-4">
                    <h3 className="uppercase text-sm font-bold mb-2">PAID</h3>
                    <p className="text-2xl font-semibold text-green-600">
                      0.00 €
                    </p>
                  </div>
                  <div className="bg-white w-full text-gray-800 p-4 rounded-md">
                    <h3 className="uppercase text-sm font-bold mb-2">
                      OUTSTANDING AMOUNTS
                    </h3>
                    <p className="text-2xl font-semibold text-red-600">
                      7,140.00 €
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start sm:flex-col xsm:flex-col gap-12">
              <div className=" ">
                <div className="">
                  <div className="mb-4 flex">
                    <span className="font-medium w-36">First name</span>
                    <span className="text-gray-700">
                      : {customer.firstName}
                    </span>
                  </div>
                  <div className="mb-4 flex">
                    <span className="font-medium w-36">Surname</span>
                    <span className="text-gray-700">: Honest</span>
                  </div>
                  <div className="mb-4 flex">
                    <span className="font-medium w-36">Profile photo</span>
                    <span className="text-blue-500">: Active</span>
                  </div>
                  <div className="mb-4 flex">
                    <span className="font-medium w-36">email</span>
                    <span className="text-gray-700">: {customer.email}</span>
                  </div>
                </div>
                <div>
                  <div className="mb-4 flex">
                    <span className="font-medium w-36">Telephone number</span>
                    <span className="text-gray-700">
                      {customer.number || ""}
                    </span>
                  </div>
                  <div className="mb-4 flex">
                    <span className="font-medium w-36">Email Verify</span>
                    <span className="text-blue-500">: Verify</span>
                  </div>
                </div>
                <div className="mb-6 flex">
                  <button
                    className="bg-[#FFC107] border-none text-sm px-2 text-primary py-2 rounded-md mr-3 flex items-center"
                    onClick={handleAddToPipeline}
                  >
                    <span className="mr-2">+</span>
                    Add to pipeline
                  </button>
                  <button
                    className="bg-[#FFC107] border-none text-sm px-2 text-primary py-2 rounded-md flex items-center"
                    onClick={handleEditContact}
                  >
                    <span className="mr-2">✎</span>
                    To edit
                  </button>
                </div>
              </div>
              <div className="w-full max-w-2xl">
                <div className="mb-4 border-b">
                  <div className="flex">
                    <Link
                      href=""
                      className={`px-4 py-2 ${
                        activeTab === "payments"
                          ? "bg-gray-800 text-white"
                          : "text-gray-700"
                      } rounded-t-md`}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab("payments");
                      }}
                    >
                      payments
                    </Link>
                    <Link
                      href=""
                      className={`px-4 py-2 ${
                        activeTab === "paymentHistory"
                          ? "bg-gray-800 text-white"
                          : "text-gray-700"
                      } rounded-t-md`}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab("paymentHistory");
                      }}
                    >
                      Payment history
                    </Link>
                    <Link
                      href=""
                      className={`px-4 py-2 ${
                        activeTab === "grade"
                          ? "bg-gray-800 text-white"
                          : "text-gray-700"
                      } rounded-t-md`}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab("grade");
                      }}
                    >
                      grade
                    </Link>
                    <Link
                      href=""
                      className={`px-4 py-2 ${
                        activeTab === "graph"
                          ? "bg-gray-800 text-white"
                          : "text-gray-700"
                      } rounded-t-md`}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab("graph");
                      }}
                    >
                      graph
                    </Link>
                  </div>
                </div>
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add to Pipeline Modal */}
      <AddToPipelineModal
        isOpen={showAddToPipeline}
        onClose={() => setShowAddToPipeline(false)}
        customer={customer}
      />

      {/* Edit Contact Modal */}
      <EditContactModal
        isOpen={showEditContact}
        onClose={() => setShowEditContact(false)}
        customer={customer}
      />

      {/* Create Offer Modal */}
      <CreateOfferModal
        isOpen={showCreateOffer}
        onClose={() => setShowCreateOffer(false)}
      />
      <AddNoteModal
        isOpen={showAddNote}
        onClose={() => setShowAddNote(false)}
        onSave={handleAddNote}
      />
    </>
  );
};

export default AgentOverviewModal;
