"use client";

import { useState } from "react";

export default function RatingPage() {
  const [sortBy, setSortBy] = useState("High rating");

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold">All my reviews</h1>
      <p className="text-gray-600 mt-2">
        Here you have an overview of all your reviews already received.
      </p>
      <p className="text-lg font-semibold text-indigo-900 mt-4">
        You currently have a total <span className="font-bold">0 Reviews.</span>
      </p>
      <div className="flex justify-end mt-6">
        <div>
          <label className=" block text-primary font-bold mr-2">Sort by</label>
          <select
            className="border border-gray-300 block w-48 rounded px-4 py-2"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option>High rating</option>
            <option>Low rating</option>
          </select>
        </div>
      </div>
    </div>
  );
}
