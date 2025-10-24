"use client";
import ConfirmationDialog from "@/components/shared/ConfirmationDialouge";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  fetchSupportFaqs,
  createSupportFaq,
  updateSupportFaq,
  deleteSupportFaq,
  SupportFaq,
} from "@/redux/slices/supportFaqsSlice";
import { fetchSupportCategories } from "@/redux/slices/supportCategoriesSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Loader Component
const Loader = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div
      className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#fff] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
      role="status"
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  </div>
);

export default function QuestionAnswerPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { faqs, isLoading } = useSelector(
    (state: RootState) => state.supportFaqs
  );
  const { categories, isLoading: categoriesLoading } = useSelector(
    (state: RootState) => state.supportCategories
  );

  // State for modal dialog visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for confirmation dialog
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<string | null>(null);

  // State for edit dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [faqToEdit, setFaqToEdit] = useState<SupportFaq | null>(null);

  // State for form inputs
  const [formData, setFormData] = useState({
    category_id: "",
    question: "",
    answer: "",
  });

  // State for edit form inputs
  const [editFormData, setEditFormData] = useState({
    category_id: "",
    question: "",
    answer: "",
  });

  useEffect(() => {
    // Fetch both FAQs and categories
    dispatch(fetchSupportFaqs())
      .unwrap()
      .catch((error) => {
        toast.error(error || "Failed to fetch FAQs");
      });

    dispatch(fetchSupportCategories())
      .unwrap()
      .catch((error) => {
        toast.error(error || "Failed to fetch categories");
      });
  }, [dispatch]);

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle edit input change
  const handleEditInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category_id || !formData.question || !formData.answer) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await dispatch(createSupportFaq(formData)).unwrap();
      toast.success("FAQ created successfully");
      setIsModalOpen(false);
      setFormData({
        category_id: "",
        question: "",
        answer: "",
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to create FAQ");
      } else {
        toast.error("Failed to create FAQ");
      }
    }
  };

  // Handle edit button click
  const handleEditClick = (faq: SupportFaq) => {
    setFaqToEdit(faq);
    setEditFormData({
      category_id: faq.category_id,
      question: faq.question,
      answer: faq.answer,
    });
    setIsEditDialogOpen(true);
  };

  // Handle update form submission
  const handleUpdate = async () => {
    if (!faqToEdit) return;
    if (
      !editFormData.category_id ||
      !editFormData.question ||
      !editFormData.answer
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await dispatch(
        updateSupportFaq({
          id: faqToEdit.id,
          data: editFormData,
        })
      ).unwrap();
      toast.success("FAQ updated successfully");
      setIsEditDialogOpen(false);
      setFaqToEdit(null);
      setEditFormData({
        category_id: "",
        question: "",
        answer: "",
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to update FAQ");
      } else {
        toast.error("Failed to update FAQ");
      }
    }
  };

  // Handle delete button click
  const handleDeleteClick = (id: string) => {
    setFaqToDelete(id);
    setIsConfirmDialogOpen(true);
  };

  // Confirm deletion
  const handleConfirmDelete = async () => {
    if (faqToDelete !== null) {
      try {
        await dispatch(deleteSupportFaq(faqToDelete)).unwrap();
        toast.success("FAQ deleted successfully");
        setIsConfirmDialogOpen(false);
        setFaqToDelete(null);
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message || "Failed to delete FAQ");
        } else {
          toast.error("Failed to delete FAQ");
        }
      }
    }
  };

  // Cancel deletion
  const handleCancelDelete = () => {
    setIsConfirmDialogOpen(false);
    setFaqToDelete(null);
  };

  // Get FAQ question for confirmation message
  const getFaqToDeleteQuestion = () => {
    if (faqToDelete === null) return "";
    const faq = faqs.find((q) => q.id === faqToDelete);
    return faq ? faq.question : "";
  };

  if (isLoading || categoriesLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <ToastContainer />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between sm:flex-col xsm:flex-col gap-4 xsm:items-start sm:items-start sm:justify-start items-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-800">
            Create Question & Answer
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#0D6EFD] hover:bg-[#0B5ED7] text-white p-2 text-sm rounded-md transition-colors"
          >
            Create Question & Answer
          </button>
        </div>

        {/* QnA Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-200">
                <th className="py-3 px-4 text-left font-bold">#Id</th>
                <th className="py-3 px-4 text-left font-bold">Category</th>
                <th className="py-3 px-4 text-left font-bold">Question</th>
                <th className="py-3 px-4 text-left font-bold">Answer</th>
                <th className="py-3 px-4 text-left font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {faqs.map((faq, index) => (
                <tr key={faq.id} className="border-b border-gray-200">
                  <td className="py-3 px-4">#{index + 1}</td>
                  <td className="py-3 px-4">
                    {categories.find((cat) => cat.id === faq.category_id)
                      ?.name || "Unknown"}
                  </td>
                  <td className="py-3 px-4">{faq.question}</td>
                  <td className="py-3 px-4">{faq.answer}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditClick(faq)}
                        className="bg-blue-500 text-white py-1 px-4 rounded hover:bg-blue-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(faq.id)}
                        className="bg-red-500 text-white py-1 px-4 rounded hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {faqs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500">
                    No questions and answers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog for Creating QnA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full  mx-4">
            <div className="flex justify-between items-center mb-4 p-6 pb-0">
              <h2 className="text-xl font-semibold text-gray-800">
                Create Questions
              </h2>
              <Link
                href=""
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </Link>
            </div>
            <div className="border border-b"></div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-2">
                <label className="block text-gray-700 mb-2">Category :</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-2">
                <label className="block text-gray-700 mb-2">Question :</label>
                <input
                  type="text"
                  name="question"
                  value={formData.question}
                  onChange={handleInputChange}
                  placeholder="Question name *"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-2">
                <label className="block text-gray-700 mb-2">Answer :</label>
                <textarea
                  name="answer"
                  value={formData.answer}
                  onChange={handleInputChange}
                  placeholder="Answer *"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  required
                />
              </div>
              <div className="flex justify-start space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-white hover:bg-[#BB2D3B] bg-[#DC3545] rounded-md transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#198754] text-white rounded hover:bg-green-700 transition-colors"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Dialog for Updating QnA */}
      {isEditDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full mx-4">
            <div className="flex justify-between items-center p-6 pb-4">
              <h2 className="text-xl font-semibold text-[#32325D]">
                Update Question
              </h2>
              <Link
                href=""
                onClick={() => setIsEditDialogOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </Link>
            </div>
            <div className="p-6 pt-0">
              <div className="mb-2">
                <label className="block text-gray-700 mb-2">Category :</label>
                <select
                  name="category_id"
                  value={editFormData.category_id}
                  onChange={handleEditInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-2">
                <label className="block text-gray-700 mb-2">Question :</label>
                <input
                  type="text"
                  name="question"
                  value={editFormData.question}
                  onChange={handleEditInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-2">
                <label className="block text-gray-700 mb-2">Answer :</label>
                <textarea
                  name="answer"
                  value={editFormData.answer}
                  onChange={handleEditInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  required
                />
              </div>
              <div className="flex justify-start space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="px-4 py-2 text-white hover:bg-[#BB2D3B] bg-[#DC3545] rounded-md transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleUpdate}
                  className="px-4 py-2 text-white bg-[#198754] rounded hover:bg-green-700 transition-colors"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmDialogOpen}
        title="Delete Question"
        message={`Are you sure you want to delete "${getFaqToDeleteQuestion()}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
