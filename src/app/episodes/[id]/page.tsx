// src/app/episodes/[id]/page.tsx
"use client"; // Mark this file as a client component

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Episode } from "../../../types/episode";
import { usePostHog } from "posthog-js/react";
import { useFeature, useFeatureValue } from "@growthbook/growthbook-react";

interface EpisodePageProps {
  params: { id: string };
}

const EpisodePage = ({ params }: EpisodePageProps) => {
  const router = useRouter();
  const { id } = params;

  const [episode, setEpisode] = useState<Episode | null>(null);
  const [episodeTitle, setEpisodeTitle] = useState<string | null>(null);

  const posthog = usePostHog();

  useEffect(() => {
    const fetchEpisode = async () => {
      try {
        const response = await fetch(`/api/episodes`);
        const episodes: Episode[] = await response.json();
        const foundEpisode = episodes.find((ep) => ep.id === +id);
        setEpisode(foundEpisode || null);
      } catch (error) {
        console.error("Failed to fetch episode:", error);
      }
    };

    fetchEpisode();
  }, [id]);

  // const feature = useFeature(episode?.feature_flag_key || "");

  const episodeTitleValue = episode?.feature_status === "running"
    ? useFeatureValue(episode?.feature_flag_key || "", "title")
    : episode?.titles?.[0];

  useEffect(() => {
    if (episodeTitleValue) {
      setEpisodeTitle(episodeTitleValue as string);
    }
  }, [episodeTitleValue]);

  if (!episode) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{episodeTitle}</h1>
      <p className="mt-2 text-gray-700">Duration: {episode.duration}</p>
      <p className="mt-4">{episode.description}</p>
      <button
        onClick={() => {
          posthog.capture("episode_action", {
            episodeId: episode.id,
            $feature_flag: posthog.getFeatureFlag(episode.feature_flag_key as string)
          });
        }}
        className="mr-2 mt-4 bg-blue-500 text-white rounded-md px-4 py-2"
      >
        Episode Action
      </button>
      <button onClick={() => router.back()} className="mt-4 bg-blue-500 text-white rounded-md px-4 py-2">
        Back
      </button>
    </div>
  );
};

export default EpisodePage;