"use client";

import React from "react";

const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 z-50">
      <div id="loading" className="h-screen flex items-center justify-center">
        <div id="loading-center">
          <div id="loading-center-absolute" className="animate-pulse">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/favicon.png"
              alt="Loading"
              className="w-12 h-16"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
