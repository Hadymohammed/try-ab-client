// src/components/EpisodeCard.tsx
import { Card, CardContent, Typography } from "@mui/material";
import { Episode } from "../../types/episode";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { useEffect } from "react";

interface EpisodeCardProps {
  episode: Episode;
}

const EpisodeCard: React.FC<EpisodeCardProps> = ({ episode }) => {
  const router = useRouter();
  const episodeTitle = episode.feature_status == "enabled" ?  (posthog.getFeatureFlagPayload(episode.feature_flag_key as string) as any)?.title : episode.titles[0];
  console.log(episode.id,episode.feature_flag_key,posthog.getFeatureFlagPayload(episode.feature_flag_key as string));
  const handleClick = () => {
    posthog.capture("episode_clicked", {
      episodeId: episode.id,
      $feature_flag: posthog.getFeatureFlag(episode.feature_flag_key as string)
    });
    router.push(`/episodes/${episode.id}`);
  };

  useEffect(() => {
    posthog.capture("episode_viewed", {
      episodeId: episode.id,
      $feature_flag: posthog.getFeatureFlag(episode.feature_flag_key as string)
    });
  }
  ,[]);
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
