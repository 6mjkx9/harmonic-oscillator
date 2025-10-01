"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { type OscillationModel, calculatePosition, calculateVelocity, calculateEnergies } from "@/lib/models"

interface EnergyVisualizationProps {
  model: OscillationModel
  time: number
  isRunning: boolean
}

export default function EnergyVisualization({ model, time, isRunning }: EnergyVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)

  // Draw the energy visualization with oscilloscope-like effect
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear previous animation frame
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    // Animation function
    const animate = () => {
      if (!canvas || !ctx) return

      // Clear canvas with dark background
      ctx.fillStyle = "hsl(222.2, 84%, 4.9%)" // Dark background
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Calculate current values
      const position = calculatePosition(model, time)
      const velocity = calculateVelocity(model, time)
      const { kinetic, potential, total } = calculateEnergies(model, time)

      // Calculate energy percentages
      const kineticPercent = total > 0 ? kinetic / total : 0
      const potentialPercent = total > 0 ? potential / total : 0

      // Canvas dimensions
      const width = canvas.width
      const height = canvas.height
      const centerX = width / 2
      const centerY = height / 2

      // Draw energy flow (oscilloscope style)
      const gradient = ctx.createLinearGradient(0, 0, width, 0)
      gradient.addColorStop(0, `rgba(59, 130, 246, ${Math.max(0.3, kineticPercent)})`) // Blue for kinetic
      gradient.addColorStop(0.5, `rgba(139, 92, 246, 0.7)`) // Purple for mixed
      gradient.addColorStop(1, `rgba(239, 68, 68, ${Math.max(0.3, potentialPercent)})`) // Red for potential

      // Draw energy wave
      ctx.beginPath()
      ctx.moveTo(0, centerY)

      const amplitude = height * 0.4
      const frequency = 10

      for (let x = 0; x < width; x++) {
        const normalizedX = x / width
        const timeFactor = time + normalizedX * 2

        // Base wave
        const baseY = centerY + Math.sin(timeFactor * frequency) * amplitude * 0.5

        // Position influence
        const positionFactor = position / model.amplitude
        const positionY = Math.sin(timeFactor * frequency * 1.5) * amplitude * 0.3 * positionFactor

        // Velocity influence
        const velocityFactor = velocity / (model.amplitude * Math.sqrt(model.springConstant / model.mass))
        const velocityY = Math.sin(timeFactor * frequency * 0.7) * amplitude * 0.2 * velocityFactor

        // Combined wave
        const y = baseY + positionY + velocityY

        ctx.lineTo(x, y)
      }

      // Complete the path to bottom edge for fill
      ctx.lineTo(width, height)
      ctx.lineTo(0, height)
      ctx.closePath()

      // Fill with gradient
      ctx.fillStyle = gradient
      ctx.fill()

      // Stroke the top of the wave
      ctx.beginPath()
      for (let x = 0; x < width; x++) {
        const normalizedX = x / width
        const timeFactor = time + normalizedX * 2

        const baseY = centerY + Math.sin(timeFactor * frequency) * amplitude * 0.5
        const positionFactor = position / model.amplitude
        const positionY = Math.sin(timeFactor * frequency * 1.5) * amplitude * 0.3 * positionFactor
        const velocityFactor = velocity / (model.amplitude * Math.sqrt(model.springConstant / model.mass))
        const velocityY = Math.sin(timeFactor * frequency * 0.7) * amplitude * 0.2 * velocityFactor

        const y = baseY + positionY + velocityY

        if (x === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }

      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw energy indicators
      const barHeight = 20
      const barWidth = width - 40
      const barX = 20
      const kineticBarY = height - 80
      const potentialBarY = height - 50

      // Kinetic energy bar
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
      ctx.fillRect(barX, kineticBarY, barWidth, barHeight)
      ctx.fillStyle = "rgba(59, 130, 246, 0.8)"
      ctx.fillRect(barX, kineticBarY, barWidth * kineticPercent, barHeight)

      // Potential energy bar
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
      ctx.fillRect(barX, potentialBarY, barWidth, barHeight)
      ctx.fillStyle = "rgba(239, 68, 68, 0.8)"
      ctx.fillRect(barX, potentialBarY, barWidth * potentialPercent, barHeight)

      // Labels
      ctx.fillStyle = "white"
      ctx.font = "12px Arial"
      ctx.fillText(`Кінетична: ${(kineticPercent * 100).toFixed(1)}% (${kinetic.toFixed(3)} Дж)`, barX, kineticBarY - 5)
      ctx.fillText(
        `Потенціальна: ${(potentialPercent * 100).toFixed(1)}% (${potential.toFixed(3)} Дж)`,
        barX,
        potentialBarY - 5,
      )

      // Draw position indicator
      const positionIndicatorX = centerX + (position / model.amplitude) * (width / 3)
      ctx.beginPath()
      ctx.arc(positionIndicatorX, 30, 8, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
      ctx.fill()
      ctx.strokeStyle = "rgba(0, 0, 0, 0.5)"
      ctx.lineWidth = 2
      ctx.stroke()

      // Position scale
      ctx.beginPath()
      ctx.moveTo(centerX - width / 3, 30)
      ctx.lineTo(centerX + width / 3, 30)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.fillStyle = "white"
      ctx.font = "10px Arial"
      ctx.fillText("-A", centerX - width / 3 - 15, 34)
      ctx.fillText("0", centerX - 5, 45)
      ctx.fillText("+A", centerX + width / 3 + 5, 34)

      // Display exact values
      ctx.fillStyle = "white"
      ctx.font = "14px Arial"
      ctx.fillText(`Час: ${time.toFixed(3)}с`, 20, 25)
      ctx.fillText(`Положення: ${position.toFixed(3)}`, 20, height - 120)
      ctx.fillText(`Швидкість: ${velocity.toFixed(3)}`, 20, height - 105)
      ctx.fillText(`Загальна енергія: ${total.toFixed(3)} Дж`, 20, height - 25)

      // Continue animation if running
      if (isRunning) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    // Start animation
    animate()

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [model, time, isRunning])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Візуалізація потоку енергії</CardTitle>
        <CardDescription>Осцилоскопічна візуалізація трансформації енергії</CardDescription>
      </CardHeader>
      <CardContent>
        <canvas ref={canvasRef} width={600} height={300} className="w-full h-[300px] rounded-md border" />

        <div className="mt-4 p-3 bg-muted rounded-md text-sm">
          <p className="font-medium mb-2">Керівництво по візуалізації:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Хвильовий патерн показує потік енергії в системі</li>
            <li>Сині області вказують на домінуючу кінетичну енергію</li>
            <li>Червоні області вказують на домінуючу потенціальну енергію</li>
            <li>Біла точка показує поточне положення відносно амплітуди</li>
            <li>Смуги внизу показують розподіл енергії в реальному часі з точними значеннями</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
