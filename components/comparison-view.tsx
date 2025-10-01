"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from "recharts"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw } from "lucide-react"
import {
  type OscillationModel,
  calculatePosition,
  calculateVelocity,
  calculateAcceleration,
  calculateEnergies,
  getModelColor,
} from "@/lib/models"
import { useAudioContext } from "@/hooks/use-audio-context"

interface ComparisonViewProps {
  models: OscillationModel[]
  onUpdateModel: (model: OscillationModel) => void
  soundEnabled: boolean
}

export default function ComparisonView({ models, onUpdateModel, soundEnabled }: ComparisonViewProps) {
  // Animation state
  const [isRunning, setIsRunning] = useState(true)
  const [time, setTime] = useState(0)
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([null, null])
  const animationRef = useRef<number>(0)
  const prevPositionsRef = useRef<number[]>([0, 0])
  const audioContext = useAudioContext()

  // Data for charts
  const [positionData, setPositionData] = useState<Array<{ time: number; [key: string]: number }>>([])
  const [velocityData, setVelocityData] = useState<Array<{ time: number; [key: string]: number }>>([])
  const [accelerationData, setAccelerationData] = useState<Array<{ time: number; [key: string]: number }>>([])
  const [energyData, setEnergyData] = useState<
    Array<{
      time: number
      [key: string]: number
    }>
  >([])

  // Play sound when crossing equilibrium
  const playOscillationSound = (modelIndex: number, currentPosition: number, previousPosition: number) => {
    if (!audioContext || !soundEnabled) return

    // Check if we crossed the equilibrium (zero) position
    if ((previousPosition < 0 && currentPosition >= 0) || (previousPosition > 0 && currentPosition <= 0)) {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      // Set frequency based on the oscillation parameters and model index
      // Different models have slightly different pitches
      const baseFreq = 220 + modelIndex * 55
      oscillator.frequency.value = baseFreq + models[modelIndex].frequency * 110

      // Connect nodes
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Set volume and quick fade out
      gainNode.gain.value = 0.15
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1)

      // Play sound
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.1)
    }
  }

  // Animation loop
  useEffect(() => {
    if (!isRunning) return

    const animate = () => {
      setTime((prevTime) => {
        const newTime = prevTime + 0.02

        // Calculate values for each model
        const positions: { [key: string]: number } = { time: newTime }
        const velocities: { [key: string]: number } = { time: newTime }
        const accelerations: { [key: string]: number } = { time: newTime }
        const energies: { [key: string]: number } = { time: newTime }

        models.forEach((model, index) => {
          const position = calculatePosition(model, newTime)
          const velocity = calculateVelocity(model, newTime)
          const acceleration = calculateAcceleration(model, newTime)
          const energyValues = calculateEnergies(model, newTime)

          // Check for equilibrium crossing and play sound
          playOscillationSound(index, position, prevPositionsRef.current[index])
          prevPositionsRef.current[index] = position

          // Store values for charts
          positions[`model${index}`] = position
          velocities[`model${index}`] = velocity
          accelerations[`model${index}`] = acceleration
          energies[`kinetic${index}`] = energyValues.kinetic
          energies[`potential${index}`] = energyValues.potential
          energies[`total${index}`] = energyValues.total

          // Draw the animation for this model
          drawAnimation(index, newTime)
        })

        // Update data arrays for charts (keeping last 100 points)
        setPositionData((prev) => [...prev.slice(-99), positions])
        setVelocityData((prev) => [...prev.slice(-99), velocities])
        setAccelerationData((prev) => [...prev.slice(-99), accelerations])
        setEnergyData((prev) => [...prev.slice(-99), energies])

        return newTime
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [isRunning, models, soundEnabled])

  // Draw the spring-mass system
  const drawAnimation = (modelIndex: number, t: number) => {
    const canvas = canvasRefs.current[modelIndex]
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const model = models[modelIndex]
    const color = getModelColor(modelIndex)

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set origin to center-top of canvas
    const originX = canvas.width / 2
    const originY = 50

    // Calculate current position
    const position = calculatePosition(model, t)

    // Draw ceiling
    ctx.fillStyle = "#333"
    ctx.fillRect(originX - 100, originY - 10, 200, 10)

    // Draw spring
    const springHeight = 100
    const springWidth = 30
    const numCoils = 10
    const massY = originY + springHeight + position

    ctx.beginPath()
    ctx.moveTo(originX, originY)

    // Draw zigzag spring
    const coilHeight = springHeight / numCoils
    for (let i = 0; i < numCoils; i++) {
      const y = originY + i * coilHeight + (i / numCoils) * position
      if (i % 2 === 0) {
        ctx.lineTo(originX + springWidth / 2, y)
      } else {
        ctx.lineTo(originX - springWidth / 2, y)
      }
    }

    ctx.lineTo(originX, massY)
    ctx.strokeStyle = "#666"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw mass
    const massSize = 20 + model.mass * 10 // Scale mass size
    ctx.beginPath()
    ctx.arc(originX, massY, massSize, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
    ctx.strokeStyle = "#1d4ed8"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw position indicator line
    ctx.beginPath()
    ctx.moveTo(originX + 100, originY + springHeight)
    ctx.lineTo(originX + 150, originY + springHeight)
    ctx.strokeStyle = "#888"
    ctx.setLineDash([5, 5])
    ctx.stroke()
    ctx.setLineDash([])

    ctx.beginPath()
    ctx.moveTo(originX + 100, massY)
    ctx.lineTo(originX + 150, massY)
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw position text
    ctx.fillStyle = "#000"
    ctx.font = "14px Arial"
    ctx.fillText(`x = ${position.toFixed(1)}`, originX + 160, massY)

    // Draw equilibrium text
    ctx.fillStyle = "#888"
    ctx.fillText("x = 0", originX + 160, originY + springHeight)

    // Draw model name
    ctx.fillStyle = "#000"
    ctx.font = "16px Arial"
    ctx.fillText(model.name, 20, 30)
  }

  // Toggle animation
  const toggleAnimation = () => {
    setIsRunning(!isRunning)
  }

  // Reset simulation
  const resetSimulation = () => {
    setTime(0)
    setPositionData([])
    setVelocityData([])
    setAccelerationData([])
    setEnergyData([])
    setIsRunning(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Comparison Mode</h2>
        <div className="flex gap-2">
          <Button onClick={toggleAnimation} variant="default">
            {isRunning ? (
              <>
                <Pause className="mr-2 h-4 w-4" /> Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" /> Resume
              </>
            )}
          </Button>
          <Button onClick={resetSimulation} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" /> Reset
          </Button>
        </div>
      </div>

      {/* Animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {models.map((model, index) => (
          <Card key={model.id}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: getModelColor(index) }}></div>
                {model.name}
              </CardTitle>
              <CardDescription>
                m = {model.mass} kg, k = {model.springConstant} N/m, A = {model.amplitude}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <canvas
                ref={(el) => (canvasRefs.current[index] = el)}
                width={400}
                height={300}
                className="border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-gray-950 w-full"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Graphs */}
      <Tabs defaultValue="position">
        <TabsList className="mb-4">
          <TabsTrigger value="position">Position</TabsTrigger>
          <TabsTrigger value="velocity">Velocity</TabsTrigger>
          <TabsTrigger value="acceleration">Acceleration</TabsTrigger>
          <TabsTrigger value="energy">Energy</TabsTrigger>
        </TabsList>

        <TabsContent value="position" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Position Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={positionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" label={{ value: "Time (s)", position: "insideBottomRight", offset: -5 }} />
                    <YAxis label={{ value: "Position (m)", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    {models.map((model, index) => (
                      <Line
                        key={model.id}
                        type="monotone"
                        dataKey={`model${index}`}
                        stroke={getModelColor(index)}
                        strokeWidth={2}
                        dot={false}
                        name={model.name}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="velocity" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Velocity Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={velocityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" label={{ value: "Time (s)", position: "insideBottomRight", offset: -5 }} />
                    <YAxis label={{ value: "Velocity (m/s)", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    {models.map((model, index) => (
                      <Line
                        key={model.id}
                        type="monotone"
                        dataKey={`model${index}`}
                        stroke={getModelColor(index)}
                        strokeWidth={2}
                        dot={false}
                        name={model.name}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="acceleration" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Acceleration Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={accelerationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" label={{ value: "Time (s)", position: "insideBottomRight", offset: -5 }} />
                    <YAxis label={{ value: "Acceleration (m/s²)", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    {models.map((model, index) => (
                      <Line
                        key={model.id}
                        type="monotone"
                        dataKey={`model${index}`}
                        stroke={getModelColor(index)}
                        strokeWidth={2}
                        dot={false}
                        name={model.name}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="energy" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Energy Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={energyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" label={{ value: "Time (s)", position: "insideBottomRight", offset: -5 }} />
                    <YAxis label={{ value: "Energy (J)", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    {models.map((model, index) => (
                      <Line
                        key={model.id}
                        type="monotone"
                        dataKey={`total${index}`}
                        stroke={getModelColor(index)}
                        strokeWidth={2}
                        dot={false}
                        name={`${model.name} (Total)`}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
