// src/app/api/episodes/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const filePath = path.join(process.cwd(), 'src', 'data', 'episodes.json');
  const fileContent = await fs.promises.readFile(filePath, 'utf-8');
  const episodes = JSON.parse(fileContent);
  return NextResponse.json(episodes);
}

export async function POST(req: Request) {
  const filePath = path.join(process.cwd(), 'src', 'data', 'episodes.json');
  const fileContent = await fs.promises.readFile(filePath, 'utf-8');
  const episodes = JSON.parse(fileContent);

  const newEpisode = await req.json();
  const newId = episodes.length ? episodes[episodes.length - 1].id + 1 : 1;
  newEpisode.id = newId;
  const updatedEpisodes = [...episodes, newEpisode];

  await fs.promises.writeFile(filePath, JSON.stringify(updatedEpisodes, null, 2));
  return NextResponse.json(newEpisode);
}

// add update 
export async function PUT(req: Request) {
    const filePath = path.join(process.cwd(), 'src', 'data', 'episodes.json');
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    const episodes = JSON.parse(fileContent);

    const updatedEpisode = await req.json();
    const updatedEpisodes = episodes.map((episode:any) =>
        episode.id === updatedEpisode.id ? updatedEpisode : episode
    );
    await fs.promises .writeFile(filePath, JSON.stringify(updatedEpisodes, null, 2));
    return NextResponse.json(updatedEpisode);
}