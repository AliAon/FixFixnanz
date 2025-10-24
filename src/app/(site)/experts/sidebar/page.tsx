"use client";
import { useState } from "react";
import { SidebarComponent } from "@/components/experts/SidebarComponent";

// Default page component for Next.js routing
export default function SidebarPage() {
  const [filters, setFilters] = useState({
    selectedRatings: [] as number[],
    selectedCategories: [] as string[],
    searchTerm: "",
    location: "",
  });

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  console.log("filters", filters);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <SidebarComponent onFilterChange={handleFilterChange} filters={filters} />
    </div>
  );
}
