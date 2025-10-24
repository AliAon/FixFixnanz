// components/AddOfferModal.tsx
import React, { useState } from 'react';

interface AddOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (offer: Omit<Offer, 'id'>) => void;
}

interface Offer {
  id: string;
  title: string;
  oneTime: number;
  monthly: number;
  duration: number;
  typeMonthly: boolean;
  typeOneTime: boolean;
  status: 'Active' | 'Inactive';
}

export default function AddOfferModal({ isOpen, onClose, onSave }: AddOfferModalProps) {
  const [formData, setFormData] = useState<Omit<Offer, 'id'>>({
    title: '',
    oneTime: 0,
    monthly: 0,
    duration: 1,
    typeMonthly: false,
    typeOneTime: false,
    status: 'Active',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: checked });
    } else if (type === 'number') {
      setFormData({ ...formData, [name]: Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add New Offer</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (months)
              </label>
              <input
                type="number"
                name="duration"
                min={1}
                value={formData.duration}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                One-Time Price (€)
              </label>
              <input
                type="number"
                name="oneTime"
                value={formData.oneTime}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Price (€)
              </label>
              <input
                type="number"
                name="monthly"
                value={formData.monthly}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="typeMonthly"
                checked={formData.typeMonthly}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600"
              />
              <label className="ml-2 text-sm text-gray-700">
                Type Monthly
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="typeOneTime"
                checked={formData.typeOneTime}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600"
              />
              <label className="ml-2 text-sm text-gray-700">
                Type One-Time
              </label>
            </div>
            
            <div className="flex items-center">
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Save Offer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}