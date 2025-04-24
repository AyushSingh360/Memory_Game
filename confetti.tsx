"use client"

import { useEffect, useRef } from "react"

type Particle = {
  x: number
  y: number
  size: number
  color: string
  velocity: {
    x: number
    y: number
  }
  rotation: number
  rotationSpeed: number
  gravity: number
  opacity: number
  shape: "circle" | "square" | "triangle" | "star"
}

export default function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])
  const animationRef = useRef<number | null>(null)

  // Create particles
  const createParticles = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear existing particles
    particles.current = []

    // Set canvas dimensions
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Create new particles
    const particleCount = Math.min(200, Math.floor((canvas.width * canvas.height) / 10000))
    const colors = [
      "#FF5252", // Red
      "#FF4081", // Pink
      "#E040FB", // Purple
      "#7C4DFF", // Deep Purple
      "#536DFE", // Indigo
      "#448AFF", // Blue
      "#40C4FF", // Light Blue
      "#18FFFF", // Cyan
      "#64FFDA", // Teal
      "#69F0AE", // Green
      "#B2FF59", // Light Green
      "#EEFF41", // Lime
      "#FFFF00", // Yellow
      "#FFD740", // Amber
      "#FFAB40", // Orange
      "#FF6E40", // Deep Orange
    ]

    const shapes: Array<"circle" | "square" | "triangle" | "star"> = ["circle", "square", "triangle", "star"]

    for (let i = 0; i < particleCount; i++) {
      particles.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.5, // Start in top half
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        velocity: {
          x: (Math.random() - 0.5) * 10,
          y: Math.random() * -10 - 5,
        },
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        gravity: 0.1 + Math.random() * 0.1,
        opacity: 1,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      })
    }
  }

  // Draw a star shape
  const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number) => {
    const spikes = 5
    const outerRadius = size
    const innerRadius = size / 2

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rotation)
    ctx.beginPath()

    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      const angle = (Math.PI * 2 * i) / (spikes * 2)
      const pointX = Math.cos(angle) * radius
      const pointY = Math.sin(angle) * radius

      if (i === 0) {
        ctx.moveTo(pointX, pointY)
      } else {
        ctx.lineTo(pointX, pointY)
      }
    }

    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  // Draw a triangle shape
  const drawTriangle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rotation)
    ctx.beginPath()
    ctx.moveTo(0, -size)
    ctx.lineTo(size * 0.866, size * 0.5) // cos(60°), sin(60°)
    ctx.lineTo(-size * 0.866, size * 0.5) // -cos(60°), sin(60°)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  // Draw a particle
  const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    ctx.globalAlpha = particle.opacity
    ctx.fillStyle = particle.color

    switch (particle.shape) {
      case "circle":
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
        break
      case "square":
        ctx.save()
        ctx.translate(particle.x, particle.y)
        ctx.rotate(particle.rotation)
        ctx.fillRect(-particle.size, -particle.size, particle.size * 2, particle.size * 2)
        ctx.restore()
        break
      case "triangle":
        drawTriangle(ctx, particle.x, particle.y, particle.size, particle.rotation)
        break
      case "star":
        drawStar(ctx, particle.x, particle.y, particle.size, particle.rotation)
        break
    }

    ctx.globalAlpha = 1
  }

  // Update and draw all particles
  const updateParticles = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Update and draw particles
    for (let i = 0; i < particles.current.length; i++) {
      const p = particles.current[i]

      // Update position
      p.x += p.velocity.x
      p.y += p.velocity.y
      p.velocity.y += p.gravity

      // Update rotation
      p.rotation += p.rotationSpeed

      // Fade out
      p.opacity -= 0.005

      // Remove if off-screen or faded out
      if (p.y > canvas.height + p.size || p.opacity <= 0) {
        particles.current.splice(i, 1)
        i--
        continue
      }

      // Draw particle
      drawParticle(ctx, p)
    }

    // Continue animation if particles remain
    if (particles.current.length > 0) {
      animationRef.current = requestAnimationFrame(updateParticles)
    }
  }

  useEffect(() => {
    // Initialize confetti
    createParticles()
    animationRef.current = requestAnimationFrame(updateParticles)

    // Handle window resize
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth
        canvasRef.current.height = window.innerHeight
      }
    }

    window.addEventListener("resize", handleResize)

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize)
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: "100%", height: "100%" }}
    />
  )
}
