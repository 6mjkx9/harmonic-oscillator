"use client"

import { useEffect, useRef, useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, RotateCcw } from "lucide-react"
import {
  type OscillationModel,
  calculatePosition,
  calculateVelocity,
  calculateAcceleration,
  calculateEnergies,
  calculateAngularFrequency,
  calculatePeriod,
} from "@/lib/models"
import { useAudioContext } from "@/hooks/use-audio-context"
import AnnotatedGraphs from "@/components/annotated-graphs"
import EnergyVisualization from "@/components/energy-visualization"
import HeatMap from "@/components/heat-map"

interface SimulationViewProps {
  model: OscillationModel
  onUpdateModel: (model: OscillationModel) => void
  soundEnabled: boolean
}

export default function SimulationView({ model, onUpdateModel, soundEnabled }: SimulationViewProps) {
  // Animation state
  const [isRunning, setIsRunning] = useState(true)
  const [time, setTime] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const prevPositionRef = useRef<number>(0)
  const audioContext = useAudioContext()

  // Data for charts
  const [positionData, setPositionData] = useState<Array<{ time: number; value: number }>>([])
  const [velocityData, setVelocityData] = useState<Array<{ time: number; value: number }>>([])
  const [accelerationData, setAccelerationData] = useState<Array<{ time: number; value: number }>>([])
  const [energyData, setEnergyData] = useState<
    Array<{ time: number; kinetic: number; potential: number; total: number }>
  >([])

  // Calculate angular frequency based on spring constant and mass
  const angularFrequency = calculateAngularFrequency(model)
  const period = calculatePeriod(model)

  // Play sound when crossing equilibrium
  const playOscillationSound = (currentPosition: number, previousPosition: number) => {
    if (!audioContext || !soundEnabled) return

    // Check if we crossed the equilibrium (zero) position
    if ((previousPosition < 0 && currentPosition >= 0) || (previousPosition > 0 && currentPosition <= 0)) {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      // Set frequency based on the oscillation parameters
      oscillator.frequency.value = 220 + model.frequency * 110

      // Connect nodes
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Set volume and quick fade out
      gainNode.gain.value = 0.2
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

        // Calculate current values
        const position = calculatePosition(model, newTime)
        const velocity = calculateVelocity(model, newTime)
        const acceleration = calculateAcceleration(model, newTime)
        const energies = calculateEnergies(model, newTime)

        // Check for equilibrium crossing and play sound
        playOscillationSound(position, prevPositionRef.current)
        prevPositionRef.current = position

        // Update data arrays for charts (keeping last 100 points)
        setPositionData((prev) => [...prev.slice(-99), { time: newTime, value: position }])
        setVelocityData((prev) => [...prev.slice(-99), { time: newTime, value: velocity }])
        setAccelerationData((prev) => [...prev.slice(-99), { time: newTime, value: acceleration }])
        setEnergyData((prev) => [
          ...prev.slice(-99),
          {
            time: newTime,
            kinetic: energies.kinetic,
            potential: energies.potential,
            total: energies.total,
          },
        ])

        // Draw the animation
        drawAnimation(newTime)

        return newTime
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [isRunning, model, soundEnabled])

  // Draw the spring-mass system
  const drawAnimation = (t: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

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
    ctx.fillStyle = "#3b82f6"
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
    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw position text
    ctx.fillStyle = "#000"
    ctx.font = "14px Arial"
    ctx.fillText(`x = ${position.toFixed(1)}`, originX + 160, massY)

    // Draw equilibrium text
    ctx.fillStyle = "#888"
    ctx.fillText("x = 0", originX + 160, originY + springHeight)

    // Draw annotations for key physics concepts
    const velocity = calculateVelocity(model, t)
    const acceleration = calculateAcceleration(model, t)

    // Annotate direction of motion with an arrow
    const arrowLength = 30
    const arrowWidth = 10

    if (Math.abs(velocity) > 0.1) {
      // Draw arrow in direction of motion
      const arrowX = originX - 80
      const arrowY = massY
      const direction = velocity > 0 ? 1 : -1

      ctx.beginPath()
      ctx.moveTo(arrowX, arrowY)
      ctx.lineTo(arrowX, arrowY + direction * arrowLength)
      ctx.lineTo(arrowX - arrowWidth / 2, arrowY + direction * arrowLength)
      ctx.lineTo(arrowX, arrowY + direction * (arrowLength + arrowWidth / 2))
      ctx.lineTo(arrowX + arrowWidth / 2, arrowY + direction * arrowLength)
      ctx.lineTo(arrowX, arrowY + direction * arrowLength)

      ctx.fillStyle = velocity > 0 ? "rgba(239, 68, 68, 0.7)" : "rgba(59, 130, 246, 0.7)"
      ctx.fill()

      ctx.fillStyle = "#000"
      ctx.fillText(velocity > 0 ? "Moving down" : "Moving up", arrowX - 40, arrowY + direction * (arrowLength + 20))
    }

    // Annotate force with an arrow
    const forceArrowX = originX + 80
    const forceArrowY = massY
    const forceDirection = position > 0 ? -1 : 1 // Force is opposite to displacement

    if (Math.abs(position) > 0.1) {
      ctx.beginPath()
      ctx.moveTo(forceArrowX, forceArrowY)
      ctx.lineTo(forceArrowX, forceArrowY + forceDirection * arrowLength)
      ctx.lineTo(forceArrowX - arrowWidth / 2, forceArrowY + forceDirection * arrowLength)
      ctx.lineTo(forceArrowX, forceArrowY + forceDirection * (arrowLength + arrowWidth / 2))
      ctx.lineTo(forceArrowX + arrowWidth / 2, forceArrowY + forceDirection * arrowLength)
      ctx.lineTo(forceArrowX, forceArrowY + forceDirection * arrowLength)

      ctx.fillStyle = "rgba(16, 185, 129, 0.7)" // Green for force
      ctx.fill()

      ctx.fillStyle = "#000"
      ctx.fillText(
        `F = -k·x = ${(-model.springConstant * position).toFixed(1)} N`,
        forceArrowX - 40,
        forceArrowY + forceDirection * (arrowLength + 20),
      )
    }
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

  // Update model parameters
  const updateModelParameter = (key: keyof OscillationModel, value: any) => {
    onUpdateModel({
      ...model,
      [key]: value,
    })
  }

  // Toggle chaos mode
  const toggleChaosMode = (enabled: boolean) => {
    onUpdateModel({
      ...model,
      chaosMode: enabled,
      initialVelocity: enabled ? Math.random() * 100 - 50 : 0,
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column - Animation and controls */}
        <div>
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle>Spring-Mass System</CardTitle>
              <CardDescription>
                {model.chaosMode
                  ? "Chaos mode: unpredictable behavior with non-zero initial velocity"
                  : "Standard harmonic oscillation"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={400}
                  className="border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-gray-950"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={toggleAnimation} variant="default" className="flex-1">
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
                <Button onClick={resetSimulation} variant="outline" className="flex-1">
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Simulation Parameters</CardTitle>
              <CardDescription>Adjust the parameters to see how they affect the oscillation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-1">
                    <Label>Amplitude (A)</Label>
                    <span className="text-sm font-medium">{model.amplitude.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[model.amplitude]}
                    min={10}
                    max={200}
                    step={1}
                    onValueChange={(value) => updateModelParameter("amplitude", value[0])}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <Label>Frequency Multiplier (ω)</Label>
                    <span className="text-sm font-medium">{model.frequency.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[model.frequency]}
                    min={0.1}
                    max={3}
                    step={0.1}
                    onValueChange={(value) => updateModelParameter("frequency", value[0])}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <Label>Initial Phase (φ)</Label>
                    <span className="text-sm font-medium">{model.phase.toFixed(0)}°</span>
                  </div>
                  <Slider
                    value={[model.phase]}
                    min={0}
                    max={360}
                    step={5}
                    onValueChange={(value) => updateModelParameter("phase", value[0])}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <Label>Mass (m)</Label>
                    <span className="text-sm font-medium">{model.mass.toFixed(1)} kg</span>
                  </div>
                  <Slider
                    value={[model.mass]}
                    min={0.5}
                    max={5}
                    step={0.1}
                    onValueChange={(value) => updateModelParameter("mass", value[0])}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <Label>Spring Constant (k)</Label>
                    <span className="text-sm font-medium">{model.springConstant.toFixed(1)} N/m</span>
                  </div>
                  <Slider
                    value={[model.springConstant]}
                    min={1}
                    max={30}
                    step={0.5}
                    onValueChange={(value) => updateModelParameter("springConstant", value[0])}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <Label>Damping Coefficient</Label>
                    <span className="text-sm font-medium">{model.damping.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[model.damping]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={(value) => updateModelParameter("damping", value[0])}
                  />
                </div>

                <div className="flex items-center justify-between space-x-2 pt-2">
                  <Label htmlFor="chaos-mode" className="flex items-center gap-2 cursor-pointer">
                    Chaos Mode
                    <span className="text-xs text-gray-500 dark:text-gray-400">(Random initial velocity)</span>
                  </Label>
                  <Switch id="chaos-mode" checked={model.chaosMode} onCheckedChange={toggleChaosMode} />
                </div>

                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <h3 className="font-medium mb-2">Calculated Values:</h3>
                  <div className="space-y-1 text-sm">
                    <p>Angular Frequency (ω): {angularFrequency.toFixed(2)} rad/s</p>
                    <p>Period (T): {period.toFixed(2)} s</p>
                    {model.chaosMode && <p>Initial Velocity: {model.initialVelocity.toFixed(2)} m/s</p>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Graphs */}
        <div>
          <Tabs defaultValue="advanced">
            <TabsList className="mb-4">
              <TabsTrigger value="advanced">Advanced Graphs</TabsTrigger>
              <TabsTrigger value="energy">Energy Visualization</TabsTrigger>
              <TabsTrigger value="heatmap">Parameter Heat Map</TabsTrigger>
            </TabsList>

            <TabsContent value="advanced" className="mt-0">
              <AnnotatedGraphs
                model={model}
                positionData={positionData}
                velocityData={velocityData}
                accelerationData={accelerationData}
                energyData={energyData}
              />
            </TabsContent>

            <TabsContent value="energy" className="mt-0">
              <EnergyVisualization model={model} time={time} isRunning={isRunning} />
            </TabsContent>

            <TabsContent value="heatmap" className="mt-0">
              <HeatMap baseModel={model} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
