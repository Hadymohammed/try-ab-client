"use client"
import './globals.css';
import { GrowthBook } from "@growthbook/growthbook-react";
import { GrowthBookProvider } from "@growthbook/growthbook-react";
import { initializeApp } from "firebase/app";
import { getAnalytics , logEvent} from "firebase/analytics";
import { useEffect } from 'react';

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
export const id =10; //this sumulates the user id
const growthbook = new GrowthBook({
  apiHost: process.env.NEXT_PUBLIC_GROWTHBOOK_API_HOST,
  clientKey: process.env.NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY,
  enableDevMode: true,
  trackingCallback: (experiment, result) => {
    console.log("Experiment viewed", experiment, result);
    logEvent(analytics,"experiment_viewed", {
      experiment_id: experiment.key,
      variation_id: result.variationId,
      user_id: id.toString(),
    });
  },
});
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    console.log("GrowthBook initialized");
    growthbook.init({
      streaming: true,
    });

    growthbook.setAttributes({
      id: id.toString(), //based on this (used_id) the experiment will be shown with its variation
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
