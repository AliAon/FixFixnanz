import Link from "next/link";
import React, { useState } from "react";

interface StrategyPreparationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StrategyPreparationModal: React.FC<StrategyPreparationModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Move useState before any conditional returns
  const [questions, setQuestions] = useState([{ id: 1, value: "start time" }]);

  // Skip rendering if modal is not open
  if (!isOpen) return null;

  // Add a new question
  const handleAddQuestion = () => {
    const newQuestionId = questions.length + 1;
    setQuestions([...questions, { id: newQuestionId, value: "" }]);
  };

  // Update question value
  const handleQuestionChange = (id: number, value: string) => {
    const updatedQuestions = questions.map((question) =>
      question.id === id ? { ...question, value } : question
    );
    setQuestions(updatedQuestions);
  };

  // Remove a question
  const handleRemoveQuestion = (id: number) => {
    const updatedQuestions = questions.filter((question) => question.id !== id);
    setQuestions(updatedQuestions);
  };

  // Handle form submission
  const handleSubmit = () => {
    console.log("Submitting questions:", questions);
    // Add your submission logic here
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-xl font-semibold text-[#2d3748]">
              Strategy preparation
            </h2>
            <Link
              href=""
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
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

          {/* Question fields */}
          <div className="space-y-4 mb-6">
            {questions.map((question, index) => (
              <div key={question.id} className="mb-4">
                <div className="mb-2">Question {question.id}</div>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={question.value}
                    onChange={(e) =>
                      handleQuestionChange(question.id, e.target.value)
                    }
                    placeholder={
                      index === 0 ? "start time" : "Enter your question"
                    }
                    className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleRemoveQuestion(question.id)}
                    className="ml-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none flex-shrink-0"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add question button - made to look exactly like the one in your images */}
          {questions.length < 5 && (
            <div className="mb-6 flex justify-start">
              <button
                onClick={handleAddQuestion}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Add question
              </button>
            </div>
          )}

          {/* Footer with action buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 text-white rounded focus:outline-none"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-500 text-white rounded focus:outline-none"
            >
              Submit Question
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyPreparationModal;
