"use client";

// Safe localStorage access functions with proper typing
export const getLocalStorage = (key: string): string | null => {
  if (typeof window !== "undefined") {
    return window.localStorage.getItem(key);
  }
  return null;
};

export const setLocalStorage = (key: string, value: string): void => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, value);
  }
};

export const removeLocalStorage = (key: string): void => {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(key);
  }
};

export const isAuthenticated = () => {
  return !!getLocalStorage("token");
};

export const getToken = () => {
  return getLocalStorage("token");
};

export const getUserRole = (): string | null => {
  const user = getLocalStorage("user");
  if (user) {
    try {
      const parsedUser = JSON.parse(user) as { role: string };
      return parsedUser.role;
    } catch (error) {
      console.error("Error parsing user:", error);
      return null;
    }
  }
  return null;
};
