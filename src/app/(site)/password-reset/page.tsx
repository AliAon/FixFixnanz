"use client";
import { useState } from "react";
import Head from "next/head";
import type { NextPage } from "next";
import { useDispatch, useSelector } from "react-redux";
import { requestPasswordReset } from "@/redux/slices/authSlice";
import type { AppDispatch, RootState } from "@/redux/store";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResetPassword: NextPage = () => {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  
  const { requestPasswordResetStatus } = useSelector(
    (state: RootState) => state.auth
  );
  
  const isSubmitting = requestPasswordResetStatus === "loading";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Bitte geben Sie Ihre E-Mail-Adresse ein.");
      return;
    }

    try {
      await dispatch(requestPasswordReset(email)).unwrap();
      toast.success("E-Mail zum Zurücksetzen des Passworts wurde gesendet!");
      setEmail(""); // Clear email field on success
    } catch (error: unknown) {
      const errorMessage = typeof error === 'string' 
        ? error 
        : "Fehler beim Senden der E-Mail. Bitte versuchen Sie es erneut.";
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <Head>
        <title>Passwort zurücksetzen</title>
        <meta name="description" content="Passwort zurücksetzen Seite" />
      </Head>
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
      <div className="flex justify-center  items-center mt-32 bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl">
          <div className="bg-white shadow-md border border-gray-300 rounded-md p-3 ">
            <h2 className="text-md font-normal text-primary font-roboto mb-6 pb-2 border-b border-gray-300">
              Reset password
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-6 flex gap-4 sm:flex-col sm:items-start xsm:flex-col xsm:items-start items-center justify-center">
                <label
                  htmlFor="email"
                  className=" text-base font-normal text-primary font-roboto mb-2"
                >
                  E-Mail Adresse
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none  w-full max-w-sm px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>



              <div className="flex sm:justify-start xsm:justify-start justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className=" flex btn-shine -translate-x-10 sm:translate-x-0 xsm:translate-x-0 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? "Wird gesendet..." : "Passwort zurücksetzen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
