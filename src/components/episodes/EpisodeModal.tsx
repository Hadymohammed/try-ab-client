"use client";
import React, { useState } from 'react';
import Modal from '@mui/material/Modal';
import { Button, IconButton } from '@mui/material';
import { useForm, useFieldArray } from 'react-hook-form';
import { Add, Remove } from '@mui/icons-material';
import { Episode } from '@/types/episode';
import { GrowthBookService } from '@/services/growthBook.service';

const EpisodeModal = ({ open, onClose, onNewEpisode }: any) => {
  const { register, handleSubmit, reset, control } = useForm({
    defaultValues: {
      titles: [{ value: '' }],
      audio_url: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'titles',
  });

  const handleCreateEpisodeExperiment = async (episode:Episode) => {
    try{
      const experiment = await GrowthBookService.createEpisodeExperiment(episode.id, episode.titles);
      console.log("Experiment created:", experiment);
      episode.titles = experiment.variations.map(v => ({
        variation_id: v.id,
        title: v.value as string
      }));
      const res = await fetch(`/api/episodes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...episode, feature_flag_key: experiment.featureFlagKey, feature_status: experiment.status, experiment_id: experiment.experimentId }),
      });
    } catch (error) {
      console.error("Error creating experiment:", error);
    }
  }

  const onSubmit = async (data: any) => {
    const response = await fetch('/api/episodes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        titles: data.titles.map((t: { value: string }) => ({ title: t.value , variation_id: null })),
        audio_url: data.audio_url,
      }),
    });

    if (response.ok) {
      const episode:Episode = await response.json();
      await handleCreateEpisodeExperiment(episode);      
      reset(); // Reset the form
      await onNewEpisode(); // Call the refresh function
    } else {
      console.error('Failed to add new episode');
    }
  };

  return (
    <Modal open={open} onClose={onClose} className="flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 shadow-lg w-11/12 md:w-1/2 lg:w-1/3">
        <h2 className="text-xl font-bold mb-4">Add New Episode</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center mb-4">
              <input
                type="text"
                placeholder={`Title ${index + 1}`}
                {...register(`titles.${index}.value`, { required: true })}
                className="border border-gray-300 rounded-lg p-2 flex-1"
              />
              <IconButton
                onClick={() => remove(index)}
                disabled={fields.length === 1}
                className="ml-2"
                color="secondary"
              >
                <Remove />
              </IconButton>
            </div>
          ))}
          <Button
            onClick={() => append({ value: '' })}
            className="mb-4"
            color="primary"
            startIcon={<Add />}
          >
            Add Title
          </Button>
          <input
            type="text"
            placeholder="audio url"
            {...register('audio_url', { required: true })}
            className="border border-gray-300 rounded-lg p-2 mb-4 w-full"
          />
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg w-full"
          >
            Add Episode
          </Button>
        </form>
      </div>
    </Modal>
  );
};

export default EpisodeModal;
