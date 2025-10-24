"use client";
import ConfirmationDialog from "@/components/shared/ConfirmationDialouge";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  fetchCategories,
  fetchSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  Category,
  SubCategory,
} from "@/redux/slices/categoriesSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Loader2 } from "lucide-react";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  subCategory: SubCategory | null;
  categories: Category[];
  onSubmit: (data: { name: string; category_id: string }) => void;
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  subCategory,
  categories,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    if (subCategory) {
      setName(subCategory.name);
      setCategoryId(subCategory.category_id);
    }
  }, [subCategory]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, category_id: categoryId });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 mx-4">
        <h2 className="text-2xl font-semibold mb-4">Edit Sub Category</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Parent Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select Parent Category</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Sub Category Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function SubCategoryPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, subCategories, isLoading } = useSelector(
    (state: RootState) => state.categories
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] =
    useState<SubCategory | null>(null);

  const [formData, setFormData] = useState({
    category_id: "",
    name: "",
  });

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchSubCategories());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category_id || !formData.name) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await dispatch(createSubCategory(formData)).unwrap();
      toast.success("Sub category created successfully");
      setFormData({ category_id: "", name: "" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to create sub category");
      } else {
        toast.error("Failed to create sub category");
      }
    }
  };

  const handleDeleteClick = (id: string) => {
    setCategoryToDelete(id);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (categoryToDelete) {
      try {
        await dispatch(deleteSubCategory(categoryToDelete)).unwrap();
        toast.success("Sub category deleted successfully");
        setIsDialogOpen(false);
        setCategoryToDelete(null);
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message || "Failed to delete sub category");
        } else {
          toast.error("Failed to delete sub category");
        }
      }
    }
  };

  const handleEditClick = (subCategory: SubCategory) => {
    setSelectedSubCategory(subCategory);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (data: {
    name: string;
    category_id: string;
  }) => {
    if (!selectedSubCategory) return;

    try {
      await dispatch(
        updateSubCategory({
          id: selectedSubCategory.id,
          data,
        })
      ).unwrap();
      toast.success("Sub category updated successfully");
      setIsEditModalOpen(false);
      setSelectedSubCategory(null);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to update sub category");
      } else {
        toast.error("Failed to update sub category");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="">
        <h1 className="text-[30px] font-semibold text-gray-800 mb-10">
          Create A Service Category
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/2 bg-white p-8 rounded-lg shadow">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label
                  htmlFor="category_id"
                  className="block text-lg font-medium text-gray-700 mb-2"
                >
                  Parent Category:
                </label>
                <select
                  id="category_id"
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Choose a parent category ...</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="name"
                  className="block text-lg font-medium text-gray-700 mb-2"
                >
                  Sub Category Name:
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Sub Category Name *"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="p-2 bg-[#198754] text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Creating...
                  </div>
                ) : (
                  "Create"
                )}
              </button>
            </form>
          </div>

          {/* Right side - Table */}
          <div className="w-full lg:w-1/2 bg-white p-4 rounded-lg shadow overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white text-left">
                  <th className="py-2 px-2 font-bold text-primary">#Id</th>
                  <th className="py-2 px-2 font-bold text-primary whitespace-nowrap">
                    Parent Category
                  </th>
                  <th className="py-2 px-2 font-bold text-primary">
                    Sub Category
                  </th>
                  <th className="py-2 px-2 font-bold text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subCategories.map((subCategory, index) => {
                  const parentCategory = categories.find(
                    (cat) => cat.id === subCategory.category_id
                  );
                  return (
                    <tr
                      key={subCategory.id}
                      className="border-t border-gray-200"
                    >
                      <td className="p-2">{index + 1}</td>
                      <td className="p-2">
                        {parentCategory?.name || "Unknown"}
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        {subCategory.name}
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditClick(subCategory)}
                            className="hover:bg-blue-700 bg-blue-600 duration-100 py-1 px-2 rounded-md text-sm text-white border-none"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(subCategory.id)}
                            className="hover:bg-[#BB2D3B] bg-[#DC3545] duration-100 py-1 px-2 rounded-md text-sm text-white border-none"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {subCategories.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">
                      No sub categories found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDialogOpen}
        title="Delete Sub Category"
        message="Are you sure you want to delete this sub category? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDialogOpen(false);
          setCategoryToDelete(null);
        }}
      />

      {/* Edit Modal */}
      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSubCategory(null);
        }}
        subCategory={selectedSubCategory}
        categories={categories}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
}
