"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Heart,
  Star,
  Sun,
  Moon,
  Cloud,
  Flower2,
  Zap,
  Music,
  Umbrella,
  Plane,
  Car,
  Bike,
  Gift,
  Cake,
  Crown,
  Diamond,
  Gem,
  Leaf,
  Volume2,
  VolumeX,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"
import Confetti from "./confetti"
import soundManager from "./sounds"

type MemoryCard = {
  id: number
  icon: LucideIcon
  isMatched: boolean
  color: string
}

type StageConfig = {
  name: string
  gridCols: string
  icons: Array<{ icon: LucideIcon; color: string }>
}

const stageConfigs: StageConfig[] = [
  {
    name: "Stage 1: Basics",
    gridCols: "grid-cols-3",
    icons: [
      { icon: Heart, color: "text-rose-400" },
      { icon: Star, color: "text-amber-400" },
      { icon: Sun, color: "text-yellow-400" },
      { icon: Moon, color: "text-purple-400" },
      { icon: Cloud, color: "text-sky-400" },
      { icon: Flower2, color: "text-emerald-400" },
    ],
  },
  {
    name: "Stage 2: Movement",
    gridCols: "grid-cols-4",
    icons: [
      { icon: Zap, color: "text-yellow-500" },
      { icon: Plane, color: "text-blue-400" },
      { icon: Car, color: "text-red-500" },
      { icon: Bike, color: "text-green-500" },
      { icon: Umbrella, color: "text-indigo-400" },
      { icon: Music, color: "text-pink-400" },
      { icon: Cloud, color: "text-sky-400" },
      { icon: Sun, color: "text-orange-400" },
    ],
  },
  {
    name: "Stage 3: Treasures",
    gridCols: "grid-cols-4",
    icons: [
      { icon: Gift, color: "text-red-400" },
      { icon: Cake, color: "text-pink-300" },
      { icon: Crown, color: "text-yellow-500" },
      { icon: Diamond, color: "text-blue-300" },
      { icon: Gem, color: "text-purple-400" },
      { icon: Leaf, color: "text-green-400" },
      { icon: Star, color: "text-amber-400" },
      { icon: Heart, color: "text-rose-500" },
      { icon: Moon, color: "text-indigo-300" },
      { icon: Zap, color: "text-yellow-400" },
    ],
  },
]

const createCards = (stageIndex: number) => {
  const stage = stageConfigs[stageIndex]
  const iconCount = stage.gridCols === "grid-cols-3" ? 6 : 8
  const selectedIcons = stage.icons.slice(0, iconCount)

  const cards: MemoryCard[] = []

  selectedIcons.forEach(({ icon, color }, index) => {
    cards.push({ id: index * 2, icon, color, isMatched: false }, { id: index * 2 + 1, icon, color, isMatched: false })
  })

  return cards.sort(() => Math.random() - 0.5)
}

export default function MemoryGame() {
  const [stage, setStage] = useState(0)
  const [cards, setCards] = useState<MemoryCard[]>(createCards(0))
  const [flippedIndexes, setFlippedIndexes] = useState<number[]>([])
  const [matches, setMatches] = useState(0)
  const [isChecking, setIsChecking] = useState(false)
  const [points, setPoints] = useState(0)
  const [moveCount, setMoveCount] = useState(0)
  const [timer, setTimer] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [soundsLoaded, setSoundsLoaded] = useState(false)

  // Initialize sound manager
  useEffect(() => {
    if (typeof window !== "undefined" && !soundsLoaded) {
      // Preload sounds
      soundManager.preload("flip", "/sounds/flip.mp3")
      soundManager.preload("match", "/sounds/match.mp3")
      soundManager.preload("wrong", "/sounds/wrong.mp3")
      soundManager.preload("complete", "/sounds/complete.mp3")
      soundManager.preload("victory", "/sounds/victory.mp3")

      setSoundsLoaded(true)
    }
  }, [soundsLoaded])

  // Play sound using sound manager
  const playSound = (sound: string) => {
    if (soundEnabled) {
      soundManager.play(sound)
    }
  }

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive) {
      interval = setInterval(() => {
        setTimer((timer) => timer + 1)
      }, 1000)
    } else if (!isActive && interval) {
      clearInterval(interval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive])

  const handleCardClick = (clickedIndex: number) => {
    // Prevent clicking if already checking or card is already matched
    if (isChecking || cards[clickedIndex].isMatched) return
    // Prevent clicking if card is already flipped
    if (flippedIndexes.includes(clickedIndex)) return
    // Prevent clicking if two cards are already flipped
    if (flippedIndexes.length === 2) return

    // Play flip sound
    playSound("flip")

    // Add clicked card to flipped cards
    const newFlipped = [...flippedIndexes, clickedIndex]
    setFlippedIndexes(newFlipped)

    // If we now have two cards flipped, check for a match
    if (newFlipped.length === 2) {
      setIsChecking(true)
      setMoveCount(moveCount + 1)

      const [firstIndex, secondIndex] = newFlipped
      const firstCard = cards[firstIndex]
      const secondCard = cards[secondIndex]

      if (firstCard.icon === secondCard.icon) {
        // Match found - calculate points (faster matches = more points)
        const speedBonus = Math.max(100 - (timer % 60), 10)
        const matchPoints = 50 + speedBonus

        setTimeout(() => {
          // Play match sound
          playSound("match")

          setCards(
            cards.map((card, index) =>
              index === firstIndex || index === secondIndex ? { ...card, isMatched: true } : card,
            ),
          )
          setFlippedIndexes([])
          setMatches((m) => m + 1)
          setPoints((p) => p + matchPoints)
          setIsChecking(false)

          toast(`+${matchPoints} points!`, {
            className: "bg-green-900 text-green-100 border-green-700",
            duration: 1500,
          })

          // Check for stage completion
          if (matches === cards.length / 2 - 1) {
            const stageCompleteBonus = 200 - moveCount * 5
            const totalStagePoints = Math.max(stageCompleteBonus, 50)

            setPoints((p) => p + totalStagePoints)
            setIsActive(false)

            // Show celebration effect
            setShowConfetti(true)

            // Play completion sound
            if (stage < stageConfigs.length - 1) {
              playSound("complete")

              toast(`Stage ${stage + 1} complete! +${totalStagePoints} bonus points!`, {
                className: "bg-purple-900 text-purple-100 border-purple-700",
                duration: 3000,
              })

              setTimeout(() => {
                setShowConfetti(false)
                advanceStage()
              }, 4000)
            } else {
              // Final victory
              playSound("victory")

              toast("🎉 Congratulations! You've completed all stages! 🎈", {
                className: "bg-purple-900 text-purple-100 border-purple-700",
                duration: 5000,
              })

              // Keep confetti for longer on final victory
              setTimeout(() => {
                setShowConfetti(false)
              }, 8000)
            }
          }
        }, 500)
      } else {
        // No match - reset after delay and deduct points
        setTimeout(() => {
          // Play wrong match sound
          playSound("wrong")

          setFlippedIndexes([])
          setIsChecking(false)
          setPoints((p) => Math.max(p - 5, 0)) // Deduct 5 points, minimum 0
        }, 1000)
      }
    }
  }

  const advanceStage = () => {
    const nextStage = stage + 1
    if (nextStage < stageConfigs.length) {
      setStage(nextStage)
      setCards(createCards(nextStage))
      setFlippedIndexes([])
      setMatches(0)
      setMoveCount(0)
      setTimer(0)
      setIsActive(true)
    }
  }

  const resetGame = () => {
    setStage(0)
    setCards(createCards(0))
    setFlippedIndexes([])
    setMatches(0)
    setIsChecking(false)
    setPoints(0)
    setMoveCount(0)
    setTimer(0)
    setIsActive(true)
    setShowConfetti(false)
  }

  const toggleSound = () => {
    const newSoundState = !soundEnabled
    setSoundEnabled(newSoundState)
    soundManager.setEnabled(newSoundState)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-8 bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-950">
      {showConfetti && <Confetti />}

      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 text-transparent bg-clip-text">
          Memory Match Game
        </h1>

        <div className="flex justify-center gap-6 text-indigo-200">
          <div className="bg-indigo-900/30 px-4 py-2 rounded-lg">
            <p className="text-sm">Stage</p>
            <p className="font-bold">
              {stage + 1}/{stageConfigs.length}
            </p>
          </div>

          <div className="bg-indigo-900/30 px-4 py-2 rounded-lg">
            <p className="text-sm">Points</p>
            <p className="font-bold">{points}</p>
          </div>

          <div className="bg-indigo-900/30 px-4 py-2 rounded-lg">
            <p className="text-sm">Time</p>
            <p className="font-bold">{formatTime(timer)}</p>
          </div>

          <div className="bg-indigo-900/30 px-4 py-2 rounded-lg">
            <p className="text-sm">Moves</p>
            <p className="font-bold">{moveCount}</p>
          </div>
        </div>

        <p className="text-lg font-medium text-indigo-300">{stageConfigs[stage].name}</p>

        <p className="text-indigo-200">
          Matches found: {matches} of {cards.length / 2}
        </p>
      </div>

      <div
        className={`grid ${stageConfigs[stage].gridCols} gap-4 md:gap-6 p-6 rounded-xl bg-indigo-950/50 backdrop-blur-sm`}
      >
        {cards.map((card, index) => (
          <div key={card.id} className="perspective-1000" onClick={() => handleCardClick(index)}>
            <div
              className={`relative w-20 h-20 md:w-28 md:h-28 cursor-pointer transform-style-3d transition-all duration-300 ${
                card.isMatched || flippedIndexes.includes(index) ? "rotate-y-180" : ""
              }`}
            >
              {/* Front of card (hidden when flipped) */}
              <div className="absolute inset-0 backface-hidden rounded-md border bg-indigo-950 border-indigo-800 hover:border-indigo-600 hover:bg-indigo-900/80">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-indigo-500/5 to-white/5" />
              </div>

              {/* Back of card (shown when flipped) */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-md border bg-indigo-800/50 border-indigo-500/50 flex items-center justify-center">
                <card.icon
                  className={`w-10 h-10 md:w-12 md:h-12 ${
                    card.isMatched ? `${card.color} filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]` : card.color
                  }`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <Button
          onClick={resetGame}
          variant="outline"
          size="lg"
          className="bg-indigo-950 border-indigo-700 hover:bg-indigo-900 hover:border-indigo-500 text-indigo-200 hover:text-indigo-100"
        >
          Start New Game
        </Button>

        {stage < stageConfigs.length - 1 && matches === cards.length / 2 && (
          <Button
            onClick={advanceStage}
            variant="default"
            size="lg"
            className="bg-purple-700 hover:bg-purple-600 text-purple-50"
          >
            Next Stage
          </Button>
        )}

        <Button
          onClick={toggleSound}
          variant="ghost"
          size="icon"
          className="text-indigo-300 hover:text-indigo-100 hover:bg-indigo-900/50"
        >
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </Button>
      </div>
    </div>
  )
}
