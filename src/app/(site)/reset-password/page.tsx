"use client";
import { useState } from "react";
import Head from "next/head";
import type { NextPage } from "next";
//import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { requestPasswordReset } from "@/redux/slices/authSlice";
import type { AppDispatch, RootState } from "@/redux/store";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PasswordReset: NextPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  //const router = useRouter();
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

    // Basic email validation
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // if (!emailRegex.test(email)) {
    //   toast.error("Bitte geben Sie eine gültige E-Mail-Adresse ein.");
    //   return;
    // }

    try {
      await dispatch(requestPasswordReset(email)).unwrap();
      setIsSubmitted(true);
      toast.success(
        "Falls ein Konto mit dieser E-Mail-Adresse existiert, erhalten Sie einen Link zum Zurücksetzen des Passworts."
      );
    } catch (error: unknown) {
      const errorMessage =
        typeof error === "string"
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

      <div className="flex justify-center items-center mt-32 bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
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

        <div className="w-full max-w-3xl">
          <div className="bg-white shadow-md border border-gray-300 rounded-md p-3">
            <h2 className="text-md font-normal text-primary font-roboto mb-6 pb-2 border-b border-gray-300">
              Passwort zurücksetzen
            </h2>

            {!isSubmitted ? (
              <>
                <p className="text-sm text-gray-600 mb-6">
                  Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen
                  Link zum Zurücksetzen Ihres Passworts.
                </p>

                <form onSubmit={handleSubmit}>
                  <div className="mb-6 flex gap-4 sm:flex-col sm:items-start xsm:flex-col xsm:items-start items-center justify-center">
                    <label
                      htmlFor="email"
                      className="text-base font-normal text-primary font-roboto mb-2"
                    >
                      E-Mail-Adresse
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none w-full max-w-sm px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="ihre@email.com"
                    />
                  </div>

                  <div className="flex sm:justify-start xsm:justify-start justify-center">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex btn-shine -translate-x-10 sm:translate-x-0 xsm:translate-x-0 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isSubmitting
                        ? "E-Mail wird gesendet..."
                        : "Link senden"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="mb-4">
                  <svg
                    className="mx-auto h-12 w-12 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  E-Mail gesendet!
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Falls ein Konto mit der E-Mail-Adresse{" "}
                  <strong>{email}</strong> existiert, haben wir Ihnen einen Link
                  zum Zurücksetzen des Passworts gesendet.
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Überprüfen Sie auch Ihren Spam-Ordner. Der Link ist 24 Stunden
                  gültig.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Andere E-Mail-Adresse verwenden
                </button>
              </div>
            )}

            <div className="mt-6 text-center">
              <a
                href="/login"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Zurück zur Anmeldung
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PasswordReset;