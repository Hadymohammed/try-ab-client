"use client"
import './globals.css';
import { GrowthBook } from "@growthbook/growthbook-react";
import { GrowthBookProvider } from "@growthbook/growthbook-react";
import { initializeApp } from "firebase/app";
import { getAnalytics , logEvent} from "firebase/analytics";
import { useEffect } from 'react';

const firebaseConfig = {
  apiKey: "AIzaSyB3A48vvfC-PcgouG7HPk7OFRmbtzGexvM",
  authDomain: "thmanyah-sso.firebaseapp.com",
  projectId: "thmanyah-sso",
  storageBucket: "thmanyah-sso.appspot.com",
  messagingSenderId: "849035368160",
  appId: "1:849035368160:web:705f1205736e0d57c06285",
  measurementId: "G-Z7NZ3PWRYZ"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const id =10; //this sumulates the user id
const growthbook = new GrowthBook({
  apiHost: "https://cdn.growthbook.io",
  clientKey: "sdk-t9nKAlkkEe1RFKqj",
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
