"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  fetchSupportCategories,
  createSupportCategory,
  updateSupportCategory,
  deleteSupportCategory,
  SupportCategory
} from "@/redux/slices/supportCategoriesSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmationDialog from "@/components/shared/ConfirmationDialouge";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: SupportCategory | null;
  onSubmit: (data: { name: string; status: number }) => void;
  isUpdating: boolean;
}

const ButtonLoader = () => (
  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
      Loading...
    </span>
  </div>
);

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  category,
  onSubmit,
  isUpdating,
}) => {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<number>(1);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setStatus(category.status);
    }
  }, [category]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, status: status === 1 ? 1 : 2 });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 mx-4">
        <h2 className="text-2xl font-semibold mb-4">Edit Support Category</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Category Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
              required
              disabled={isUpdating}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(Number(e.target.value))}
              className="w-full p-2 border rounded"
              disabled={isUpdating}
            >
              <option value={1}>Active</option>
              <option value={2}>Inactive</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdating}
              className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
            >
              {isUpdating && <ButtonLoader />}
              <span>{isUpdating ? 'Updating...' : 'Update'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function SupportCategoriesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { categories } = useSelector((state: RootState) => state.supportCategories);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SupportCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    status: 1,
  });

  useEffect(() => {
    dispatch(fetchSupportCategories());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsCreating(true);
    try {
      await dispatch(createSupportCategory({
        name: formData.name.trim(),
        status: formData.status === 1 ? 1 : 2
      })).unwrap();
      toast.success("Support category created successfully");
      setFormData({ name: "", status: 1 });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "duplicate key value violates") {
          toast.error("Category name already exists");
        } else {
          toast.error(error.message || "Failed to create support category");
        }
      } else {
        toast.error("Failed to create support category");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setCategoryToDelete(id);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (categoryToDelete) {
      setIsDeleting(true);
      try {
        await dispatch(deleteSupportCategory(categoryToDelete)).unwrap();
        toast.success("Support category deleted successfully");
        setIsDialogOpen(false);
        setCategoryToDelete(null);
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message || "Failed to delete support category");
        } else {
          toast.error("Failed to delete support category");
        }
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleEditClick = (category: SupportCategory) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (data: { name: string; status: number }) => {
    if (!selectedCategory) return;

    setIsUpdating(true);
    try {
      await dispatch(updateSupportCategory({
        id: selectedCategory.id,
        data: {
          name: data.name.trim(),
          status: data.status === 1 ? 1 : 2
        }
      })).unwrap();
      toast.success("Support category updated successfully");
      setIsEditModalOpen(false);
      setSelectedCategory(null);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "duplicate key value violates") {
          toast.error("Category name already exists");
        } else {
          toast.error(error.message || "Failed to update support category");
        }
      } else {
        toast.error("Failed to update support category");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <ToastContainer />
      
      <div className="">
        <h1 className="text-[30px] font-semibold text-gray-800 mb-10">
          Support Categories
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/2 bg-white p-8 rounded-lg shadow">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label
                  htmlFor="name"
                  className="block text-lg font-medium text-gray-700 mb-2"
                >
                  Category Name:
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Category Name *"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                  disabled={isCreating}
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="status"
                  className="block text-lg font-medium text-gray-700 mb-2"
                >
                  Status:
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={isCreating}
                >
                  <option value={1}>Active</option>
                  <option value={2}>Inactive</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="p-2 bg-[#198754] text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isCreating && <ButtonLoader />}
                <span>{isCreating ? 'Creating...' : 'Create Category'}</span>
              </button>
            </form>
          </div>

          {/* Right side - Table */}
          <div className="w-full lg:w-1/2 bg-white p-4 rounded-lg shadow overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white text-left">
                  <th className="py-2 px-2 font-bold text-primary">#</th>
                  <th className="py-2 px-2 font-bold text-primary">Name</th>
                  <th className="py-2 px-2 font-bold text-primary">Status</th>
                  <th className="py-2 px-2 font-bold text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category, index) => (
                  <tr key={category.id} className="border-t border-gray-200">
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2">{category.name}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        category.status === 1 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.status === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(category)}
                          disabled={isUpdating || isDeleting}
                          className="hover:bg-blue-700 bg-blue-600 duration-100 py-1 px-2 rounded-md text-sm text-white border-none disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(category.id)}
                          disabled={isDeleting || isUpdating}
                          className="hover:bg-[#BB2D3B] bg-[#DC3545] duration-100 py-1 px-2 rounded-md text-sm text-white border-none disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">
                      No support categories found
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
        confirmText={
          <>
            {isDeleting && <ButtonLoader />}
            <div className="ml-2">{isDeleting ? 'Deleting...' : 'Delete'}</div>
          </>
        }
        title="Delete Support Category"
        message="Are you sure you want to delete this support category? This action cannot be undone."
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDialogOpen(false);
          setCategoryToDelete(null);
        }}
        isConfirmDisabled={isDeleting}
      />

      {/* Edit Modal */}
      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        onSubmit={handleEditSubmit}
        isUpdating={isUpdating}
      />
    </div>
  );
}
