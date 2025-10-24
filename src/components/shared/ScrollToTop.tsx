"use client";

import React, { useState, useEffect } from "react";

const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 z-50 transition-all duration-300 transform bg-transparent border-none ${
        isVisible
          ? "translate-x-0 opacity-100 right-8"
          : "translate-x-20 opacity-0 right-8"
      }`}
      aria-label="Scroll to top"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/in-scroll-up.svg"
        alt="Scroll to top"
        className="w-12 h-16"
      />
    </button>
  );
};

export default ScrollToTop;
