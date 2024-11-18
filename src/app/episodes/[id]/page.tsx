"use client"
import { BarChart } from "@mui/x-charts/BarChart";
import { Box, Button, Card, CardContent, Menu, MenuItem, Select, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Episode } from "../../../types/episode";
import { usePostHog } from "posthog-js/react";
import { useFeature, useFeatureValue } from "@growthbook/growthbook-react";
import { GrowthBookService, IExperimentResult } from "@/services/growthBook.service";
import ReactPlayer from "react-player";
import { logEvent } from "firebase/analytics";
import { analytics, userId } from "@/app/layout";
import { Formik, Form, Field } from "formik";

interface EpisodePageProps {
  params: { id: string };
}

const EpisodePage = ({ params }: EpisodePageProps) => {
  const router = useRouter();
  const { id } = params;

  const [episode, setEpisode] = useState<Episode | null>(null);
  const [episodeTitle, setEpisodeTitle] = useState<string | null>(null);
  const [results, setResult] = useState<IExperimentResult | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [event, setEvent] = useState<string>("impression");
  const [formData, setFormData] = useState<any>({});

  const dropdownOptions = {
    app: ["Podcast App", "Radio App", "Music App"],
    isRadioSubscriber: ["True", "False"],
  };

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
        setResult(result);
      } catch (error) {
        console.error("Failed to fetch experiment result:", error);
      }
    };

    fetchEpisode();
  }, [id]);

  const feature = useFeature(episode?.feature_flag_key as string);
  const { experiment, experimentResult } = feature;

  const episodeTitleValue = episode?.feature_status === "running"
    ? useFeatureValue(episode?.feature_flag_key || "", "title")
    : episode?.titles?.[0].title;

  useEffect(() => {
    if (episodeTitleValue) {
      setEpisodeTitle(episodeTitleValue as string);
    }
  }, [episodeTitleValue]);

  const events = [
    {
      event: "track",
      fields: [
        "episodeId",
        "podcastId",
        "tenentId",
      ],
    },
    {
      event: "listen",
      fields: [
        "episodeId",
        "podcastId",
        "tenentId",
        // "timestamp",
        "total_episode_duration",
        "time",
        // "event.properties.$device_id",
        // "event.properties.$os",
        // "event.properties.$geoip_country_name",
        "app",
        "isRadioSubscriber",
      ],
    },
    {
      event: "play",
      fields: ["episodeId", "podcastId", "tenentId", "person.id"],
    },
    {
      event: "impression",
      fields: ["episodeId", "podcastId", "tenentId"],
    },
    {
      event: "click",
      fields: ["episodeId", "podcastId", "tenentId"],
    },
    {
      event: "like",
      fields: ["episodeId", "podcastId", "tenentId"],
    },
    {
      event: "review",
      fields: ["episodeId", "podcastId", "tenentId"],
    },
    {
      event: "share",
      fields: ["episodeId", "podcastId", "tenentId"],
    },
    {
      event: "view",
      fields: ["episodeId", "podcastId", "tenentId"],
    },
  ];

  const handleFormChange = (e:any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEventChange = (e:any) => {
    setEvent(e.target.value as string);
    setFormData({
      episodeId: formData?.episodeId,
      podcastId: formData?.podcastId,
      tenentId: formData?.tenentId
    }); // Reset form data when event changes
  };

  const selectedEventFields = events.find((ev) => ev.event === event)?.fields || [];

  if (!episode) return <div>Loading...</div>;

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        {episodeTitle}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary">
        Duration: {duration} secs
      </Typography>
      <Typography variant="body1" mt={2}>
        {episode.description}
      </Typography>
      <Box mt={4}>
        <Button variant="contained" color="secondary" onClick={() => router.back()}>
          Back
        </Button>
      </Box>
      <ReactPlayer
        hidden
        url={episode.audio_url}
        progressInterval={1000}
        controls
        onDuration={(duration) => setDuration(duration)}
        onProgress={(progress) => {
          logEvent(analytics, "episode_listened", {
            episode_id: episode.id.toString(),
            experiment_id: experiment?.key,
            variation_id: experimentResult?.variationId,
            user_id: userId.toString(),
            played_seconds: progress.playedSeconds,
            duration,
          });
        }}
        className="mt-4"
        width="100%"
      />
      {/* Events Dropdown */}
      <Select value={event} onChange={handleEventChange} name="Event" displayEmpty key="Event" sx={{mt:2}}>
        {events.map((ev) => (
          <MenuItem key={ev.event} value={ev.event}>
            {ev.event.toUpperCase()}
          </MenuItem>
        ))}
      </Select>

      {/* Dynamic Form Fields */}
      <Formik
        initialValues={formData}
        onSubmit={(values) => {
          console.log("Event submitted:", event, formData);
          posthog.capture(event,{...formData});
        }}
      >
        {() => (
          <Form>
            <Box mt={4} className="flex w-full flex-wrap">
              {selectedEventFields.map((field) => {
                  const isDropdownField = Object.keys(dropdownOptions).includes(field);

                  return isDropdownField ? (
                    <Select
                      key={field}
                      name={field}
                      value={formData[field] || ""}
                      onChange={handleFormChange}
                      // fullWidth
                      variant="outlined"
                      displayEmpty
                      sx={{
                        margin: 2
                      }}
                    >
                      <MenuItem value="" disabled>
                        Select {field}
                      </MenuItem>
                      {(dropdownOptions[field as keyof typeof dropdownOptions] || []).map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  ) : (
                    <TextField
                      key={field}
                      name={field}
                      label={field}
                      variant="outlined"
                      sx={{
                        margin: 2
                      }}
                      onChange={handleFormChange}
                      value={formData[field] || ""}
                    />
                  );
                })}
            </Box>
              <Button type="submit" variant="contained" color="primary" sx={{
                margin: 4
              }}>
                Send
              </Button>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default EpisodePage;
