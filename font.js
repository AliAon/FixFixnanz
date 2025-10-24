import localFont from "next/font/local";
export const ppAgrandir = localFont({
  src: [
    {
      path: "./public/fonts/PPAgrandir-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./public/fonts/PPAgrandirText-Bold.otf",
      weight: "500",
      style: "medium",
    },
  ],
  variable: "--font-ppagrandir", 
});
