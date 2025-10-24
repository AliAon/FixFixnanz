// app/(site)/set-new-password/page.tsx
import { Suspense } from "react";
import Head from "next/head";
import SetNewPasswordForm from "./SetNewPasswordForm";

const SetNewPasswordPage = () => {
  return (
    <>
      <Head>
        <title>Neues Passwort festlegen</title>
        <meta name="description" content="Neues Passwort festlegen" />
      </Head>
      <div className="flex justify-center items-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={
          <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Lade...</p>
            </div>
          </div>
        }>
          <SetNewPasswordForm />
        </Suspense>
      </div>
    </>
  );
};

export default SetNewPasswordPage;