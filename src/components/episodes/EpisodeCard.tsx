// src/components/EpisodeCard.tsx
import { Card, CardContent, Typography } from "@mui/material";
import { Episode } from "../../types/episode";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { useEffect } from "react";
import { useFeature, useFeatureValue } from "@growthbook/growthbook-react";
import { analytics, id } from "@/app/layout";
import { logEvent } from "firebase/analytics";

interface EpisodeCardProps {
  episode: Episode;
}

const EpisodeCard: React.FC<EpisodeCardProps> = ({ episode }) => {
  const router = useRouter();
  const feature = useFeature(episode.feature_flag_key as string);
  const { experiment, experimentResult } = feature;

  const episodeTitle = episode.feature_status == "running" ?  (useFeatureValue(episode.feature_flag_key as string,"title") as any) : episode.titles[0];

  const handleClick = () => {
    console.log("Episode selected event fired:", {
      experiment_id: experiment?.key,
      variation_id: experimentResult?.variationId, //which is the variation key on creating the experiment
      user_id: id.toString(),
    });
    logEvent(analytics,"episode-selected", {
      experiment_id: experiment?.key,
      variation_id: experimentResult?.variationId,
      user_id: id.toString(),
    });
    router.push(`/episodes/${episode.id}`);
  };

  return (
    <Card onClick={handleClick} style={{ margin: "10px", cursor: "pointer" }}>
      <CardContent>
        <Typography variant="h5">{episodeTitle}</Typography>
        <Typography color="textSecondary">{episode.duration}</Typography>
      </CardContent>
    </Card>
  );
};

export default EpisodeCard;
