"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import UserRegistrationForm from "@/components/Registration/UserRegistrationForm";
import AdvisorRegistrationForm from "@/components/Registration/AdvisorRegistrationForm";

const RegistrationContent = () => {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  return (
    <div className="px-6 py-16 max-w-[1330px] mx-auto">
      {type === "User" ? (
        <UserRegistrationForm />
      ) : type === "Advisor" ? (
        <AdvisorRegistrationForm />
      ) : (
        <div>Invalid registration type</div>
      )}
    </div>
  );
};

export default function RegistrationPage() {
  return (
    <div
      className="relative h-full mt-32 object-cover w-full"
      style={{ backgroundImage: "url('/images/reg-bg.jpg')" }}
    >
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        }
      >
        <RegistrationContent />
      </Suspense>
    </div>
  );
}
