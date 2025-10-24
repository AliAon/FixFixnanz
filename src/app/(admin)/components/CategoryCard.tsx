"use client";
import { useState, useEffect } from "react";
import ConfirmationDialog from "@/components/shared/ConfirmationDialouge";
import Link from "next/link";
import Image from "next/image";

interface CategoryCardProps {
  id: number;
  image: string | File;
  title: string;
  onDelete: (id: number) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  id,
  image,
  title,
  onDelete,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("/images/placeholder.jpg");

  useEffect(() => {
    if (typeof image === 'string' && image) {
      // Handle absolute and relative URLs
      try {
        // Check if it's a valid URL
        new URL(image);
        setImageUrl(image);
      } catch {
        // If not a valid URL, assume it's a relative path
        setImageUrl(image.startsWith('/') ? image : `/${image}`);
      }
    } else if (image instanceof File) {
      const url = URL.createObjectURL(image);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [image]);

  const handleDeleteClick = () => {
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(id);
    setIsDialogOpen(false);
  };

  const handleCancelDelete = () => {
    setIsDialogOpen(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageUrl("/images/placeholder.jpg");
  };

  return (
    <div>
      <div className="bg-white rounded-2xl group cursor-pointer shadow-lg px-4 pb-6 w-full transform transition-all duration-300 ">
        <div className="relative overflow-hidden flex justify-center h-48">
          <Image
            src={imageError ? "/images/placeholder.jpg" : imageUrl}
            alt={title}
            width={200}
            height={192}
            className="object-contain"
            onError={handleImageError}
            priority
          />
        </div>
        <h2 className="mt-6 text-lg capitalize font-semibold text-secondary font-roboto duration-300 group-hover:text-[#1477BC]">
          {title}
        </h2>
        <div className="flex gap-2">
          <Link
            href={`/admin/categories/edit/${id}`}
            className="hover:bg-[#FFCA2C] bg-[#FFC107] duration-100 py-1 px-2 rounded-md text-sm text-black border-none"
          >
            Edit
          </Link>
          <button
            onClick={handleDeleteClick}
            className="hover:bg-[#BB2D3B] bg-[#DC3545] duration-100 py-1 px-2 rounded-md text-sm border-none text-white"
          >
            Delete
          </button>
        </div>
      </div>
      <ConfirmationDialog
        isOpen={isDialogOpen}
        title="Delete Category"
        message={`Are you sure you want to delete "${title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};