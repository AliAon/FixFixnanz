"use client";
import { useState } from "react";
import Head from "next/head";
import Link from "next/link";

interface Contact {
  id: string;
  createDate: string;
  firstName: string;
  lastName: string;
  leadStatus: "lead" | "marketingqualifiedlead";
  email: string;
  number: string;
}

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: "107579633483",
      createDate: "20-03-2025",
      firstName: "Mischa",
      lastName: "Thomas",
      leadStatus: "lead",
      email: "buero@versmakler-thomas.de",
      number: "1234567890",
    },
    {
      id: "107586678701",
      createDate: "20-03-2025",
      firstName: "Torsten",
      lastName: "Kulling",
      leadStatus: "marketingqualifiedlead",
      email: "info@mkversicherung-gmbh.de",
      number: "1234567890",
    },
    {
      id: "107584146197",
      createDate: "20-03-2025",
      firstName: "Mathias",
      lastName: "Matzeck",
      leadStatus: "lead",
      email: "mathias@f-vm.de",
      number: "1234567890",
    },
    {
      id: "107584139393",
      createDate: "20-03-2025",
      firstName: "Ralf",
      lastName: "Kühne",
      leadStatus: "lead",
      email: "ralfkuehne@le-finanz.net",
      number: "1234567890",
    },
    {
      id: "107570616724",
      createDate: "20-03-2025",
      firstName: "Hendrik",
      lastName: "Kreuder",
      leadStatus: "marketingqualifiedlead",
      email: "hkreuder@global-finanz.de",
      number: "1234567890",
    },
    {
      id: "107568625213",
      createDate: "20-03-2025",
      firstName: "René",
      lastName: "Seidel",
      leadStatus: "lead",
      email: "rseidel@jbvgmbh.de",
      number: "1234567890",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newContact, setNewContact] = useState({
    email: "",
    firstName: "",
    lastName: "",
    number: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewContact({
      ...newContact,
      [name]: value,
    });
  };

  const handleAddContact = () => {
    if (
      newContact.email &&
      newContact.firstName &&
      newContact.lastName &&
      newContact.number
    ) {
      const contact: Contact = {
        id: Math.floor(100000000000 + Math.random() * 9000000000).toString(),
        createDate: new Date()
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
          .replace(/\//g, "-"),
        firstName: newContact.firstName,
        lastName: newContact.lastName,
        leadStatus: "lead",
        email: newContact.email,
        number: newContact.number,
      };

      setContacts([...contacts, contact]);
      setNewContact({
        email: "",
        firstName: "",
        lastName: "",
        number: "",
      });
      setShowModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>HubSpot Contact</title>
        <meta name="description" content="HubSpot Contact Management" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-indigo-900">
            Hubspot Contact
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#002D51] text-white font-medium py-2 px-4 rounded shadow"
          >
            Add Contact
          </button>
        </div>

        <div className="overflow-auto">
          <table className="min-w-full divide-y divide-gray-200 border-b">
            <thead>
              <tr className="border-b-2 border-primary">
                <th className="px-6 py-3 text-left text-base font-bold text-primary">
                  S/L
                </th>
                <th className="px-6 py-3 text-left text-base font-bold text-primary">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-base font-bold text-primary">
                  Create Date
                </th>
                <th className="px-6 py-3 text-left text-base font-bold text-primary">
                  First Name
                </th>
                <th className="px-6 py-3 text-left text-base font-bold text-primary">
                  Last Name
                </th>
                <th className="px-6 py-3 text-left text-base font-bold text-primary">
                  Lead-Status
                </th>
                <th className="px-6 py-3 text-left text-base font-bold text-primary">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-base font-bold text-primary">
                  Phone Number
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contacts.map((contact, index) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-base">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base">
                    {contact.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base">
                    {contact.createDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base">
                    {contact.firstName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base">
                    {contact.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base">
                    <span
                      className={`px-3 py-1 inline-flex text-xs rounded-full font-medium text-white ${
                        contact.leadStatus === "lead"
                          ? "bg-blue-500"
                          : "bg-gray-500"
                      }`}
                    >
                      {contact.leadStatus === "lead"
                        ? "lead"
                        : "marketingqualifiedlead"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base">
                    {contact.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base">
                    {contact.number}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Add Contact Modal */}
      {showModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div
            className="flex items-center justify-center min-h-screen pt-4 px-4 pb-10 text-center sm:block sm:p-0"
            onClick={() => setShowModal(false)}
          >
            <div
              className="fixed  inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div
              onClick={(e) => e.stopPropagation()}
              className="inline-block w-full max-w-lg align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle l"
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="text-xl font-semibold text-indigo-900">
                    Add New Contact
                  </h3>
                  <Link
                    href=""
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <span className="text-2xl">&times;</span>
                  </Link>
                </div>
                <div className="mt-4 space-y-2">
                  <div>
                    <label className="block text-base font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={newContact.email}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={newContact.firstName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={newContact.lastName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="number"
                      value={newContact.number}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 justify-end sm:px-6 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="inline-flex justify-center rounded-md border border-[#6C757D] shadow-sm px-4 py-1 duration-0 bg-[#5c636a] text-base font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-base"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleAddContact}
                  className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-1 bg-[#002D51] text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-base"
                >
                  Save Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
