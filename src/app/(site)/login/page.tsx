"use client";
import React, {
  useState,
  useEffect,
  FormEvent,
  ChangeEvent,
  ReactNode,
} from "react";
import { FcGoogle } from "react-icons/fc";
import { FaUser, FaUserTie, FaCheckCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loginUser } from "@/redux/slices/authSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import PublicRoute from "@/components/auth/PublicRoute";

type TabType = "login" | "registration";

interface FormState {
  email: string;
  password: string;
  confirmPassword: string;
  saveLogin: boolean;
}
interface RegistrationOption {
  title: string;
  icon: ReactNode;
  benefits: string[];
  type: "User" | "Advisor";
}

const LoginPage: React.FC = () => {
  const [formState, setFormState] = useState<FormState>({
    email: "",
    password: "",
    confirmPassword: "",
    saveLogin: false,
  });

  const [activeTab, setActiveTab] = useState<TabType>("login");
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Get auth state from Redux with more detail
  const { isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  // // Effect for handling authentication status changes
  // useEffect(() => {
  //   if (isAuthenticated && user) {
  //     // Show success toast with user's name if available
  //     // const userName =  user.email;
  //     toast.success(
  //       `Welcome back! Redirecting...`
  //       // `Welcome back${userName ? ", " + userName : ""}! Redirecting...`
  //     );

  //     // Redirect to appropriate dashboard based on user role
  //     setTimeout(() => {
  //       if (user.role === "financial-advisor") {
  //         router.push("/admin");
  //       } else {
  //         router.push("/customer-dashboard");
  //       }
  //     }, 1500);
  //   }
  // }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (error) {
      if (error.includes("Invalid email or password")) {
        toast.error("Invalid email or password. Please try again.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else if (error.includes("not active")) {
        toast.error(
          "Your account is not active. Please check your email for activation instructions.",
          {
            position: "top-right",
            autoClose: 7000,
          }
        );
      } else {
        toast.error(error);
      }

      // Clear the password field on error
      setFormState((prev) => ({
        ...prev,
        password: "",
      }));
    }
  }, [error]);

  const switchTab = (tab: TabType): void => {
    if (tab === activeTab) return;
    setActiveTab(tab);

    setFormState({
      email: "",
      password: "",
      confirmPassword: "",
      saveLogin: false,
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (activeTab === "login") {
      if (!formState.email.includes("@")) {
        toast.error("Please enter a valid email address");
        return;
      }

      if (formState.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }

      dispatch(
        loginUser({
          email: formState.email,
          password: formState.password,
        })
      );
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const options: RegistrationOption[] = [
    {
      title: "Register as a user",
      type: "User",
      icon: <FaUser className="text-2xl" />,
      benefits: [
        "Find the right financial products in just a few steps",
        "Get free advice",
      ],
    },
    {
      title: "Register as a financial advisor",
      type: "Advisor",
      icon: <FaUserTie className="text-2xl" />,
      benefits: [
        "Gain more qualified customer inquiries",
        "Let regional lists and be found better",
      ],
    },
  ];

  const handleRegistration = (type: "User" | "Advisor") => {
    router.push(`/registration?type=${type}`);
  };

  const handleForgotPassword = () => {
    router.push("/password-reset");
  };

  const handleGoogleLogin = () => {
    toast.info("Google login feature coming soon!");
  };

  return (
    <PublicRoute>
      <div className="max-w-[1330px] mx-auto">
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

        <div className="flex bg-[#FBFBFB] shadow-xl mx-4 rounded-lg items-center justify-between px-4 py-6 gap-6 my-48">
          <div className="w-full max-w-2xl sm:max-w-full xsm:max-w-full rounded-lg overflow-hidden flex flex-col md:flex-row">
            {/* Form Section */}
            <div className="w-full px-8 xsm:px-4">
              <h1 className="text-2xl translate-y-5 md:text-3xl font-bold font-roboto text-center text-[#3A5D91] mb-10">
                Welcome to FixFinanz
              </h1>

              <div className="grid grid-cols-2 mb-10 relative">
                <button
                  onClick={() => switchTab("login")}
                  className={`py-3 font-bold duration-0 border-none rounded-none font-roboto text-lg ${
                    activeTab === "login" ? "text-[#1C2E68]" : "text-[#1C2E68]"
                  } text-center ${
                    activeTab === "login" ? "bg-transparent" : "bg-[#D0D0D0]"
                  }`}
                  type="button"
                >
                  login
                </button>
                <button
                  onClick={() => switchTab("registration")}
                  className={`py-3 font-bold duration-0 border-none rounded-none font-roboto text-lg ${
                    activeTab === "registration"
                      ? "text-[#1C2E68]"
                      : "text-[#1C2E68]"
                  } text-center ${
                    activeTab === "registration"
                      ? "bg-transparent"
                      : "bg-[#D0D0D0]"
                  }`}
                  type="button"
                >
                  registration
                </button>

                <div
                  className="absolute top-0 left-0 h-0.5 bg-[#1C2E68] w-1/2 transition-transform duration-300"
                  style={{
                    transform: `translateX(${
                      activeTab === "login" ? "0%" : "100%"
                    })`,
                  }}
                />
              </div>

              <form onSubmit={handleSubmit} className="px-4">
                {activeTab === "login" && (
                  <div>
                    <div className="mb-6">
                      <input
                        type="email"
                        name="email"
                        placeholder="Your email"
                        className="w-full py-3 px-4 border-b bg-transparent font-roboto text-secondary border-gray-300 focus:border-blue-500 outline-none"
                        value={formState.email}
                        onChange={handleInputChange}
                        onBlur={(e) => {
                          if (e.target.value && !e.target.value.includes("@")) {
                            toast.warn("Please enter a valid email address");
                          }
                        }}
                        required
                      />
                    </div>
                    <div className="mb-6">
                      <input
                        type="password"
                        name="password"
                        placeholder="Your password"
                        className="w-full py-3 border-b px-4 bg-transparent font-roboto text-secondary border-gray-300 focus:border-blue-500 outline-none"
                        value={formState.password}
                        onChange={handleInputChange}
                        onBlur={(e) => {
                          if (e.target.value && e.target.value.length < 6) {
                            toast.warn(
                              "Password should be at least 6 characters"
                            );
                          }
                        }}
                        required
                      />
                    </div>
                  </div>
                )}
                {activeTab === "registration" && (
                  <div className="mb-36 ">
                    <div className=" py-6 px-0 grid grid-cols-2 xsm:grid-cols-1 sm:grid-cols-1 gap-8">
                      {options.map((option, index) => (
                        <div key={index} className="flex flex-col gap-6">
                          <button
                            onClick={() => handleRegistration(option.type)}
                            className="btn-shine flex items-center gap-2 px-3 py-6 font-roboto bg-gradient-to-r from-[#434370] to-[#13214e] text-white rounded-lg  transition-colors w-full min-w-[250px] sm:min-w-full sm:max-w-full xsm:min-w-full xsm:max-w-full max-w-[300px]"
                          >
                            {option.icon}
                            <span className="text-sm font-semibold">
                              {option.title}
                            </span>
                          </button>

                          <div className="space-y-4">
                            {option.benefits.map((benefit, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <FaCheckCircle className="text-[#198754] mt-1 flex-shrink-0" />
                                <span className="text-md font-roboto text-secondary">
                                  {benefit}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "login" && (
                  <div className="flex justify-between items-center mb-8">
                    <label className="flex items-center text-[#647286] font-roboto">
                      <input
                        type="checkbox"
                        name="saveLogin"
                        className="mr-2 h-3 w-3"
                        checked={formState.saveLogin}
                        onChange={handleInputChange}
                      />
                      Save login
                    </label>
                    <Link
                      href="/password-reset"
                      type="button"
                      className="text-[#1477BC] duration-200 hover:text-secondary bg-transparent border-none"
                      onClick={handleForgotPassword}
                    >
                      Forgot Password?
                    </Link>
                  </div>
                )}

                {activeTab === "login" && (
                  <div>
                    <button
                      type="submit"
                      className="w-full bg-[#152350] text-white py-2 font-roboto font-bold btn-shine rounded-md transition mb-6"
                      disabled={isLoading}
                    >
                      {isLoading ? "Logging in..." : "login"}
                    </button>

                    <div className="flex items-center mb-6">
                      <div className="flex-grow border-t border-gray-300"></div>
                      <span className="mx-4 text-secondary">Or</span>
                      <div className="flex-grow border-t border-gray-300"></div>
                    </div>

                    <button
                      type="button"
                      className="w-full flex items-center justify-center border-none text-secondary font-roboto rounded-none bg-white transition duration-200"
                      onClick={handleGoogleLogin}
                    >
                      <FcGoogle className="text-xl mr-2" />
                      {activeTab === "login" ? "Login with Google" : "  "}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/login-img.png"
            alt="Login illustration"
            className="w-full max-w-xl md:max-w-md duration-300 sm:hidden xsm:hidden rounded-2xl"
          />
        </div>
      </div>
    </PublicRoute>
  );
};

export default LoginPage;
