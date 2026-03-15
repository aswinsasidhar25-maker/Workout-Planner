import { useState } from 'react'
import { Pause, Play } from 'lucide-react'

const BODY = {
  head: { cx: 50, cy: 18, r: 8 },
  neck: { x1: 50, y1: 26, x2: 50, y2: 30 },
  torso: { x1: 50, y1: 30, x2: 50, y2: 58 },
  hipW: 10,
}

const colors = {
  body: '#818cf8',
  accent: '#f59e0b',
  ground: '#363650',
  weight: '#f59e0b',
}

function StickFigure({ pose, highlight }) {
  const {
    headX = 50, headY = 18,
    shoulderY = 30,
    lArmX1, lArmY1, lArmX2, lArmY2,
    rArmX1, rArmY1, rArmX2, rArmY2,
    hipY = 58,
    lLegX1, lLegY1, lLegX2, lLegY2,
    rLegX1, rLegY1, rLegX2, rLegY2,
    torsoX = 50,
    barbell, bench, weight,
  } = pose

  return (
    <g>
      {bench && (
        <rect x={bench.x} y={bench.y} width={bench.w} height={bench.h} rx="3" fill={colors.ground} />
      )}
      {barbell && (
        <>
          <line x1={barbell.x1} y1={barbell.y} x2={barbell.x2} y2={barbell.y} stroke={colors.weight} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx={barbell.x1} cy={barbell.y} r="4" fill={colors.weight} opacity="0.8" />
          <circle cx={barbell.x2} cy={barbell.y} r="4" fill={colors.weight} opacity="0.8" />
        </>
      )}
      {weight && (
        <rect x={weight.x} y={weight.y} width={weight.w} height={weight.h} rx="2" fill={colors.weight} opacity="0.8" />
      )}
      {/* Torso */}
      <line x1={torsoX} y1={shoulderY} x2={torsoX} y2={hipY} stroke={colors.body} strokeWidth="3" strokeLinecap="round" />
      {/* Left arm */}
      <line x1={torsoX} y1={shoulderY} x2={lArmX1} y2={lArmY1} stroke={highlight === 'arms' ? colors.accent : colors.body} strokeWidth="2.5" strokeLinecap="round" />
      <line x1={lArmX1} y1={lArmY1} x2={lArmX2} y2={lArmY2} stroke={highlight === 'arms' ? colors.accent : colors.body} strokeWidth="2.5" strokeLinecap="round" />
      {/* Right arm */}
      <line x1={torsoX} y1={shoulderY} x2={rArmX1} y2={rArmY1} stroke={highlight === 'arms' ? colors.accent : colors.body} strokeWidth="2.5" strokeLinecap="round" />
      <line x1={rArmX1} y1={rArmY1} x2={rArmX2} y2={rArmY2} stroke={highlight === 'arms' ? colors.accent : colors.body} strokeWidth="2.5" strokeLinecap="round" />
      {/* Left leg */}
      <line x1={torsoX} y1={hipY} x2={lLegX1} y2={lLegY1} stroke={highlight === 'legs' ? colors.accent : colors.body} strokeWidth="2.5" strokeLinecap="round" />
      <line x1={lLegX1} y1={lLegY1} x2={lLegX2} y2={lLegY2} stroke={highlight === 'legs' ? colors.accent : colors.body} strokeWidth="2.5" strokeLinecap="round" />
      {/* Right leg */}
      <line x1={torsoX} y1={hipY} x2={rLegX1} y2={rLegY1} stroke={highlight === 'legs' ? colors.accent : colors.body} strokeWidth="2.5" strokeLinecap="round" />
      <line x1={rLegX1} y1={rLegY1} x2={rLegX2} y2={rLegY2} stroke={highlight === 'legs' ? colors.accent : colors.body} strokeWidth="2.5" strokeLinecap="round" />
      {/* Head */}
      <circle cx={headX} cy={headY} r={BODY.head.r} fill="none" stroke={colors.body} strokeWidth="2.5" />
    </g>
  )
}

const animations = {
  'bench-press': {
    label: 'Pressing Motion',
    highlight: 'arms',
    frames: [
      { headX: 50, headY: 62, shoulderY: 62, torsoX: 50, hipY: 62,
        lArmX1: 35, lArmY1: 50, lArmX2: 35, lArmY2: 38,
        rArmX1: 65, rArmY1: 50, rArmX2: 65, rArmY2: 38,
        lLegX1: 38, lLegY1: 72, lLegX2: 30, lLegY2: 85,
        rLegX1: 62, rLegY1: 72, rLegX2: 70, rLegY2: 85,
        bench: { x: 25, y: 64, w: 50, h: 6 },
        barbell: { x1: 20, x2: 80, y: 38 } },
      { headX: 50, headY: 62, shoulderY: 62, torsoX: 50, hipY: 62,
        lArmX1: 35, lArmY1: 55, lArmX2: 35, lArmY2: 60,
        rArmX1: 65, rArmY1: 55, rArmX2: 65, rArmY2: 60,
        lLegX1: 38, lLegY1: 72, lLegX2: 30, lLegY2: 85,
        rLegX1: 62, rLegY1: 72, rLegX2: 70, rLegY2: 85,
        bench: { x: 25, y: 64, w: 50, h: 6 },
        barbell: { x1: 20, x2: 80, y: 60 } },
    ],
  },
  'push-up': {
    label: 'Push-Up Motion',
    highlight: 'arms',
    frames: [
      { headX: 25, headY: 35, shoulderY: 40, torsoX: 35, hipY: 55,
        lArmX1: 25, lArmY1: 52, lArmX2: 25, lArmY2: 65,
        rArmX1: 25, rArmY1: 52, rArmX2: 25, rArmY2: 65,
        lLegX1: 55, lLegY1: 62, lLegX2: 75, lLegY2: 65,
        rLegX1: 55, rLegY1: 62, rLegX2: 75, rLegY2: 65 },
      { headX: 25, headY: 52, shoulderY: 55, torsoX: 40, hipY: 60,
        lArmX1: 22, lArmY1: 60, lArmX2: 22, lArmY2: 65,
        rArmX1: 22, rArmY1: 60, rArmX2: 22, rArmY2: 65,
        lLegX1: 58, lLegY1: 63, lLegX2: 75, lLegY2: 65,
        rLegX1: 58, rLegY1: 63, rLegX2: 75, rLegY2: 65 },
    ],
  },
  'overhead-press': {
    label: 'Press Overhead',
    highlight: 'arms',
    frames: [
      { headX: 50, headY: 18, shoulderY: 30,
        lArmX1: 38, lArmY1: 28, lArmX2: 35, lArmY2: 15,
        rArmX1: 62, rArmY1: 28, rArmX2: 65, rArmY2: 15,
        hipY: 58,
        lLegX1: 42, lLegY1: 72, lLegX2: 42, lLegY2: 88,
        rLegX1: 58, rLegY1: 72, rLegX2: 58, rLegY2: 88,
        barbell: { x1: 20, x2: 80, y: 12 } },
      { headX: 50, headY: 18, shoulderY: 30,
        lArmX1: 36, lArmY1: 35, lArmX2: 34, lArmY2: 30,
        rArmX1: 64, rArmY1: 35, rArmX2: 66, rArmY2: 30,
        hipY: 58,
        lLegX1: 42, lLegY1: 72, lLegX2: 42, lLegY2: 88,
        rLegX1: 58, rLegY1: 72, rLegX2: 58, rLegY2: 88,
        barbell: { x1: 20, x2: 80, y: 28 } },
    ],
  },
  'lateral-raise': {
    label: 'Raise to Sides',
    highlight: 'arms',
    frames: [
      { headX: 50, headY: 18, shoulderY: 30,
        lArmX1: 38, lArmY1: 42, lArmX2: 38, lArmY2: 55,
        rArmX1: 62, rArmY1: 42, rArmX2: 62, rArmY2: 55,
        hipY: 58,
        lLegX1: 42, lLegY1: 72, lLegX2: 42, lLegY2: 88,
        rLegX1: 58, rLegY1: 72, rLegX2: 58, rLegY2: 88 },
      { headX: 50, headY: 18, shoulderY: 30,
        lArmX1: 25, lArmY1: 30, lArmX2: 12, lArmY2: 30,
        rArmX1: 75, rArmY1: 30, rArmX2: 88, rArmY2: 30,
        hipY: 58,
        lLegX1: 42, lLegY1: 72, lLegX2: 42, lLegY2: 88,
        rLegX1: 58, rLegY1: 72, rLegX2: 58, rLegY2: 88 },
    ],
  },
  'curl': {
    label: 'Curl Motion',
    highlight: 'arms',
    frames: [
      { headX: 50, headY: 18, shoulderY: 30,
        lArmX1: 40, lArmY1: 42, lArmX2: 40, lArmY2: 55,
        rArmX1: 60, rArmY1: 42, rArmX2: 60, rArmY2: 55,
        hipY: 58,
        lLegX1: 42, lLegY1: 72, lLegX2: 42, lLegY2: 88,
        rLegX1: 58, rLegY1: 72, rLegX2: 58, rLegY2: 88,
        weight: { x: 34, y: 53, w: 12, h: 5 } },
      { headX: 50, headY: 18, shoulderY: 30,
        lArmX1: 40, lArmY1: 38, lArmX2: 42, lArmY2: 30,
        rArmX1: 60, rArmY1: 38, rArmX2: 58, rArmY2: 30,
        hipY: 58,
        lLegX1: 42, lLegY1: 72, lLegX2: 42, lLegY2: 88,
        rLegX1: 58, rLegY1: 72, rLegX2: 58, rLegY2: 88,
        weight: { x: 36, y: 26, w: 12, h: 5 } },
    ],
  },
  'pulldown': {
    label: 'Pull Down',
    highlight: 'arms',
    frames: [
      { headX: 50, headY: 25, shoulderY: 37,
        lArmX1: 30, lArmY1: 25, lArmX2: 25, lArmY2: 12,
        rArmX1: 70, rArmY1: 25, rArmX2: 75, rArmY2: 12,
        hipY: 58,
        lLegX1: 38, lLegY1: 72, lLegX2: 35, lLegY2: 88,
        rLegX1: 62, rLegY1: 72, rLegX2: 65, rLegY2: 88 },
      { headX: 50, headY: 25, shoulderY: 37,
        lArmX1: 35, lArmY1: 40, lArmX2: 30, lArmY2: 37,
        rArmX1: 65, rArmY1: 40, rArmX2: 70, rArmY2: 37,
        hipY: 58,
        lLegX1: 38, lLegY1: 72, lLegX2: 35, lLegY2: 88,
        rLegX1: 62, rLegY1: 72, rLegX2: 65, rLegY2: 88 },
    ],
  },
  'row': {
    label: 'Rowing Motion',
    highlight: 'arms',
    frames: [
      { headX: 35, headY: 22, shoulderY: 32, torsoX: 45, hipY: 55,
        lArmX1: 32, lArmY1: 42, lArmX2: 25, lArmY2: 52,
        rArmX1: 32, rArmY1: 42, rArmX2: 25, rArmY2: 52,
        lLegX1: 55, lLegY1: 68, lLegX2: 55, lLegY2: 88,
        rLegX1: 62, rLegY1: 68, rLegX2: 62, rLegY2: 88 },
      { headX: 35, headY: 22, shoulderY: 32, torsoX: 45, hipY: 55,
        lArmX1: 38, lArmY1: 38, lArmX2: 42, lArmY2: 35,
        rArmX1: 38, rArmY1: 38, rArmX2: 42, rArmY2: 35,
        lLegX1: 55, lLegY1: 68, lLegX2: 55, lLegY2: 88,
        rLegX1: 62, rLegY1: 68, rLegX2: 62, rLegY2: 88 },
    ],
  },
  'squat': {
    label: 'Squat Motion',
    highlight: 'legs',
    frames: [
      { headX: 50, headY: 18, shoulderY: 30,
        lArmX1: 38, lArmY1: 35, lArmX2: 32, lArmY2: 30,
        rArmX1: 62, rArmY1: 35, rArmX2: 68, rArmY2: 30,
        hipY: 58,
        lLegX1: 42, lLegY1: 72, lLegX2: 42, lLegY2: 88,
        rLegX1: 58, rLegY1: 72, rLegX2: 58, rLegY2: 88,
        barbell: { x1: 20, x2: 80, y: 28 } },
      { headX: 50, headY: 38, shoulderY: 48,
        lArmX1: 38, lArmY1: 52, lArmX2: 32, lArmY2: 48,
        rArmX1: 62, rArmY1: 52, rArmX2: 68, rArmY2: 48,
        hipY: 68,
        lLegX1: 35, lLegY1: 78, lLegX2: 30, lLegY2: 88,
        rLegX1: 65, rLegY1: 78, rLegX2: 70, rLegY2: 88,
        barbell: { x1: 20, x2: 80, y: 46 } },
    ],
  },
  'lunge': {
    label: 'Lunge Motion',
    highlight: 'legs',
    frames: [
      { headX: 50, headY: 18, shoulderY: 30,
        lArmX1: 42, lArmY1: 42, lArmX2: 42, lArmY2: 55,
        rArmX1: 58, rArmY1: 42, rArmX2: 58, rArmY2: 55,
        hipY: 58,
        lLegX1: 42, lLegY1: 72, lLegX2: 42, lLegY2: 88,
        rLegX1: 58, rLegY1: 72, rLegX2: 58, rLegY2: 88 },
      { headX: 50, headY: 30, shoulderY: 42,
        lArmX1: 42, lArmY1: 52, lArmX2: 42, lArmY2: 62,
        rArmX1: 58, rArmY1: 52, rArmX2: 58, rArmY2: 62,
        hipY: 65,
        lLegX1: 32, lLegY1: 78, lLegX2: 25, lLegY2: 88,
        rLegX1: 65, rLegY1: 78, rLegX2: 72, rLegY2: 88 },
    ],
  },
  'deadlift': {
    label: 'Hinge Motion',
    highlight: 'legs',
    frames: [
      { headX: 50, headY: 18, shoulderY: 30,
        lArmX1: 42, lArmY1: 42, lArmX2: 42, lArmY2: 55,
        rArmX1: 58, rArmY1: 42, rArmX2: 58, rArmY2: 55,
        hipY: 58,
        lLegX1: 42, lLegY1: 72, lLegX2: 42, lLegY2: 88,
        rLegX1: 58, rLegY1: 72, rLegX2: 58, rLegY2: 88,
        barbell: { x1: 25, x2: 75, y: 55 } },
      { headX: 40, headY: 35, shoulderY: 42, torsoX: 48, hipY: 60,
        lArmX1: 38, lArmY1: 55, lArmX2: 38, lArmY2: 70,
        rArmX1: 52, rArmY1: 55, rArmX2: 52, rArmY2: 70,
        lLegX1: 42, lLegY1: 74, lLegX2: 42, lLegY2: 88,
        rLegX1: 58, rLegY1: 74, rLegX2: 58, rLegY2: 88,
        barbell: { x1: 22, x2: 68, y: 72 } },
    ],
  },
  'hip-thrust': {
    label: 'Hip Drive',
    highlight: 'legs',
    frames: [
      { headX: 28, headY: 50, shoulderY: 55, torsoX: 40, hipY: 65,
        lArmX1: 32, lArmY1: 60, lArmX2: 28, lArmY2: 68,
        rArmX1: 45, rArmY1: 60, rArmX2: 48, rArmY2: 68,
        lLegX1: 52, lLegY1: 72, lLegX2: 62, lLegY2: 85,
        rLegX1: 55, rLegY1: 72, rLegX2: 68, rLegY2: 85,
        bench: { x: 15, y: 52, w: 22, h: 6 } },
      { headX: 28, headY: 45, shoulderY: 50, torsoX: 42, hipY: 55,
        lArmX1: 32, lArmY1: 55, lArmX2: 28, lArmY2: 62,
        rArmX1: 48, rArmY1: 55, rArmX2: 52, rArmY2: 62,
        lLegX1: 55, lLegY1: 68, lLegX2: 62, lLegY2: 85,
        rLegX1: 58, rLegY1: 68, rLegX2: 68, rLegY2: 85,
        bench: { x: 15, y: 52, w: 22, h: 6 },
        barbell: { x1: 30, x2: 60, y: 53 } },
    ],
  },
  'plank': {
    label: 'Hold Position',
    highlight: 'arms',
    frames: [
      { headX: 22, headY: 42, shoulderY: 48, torsoX: 40, hipY: 55,
        lArmX1: 28, lArmY1: 58, lArmX2: 22, lArmY2: 68,
        rArmX1: 28, rArmY1: 58, rArmX2: 22, rArmY2: 68,
        lLegX1: 58, lLegY1: 58, lLegX2: 78, lLegY2: 62,
        rLegX1: 58, rLegY1: 58, rLegX2: 78, rLegY2: 62 },
      { headX: 22, headY: 44, shoulderY: 50, torsoX: 40, hipY: 57,
        lArmX1: 28, lArmY1: 60, lArmX2: 22, lArmY2: 68,
        rArmX1: 28, rArmY1: 60, rArmX2: 22, rArmY2: 68,
        lLegX1: 58, lLegY1: 60, lLegX2: 78, lLegY2: 64,
        rLegX1: 58, rLegY1: 60, rLegX2: 78, rLegY2: 64 },
    ],
  },
  'crunch': {
    label: 'Crunch Motion',
    highlight: 'arms',
    frames: [
      { headX: 30, headY: 55, shoulderY: 60, torsoX: 45, hipY: 68,
        lArmX1: 35, lArmY1: 55, lArmX2: 28, lArmY2: 50,
        rArmX1: 42, rArmY1: 55, rArmX2: 38, rArmY2: 50,
        lLegX1: 55, lLegY1: 60, lLegX2: 62, lLegY2: 50,
        rLegX1: 58, rLegY1: 60, rLegX2: 68, rLegY2: 50 },
      { headX: 38, headY: 48, shoulderY: 55, torsoX: 48, hipY: 68,
        lArmX1: 42, lArmY1: 50, lArmX2: 38, lArmY2: 44,
        rArmX1: 48, rArmY1: 50, rArmX2: 45, rArmY2: 44,
        lLegX1: 55, lLegY1: 60, lLegX2: 62, lLegY2: 50,
        rLegX1: 58, rLegY1: 60, rLegX2: 68, rLegY2: 50 },
    ],
  },
  'running': {
    label: 'Running Motion',
    highlight: 'legs',
    frames: [
      { headX: 50, headY: 15, shoulderY: 28,
        lArmX1: 42, lArmY1: 35, lArmX2: 35, lArmY2: 28,
        rArmX1: 58, rArmY1: 38, rArmX2: 65, rArmY2: 45,
        hipY: 55,
        lLegX1: 42, lLegY1: 65, lLegX2: 35, lLegY2: 78,
        rLegX1: 58, rLegY1: 68, rLegX2: 65, rLegY2: 85 },
      { headX: 50, headY: 15, shoulderY: 28,
        lArmX1: 58, lArmY1: 38, lArmX2: 65, lArmY2: 45,
        rArmX1: 42, rArmY1: 35, rArmX2: 35, rArmY2: 28,
        hipY: 55,
        lLegX1: 58, lLegY1: 68, lLegX2: 65, lLegY2: 85,
        rLegX1: 42, rLegY1: 65, rLegX2: 35, rLegY2: 78 },
    ],
  },
  'jumping': {
    label: 'Jump Motion',
    highlight: 'legs',
    frames: [
      { headX: 50, headY: 10, shoulderY: 22,
        lArmX1: 32, lArmY1: 18, lArmX2: 22, lArmY2: 12,
        rArmX1: 68, rArmY1: 18, rArmX2: 78, rArmY2: 12,
        hipY: 45,
        lLegX1: 42, lLegY1: 55, lLegX2: 38, lLegY2: 65,
        rLegX1: 58, rLegY1: 55, rLegX2: 62, rLegY2: 65 },
      { headX: 50, headY: 35, shoulderY: 48,
        lArmX1: 38, lArmY1: 52, lArmX2: 35, lArmY2: 58,
        rArmX1: 62, rArmY1: 52, rArmX2: 65, rArmY2: 58,
        hipY: 65,
        lLegX1: 38, lLegY1: 78, lLegX2: 35, lLegY2: 88,
        rLegX1: 62, rLegY1: 78, rLegX2: 65, rLegY2: 88 },
    ],
  },
}

export default function ExerciseAnimation({ animationType, compact = false }) {
  const [playing, setPlaying] = useState(true)
  const anim = animations[animationType] || animations['squat']
  const height = compact ? 120 : 180

  return (
    <div className="relative rounded-xl overflow-hidden bg-bg border border-surface-lighter">
      <svg
        viewBox="0 0 100 95"
        className="w-full"
        style={{ height }}
      >
        {/* Ground line */}
        <line x1="5" y1="90" x2="95" y2="90" stroke={colors.ground} strokeWidth="1" strokeDasharray="4,3" />

        {/* Animated figure using CSS transitions */}
        <g>
          <style>{`
            .anim-pose { transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
            @keyframes figureMove {
              0%, 100% { opacity: 1; }
              49% { opacity: 1; }
              50% { opacity: 0; }
              51% { opacity: 0; }
            }
            .frame-a { animation: ${playing ? 'figureMove 2s ease-in-out infinite' : 'none'}; }
            .frame-b { animation: ${playing ? 'figureMove 2s ease-in-out infinite reverse' : 'none'}; opacity: ${playing ? 1 : 0}; }
          `}</style>
          <g className="frame-a">
            <StickFigure pose={anim.frames[0]} highlight={anim.highlight} />
          </g>
          <g className="frame-b">
            <StickFigure pose={anim.frames[1]} highlight={anim.highlight} />
          </g>
        </g>

        {/* Label */}
        <text x="50" y="8" textAnchor="middle" fill="#64748b" fontSize="5" fontFamily="Inter, sans-serif" fontWeight="600">
          {anim.label}
        </text>
      </svg>

      {/* Play/Pause */}
      <button
        onClick={() => setPlaying(!playing)}
        className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-surface-lighter/80 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
      >
        {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
      </button>
    </div>
  )
}
