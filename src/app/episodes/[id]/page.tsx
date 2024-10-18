"use client"; 
import { BarChart } from "@mui/x-charts/BarChart";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Episode } from "../../../types/episode";
import { usePostHog } from "posthog-js/react";
import { useFeature, useFeatureValue } from "@growthbook/growthbook-react";
import { GrowthBookService, IExperimentResult } from "@/services/growthBook.service";

interface EpisodePageProps {
  params: { id: string };
}

const EpisodePage = ({ params }: EpisodePageProps) => {
  const router = useRouter();
  const { id } = params;

  const [episode, setEpisode] = useState<Episode | null>(null);
  const [episodeTitle, setEpisodeTitle] = useState<string | null>(null);
  const [experimentResult, setExperimentResult] = useState<IExperimentResult | null>(null);

  const posthog = usePostHog();

  useEffect(() => {
    const fetchEpisode = async () => {
      try {
        const response = await fetch(`/api/episodes`);
        const episodes: Episode[] = await response.json();
        const foundEpisode = episodes.find((ep) => ep.id === +id);
        setEpisode(foundEpisode || null);
        await fetchExperimentResult(foundEpisode?.experiment_id as string);
      } catch (error) {
        console.error("Failed to fetch episode:", error);
      }
    };

    const fetchExperimentResult = async (experiment_id: string) => {
      try {
        const result = await GrowthBookService.getExperimentResults(experiment_id); 
        setExperimentResult(result);
      } catch (error) {
        console.error("Failed to fetch experiment result:", error);
      }
    };

    fetchEpisode();
  }, [id]);

  const episodeTitleValue = episode?.feature_status === "running"
    ? useFeatureValue(episode?.feature_flag_key || "", "title")
    : episode?.titles?.[0].title;

  useEffect(() => {
    if (episodeTitleValue) {
      setEpisodeTitle(episodeTitleValue as string);
    }
  }, [episodeTitleValue]);

  const getTitleForVariation = (variationId: string) => {
    return episode?.titles.find((title) => title.variation_id === variationId)?.title || "Unknown Title";
  };

  if (!episode) return <div>Loading...</div>;

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        {episodeTitle}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary">
        Duration: {episode.duration}
      </Typography>
      <Typography variant="body1" mt={2}>
        {episode.description}
      </Typography>
      <Box mt={4}>
        <Button
          variant="contained"
          color="primary"
          sx={{ mr: 2 }}
        >
          Episode Action
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => router.back()}
        >
          Back
        </Button>
      </Box>

      {experimentResult && (
        <Box mt={6}>
          <Typography variant="h5" gutterBottom>
            Experiment Results
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Total Users: {experimentResult.totalUsers}
          </Typography>

          {/* Display variations with titles */}
          {experimentResult.metrics[0].variations.map((variation) => (
            <Card key={variation.variationId} variant="outlined" sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6">
                  Title: {getTitleForVariation(variation.variationId)}
                </Typography>
                <Typography variant="body2">
                  Users Clicked: {variation.analyses[0].numerator} / Total Users: {variation.analyses[0].denominator}
                </Typography>
                {variation.analyses.map((analysis, index) => (
                  <Box key={index} mt={1}>
                    <Typography variant="body2">
                      Mean Click Rate: {(analysis.mean * 100).toFixed(2)}%
                    </Typography>
                    <Typography variant="body2">
                      Confidence Interval: [{analysis.ciLow}, {analysis.ciHigh}]
                    </Typography>
                    <Typography variant="body2">
                      Chance to Beat Control: {(analysis.chanceToBeatControl * 100).toFixed(2)}%
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          ))}

          {/* Display a simple bar chart for user counts */}
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Click Distribution per Title
            </Typography>
            <BarChart
              width={600}
              height={300}
              xAxis={[
                {
                  id: "titles",
                  data: experimentResult.metrics[0].variations.map((v) => getTitleForVariation(v.variationId)),
                  label: "Titles",
                  scaleType: "band",
                },
              ]}
              series={[
                {
                  data: experimentResult.metrics[0].variations.map((v) => v.analyses[0].denominator),
                  label: "Total Users",
                  color: "rgba(63, 81, 181, 0.6)",
                  xAxisKey: "titles",
                },
                {
                  data: experimentResult.metrics[0].variations.map((v) => v.analyses[0].numerator),
                  label: "Users Clicked",
                  color: "rgba(76, 175, 80, 0.6)",
                  xAxisKey: "titles",
                },
              ]}
              layout="vertical"
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};
export default EpisodePage;
