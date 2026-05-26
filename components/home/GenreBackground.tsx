'use client'

import { useState } from 'react'
import { GenreKey } from '@/types/genre'
import XuanhuanBackground from './backgrounds/XuanhuanBackground'
import MysteryBackground from './backgrounds/MysteryBackground'
import AncientBackground from './backgrounds/AncientBackground'
import MagicBackground from './backgrounds/MagicBackground'
import UrbanBackground from './backgrounds/UrbanBackground'
import HorrorBackground from './backgrounds/HorrorBackground'
import ScifiBackground from './backgrounds/ScifiBackground'
import ApocalypseBackground from './backgrounds/ApocalypseBackground'
import RandomBackground from './backgrounds/RandomBackground'

interface Props {
  hoveredGenre: GenreKey | 'random' | null
}

export default function GenreBackground({ hoveredGenre }: Props) {
  return (
    <div
      className="transition-opacity duration-500"
      style={{ opacity: hoveredGenre ? 1 : 0 }}
    >
      {hoveredGenre === 'xuanhuan' && <XuanhuanBackground />}
      {hoveredGenre === 'mystery' && <MysteryBackground />}
      {hoveredGenre === 'ancient' && <AncientBackground />}
      {hoveredGenre === 'magic' && <MagicBackground />}
      {hoveredGenre === 'urban' && <UrbanBackground />}
      {hoveredGenre === 'horror' && <HorrorBackground />}
      {hoveredGenre === 'scifi' && <ScifiBackground />}
      {hoveredGenre === 'apocalypse' && <ApocalypseBackground />}
      {hoveredGenre === 'random' && <RandomBackground />}
    </div>
  )
}