"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { resetPasswordWithToken, validateResetToken } from "@/redux/slices/authSlice";
import type { AppDispatch, RootState } from "@/redux/store";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SetNewPasswordForm = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  const { resetPasswordStatus, validateTokenStatus } = useSelector(
    (state: RootState) => state.auth
  );

  console.debug(validateTokenStatus);

  const isSubmitting = resetPasswordStatus === "loading";

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    
    if (!tokenParam) {
      toast.error("Ungültiger oder fehlender Reset-Token");
      router.push("/forgot-password");
      return;
    }

    setToken(tokenParam);

    // Validate the token
    const validateToken = async () => {
      try {
        setIsLoading(true);
        await dispatch(validateResetToken(tokenParam)).unwrap();
        setIsTokenValid(true);
      } catch (error: unknown) {
        const errorMessage =
          typeof error === "string"
            ? error
            : "Ungültiger oder abgelaufener Reset-Token";
        toast.error(errorMessage);
        setTimeout(() => {
          router.push("/forgot-password");
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [searchParams, dispatch, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Bitte füllen Sie alle Felder aus.");
      return;
    }

    if (password.length < 8) {
      toast.error("Das Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Die Passwörter stimmen nicht überein.");
      return;
    }

    try {
      await dispatch(
        resetPasswordWithToken({
          token,
          new_password: password,
          confirm_password: confirmPassword,
        })
      ).unwrap();

      toast.success("Passwort erfolgreich zurückgesetzt!");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: unknown) {
      const errorMessage =
        typeof error === "string"
          ? error
          : "Fehler beim Zurücksetzen des Passworts. Bitte versuchen Sie es erneut.";
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Token wird validiert...</p>
        </div>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Ungültiger Token
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Der Reset-Link ist ungültig oder abgelaufen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Neues Passwort festlegen</title>
        <meta name="description" content="Neues Passwort festlegen" />
      </Head>

      <div className="flex justify-center items-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
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

        <div className="w-full max-w-md">
          <div className="bg-white shadow-md border border-gray-300 rounded-md p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Neues Passwort festlegen
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Geben Sie Ihr neues Passwort ein
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Neues Passwort
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10"
                  placeholder="Mindestens 8 Zeichen"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Passwort bestätigen
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10"
                  placeholder="Passwort wiederholen"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Wird gespeichert..." : "Passwort speichern"}
                </button>
              </div>
            </form>

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

export default SetNewPasswordForm;
