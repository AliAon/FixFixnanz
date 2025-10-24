// components/ConfirmationDialog.tsx
import React from "react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: React.ReactNode;
  cancelText: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  isConfirmDisabled?: boolean;
  isLoading?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isConfirmDisabled = false,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 mx-4">
        <div className="text-center">
          {/* Warning Icon */}
          <div className="rounded-full bg-orange-100 p-4 mx-auto mb-6 flex items-center justify-center w-20 h-20">
            <span className="text-orange-400 text-4xl font-bold">!</span>
          </div>

          {/* Title */}
          <h2 className="text-[30px] font-bold text-[#545454] font-roboto mb-4">
            {title}
          </h2>

          {/* Message */}
          <p className="text-gray-600 mb-8 text-[18px] font-roboto">
            {message}
          </p>

          {/* Buttons */}
          <div className="flex flex-row-reverse gap-8 justify-center space-x-4">
            <button
              onClick={onCancel}
              className="px-4 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isConfirmDisabled || isLoading}
              className={`px-4 py-1 bg-red-500 text-white rounded font-medium font-roboto border-none ${
                isConfirmDisabled || isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Deleting...
                </div>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
    
  );
};

export default ConfirmationDialog;
