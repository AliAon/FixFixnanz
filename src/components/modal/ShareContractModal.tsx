import React, { useState } from "react";
import { X } from "lucide-react";

interface Expert {
  id: string;
  name: string;
  email: string;
  company: string;
  avatar: string;
}

interface ShareContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckContract: (selectedExperts: string[]) => void;
  contractNumber: string;
}

const ShareContractModal: React.FC<ShareContractModalProps> = ({
  isOpen,
  onClose,
  onCheckContract,
  contractNumber
}) => {
  const [selectedExperts, setSelectedExperts] = useState<string[]>([]);

  // Mock data for financial experts
  const experts: Expert[] = [
    {
      id: "1",
      name: "Nils Zierenberg",
      email: "nils.zierenberg@swisslife-select.de",
      company: "Swiss Life Select",
      avatar: "/images/agent-2.jpg"
    },
    {
      id: "2", 
      name: "khurram",
      email: "rajaziafatofficial@gmail.com",
      company: "Swiss Life Select",
      avatar: "/images/agent-3.jpg"
    }
  ];

  const handleExpertToggle = (expertId: string) => {
    setSelectedExperts(prev => 
      prev.includes(expertId) 
        ? prev.filter(id => id !== expertId)
        : [...prev, expertId]
    );
  };

  const handleCheckContract = () => {
    if (selectedExperts.length === 0) {
      return; // Could show a toast message here
    }
    onCheckContract(selectedExperts);
    onClose();
  };

  const handleClose = () => {
    setSelectedExperts([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 relative">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white hover:text-white transition-all duration-200 group"
            aria-label="Close modal"
          >
            <X size={18} className="group-hover:scale-110 transition-transform duration-200" />
          </button>
          <h2 className="text-xl font-semibold mb-2">
            Have your contract checked directly by FixFinanz
          </h2>
          <p className="text-blue-100 text-sm">
            Contract #{contractNumber}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Share contract with financial expert
          </h3>

          {/* Experts Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">Sl</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">Select</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">Name</th>
                </tr>
              </thead>
              <tbody>
                {experts.map((expert, index) => (
                  <tr key={expert.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-2">
                      <span className="font-medium text-gray-700">#{index + 1}</span>
                    </td>
                    <td className="py-4 px-2">
                      <input
                        type="checkbox"
                        checked={selectedExperts.includes(expert.id)}
                        onChange={() => handleExpertToggle(expert.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                          <img
                            src={expert.avatar}
                            alt={expert.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/images/agent-2.jpg";
                            }}
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{expert.name}</h4>
                          <p className="text-sm text-gray-600">{expert.email}</p>
                          <p className="text-sm text-gray-500">{expert.company}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-md font-medium transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleCheckContract}
            disabled={selectedExperts.length === 0}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              selectedExperts.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            Check contract
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareContractModal; 