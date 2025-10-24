"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPlus } from "react-icons/fa";
import Modal from "../../components/Modal";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  clearError,
  ContractCategory,
} from "@/redux/slices/contractCategoriesSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { BiCategory } from "react-icons/bi";

const ContractCategoriesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, loading, error } = useSelector(
    (state: RootState) => state.contractCategories
  );

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentCategory, setCurrentCategory] =
    useState<ContractCategory | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Fetch categories on mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Show error messages
  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error}`);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Add category with image
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    const formData = new FormData();
    formData.append("name", newCategoryName);
    if (selectedImage) {
      formData.append("image", selectedImage); // Note: Use 'image' instead of 'icon' to match API
    }

    dispatch(createCategory(formData))
      .unwrap()
      .then(() => {
        setNewCategoryName("");
        setSelectedImage(null);
        setShowAddModal(false);
        toast.success("Category added successfully");
      })
      .catch((error) => {
        toast.error(`Failed to add category: ${error}`);
      });
  };

  // Update category with image
  const handleEditCategory = () => {
    if (!currentCategory || !newCategoryName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    const formData = new FormData();
    formData.append("name", newCategoryName);
    if (selectedImage) {
      formData.append("image", selectedImage); // Note: Use 'image' instead of 'icon' to match API
    }

    dispatch(updateCategory({ id: currentCategory.id, data: formData }))
      .unwrap()
      .then(() => {
        setShowEditModal(false);
        toast.success("Category updated successfully");
      })
      .catch((error) => {
        toast.error(`Failed to update category: ${error}`);
      });
  };

  // Handle deleting a category
  const handleDeleteCategory = () => {
    if (!currentCategory) return;

    dispatch(deleteCategory(currentCategory.id))
      .unwrap()
      .then(() => {
        setShowDeleteModal(false);
        toast.success("Category deleted successfully");
      })
      .catch((error) => {
        toast.error(`Failed to delete category: ${error}`);
      });
  };

  // Open edit modal
  const openEditModal = (category: ContractCategory) => {
    setCurrentCategory(category);
    setNewCategoryName(category.name);
    setSelectedImage(null); // Reset selected image
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (category: ContractCategory) => {
    setCurrentCategory(category);
    setShowDeleteModal(true);
  };

  return (
    <div className="w-full mx-auto p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <h1 className="text-4xl font-semibold text-[#2D3748] mb-6">
        Contract Category
      </h1>

      <div className="mb-6">
        <button
          onClick={() => {
            setNewCategoryName("");
            setSelectedImage(null);
            setShowAddModal(true);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
        >
          <FaPlus className="inline mr-2" /> Add New Category
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading categories...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-lg font-semibold text-gray-700">
                  SL
                </th>
                <th className="px-6 py-3 text-center text-lg font-semibold text-gray-700 w-40">
                  name
                </th>
                <th className="px-6 py-3 text-center text-lg font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No categories found. Add a new category to get started.
                  </td>
                </tr>
              ) : (
                categories.map((category, index) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-lg font-medium text-gray-700">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-start items-center">
                        <img
                          src={category.image || ""}
                          alt={category.name}
                          className="w-28 h-w-28 mr-4 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "";
                          }}
                        />
                        <span className="w-max">{category.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-11 flex items-center h-full justify-center text-right">
                      <button
                        onClick={() => openEditModal(category)}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded mr-2"
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(category)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddModal && (
        <Modal title="Add Category" onClose={() => setShowAddModal(false)}>
          <div className="p-4">
            <div className="mb-4">
              <label className="block mb-2 font-semibold">Category Name</label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter category name"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-semibold">Category Icon</label>
              <div className="flex items-center">
                {selectedImage ? (
                  <div className="relative mr-4">
                    <img
                      src={URL.createObjectURL(selectedImage)}
                      alt="Preview"
                      className="h-16 w-16 object-cover rounded"
                    />
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-[25px] h-[25px] text-base p-0 flex items-center justify-center text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center mr-4">
                    <BiCategory fontSize={24} />
                  </div>
                )}
                <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 py-2 px-4 rounded">
                  <span>Choose File</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedImage(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-white border border-black rounded mr-2 bg-black"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Category Modal */}
      {showEditModal && currentCategory && (
        <Modal title="Edit Category" onClose={() => setShowEditModal(false)}>
          <div className="p-4">
            <div className="mb-4">
              <label className="block mb-2 font-semibold">Category Name</label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter category name"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-semibold">Category Icon</label>
              <div className="flex items-center">
                {selectedImage ? (
                  <div className="relative mr-4">
                    <img
                      src={URL.createObjectURL(selectedImage)}
                      alt="Preview"
                      className="h-16 w-16 object-cover rounded"
                    />
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="relative mr-4">
                    <img
                      src={currentCategory.image || ""}
                      alt={currentCategory.name}
                      className="h-16 w-16 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "";
                      }}
                    />
                  </div>
                )}
                <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 py-2 px-4 rounded">
                  <span>Choose File</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedImage(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-white border border-black rounded mr-2 bg-black"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleEditCategory}
                className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Category Modal */}
      {showDeleteModal && currentCategory && (
        <Modal
          title="Delete Category"
          onClose={() => setShowDeleteModal(false)}
        >
          <div className="p-4">
            <p className="text-lg mb-4">
              Are you sure you want to delete the category &quot;
              {currentCategory.name}&quot;?
            </p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-px-4 py-2 text-white border border-black rounded mr-2 bg-black"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCategory}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ContractCategoriesPage;
