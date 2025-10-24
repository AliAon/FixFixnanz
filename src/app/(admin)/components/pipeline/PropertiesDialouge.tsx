"use client";
import Link from "next/link";
import React, { useState } from "react";

interface Property {
  id: number;
  pipelineName: string;
  name: string;
  type: string;
}

interface PropertiesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PropertiesModal: React.FC<PropertiesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [properties, setProperties] = useState<Property[]>([]);

  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const [propertyName, setPropertyName] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [selectedPipeline, setSelectedPipeline] = useState("");
  const propertyTypes = ["String", "Number", "Boolean", "Date", "Object"];
  const pipelines = [
    "Agency Pipeline",
    "Sales Pipeline",
    "Marketing Pipeline",
    "Support Pipeline",
  ];

  const handleAddProperty = () => {
    if (propertyName && propertyType && selectedPipeline) {
      const newProperty = {
        id: Date.now(), 
        pipelineName: selectedPipeline,
        name: propertyName,
        type: propertyType,
      };

      setProperties([...properties, newProperty]);

      resetForm();
    }
  };

  const resetForm = () => {
    setPropertyName("");
    setPropertyType("");
    setSelectedPipeline("");
    setShowCreateDialog(false);
  };

  const handleDeleteProperty = (id: number) => {
    if (confirm("Are you sure you want to delete this property?")) {
      setProperties(properties.filter((property) => property.id !== id));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl overflow-hidden">
        {!showCreateDialog ? (
          <>
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-2xl font-semibold text-primary">
                Properties
              </h2>
              <Link
                href=""
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Link>
            </div>

            <div className="p-6">
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-gray-800 text-white px-4 py-2 rounded-md"
                >
                  New property
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 text-left text-md text-primary text-bold">
                        S / L
                      </th>
                      <th className="py-3 px-4 text-left text-md text-primary text-bold">
                        Pipeline name
                      </th>
                      <th className="py-3 px-4 text-left text-md text-primary text-bold">
                        name
                      </th>
                      <th className="py-3 px-4 text-left text-md text-primary text-bold">
                        type
                      </th>
                      <th className="py-3 px-4 text-left text-md text-primary text-bold">
                        action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((property, index) => (
                      <tr
                        key={property.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {index + 1}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {property.pipelineName}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {property.name}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {property.type}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          <div className="flex space-x-3">
                            <button className="text-white w-[55px] bg-blue-500">
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProperty(property.id);
                              }}
                              className="text-white w-[55px] bg-red-500"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {properties.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-8 text-center text-gray-500"
                        >
                          No properties found. Click &#34;New property&#34; to add one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-2xl text-primary font-semibold">
                Create property
              </h3>
              <Link
                href=""
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Link>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-[16px] font-bold text-primary mb-2">
                  Property name
                </label>
                <input
                  type="text"
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter property name"
                />
              </div>

              <div>
                <label className="block text-[16px] font-bold text-primary mb-2">
                  Property type
                </label>
                <div className="relative">
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    <option value="">Choose a type</option>
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[16px] font-bold text-primary mb-2">
                  Pipelines
                </label>
                <div className="relative">
                  <select
                    value={selectedPipeline}
                    onChange={(e) => setSelectedPipeline(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    <option value="">Select pipeline</option>
                    {pipelines.map((pipeline) => (
                      <option key={pipeline} value={pipeline}>
                        {pipeline}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="block text-[16px] font-bold text-primary mb-2">
                  Preview property
                </h4>
                <div className="border-t border-b py-4 mt-1 text-sm text-gray-500">
                  {propertyName && propertyType && selectedPipeline ? (
                    <div>
                      Pipeline: {selectedPipeline}, Name: {propertyName}, Type:{" "}
                      {propertyType}
                    </div>
                  ) : (
                    <div className="text-gray-400 italic">
                      Complete all fields to see preview
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end p-4 border-t">
              <button
                onClick={handleAddProperty}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={!propertyName || !propertyType || !selectedPipeline}
              >
                Add
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PropertiesModal;
