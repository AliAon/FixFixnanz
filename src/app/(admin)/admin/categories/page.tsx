"use client";
import { useEffect, useState } from "react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  Category,
  fetchCategories,
  deleteCategory,
  createCategory,
  updateCategory,
} from "@/redux/slices/categoriesSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "../../components/Modal";
import { Loader2 } from "lucide-react";

const CategoriesPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, isLoading } = useSelector(
    (state: RootState) => state.categories
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setSelectedImage(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const resetForm = () => {
    setCategoryName("");
    setCategoryDescription("");
    setSelectedImage(null);
    setCurrentCategory(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleAddCategory = async () => {
    if (!categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (!selectedImage) {
      toast.error("Please select an image");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", categoryName.trim());
      if (categoryDescription.trim()) {
        formData.append("description", categoryDescription.trim());
      }
      formData.append("file", selectedImage);

      const resultAction = await dispatch(createCategory(formData));

      // Check if the action was fulfilled and has data
      if (
        createCategory.fulfilled.match(resultAction) &&
        resultAction.payload
      ) {
        toast.success("Category created successfully!");
        setShowAddModal(false);
        resetForm();
        // Refresh the categories list
        dispatch(fetchCategories());
      } else {
        const errorMessage =
          resultAction.payload || "Failed to create category";
        toast.error(
          typeof errorMessage === "string"
            ? errorMessage
            : "Failed to create category"
        );
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCategory = async () => {
    if (!currentCategory?.id || !categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("_method", "PATCH");
      formData.append("name", categoryName.trim());
      if (categoryDescription.trim()) {
        formData.append("description", categoryDescription.trim());
      }
      if (selectedImage) {
        formData.append("file", selectedImage, selectedImage.name);
      }

      const resultAction = await dispatch(
        updateCategory({
          id: currentCategory.id,
          data: formData,
        })
      );

      // Check if the action was fulfilled and has data
      if (
        updateCategory.fulfilled.match(resultAction) &&
        resultAction.payload
      ) {
        toast.success("Category updated successfully!");
        setShowEditModal(false);
        resetForm();
        // Refresh the categories list
        dispatch(fetchCategories());
      } else {
        const errorMessage =
          resultAction.payload || "Failed to update category";
        toast.error(
          typeof errorMessage === "string"
            ? errorMessage
            : "Failed to update category"
        );
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!currentCategory) return;

    setIsSubmitting(true);
    try {
      const resultAction = await dispatch(deleteCategory(currentCategory.id));

      if (deleteCategory.fulfilled.match(resultAction)) {
        toast.success("Category deleted successfully");
        setShowDeleteModal(false);
        setCurrentCategory(null);
      } else {
        toast.error(
          (resultAction.payload as string) || "Failed to delete category"
        );
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (category: Category) => {
    setCurrentCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description || "");
    setSelectedImage(null);
    setShowEditModal(true);
  };

  const openDeleteModal = (category: Category) => {
    setCurrentCategory(category);
    setShowDeleteModal(true);
  };

  return (
    <div className="my-8 px-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="pb-6 flex justify-between items-center">
        <h1 className="text-[30px] font-semibold text-[#32325D]">Categories</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
        >
          Add Category
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-2 xsm:grid-cols-1 gap-6">
          {categories?.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-2xl group cursor-pointer shadow-lg px-4 pb-6 w-full"
            >
              <div className="relative overflow-hidden flex justify-center h-48">
                <img
                  src={
                    typeof category.image === "string"
                      ? category.image
                      : "/placeholder.jpg"
                  }
                  alt={category.name}
                  className="object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src.includes("placeholder.jpg")) return; // Prevent infinite loop
                    target.src = "/placeholder.jpg";
                  }}
                />
              </div>
              <h2 className="mt-6 text-lg capitalize font-semibold text-secondary font-roboto duration-300 group-hover:text-[#1477BC]">
                {category.name}
              </h2>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => openEditModal(category)}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => openDeleteModal(category)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Category Modal */}
      {showAddModal && (
        <Modal title="Add New Category" onClose={() => setShowAddModal(false)}>
          <div className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  placeholder="Enter category description (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="image">Image</label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
                <p className="text-sm text-gray-500">Max file size: 5MB</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                disabled={
                  isSubmitting || !categoryName.trim() || !selectedImage
                }
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Category"
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Category Modal */}
      {showEditModal && currentCategory && (
        <Modal title="Edit Category" onClose={() => setShowEditModal(false)}>
          <div className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="edit-name">Name</label>
                <input
                  id="edit-name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-description">Description</label>
                <textarea
                  id="edit-description"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  placeholder="Enter category description (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-image">Current Image</label>
                {currentCategory.image && !previewUrl && (
                  <div className="mb-4">
                    <img
                      src={currentCategory.image}
                      alt="Current category"
                      className="w-32 h-32 object-contain border rounded"
                    />
                  </div>
                )}
                {previewUrl && (
                  <div className="mb-4">
                    <label className="block text-sm text-gray-600 mb-2">
                      New Image Preview:
                    </label>
                    <img
                      src={previewUrl}
                      alt="New category preview"
                      className="w-32 h-32 object-contain border rounded"
                    />
                  </div>
                )}
                <label htmlFor="edit-image">Update Image (Optional)</label>
                <input
                  id="edit-image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="text-sm text-gray-500">Max file size: 5MB</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleEditCategory}
                disabled={isSubmitting || !categoryName.trim()}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Category"
                )}
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
          <div className="p-6">
            <p className="mb-6">
              Are you sure you want to delete this category?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCategory}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Category"
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CategoriesPage;
