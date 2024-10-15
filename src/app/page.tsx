// src/app/page.tsx
"use client";
// src/app/page.tsx

import React, { useEffect, useState } from 'react';
import EpisodeCard from '../components/episodes/EpisodeCard';
import EpisodeModal from '../components/episodes/EpisodeModal';
import { Button, Container } from '@mui/material';
import { Episode } from '@/types/episode';
import posthog from 'posthog-js';

const LandingPage = () => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [open, setOpen] = useState(false);
  const pageTitle = posthog.getFeatureFlagPayload('page-title') as any
  console.log(pageTitle)

  const fetchEpisodes = async () => {
    const res = await fetch('/api/episodes');
    const data = await res.json();
    setEpisodes(data);
  };

  useEffect(() => {
    posthog.setPersonProperties({ 'is_logged_in': true, 'email': 'ex2@g.com'});
    fetchEpisodes();
  }, []);

  const handleNewEpisode = async () => {
    // Refresh the episode list
    await fetchEpisodes();
    setOpen(false); // Close the modal after refreshing
  };

  return (
    <Container className="my-10">
      <h1 className="text-3xl font-bold mb-6">Episodes - {pageTitle?.title} </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {episodes.map((episode) => (
          <EpisodeCard key={episode.id} episode={episode} />
        ))}
      </div>

      {/* Add Button */}
      <Button
        variant="contained"
        onClick={() => setOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition duration-300 ease-in-out"
      >
        Add Episode
      </Button>

      {/* Episode Modal */}
      <EpisodeModal open={open} onClose={() => setOpen(false)} onNewEpisode={handleNewEpisode} />
    </Container>
  );
};

export default LandingPage;
