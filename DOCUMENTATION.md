# FitOne - Documentation

> A comprehensive workout planning and fitness tracking web application.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Pages](#pages)
- [State Management](#state-management)
- [Data Models](#data-models)
- [Workout Plan Generation](#workout-plan-generation)
- [Utilities & Services](#utilities--services)
- [Theme & Design](#theme--design)
- [Configuration & Deployment](#configuration--deployment)
- [Changelog](#changelog)

---

## Overview

FitOne is a modern, feature-rich fitness application that provides personalized workout plan generation, exercise browsing, progress analytics, weight tracking with BMI calculations, cloud synchronization via Google Drive, and an achievement badge system. The app supports 270+ exercises across 10 muscle groups.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 19.2.4 | UI framework |
| React Router | 7.13.1 | Client-side routing |
| Vite | 6.3.5 | Build tool & dev server |
| Tailwind CSS | 4.2.1 | Utility-first styling |
| Framer Motion | 12.36.0 | Animations & transitions |
| Recharts | 3.8.0 | Charts & data visualization |
| Lucide React | 0.577.0 | Icon library |
| ESLint | 9.39.4 | Code linting |

---

## Project Structure

```
/
├── index.html                          # Entry HTML (title, meta tags, Google sign-in script)
├── package.json                        # Dependencies & scripts
├── vite.config.js                      # Vite + React + Tailwind config
├── eslint.config.js                    # ESLint rules
├── public/
│   └── exercises/                      # Exercise images (60+ images)
└── src/
    ├── main.jsx                        # App entry point
    ├── App.jsx                         # Router configuration
    ├── index.css                       # Tailwind theme, custom properties, animations
    ├── pages/
    │   ├── Onboarding.jsx              # 8-step setup wizard
    │   ├── Dashboard.jsx               # Home page with stats, badges, streak
    │   ├── WorkoutPlan.jsx             # Daily workout execution
    │   ├── ExerciseLibrary.jsx         # Browse 270+ exercises
    │   ├── Progress.jsx                # Analytics, weight tracker, BMI
    │   └── Profile.jsx                 # User settings & preferences
    ├── components/
    │   ├── ExerciseCard.jsx            # Reusable exercise display card
    │   ├── Layout.jsx                  # App shell (header, nav, content)
    │   └── SyncStatusIndicator.jsx     # Cloud sync status display
    ├── context/
    │   ├── AppContext.jsx              # Central state management (useReducer)
    │   └── GoogleAuthContext.jsx       # Google OAuth & Drive sync
    ├── data/
    │   ├── exercises.js                # 270+ exercise definitions
    │   └── exerciseImages.js           # Exercise-to-image mapping
    ├── services/
    │   └── googleDriveService.js       # Google Drive API operations
    └── utils/
        └── calories.js                 # MET-based calorie calculator, unit converters
```

---

## Features

### Personalized Workout Plans
- Algorithm generates plans based on user goals, fitness level, available days, and session duration
- Split templates: Full Body, Upper/Lower, Push/Pull/Legs (adapts to 3-6 day schedules)
- Exercises filtered by gender, difficulty, and goal compatibility
- One-tap plan regeneration

### Exercise Library
- 270+ exercises across 10 muscle groups
- Search and filter by muscle group, difficulty, and equipment
- Detailed exercise info: description, secondary muscles, pro tips, calorie estimates
- Exercise images with fallback to muscle group images

### Real-Time Workout Tracking
- Set-by-set completion tracking with visual feedback
- Weight adjustment per exercise (+/- 2.5 kg)
- Add/remove/replace exercises during workout
- Log completed workouts with celebration animation

### Progress Analytics
- Overview stats: workouts, sets, calories, volume, reps, streak
- Weekly workouts bar chart (8-week history)
- Calorie burn chart with daily/weekly toggle
- Volume trend line chart (14-day)
- Muscle distribution pie chart

### Weight Tracker
- Log daily weight entries (future dates blocked)
- Weight journey area chart with target weight reference line
- Weight goal setting (lose/gain/maintain) with progress tracking
- Stats: current weight, remaining to goal, % to shed, progress bar

### BMI Calculator
- Dynamic BMI calculation based on latest weight log entry
- Visual BMI scale bar with category indicator (Underweight/Normal/Overweight/Obese)
- Ideal weight range for user's height
- Expandable info section with BMI scale explanation
- Updates automatically when new weight is logged

### Achievement Badges
| Badge | Requirement |
|---|---|
| First Step | Complete 1 workout |
| Getting Started | Complete 3 workouts |
| Dedicated | Complete 10 workouts |
| Powerhouse | Complete 25 workouts |
| On a Roll | 3-day streak |
| Week Warrior | 7-day streak |
| Full Timer | Workouts on 5 different days |

### Cloud Sync
- Google Drive integration (app data folder)
- Auto-sync on state changes
- Real-time sync status indicator (syncing/saved/error)
- Cross-device data access
- Sign in/out from Profile page

---

## Pages

### 1. Onboarding (`/src/pages/Onboarding.jsx`)
8-step setup wizard:
1. Welcome + name input + optional Google Sign-In
2. Gender selection (Male/Female)
3. Body measurements (height in cm, weight in kg) - optional
4. Fitness goals (multi-select: Build Muscle, Lose Weight, Strength, Tone, Endurance)
5. Fitness level (Beginner, Intermediate, Advanced)
6. Session duration (30/45/60/90 min)
7. Training days (minimum 3 days)
8. Summary review

### 2. Dashboard (`/src/pages/Dashboard.jsx`)
- Personalized greeting with rotating motivational quotes
- Streak tracker with personal best
- Stats: daily calories, today's sets, weekly workouts, total workouts
- Achievement badges grid
- Today's workout preview
- Weekly overview with day indicators
- Goals display with training parameters

### 3. Workout Plan (`/src/pages/WorkoutPlan.jsx`)
- Day selector tabs
- Exercise cards with set tracking, weight controls, tips
- Add exercise modal (filterable by muscle group)
- Log workout with celebration modal
- Plan regeneration

### 4. Exercise Library (`/src/pages/ExerciseLibrary.jsx`)
- Search bar with real-time filtering
- Filters: muscle group, difficulty, equipment
- Exercise grid with detail modals
- Personalized calorie estimates

### 5. Progress (`/src/pages/Progress.jsx`)
- Workout analytics charts (weekly workouts, calories, volume, muscle distribution)
- Weight Tracker section (BMI, goal, log form, chart, entries)
- All charts built with Recharts

### 6. Profile (`/src/pages/Profile.jsx`)
- Account info & Google Cloud Sync
- Body measurements editor
- Weight tracker toggle
- Goals, training days, duration, fitness level editors
- Regenerate plan & reset app actions

---

## State Management

Central state managed via React Context + `useReducer` in `AppContext.jsx`.

### Key Actions

| Action | Description |
|---|---|
| `SET_PROFILE` | Initialize/update user profile |
| `REGENERATE_PLAN` | Generate new workout plan |
| `UPDATE_EXERCISE_IN_PLAN` | Modify exercise sets/reps/weight |
| `TOGGLE_SET_COMPLETE` | Mark individual set done |
| `LOG_WORKOUT` | Record completed workout, update streak & badges |
| `REPLACE_EXERCISE` | Swap exercise in plan |
| `ADD_EXERCISE_TO_DAY` | Add exercise to day's plan |
| `REMOVE_EXERCISE_FROM_DAY` | Remove exercise from plan |
| `ADD_WEIGHT_ENTRY` | Log weight for a date |
| `DELETE_WEIGHT_ENTRY` | Remove weight log entry |
| `SET_WEIGHT_GOAL` | Set/clear target weight |
| `TOGGLE_WEIGHT_TRACKER` | Enable/disable weight tracker |
| `ADD_CUSTOM_EXERCISE` | Add user-defined exercise |
| `IMPORT_STATE` | Import state from cloud sync |

### Persistence
- State saved to `localStorage` key: `onefit-state`
- Auto-migration from legacy keys: `zenfit-state`, `fitforge-state`
- Cloud backup via Google Drive app data folder

---

## Data Models

### Profile
```javascript
{
  name: string,
  gender: 'male' | 'female',
  goals: string[],           // ['build_muscle', 'lose_weight', 'strength', 'tone', 'endurance']
  fitnessLevel: string,      // 'beginner' | 'intermediate' | 'advanced'
  duration: number,           // 30 | 45 | 60 | 90 (minutes)
  workoutDays: string[],     // ['Monday', 'Wednesday', 'Friday']
  height: number | null,     // cm
  weight: number | null,     // kg
}
```

### Exercise
```javascript
{
  id: string,
  name: string,
  muscle: string,            // Primary muscle group ID
  secondary: string[],       // Secondary muscle group IDs
  difficulty: string,        // 'beginner' | 'intermediate' | 'advanced'
  equipment: string,
  type: string,              // 'strength' | 'cardio'
  description: string,
  tips: string[],
  calories: number,
  gender: string,            // 'both' | 'male' | 'female'
  goals: string[],
}
```

### Workout Plan
```javascript
{
  [day: string]: {
    name: string,            // e.g. "Push Day"
    exercises: [{
      exerciseId: string,
      sets: number,
      reps: number,
      weight: number,
      rest: number,          // seconds
      completed: boolean[],  // per-set tracking
    }],
    isRest: boolean,
  }
}
```

### Weight Log
```javascript
{
  [date: string]: {          // "2026-03-20"
    weight: number,          // kg
  }
}
```

### Weight Goal
```javascript
{
  targetWeight: number,      // kg
  type: string,              // 'lose' | 'gain' | 'maintain'
}
```

---

## Workout Plan Generation

Algorithm in `AppContext.jsx` → `generateWorkoutPlan()`:

1. Select split template based on number of training days:
   - 3 days → Full Body A/B/C
   - 4 days → Upper/Lower splits
   - 5 days → Push/Pull/Legs + Upper/Lower
   - 6 days → Push/Pull/Legs x2

2. Determine exercise parameters from goal configs:
   - Build Muscle: 3-5 sets, 6-12 reps, 90s rest
   - Lose Weight: 3-4 sets, 12-20 reps, 45s rest
   - Build Strength: 4-6 sets, 3-6 reps, 180s rest
   - Tone & Define: 3-4 sets, 12-15 reps, 60s rest
   - Build Endurance: 2-3 sets, 15-25 reps, 30s rest

3. For each training day:
   - Map to template muscle groups
   - Filter exercises by gender, difficulty, goals
   - Sort by compound score, goal match, randomness
   - Select 1-3 exercises per muscle group
   - Add cardio on alternating days for weight loss/endurance goals

---

## Utilities & Services

### Calorie Calculator (`/src/utils/calories.js`)
- MET-based formula: `MET × weight(kg) × duration(hours)`
- Exercise-specific MET values for 60+ exercises
- Unit converters: kg↔lbs, cm↔ft/in
- Display formatters for height and weight

### Google Drive Service (`/src/services/googleDriveService.js`)
- `findAppDataFile()` - Locate user's data file in Drive
- `readFile()` - Fetch saved state
- `createFile()` - Create new backup
- `updateFile()` - Update existing backup
- Uses Drive API v3, app data folder scope

---

## Theme & Design

Dark theme with the following color palette:

| Token | Value | Usage |
|---|---|---|
| `--color-primary` | #6366f1 | Primary actions, active states |
| `--color-primary-light` | #818cf8 | Highlights, gradients |
| `--color-accent` | #f59e0b | Secondary actions, warnings |
| `--color-background` | #13131f | Page background |
| `--color-surface` | #1e1e2e | Card backgrounds |
| `--color-surface-light` | #2a2a3e | Elevated surfaces |
| `--color-success` | #10b981 | Success states |
| `--color-danger` | #ef4444 | Destructive actions |
| `--color-text-primary` | #f1f5f9 | Main text |
| `--color-text-secondary` | #94a3b8 | Secondary text |
| `--color-text-muted` | #64748b | Muted text |

Design patterns: rounded corners (xl/2xl), glassmorphism headers, gradient CTAs, staggered animations.

---

## Configuration & Deployment

### Environment Variables
| Variable | Description |
|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID for Drive sync |

### Scripts
```bash
npm run dev       # Start development server
npm run build     # Production build
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

### Google DNS Verification
Site verification meta tag is included in `index.html`:
```html
<meta name="google-site-verification" content="qfn2y3_xZciqOqeguXEKmBqIb_aKhaEUOueanmNpRu4" />
```

---

## Changelog

### v1.0 - Initial Release
- Built FitForge workout planner web app with exercise database and plan generation

### v1.1 - Multi-Goal & Animations
- Multi-goal selection, workout duration options, expanded exercise library, SVG animations

### v1.2 - Rename to ZenFit
- Rebranded to ZenFit, added motivational elements

### v1.3 - Scientific Splits
- Scientific workout split templates, training day selection, real exercise images

### v1.4 - Google Cloud Sync
- Google Drive cloud sync for cross-device backup
- OAuth 2.0 authentication
- Sync status indicator

### v1.5 - Exercise Images & Auth Fixes
- Mapped 42+ exercise images
- Fixed Google sign-in name auto-fill
- Gender-specific icons in onboarding

### v1.6 - Weight Tracker & Calorie System
- Weight tracking with log entries, goals, and chart visualization
- MET-based calorie calculation for accurate burn estimates
- Body measurements (height/weight) in profile and onboarding
- Unit conversion support

### v1.7 - Rename to OneFit
- Rebranded from ZenFit to OneFit
- Dynamic motivational quotes on dashboard (10 unique quotes)

### v1.8 - Metric-Only & Auth Fix
- Removed metric/imperial toggle, standardized to metric (kg/cm)
- Fixed Google sign-in not populating user name

### v1.9 - Rename to FitOne & Weight Tracker Optimization
- Rebranded from OneFit to FitOne
- **Weight Tracker enhancements:**
  - Future dates blocked in weight log date picker
  - Target weight shown as dashed horizontal line on weight journey graph
  - Weight stats cards: current weight, remaining to goal, % to shed, progress bar
  - BMI calculator with visual scale bar, category classification, ideal weight range
  - Expandable BMI info section with full scale explanation
  - BMI dynamically updates when new weight entries are logged
- Google site verification meta tag for DNS verification
