// postHog provider
"use client";
import React from 'react';
import { PostHogProvider } from 'posthog-js/react';
import posthog from 'posthog-js';

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  if (typeof window !== 'undefined') {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
    });
  }

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}