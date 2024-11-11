"use client"; 
import { BarChart } from "@mui/x-charts/BarChart";
import { Box, Button, Card, CardContent, MenuItem, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Episode } from "../../../types/episode";
import { usePostHog } from "posthog-js/react";
import { useFeature, useFeatureValue } from "@growthbook/growthbook-react";
import { GrowthBookService, IExperimentResult } from "@/services/growthBook.service";
import ReactPlayer from "react-player";
import { logEvent } from "firebase/analytics";
import { analytics, userId } from "@/app/layout";
import { Formik, Form, Field, useFormikContext } from "formik";
import * as Yup from "yup";

interface EpisodePageProps {
  params: { id: string };
}

const EpisodeSchema = Yup.object().shape({
  episodeId: Yup.number().required("Episode ID is required"),
  podcastId: Yup.number().required("Podcast ID is required"),
  tenentId: Yup.number().required("Tenant ID is required"),
  event: Yup.string().required("Event is required"),
  browser: Yup.string(),
  device_id: Yup.string(),
  device_type: Yup.string(),
  geoip_city_name: Yup.string(),
  geoip_continent_name: Yup.string(),
  geoip_country_name: Yup.string(),
  geoip_time_zone: Yup.string(),
  os: Yup.string(),
  referrer: Yup.string(),
  person_id: Yup.string(),
  timestamp: Yup.date().required("Timestamp is required"),
  host: Yup.string(),
  time: Yup.string().required("Time is required"),
  total_episode_duration: Yup.string().required("Total episode duration is required"),
  app: Yup.string().required("App is required"),
  isRadioSubscriber: Yup.bool().required("Radio subscriber status is required"),
});

const EpisodePage = ({ params }: EpisodePageProps) => {
  const router = useRouter();
  const { id } = params;
  

  const [episode, setEpisode] = useState<Episode | null>(null);
  const [episodeTitle, setEpisodeTitle] = useState<string | null>(null);
  const [results, setResult] = useState<IExperimentResult | null>(null);
  const [duration , setDuration] = useState<number | null>(null);

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

  const getTitleForVariation = (variationId: string) => {
    return episode?.titles.find((title) => title.variation_id === variationId)?.title || "Unknown Title";
  };

  if (!episode) return <div>Loading...</div>;

  const EventButton = ({label, event}:{label:string, event:string}) => {
    const { values } = useFormikContext();
  
    const handleSendEvent = () => {
      // console.log(event, values);
      posthog.capture(event, {
        ...(values as any)
      });
    };
  
    return (
      <Button
        variant="contained"
        color="info"
        onClick={handleSendEvent}
        sx={{ ml: 2 }}
      >
        {label}
      </Button>
    );
  };
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
        <Button
          variant="contained"
          color="secondary"
          onClick={() => router.back()}
        >
          Back
        </Button>
      </Box>
      <ReactPlayer
        url={episode.audio_url}
        progressInterval={1000}
        controls
        onDuration={(duration) => {
          console.log("Episode duration:", duration);
          setDuration(duration);
        }}
        onProgress={(progress) => {
          logEvent(analytics, "episode_listened", {
            episode_id: episode.id.toString(),
            experiment_id: experiment?.key,
            variation_id: experimentResult?.variationId,
            user_id: userId.toString(),
            played_seconds: progress.playedSeconds,
            duration: duration,
          })
        }}
        className="mt-4"
        width="100%"
      />
      
      
      <Formik
        className="m-2"
        initialValues={{
          episodeId: "",
          podcastId: "",
          tenentId: "",
          browser: "",
          device_id: "",
          device_type: "",
          geoip_city_name: "",
          geoip_continent_name: "",
          geoip_country_name: "",
          // geoip_time_zone: "",
          os: "",
          referrer: "",
          person_id: "",
          time:0,
          timestamp: new Date().toISOString(),
          host: "",
          total_episode_duration: "600",
          app: "",
          isRadioSubscriber: false,
        }}
        validationSchema={EpisodeSchema}
        onSubmit={()=>{}}
      >
        {({ errors, touched }) => (
          <Form>
            <Box className="flex justify-around flex-wrap">
              <EventButton label="Episode Download" event="download"/>
              <EventButton label="Episode Impression" event="impression"/>
              <EventButton label="Episode Click" event="click"/>
              <EventButton label="Episode Play" event="play"/>
              <EventButton label="Episode Like" event="like"/>
              <EventButton label="Episode Review" event="review"/>
              <EventButton label="Episode Share" event="share"/>
              <EventButton label="Episode View" event="view"/>
            </Box>
            <Card sx={{ mt: 4, p: 3 }}>
              <CardContent>
                <Field name="episodeId" as={TextField} label="Episode ID" fullWidth margin="normal" />
                <Field name="podcastId" as={TextField} label="Podcast ID" fullWidth margin="normal" />
                <Field name="tenentId" as={TextField} label="Tenant ID" fullWidth margin="normal" />
                <Field name="person_id" as={TextField} label="Person ID" fullWidth margin="normal" />

                <Field name="browser" as={TextField} label="Browser" fullWidth margin="normal" >
                  <MenuItem value={"Chrome"}>Chrome</MenuItem>
                  <MenuItem value={"Safari"}>Safari</MenuItem>
                  <MenuItem value={"Opera"}>Opera</MenuItem>
                </Field>

                <Field name="device_id" as={TextField} label="Device ID" fullWidth margin="normal" />
                <Field name="device_type" as={TextField} label="Device Type" fullWidth margin="normal" />
                <Field name="geoip_country_name" as={TextField} label="Country" fullWidth margin="normal" />
                <Field name="geoip_city_name" as={TextField} label="City" fullWidth margin="normal" />
                <Field name="geoip_continent_name" as={TextField} label="Continent" fullWidth margin="normal" />

                <Field name="os" as={TextField} select label="Operating System" fullWidth margin="normal" >
                  <MenuItem value={"IOS"}>IOS</MenuItem>
                  <MenuItem value={"Android"}>Android</MenuItem>
                  <MenuItem value={"Windows"}>Windows</MenuItem>
                </Field>
                <Field name="time" as={TextField} label="Listen Time" fullWidth margin="normal" />

                <Field name="isRadioSubscriber" as={TextField} label="Radio Subscriber" select fullWidth margin="normal">
                  <MenuItem value={"true"}>Yes</MenuItem>
                  <MenuItem value={"false"}>No</MenuItem>
                </Field>
                <Field name="referrer" as={TextField} label="Referrer" select fullWidth margin="normal">
                  <MenuItem value={"X"}>X</MenuItem>
                  <MenuItem value={"Instagram"}>instagram</MenuItem>
                </Field>
                <Field name="app" as={TextField} label="App" select fullWidth margin="normal">
                  <MenuItem value={"Radio"}>Radio</MenuItem>
                  <MenuItem value={"Apple Podcast"}>Apple Podcast</MenuItem>
                </Field>
                <Box mt={4}>
                  <Button type="submit" variant="contained" color="primary">
                    Submit
                  </Button>
                  <Button variant="contained" color="secondary" onClick={() => router.back()} sx={{ ml: 2 }}>
                    Back
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Form>
        )}
      </Formik>
      {/* {results && (
        <Box mt={6}>
          <Typography variant="h5" gutterBottom>
            Experiment Results
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Total Users: {results.totalUsers}
          </Typography>

          {/* Display variations with titles */}
          {/* {results.metrics[0].variations.map((variation) => (
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
          ))} */}

          {/* Display a simple bar chart for user counts */}
          {/* <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Click Distribution per Title
            </Typography>
            <BarChart
              width={600}
              height={300}
              xAxis={[
                {
                  id: "titles",
                  data: results.metrics[0].variations.map((v) => getTitleForVariation(v.variationId)),
                  label: "Titles",
                  scaleType: "band",
                },
              ]}
              series={[
                {
                  data: results.metrics[0].variations.map((v) => v.analyses[0].denominator),
                  label: "Total Users",
                  color: "rgba(63, 81, 181, 0.6)",
                  xAxisKey: "titles",
                },
                {
                  data: results.metrics[0].variations.map((v) => v.analyses[0].numerator),
                  label: "Users Clicked",
                  color: "rgba(76, 175, 80, 0.6)",
                  xAxisKey: "titles",
                },
              ]}
              layout="vertical"
            />
          </Box> */}
        {/* </Box> */}
      {/* )}  */}
    </Box>
  );
};
export default EpisodePage;
