"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { type OscillationModel, calculatePosition } from "@/lib/models"

interface HeatMapProps {
  baseModel: OscillationModel
}

export default function HeatMap({ baseModel }: HeatMapProps) {
  const [paramRange, setParamRange] = useState<{
    springConstantMin: number
    springConstantMax: number
    massMin: number
    massMax: number
  }>({
    springConstantMin: 1,
    springConstantMax: 20,
    massMin: 0.5,
    massMax: 5,
  })

  const [heatMapData, setHeatMapData] = useState<Array<Array<number>>>([])
  const [selectedParameter, setSelectedParameter] = useState<"amplitude" | "frequency" | "period">("amplitude")

  // Generate heat map data
  useEffect(() => {
    const generateHeatMapData = () => {
      const { springConstantMin, springConstantMax, massMin, massMax } = paramRange

      // Create a grid of values
      const kSteps = 20 // Number of steps for spring constant
      const mSteps = 20 // Number of steps for mass

      const kStep = (springConstantMax - springConstantMin) / kSteps
      const mStep = (massMax - massMin) / mSteps

      const data: number[][] = []

      for (let i = 0; i < mSteps; i++) {
        const row: number[] = []
        const mass = massMax - i * mStep // Reverse order for visual mapping

        for (let j = 0; j < kSteps; j++) {
          const springConstant = springConstantMin + j * kStep

          // Calculate the parameter value based on selection
          let value = 0

          if (selectedParameter === "amplitude") {
            // For amplitude, we'll use a time of 0 and see how the initial amplitude varies
            const model = { ...baseModel, mass, springConstant }
            value = Math.abs(calculatePosition(model, 0))
          } else if (selectedParameter === "frequency") {
            // Angular frequency = sqrt(k/m)
            value = Math.sqrt(springConstant / mass)
          } else if (selectedParameter === "period") {
            // Period = 2π/ω = 2π/sqrt(k/m)
            value = (2 * Math.PI) / Math.sqrt(springConstant / mass)
          }

          row.push(value)
        }

        data.push(row)
      }

      setHeatMapData(data)
    }

    generateHeatMapData()
  }, [baseModel, paramRange, selectedParameter])

  // Normalize data for color mapping
  const normalizeData = (data: number[][]) => {
    let min = Number.POSITIVE_INFINITY
    let max = Number.NEGATIVE_INFINITY

    // Find min and max values
    for (const row of data) {
      for (const value of row) {
        if (value < min) min = value
        if (value > max) max = value
      }
    }

    // Normalize to 0-1 range
    return data.map((row) => row.map((value) => (value - min) / (max - min)))
  }

  const normalizedData = normalizeData(heatMapData)

  // Get color for a normalized value (0-1)
  const getColor = (value: number) => {
    // Color gradient from blue (cold) to red (hot)
    const r = Math.floor(255 * value)
    const g = Math.floor(255 * (1 - Math.abs(2 * value - 1)))
    const b = Math.floor(255 * (1 - value))

    return `rgb(${r}, ${g}, ${b})`
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Parameter Heat Map</CardTitle>
        <CardDescription>Visualize how mass and spring constant affect {selectedParameter}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex space-x-2">
          <button
            onClick={() => setSelectedParameter("amplitude")}
            className={`px-3 py-1 rounded-md text-sm ${
              selectedParameter === "amplitude"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            }`}
          >
            Amplitude
          </button>
          <button
            onClick={() => setSelectedParameter("frequency")}
            className={`px-3 py-1 rounded-md text-sm ${
              selectedParameter === "frequency"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            }`}
          >
            Frequency
          </button>
          <button
            onClick={() => setSelectedParameter("period")}
            className={`px-3 py-1 rounded-md text-sm ${
              selectedParameter === "period"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            }`}
          >
            Period
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="relative aspect-square border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden">
              {normalizedData.map((row, i) => (
                <div key={i} className="flex h-[5%]">
                  {row.map((value, j) => (
                    <div
                      key={j}
                      className="w-[5%] h-full"
                      style={{ backgroundColor: getColor(value) }}
                      title={`Mass: ${(paramRange.massMax - (i * (paramRange.massMax - paramRange.massMin)) / 20).toFixed(2)}, 
                              Spring Constant: ${(paramRange.springConstantMin + (j * (paramRange.springConstantMax - paramRange.springConstantMin)) / 20).toFixed(2)}, 
                              ${selectedParameter}: ${heatMapData[i][j].toFixed(2)}`}
                    />
                  ))}
                </div>
              ))}

              {/* Axes labels */}
              <div className="absolute bottom-0 left-0 w-full text-center text-xs font-medium text-gray-700 dark:text-gray-300">
                Spring Constant (k) →
              </div>
              <div className="absolute top-0 left-0 h-full flex items-center">
                <div className="transform -rotate-90 text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Mass (m) →
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <div className="text-xs">{paramRange.springConstantMin}</div>
              <div className="text-xs font-medium">Spring Constant (k)</div>
              <div className="text-xs">{paramRange.springConstantMax}</div>
            </div>
          </div>

          <div className="w-full md:w-64 space-y-6">
            <div>
              <Label className="mb-2 block">Spring Constant Range</Label>
              <Slider
                value={[paramRange.springConstantMin, paramRange.springConstantMax]}
                min={0.1}
                max={30}
                step={0.1}
                onValueChange={(value) =>
                  setParamRange({
                    ...paramRange,
                    springConstantMin: value[0],
                    springConstantMax: value[1],
                  })
                }
              />
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>0.1</span>
                <span>30</span>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Mass Range</Label>
              <Slider
                value={[paramRange.massMin, paramRange.massMax]}
                min={0.1}
                max={10}
                step={0.1}
                onValueChange={(value) =>
                  setParamRange({
                    ...paramRange,
                    massMin: value[0],
                    massMax: value[1],
                  })
                }
              />
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>0.1</span>
                <span>10</span>
              </div>
            </div>

            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
              <h4 className="font-medium mb-2">Heat Map Legend</h4>
              <div className="h-4 w-full bg-gradient-to-r from-blue-500 via-green-500 to-red-500 rounded-sm" />
              <div className="flex justify-between mt-1 text-xs">
                <span>Low</span>
                <span>High</span>
              </div>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                {selectedParameter === "amplitude" && "Higher amplitude shown in red, lower in blue"}
                {selectedParameter === "frequency" && "Higher frequency shown in red, lower in blue"}
                {selectedParameter === "period" && "Longer period shown in red, shorter in blue"}
              </p>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-xs">
              <p className="font-medium mb-1">Hover over the heat map to see exact values</p>
              <p className="text-gray-600 dark:text-gray-400">
                This visualization shows how mass and spring constant together affect the {selectedParameter} of the
                oscillation.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
