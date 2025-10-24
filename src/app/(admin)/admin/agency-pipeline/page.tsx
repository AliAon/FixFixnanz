"use client";
import { useState, useEffect } from "react";
import { FaTools, FaUserFriends } from "react-icons/fa";
import { IoIosAdd, IoMdArrowDropdown } from "react-icons/io";
import Link from "next/link";
import { PiExportBold } from "react-icons/pi";
import PipelineModal from "../../components/pipeline/ManagePiplelineDialouge";
import NewDealModal from "../../components/pipeline/NewDealModel";
import ImportContactModal from "../../components/pipeline/ImportContactModel";
import AgencyMobileHeader from "../../components/pipeline/AgencyMobileHeader";
import { BsQuestionCircleFill } from "react-icons/bs";
import Image from "next/image";
import { IoCall } from "react-icons/io5";
import StrategyPreparationModal from "../../components/pipeline/StrategyPreprationModel";
import PhoneDialerModal from "../../components/pipeline/PhoneDialerModal";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  email: string;
  stage: string;
  leadSource: string;
  status: string;
  createdAt: string;
  profileImg?: string;
}

export default function AgencyPipelinePage() {
  const [contacts] = useState<Contact[]>([
    {
      id: 1,
      firstName: "saiful",
      lastName: "test",
      company: "test",
      phone: "63452734567",
      email: "saifulsaisd4@gmail.com",
      stage: "Standard",
      leadSource: "Added manually",
      status: "",
      createdAt: "November 18, 2024 - 9:57 a.m.",
      profileImg: "/images/agent-2.jpg",
    },
    {
      id: 2,
      firstName: "martin",
      lastName: "Zenner",
      company: "test",
      phone: "73628761873",
      email: "contact @ digital-new customers",
      stage: "Standard",
      leadSource: "Added manually",
      status: "",
      createdAt: "06.12.2024 - 14:27",
      profileImg: "/images/agent-2.jpg",
    },
  ]);
  const { pipelines } = useSelector((state: RootState) => state.pipeline);
  const { stages } = useSelector((state: RootState) => state.stage);
  const [isPipelineModalOpen, setIsPipelineModalOpen] = useState(false);
  const [isNewDealModalOpen, setIsNewDealModalOpen] = useState(false);
  const [isImportContactModalOpen, setIsImportContactModalOpen] =
    useState(false);
  const [isStrategyPreparationModalOpen, setIsStrategyPreparationModalOpen] =
    useState(false);
  const [isPhoneDialerModalOpen, setIsPhoneDialerModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<
    | {
        name?: string;
        phone?: string;
        company?: string;
        email?: string;
      }
    | undefined
  >(undefined);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobileView(window.innerWidth < 999);
    };

    checkIsMobile();

    window.addEventListener("resize", checkIsMobile);

    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  const handleCallClick = () => {
    setSelectedContact(undefined);
    setIsPhoneDialerModalOpen(true);
  };

  const handleContactCallClick = (contact: Contact) => {
    setSelectedContact({
      name: `${contact.firstName} ${contact.lastName}`,
      phone: contact.phone,
      company: contact.company,
      email: contact.email,
    });
    setIsPhoneDialerModalOpen(true);
  };

  return (
    <div className="bg-gray-100">
      {isMobileView ? (
        <AgencyMobileHeader
          onManagePipelineClick={() => setIsPipelineModalOpen(true)}
          onStrategyPreparationClick={() =>
            setIsStrategyPreparationModalOpen(true)
          }
          onNewDealClick={() => setIsNewDealModalOpen(true)}
          onImportContactClick={() => setIsImportContactModalOpen(true)}
          contactCount={contacts.length}
        />
      ) : (
        <header className="bg-base text-white p-4">
          <div className="">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <Link
                  href=""
                  onClick={(e) => {
                    e.preventDefault();
                    setIsPipelineModalOpen(true);
                  }}
                  className="flex items-center bg-[#FFC107] justify-center hover:bg-[#FFCA2C] text-black font-bold py-2 px-4 rounded"
                >
                  <span className="mr-2">
                    <FaTools />
                  </span>
                  <div>
                    <span className="block font-normal text-center ">
                      Manage Pipeline
                    </span>
                  </div>
                </Link>

                <div className="flex items-center cursor-pointer">
                  <span className="mr-2 font-semibold">All Contacts</span>
                  <span className="bg-yellow-400 text-black rounded-full px-2 py-0.5 text-xs">
                    {contacts.length}
                  </span>
                </div>
                <div className="flex items-center cursor-pointer">
                  <span className="mr-2 font-semibold">Pipelines</span>
                  <IoMdArrowDropdown />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Link
                  href=""
                  className="flex items-center font-semibold"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsNewDealModalOpen(true);
                  }}
                >
                  <IoIosAdd size={28} className="mr-1" />
                  <span>New Deal</span>
                </Link>

                <Link
                  href=""
                  onClick={(e) => {
                    e.preventDefault();
                    setIsImportContactModalOpen(true);
                  }}
                  className="flex items-center font-semibold"
                >
                  <PiExportBold size={24} className="mr-2" />
                  <span>Import Contact</span>
                </Link>
                <Link
                  href=""
                  className="flex items-center font-semibold"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsStrategyPreparationModalOpen(true);
                  }}
                >
                  <BsQuestionCircleFill size={20} className="mr-2" />
                  <span>Strategy preparation</span>
                </Link>
                <Link
                  href="/admin/co-admin-contact"
                  className="flex items-center bg-white w-[80px] p-2 rounded-md font-semibold"
                >
                  <Image
                    src="/images/icons/hubspot.png"
                    alt="hubspot"
                    width={80}
                    height={80}
                  />
                </Link>
                <Link
                  href=""
                  onClick={handleCallClick}
                  className="flex items-center bg-[#198754] p-2 rounded-md font-semibold text-white"
                >
                  <IoCall size={16} className="mr-1" /> Call
                </Link>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Suchen..."
                    className="bg-white text-gray-800 rounded-md py-2 px-4 w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="my-6 px-4 ">
        <div className="bg-white rounded-lg shadow-sm p-4 overflow-x-auto  w-full">
          <table className="min-w-full divide-y divide-gray-200 border-b border-gray-400 ">
            <thead>
              <tr>
                <th className="py-3 px-2 text-left">#</th>
                <th className="py-3 px-2 text-left font-bold text-[12px] text-primary">
                  Profiles
                </th>
                <th className="py-3 px-2 text-left font-bold text-[12px] text-primary">
                  First Name
                </th>
                <th className="py-3 px-2 text-left font-bold text-[12px] text-primary">
                  SurName
                </th>
                <th className="py-3 px-2 text-left font-bold text-[12px] text-primary">
                  Company
                </th>
                <th className="py-3 px-2 text-left font-bold text-[12px] text-primary">
                  Phone
                </th>
                <th className="py-3 px-2 text-left font-bold text-[12px] text-primary">
                  E-Mail
                </th>
                <th className="py-3 px-2 text-left font-bold text-[12px] text-primary">
                  Stage
                </th>
                <th className="py-3 px-2 text-left font-bold text-[12px] text-primary">
                  Last activity
                </th>
                <th className="py-3 px-2 text-left font-bold text-[12px] text-primary">
                  Lead - origin
                </th>
                <th className="py-3 px-2 text-left font-bold text-[12px] text-primary">
                  Status
                </th>
                <th className="py-3 px-2 text-left font-bold text-[12px] text-primary">
                  Created:
                </th>
                <th className="py-3 px-2 text-left font-bold text-[12px] text-primary">
                  Lead status
                </th>
                <th className="py-3 px-2 text-left font-bold text-[12px] text-primary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 border-b border-gray-300">
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-16 text-center">
                    <h2 className="text-2xl font-semibold text-primary mb-2">
                      Noch keine Kundenanfragen
                    </h2>
                    <p className="text-gray-600 text-xs mb-4">
                      You currently have no new customer inquiries.
                    </p>
                    <button className="bg-[#ffc107] hover:bg-[#ffca2c] border-none text-black font-bold py-3 px-6 rounded-md flex items-center mx-auto">
                      <FaUserFriends className="mr-2" />
                      <span>Neue Kunden erhalten</span>
                    </button>
                  </td>
                </tr>
              ) : (
                contacts.map((contact, index) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="py-4 px-2 text-xs">
                      {index === 0 ? "1" : "2nd"}
                    </td>
                    <td className="py-4 px-2">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                        {contact.profileImg ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={contact.profileImg}
                            alt={`${contact.firstName} ${contact.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            {contact.firstName.charAt(0)}
                            {contact.lastName.charAt(0)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-2 text-xs">{contact.firstName}</td>
                    <td className="py-4 px-2 text-xs">{contact.lastName}</td>
                    <td className="py-4 px-2 text-xs">{contact.company}</td>
                    <td className="py-4 px-2 text-xs">{contact.phone}</td>
                    <td className="py-4 px-2 text-xs">{contact.email}</td>
                    <td className="py-4 px-2 text-xs">
                      <span className="bg-[#ffc107] text-black px-3 py-1 rounded-full">
                        {contact.stage}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-xs">{contact.leadSource}</td>
                    <td className="py-4 px-2 text-xs">{contact.status}</td>
                    <td className="py-4 px-2 text-xs">{contact.createdAt}</td>
                    <td className="py-4 px-2 text-xs"></td>
                    <td className="py-4 px-2 text-xs">
                      <button
                        onClick={() => handleContactCallClick(contact)}
                        className="bg-green-500 text-white p-1 rounded-full"
                        title="Call this contact"
                      >
                        <IoCall size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div>
            <div className="mt-4 flex justify-between items-center">
              <div className="flex items-center">
                <span className="mr-2">Show</span>
                <select className="border rounded p-1">
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <span className="ml-2">Entries</span>
              </div>

              <div className="flex items-center">
                <button className="px-4 py-2 border rounded mr-1 text-primary bg-gray-100">
                  Previous
                </button>
                <button className="px-4 py-2 border rounded mr-1 bg-[#002b4d] text-white">
                  1
                </button>
                <button className="px-4 py-2 border rounded ml-1 text-primary bg-gray-100">
                  Next
                </button>
              </div>

              <div>
                <span>Show 1 to 2 of 2 entries</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PipelineModal
        isOpen={isPipelineModalOpen}
        onClose={() => setIsPipelineModalOpen(false)}
        setIsCreatingPipeline={() => {}}
      />

      <NewDealModal
        isOpen={isNewDealModalOpen}
        onClose={() => setIsNewDealModalOpen(false)}
      />

      <ImportContactModal
        isOpen={isImportContactModalOpen}
        onClose={() => setIsImportContactModalOpen(false)}
        pipelines={pipelines.map((p) => ({
          id: p.id.toString(),
          name: p.name,
        }))}
        stages={stages}
      />

      <StrategyPreparationModal
        isOpen={isStrategyPreparationModalOpen}
        onClose={() => setIsStrategyPreparationModalOpen(false)}
      />

      <PhoneDialerModal
        isOpen={isPhoneDialerModalOpen}
        onClose={() => setIsPhoneDialerModalOpen(false)}
        contactData={selectedContact}
      />
    </div>
  );
}
