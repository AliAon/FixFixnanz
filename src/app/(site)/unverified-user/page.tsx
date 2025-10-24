"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { resendVerificationEmail } from "@/redux/slices/authSlice";

const UnverifiedUserPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { resendVerificationStatus, resendVerificationError, user } =
    useSelector((state: RootState) => state.auth);

  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState("test@test2.de");
  const [showAlternativeEmail, setShowAlternativeEmail] = useState(false);
  const [alternativeEmail, setAlternativeEmail] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [showCountdown, setShowCountdown] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRequestingMainEmail, setIsRequestingMainEmail] = useState(false);
  const [isRequestingAltEmail, setIsRequestingAltEmail] = useState(false);
  const [hasStartedInitialTimer, setHasStartedInitialTimer] = useState(false);
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);

  const isResending = resendVerificationStatus === "loading";
  console.log(isResending);

  // Get user email from Redux state or localStorage on component mount
  React.useEffect(() => {
    if (user?.email) {
      setUserEmail(user.email);
    } else {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.email) {
            setUserEmail(parsedUser.email);
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    }
  }, [user]);

  // Start timer automatically when page loads (for users coming from registration)
  React.useEffect(() => {
    if (!hasStartedInitialTimer && userEmail) {
      // Check if user just registered (we can check this via URL params or localStorage)
      const urlParams = new URLSearchParams(window.location.search);
      const fromRegistration = urlParams.get('from') === 'registration';
      const justRegistered = localStorage.getItem('justRegistered') === 'true';
      
      if (fromRegistration || justRegistered) {
        setEmailSent(true);
        setShowCountdown(true);
        setCountdown(120); // 2 minutes timer
        setHasStartedInitialTimer(true);
        setErrorMessage(null); // Clear any existing error messages
        setShowRegistrationSuccess(true); // Show registration success message
        
        // Clear the registration flag
        localStorage.removeItem('justRegistered');
        
        // Clean up URL params
        if (fromRegistration) {
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
        
        // Hide registration success message after 5 seconds
        setTimeout(() => {
          setShowRegistrationSuccess(false);
        }, 5000);
      }
    }
  }, [userEmail, hasStartedInitialTimer]);

  // Countdown timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showCountdown && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && showCountdown) {
      setShowCountdown(false);
      setEmailSent(false);
    }
    return () => clearInterval(interval);
  }, [showCountdown, countdown]);

  // Handle resend verification success/error
  React.useEffect(() => {
    if (resendVerificationStatus === "succeeded") {
      setEmailSent(true);
      setShowCountdown(true);
      setCountdown(120);
      setErrorMessage(null);
    } else if (
      resendVerificationStatus === "failed" &&
      resendVerificationError
    ) {
      setErrorMessage(resendVerificationError);
      setEmailSent(false);
    }
  }, [resendVerificationStatus, resendVerificationError]);

  // Format countdown time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const handleRequestLink = async () => {
    setIsRequestingMainEmail(true);
    setErrorMessage(null);
    try {
      // Use the logged-in user's email or the stored email
      const emailToUse = user?.email || userEmail;
      await dispatch(resendVerificationEmail(emailToUse)).unwrap();

      setEmailSent(true);
      setShowCountdown(true);
      setCountdown(120); // 2 minutes countdown
    } catch (error) {
      console.error("Failed to resend verification email:", error);
      setErrorMessage("Failed to send verification email. Please try again.");
    } finally {
      setIsRequestingMainEmail(false);
    }
  };

  const handleResendEmail = async () => {
    setShowAlternativeEmail(true);
  };

  const handleSubmitAlternativeEmail = async () => {
    if (!alternativeEmail.trim()) {
      setErrorMessage("Bitte geben Sie eine E-Mail-Adresse ein.");
      return;
    }

    setIsRequestingAltEmail(true);
    setErrorMessage(null);
    try {
      await dispatch(resendVerificationEmail(alternativeEmail)).unwrap();

      setEmailSent(true);
      setShowAlternativeEmail(false);
      setAlternativeEmail("");
      setShowCountdown(true);
      setCountdown(120); // 2 minutes countdown
    } catch (error) {
      console.error("Failed to resend verification email:", error);
      setErrorMessage("Failed to send verification email. Please try again.");
    } finally {
      setIsRequestingAltEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1a365d] text-white py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="text-lg font-bold">📞 +49 341 58193401</div>
            <div className="text-lg">✉️ kontakt@fixfinanz.de</div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-[#0f2a44] text-white py-3">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-white">
              Fixfinanz
            </Link>
            <div className="flex space-x-6">
              <Link href="/" className="hover:text-gray-300">
                Home
              </Link>
              <Link href="/experts" className="hover:text-gray-300">
                Finanzberater
              </Link>
              <Link href="/financial-services" className="hover:text-gray-300">
                Finanzdienstleistungen
              </Link>
              <Link
                href="/financial-check"
                className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
              >
                Finanz-Check
              </Link>
            </div>
          </div>
          <div className="flex space-x-4">
            <Link
              href="/admin"
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
            >
              Back to admin 127 2417
            </Link>
            <Link
              href="/admin"
              className="bg-white text-gray-800 hover:bg-gray-100 px-4 py-2 rounded text-sm"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="w-full max-w-[800px] mx-auto">
          {/* Registration Success Banner */}
          {showRegistrationSuccess && (
            <div className="mb-6 bg-blue-100 border border-blue-400 text-blue-700 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                <span className="font-medium">
                  Registration successful! Please check your email for verification.
                </span>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {emailSent && !showRegistrationSuccess && (
            <div className="mb-6 bg-green-100 border border-green-400 text-green-700 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                <span className="font-medium">
                  Confirmation email sent successfully!
                </span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-600 rounded-full mr-3"></div>
                  <span className="font-medium">{errorMessage}</span>
                </div>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="text-red-500 bg-transparent border-none p-0 hover:text-red-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg w-[800px] mx-auto py-5 shadow-lg text-center">
            {showCountdown ? (
              <>
                <div className="flex flex-col w-full justify-center p-4 items-center border border-[#00000020] bg-[#00000008]">
                  <h1 className="text-lg font-medium text-gray-800 mb-2">
                    Your email has not been verified yet!
                  </h1>

                  <div className="text-2xl font-bold text-gray-800">
                    {formatTime(countdown)}
                  </div>
                </div>
                <div className="mb-6 mt-3">
                  <p className="text-gray-600 mb-2">
                    Your email has not been <strong>verified yet</strong>. You
                    must confirm your email first.
                  </p>
                  <div className="text-lg font-semibold text-gray-800 mb-4">
                    {userEmail}
                  </div>
                </div>

                <div className="mb-8">
                  <p className="text-gray-600 mb-2">
                    <strong>Check your email inbox.</strong>
                  </p>
                  <p className="text-gray-600 mb-2">
                    To receive the confirmation link, click the Request Email
                    button.
                  </p>
                  <p className="text-gray-500 italic text-sm">
                    It may take a few minutes for the email to arrive.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col w-full justify-center p-4 items-center border border-[#00000020] bg-[#00000008]">
                  <h1 className="text-lg font-medium text-gray-800 mb-2">
                    Deine E-Mail wurde noch nicht verifiziert!
                  </h1>

                  <div className="text-red-600 text-xl font-bold">
                    EXPIRED
                  </div>
                </div>

                <div className="mb-6 mt-3">
                  <p className="text-gray-600 mb-2">
                    Dein E-Mail wurde noch nicht <strong>verifiziert</strong>.
                    Du musst deine E-Mail zuerst bestätigen.
                  </p>
                  <div className="text-lg font-semibold text-gray-800 mb-4">
                    {userEmail}
                  </div>
                </div>

                <div className="mb-8">
                  <p className="text-gray-600 mb-2">
                    <strong>Überprüfe dein E-Mail Postfach.</strong>
                  </p>
                  <p className="text-gray-600 mb-2">
                    Um den Bestätigungslink zu erhalten, klicke auf den Button
                    E-Mail anfordern.
                  </p>
                  <p className="text-gray-500 italic text-sm">
                    Es kann einige Minuten dauern, bis die E-Mail ankommt
                  </p>
                </div>
              </>
            )}

            <div className="flex flex-col gap-2 justify-center items-center">
              <button
                onClick={handleRequestLink}
                disabled={isRequestingMainEmail}
                className="bg-[#1a365d] w-[260px] hover:bg-[#2d4a6b] text-white px-8 py-3 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRequestingMainEmail
                  ? "Wird gesendet..."
                  : showCountdown
                  ? "Request email link!"
                  : "E-Mail Link anfordern!"}
              </button>

              <button
                onClick={handleResendEmail}
                disabled={
                  isRequestingMainEmail ||
                  isRequestingAltEmail ||
                  showAlternativeEmail
                }
                className="bg-cyan-500 hover:bg-cyan-600 w-[260px] text-white px-8 py-3 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send alternative email
              </button>
            </div>

            {/* Alternative Email Input */}
            {showAlternativeEmail && (
              <div className="mt-8 space-y-4 max-w-[350px] mx-auto">
                <h3 className="text-lg font-semibold text-gray-800">
                  Enter alternative email address
                </h3>
                <div className="space-y-4 w-full flex flex-col gap-4 justify-center items-center">
                  <input
                    type="email"
                    value={alternativeEmail}
                    onChange={(e) => setAlternativeEmail(e.target.value)}
                    placeholder="Alternative email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSubmitAlternativeEmail}
                    disabled={isRequestingAltEmail}
                    className="bg-[#1a365d] mx-auto hover:bg-[#2d4a6b] text-white px-8 py-3 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRequestingAltEmail ? "Wird gesendet..." : "Submit"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UnverifiedUserPage;
