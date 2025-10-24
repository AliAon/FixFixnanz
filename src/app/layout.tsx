import "./globals.css";
import ReduxProvider from "../redux/providers";
// import { store } from "../redux/store";
import { ppAgrandir } from "../../font";
import ScrollToTop from "@/components/shared/ScrollToTop";
import ClientLayout from "@/components/shared/ClientLayout";
// import AuthTimeoutProvider from "@/components/AuthTimeoutProvider";
import { ToastContainer } from 'react-toastify';

export const metadata = {
  title: "FixFinanz",
  description: "Your website description",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${ppAgrandir.variable}`}>
      <head>
        <link rel="icon" href="/images/favicon.png" />
      </head>
      <body>
        <main className="">
          <ReduxProvider>
            {/* <AuthTimeoutProvider> */}
              <ClientLayout>{children}</ClientLayout>
              <ScrollToTop />
            {/* </AuthTimeoutProvider> */}
          </ReduxProvider>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </main>
      </body>
    </html>
  );
}
