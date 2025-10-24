"use client";

import { useState, useEffect } from "react";

export const useLoader = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => {
      setTimeout(() => setIsLoading(false), 2000);
    };

    window.addEventListener("beforeunload", handleStart);
    window.addEventListener("load", handleComplete);

    return () => {
      window.removeEventListener("beforeunload", handleStart);
      window.removeEventListener("load", handleComplete);
    };
  }, []);

  const showLoader = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return { isLoading, showLoader };
};
