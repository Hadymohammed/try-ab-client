"use client"
import './globals.css';
import { GrowthBook } from "@growthbook/growthbook-react";
import { GrowthBookProvider } from "@growthbook/growthbook-react";
import { initializeApp } from "firebase/app";
import { getAnalytics , logEvent} from "firebase/analytics";
import { useEffect } from 'react';
import posthog from "posthog-js";
 

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const userId =4; //this sumulates the user id
const growthbook = new GrowthBook({
  apiHost: process.env.NEXT_PUBLIC_GROWTHBOOK_API_HOST,
  clientKey: process.env.NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY,
  enableDevMode: true,
  trackingCallback: (experiment, result) => {
    // console.log("Experiment viewed", result.key);
    // logEvent(analytics,"experiment_viewed", {
    //   experiment_id: experiment.key,
    //   variation_id: result.key, //which is the variation key on creating the experiment (number)
    //   user_id: userId.toString(),
    // });
  },
});

const POSTHOG_API_KEY = "phc_KxeAGvbUttK5u5c9aAsM1zL9kQkbYTVezuuENsCVG0z";
const POSTHOG_HOST_URL = "https://us.i.posthog.com"; 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  if (typeof window !== "undefined" && POSTHOG_API_KEY) {
    posthog.init(POSTHOG_API_KEY, {
      api_host: POSTHOG_HOST_URL,
      persistence: "memory", // Use memory persistence for Next.js
    });
  }
  useEffect(() => {
    console.log("GrowthBook initialized");
    growthbook.init({
      streaming: true,
    });

    growthbook.setAttributes({
      id: userId.toString(), //based on this (used_id) the experiment will be shown with its variation
    });
  }, []);

  return (
    <html lang="en">
      <GrowthBookProvider growthbook={growthbook}>
        <body>{children}</body>
      </GrowthBookProvider>
    </html>
  );
}
