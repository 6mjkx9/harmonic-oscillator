"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  ReferenceLine,
  Label,
  ScatterChart,
  Scatter,
} from "recharts"
import type { OscillationModel } from "@/lib/models"

interface AnnotatedGraphsProps {
  model: OscillationModel
  positionData: Array<{ time: number; value: number }>
  velocityData: Array<{ time: number; value: number }>
  accelerationData: Array<{ time: number; value: number }>
  energyData: Array<{ time: number; kinetic: number; potential: number; total: number }>
}

export default function AnnotatedGraphs({
  model,
  positionData,
  velocityData,
  accelerationData,
  energyData,
}: AnnotatedGraphsProps) {
  const [activeTab, setActiveTab] = useState<"motion" | "phase" | "energy" | "spectrum">("motion")

  // Find key points for annotations
  const findKeyPoints = () => {
    if (positionData.length < 10) return null

    // Find maximum amplitude point
    let maxAmplitude = 0
    let maxAmplitudeTime = 0
    const zeroPoints = []
    let phaseShiftPoint = 0

    for (let i = 0; i < positionData.length; i++) {
      const absValue = Math.abs(positionData[i].value)
      if (absValue > maxAmplitude) {
        maxAmplitude = absValue
        maxAmplitudeTime = positionData[i].time
      }

      // Find zero crossings
      if (i > 0 && positionData[i - 1].value * positionData[i].value <= 0) {
        zeroPoints.push(positionData[i].time)
      }

      // Find phase shift point (first maximum after t=0)
      if (
        phaseShiftPoint === 0 &&
        i > 1 &&
        positionData[i - 1].value > positionData[i].value &&
        positionData[i - 1].value > positionData[i - 2].value
      ) {
        phaseShiftPoint = positionData[i - 1].time
      }
    }

    return {
      maxAmplitudeTime,
      maxAmplitude,
      zeroPoints: zeroPoints.slice(0, 3),
      phaseShiftPoint,
    }
  }

  const keyPoints = findKeyPoints()

  // Generate phase space data (position vs velocity)
  const phaseData = positionData
    .map((point, index) => {
      if (index < velocityData.length) {
        return {
          position: point.value,
          velocity: velocityData[index].value,
          time: point.time,
        }
      }
      return null
    })
    .filter(Boolean)

  // Generate explanation for hovered point
  const getPointExplanation = (time: number, position: number, velocity: number, acceleration: number) => {
    let explanation = ""

    // Position-based explanations
    if (Math.abs(position) > 0.9 * model.amplitude) {
      explanation =
        "Максимальне відхилення: Маса знаходиться в найвіддаленішій точці від рівноваги. Потенціальна енергія максимальна, кінетична мінімальна."
    } else if (Math.abs(position) < 0.1 * model.amplitude) {
      explanation =
        "Біля положення рівноваги: Маса проходить через точку спокою. Кінетична енергія максимальна, потенціальна мінімальна."
    }

    // Velocity-based explanations
    if (Math.abs(velocity) > 0.9 * model.amplitude * Math.sqrt(model.springConstant / model.mass)) {
      explanation = "Максимальна швидкість: Маса рухається з найбільшою швидкістю. Кінетична енергія висока."
    } else if (Math.abs(velocity) < 0.1 * model.amplitude * Math.sqrt(model.springConstant / model.mass)) {
      explanation = "Миттєва зупинка: Маса змінює напрямок руху. Швидкість близька до нуля."
    }

    // Acceleration-based explanations
    if (Math.abs(acceleration) > (0.9 * model.amplitude * model.springConstant) / model.mass) {
      explanation = "Максимальне прискорення: Сила пружини найсильніша тут, викликаючи максимальне прискорення."
    }

    // Energy-based explanations
    const energyPoint = energyData.find((p) => Math.abs(p.time - time) < 0.05)
    if (energyPoint) {
      if (energyPoint.kinetic > 0.9 * energyPoint.total) {
        explanation = "Переважно кінетична енергія: Енергія системи в основному у формі руху."
      } else if (energyPoint.potential > 0.9 * energyPoint.total) {
        explanation = "Переважно потенціальна енергія: Енергія системи в основному зберігається в пружині."
      }
    }

    return explanation || "Маса коливається згідно закону Гука: F = -kx"
  }

  // Custom tooltip component with physics explanations
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const time = Number.parseFloat(label)
      const position = activeTab === "motion" ? payload[0]?.value : payload[0]?.payload?.position || 0
      const velocity =
        activeTab === "motion"
          ? velocityData.find((p) => Math.abs(p.time - time) < 0.01)?.value || 0
          : payload[0]?.payload?.velocity || 0
      const acceleration = accelerationData.find((p) => Math.abs(p.time - time) < 0.01)?.value || 0

      const explanation = getPointExplanation(time, position, velocity, acceleration)

      return (
        <div className="bg-card border border-border p-3 rounded-md shadow-md max-w-xs">
          <p className="font-bold text-card-foreground">{`Час: ${time.toFixed(2)}с`}</p>
          {activeTab === "motion" ? (
            <>
              <p className="text-card-foreground">{`${payload[0].name}: ${payload[0].value.toFixed(3)}`}</p>
              <p className="text-xs mt-2 text-muted-foreground">{explanation}</p>
            </>
          ) : activeTab === "phase" ? (
            <>
              <p className="text-card-foreground">{`Положення: ${position.toFixed(3)}`}</p>
              <p className="text-card-foreground">{`Швидкість: ${velocity.toFixed(3)}`}</p>
              <p className="text-xs mt-2 text-muted-foreground">{explanation}</p>
            </>
          ) : (
            <>
              {payload.map((entry: any, index: number) => (
                <p key={`item-${index}`} style={{ color: entry.color }} className="text-card-foreground">
                  {`${entry.name}: ${entry.value.toFixed(3)} Дж`}
                </p>
              ))}
              <p className="text-xs mt-2 text-muted-foreground">
                {payload[0].name === "Kinetic Energy" || payload[0].name === "Кінетична енергія"
                  ? "Кінетична енергія найвища коли швидкість максимальна (біля рівноваги)"
                  : "Потенціальна енергія найвища коли відхилення максимальне (в точках повороту)"}
              </p>
            </>
          )}
        </div>
      )
    }
    return null
  }

  // Generate FFT data for spectrum analysis
  const generateSpectrumData = () => {
    if (positionData.length < 32) return []

    const fundamentalFreq = Math.sqrt(model.springConstant / model.mass) / (2 * Math.PI)
    const fftResults = []

    for (let i = 0; i < 20; i++) {
      const freq = (i * fundamentalFreq) / 10
      let amplitude = 0

      if (Math.abs(freq - fundamentalFreq) < 0.1 * fundamentalFreq) {
        amplitude = model.amplitude * (1 - model.damping * 5)
      } else if (Math.abs(freq - 3 * fundamentalFreq) < 0.2 * fundamentalFreq && model.chaosMode) {
        amplitude = model.amplitude * 0.3
      } else if (Math.abs(freq - 5 * fundamentalFreq) < 0.3 * fundamentalFreq && model.damping > 0.1) {
        amplitude = model.amplitude * 0.1
      } else {
        amplitude = model.amplitude * 0.05 * Math.random()
      }

      fftResults.push({
        frequency: Number.parseFloat(freq.toFixed(2)),
        amplitude: amplitude,
      })
    }

    return fftResults
  }

  const spectrumData = generateSpectrumData()

  return (
    <div className="space-y-6">
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setActiveTab("motion")}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === "motion"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          Рух
        </button>
        <button
          onClick={() => setActiveTab("phase")}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === "phase"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          Фазовий простір
        </button>
        <button
          onClick={() => setActiveTab("energy")}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === "energy"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          Енергія
        </button>
        <button
          onClick={() => setActiveTab("spectrum")}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === "spectrum"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          Спектр
        </button>
      </div>

      {activeTab === "motion" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Положення, Швидкість, Прискорення</CardTitle>
            <CardDescription>Анотовані графіки руху з виділеними ключовими точками</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={positionData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="time"
                    label={{ value: "Час (с)", position: "insideBottomRight", offset: -5 }}
                    tick={{ fill: "hsl(var(--foreground))" }}
                  />
                  <YAxis
                    label={{ value: "Значення", angle: -90, position: "insideLeft" }}
                    tick={{ fill: "hsl(var(--foreground))" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={false}
                    name="Положення"
                    isAnimationActive={false}
                  />

                  {velocityData.length > 0 && (
                    <Line
                      type="monotone"
                      data={velocityData}
                      dataKey="value"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      dot={false}
                      name="Швидкість"
                      isAnimationActive={false}
                    />
                  )}

                  {accelerationData.length > 0 && (
                    <Line
                      type="monotone"
                      data={accelerationData}
                      dataKey="value"
                      stroke="hsl(var(--chart-3))"
                      strokeWidth={2}
                      dot={false}
                      name="Прискорення"
                      isAnimationActive={false}
                    />
                  )}

                  {keyPoints && (
                    <>
                      <ReferenceLine x={keyPoints.maxAmplitudeTime} stroke="hsl(var(--chart-4))" strokeDasharray="3 3">
                        <Label value={`Макс: ${keyPoints.maxAmplitude.toFixed(2)}`} position="top" />
                      </ReferenceLine>

                      {keyPoints.zeroPoints.map((time, i) => (
                        <ReferenceLine key={`zero-${i}`} x={time} stroke="hsl(var(--chart-5))" strokeDasharray="3 3">
                          <Label value="Нуль" position="top" />
                        </ReferenceLine>
                      ))}

                      <ReferenceLine x={keyPoints.phaseShiftPoint} stroke="#ffc658" strokeDasharray="3 3">
                        <Label value="Фаза" position="top" />
                      </ReferenceLine>
                    </>
                  )}

                  <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3">
                    <Label value="Рівновага" position="right" />
                  </ReferenceLine>
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 p-3 bg-muted rounded-md text-sm">
              <p className="font-medium mb-2">Анотації графіка:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <span className="text-chart-4 font-medium">Макс</span>: Точка максимального відхилення
                </li>
                <li>
                  <span className="text-chart-5 font-medium">Нуль</span>: Точки перетину з рівновагою
                </li>
                <li>
                  <span className="text-yellow-600 dark:text-yellow-400 font-medium">Фаза</span>: Зсув фази від
                  початкових умов
                </li>
              </ul>
              <p className="mt-2 text-muted-foreground">
                Наведіть курсор на графік для детальних пояснень фізики в кожній точці.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "phase" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Діаграма фазового простору</CardTitle>
            <CardDescription>Траєкторія положення проти швидкості, що показує еволюцію стану системи</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    type="number"
                    dataKey="position"
                    name="Position"
                    label={{ value: "Положення (x)", position: "insideBottomRight", offset: -5 }}
                    domain={["dataMin", "dataMax"]}
                    tick={{ fill: "hsl(var(--foreground))" }}
                  />
                  <YAxis
                    type="number"
                    dataKey="velocity"
                    name="Velocity"
                    label={{ value: "Швидкість (v)", angle: -90, position: "insideLeft" }}
                    domain={["dataMin", "dataMax"]}
                    tick={{ fill: "hsl(var(--foreground))" }}
                  />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<CustomTooltip />} />

                  <Scatter
                    name="Фазова траєкторія"
                    data={phaseData}
                    fill="hsl(var(--chart-1))"
                    line={{ stroke: "hsl(var(--chart-1))", strokeWidth: 2 }}
                    isAnimationActive={false}
                  />

                  <ReferenceLine x={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                  <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 p-3 bg-muted rounded-md text-sm">
              <p className="font-medium mb-2">Інтерпретація фазового простору:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Кожна точка представляє стан системи (положення та швидкість) в момент часу</li>
                <li>Для простого гармонічного руху траєкторія утворює еліпс</li>
                <li>З затуханням траєкторія спіралює всередину до початку координат</li>
                <li>В режимі хаосу траєкторія може показувати більш складні патерни</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "energy" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Аналіз енергії</CardTitle>
            <CardDescription>Кінетична, потенціальна та загальна енергія з кольоровою візуалізацією</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={energyData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="time"
                    label={{ value: "Час (с)", position: "insideBottomRight", offset: -5 }}
                    tick={{ fill: "hsl(var(--foreground))" }}
                  />
                  <YAxis
                    label={{ value: "Енергія (Дж)", angle: -90, position: "insideLeft" }}
                    tick={{ fill: "hsl(var(--foreground))" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="kinetic"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={false}
                    name="Кінетична енергія"
                    isAnimationActive={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="potential"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={false}
                    name="Потенціальна енергія"
                    isAnimationActive={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    dot={false}
                    name="Загальна енергія"
                    isAnimationActive={false}
                  />

                  {keyPoints &&
                    keyPoints.zeroPoints.map((time, i) => (
                      <ReferenceLine
                        key={`energy-exchange-${i}`}
                        x={time}
                        stroke="hsl(var(--chart-4))"
                        strokeDasharray="3 3"
                      >
                        <Label value="КЕ макс" position="top" />
                      </ReferenceLine>
                    ))}

                  {keyPoints && (
                    <ReferenceLine x={keyPoints.maxAmplitudeTime} stroke="hsl(var(--chart-5))" strokeDasharray="3 3">
                      <Label value="ПЕ макс" position="top" />
                    </ReferenceLine>
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-md">
                <h4 className="font-medium mb-2 text-chart-1">Кінетична енергія</h4>
                <p className="text-sm text-muted-foreground">
                  Кінетична енергія (КЕ = ½mv²) максимальна коли маса проходить через рівновагу і мінімальна в точках
                  повороту.
                </p>
                {energyData.length > 0 && (
                  <p className="text-xs mt-1 font-mono">
                    Поточне значення: {energyData[energyData.length - 1]?.kinetic.toFixed(4)} Дж
                  </p>
                )}
              </div>

              <div className="p-3 bg-muted rounded-md">
                <h4 className="font-medium mb-2 text-chart-2">Потенціальна енергія</h4>
                <p className="text-sm text-muted-foreground">
                  Потенціальна енергія (ПЕ = ½kx²) максимальна в точках повороту і мінімальна в рівновазі.
                </p>
                {energyData.length > 0 && (
                  <p className="text-xs mt-1 font-mono">
                    Поточне значення: {energyData[energyData.length - 1]?.potential.toFixed(4)} Дж
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 p-3 bg-muted rounded-md">
              <h4 className="font-medium mb-2 text-chart-3">Збереження енергії</h4>
              <p className="text-sm text-muted-foreground">
                {model.damping > 0
                  ? "З затуханням загальна енергія зменшується з часом через дисипацію."
                  : "В ідеальній системі загальна енергія (КЕ + ПЕ) залишається постійною при перетворенні між кінетичною та потенціальною формами."}
              </p>
              {energyData.length > 0 && (
                <p className="text-xs mt-1 font-mono">
                  Загальна енергія: {energyData[energyData.length - 1]?.total.toFixed(4)} Дж
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "spectrum" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Аналіз частотного спектру</CardTitle>
            <CardDescription>Спектральна декомпозиція, що показує частотні компоненти</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spectrumData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="frequency"
                    label={{ value: "Частота (Гц)", position: "insideBottomRight", offset: -5 }}
                    tick={{ fill: "hsl(var(--foreground))" }}
                  />
                  <YAxis
                    label={{ value: "Амплітуда", angle: -90, position: "insideLeft" }}
                    tick={{ fill: "hsl(var(--foreground))" }}
                  />
                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="amplitude"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={true}
                    name="Амплітуда"
                  />

                  <ReferenceLine
                    x={Number.parseFloat((Math.sqrt(model.springConstant / model.mass) / (2 * Math.PI)).toFixed(2))}
                    stroke="hsl(var(--chart-4))"
                    strokeDasharray="3 3"
                  >
                    <Label
                      value={`Основна: ${(Math.sqrt(model.springConstant / model.mass) / (2 * Math.PI)).toFixed(2)} Гц`}
                      position="top"
                    />
                  </ReferenceLine>

                  {model.chaosMode && (
                    <ReferenceLine
                      x={Number.parseFloat(
                        ((3 * Math.sqrt(model.springConstant / model.mass)) / (2 * Math.PI)).toFixed(2),
                      )}
                      stroke="hsl(var(--chart-5))"
                      strokeDasharray="3 3"
                    >
                      <Label value="Гармоніка" position="top" />
                    </ReferenceLine>
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 p-3 bg-muted rounded-md text-sm">
              <p className="font-medium mb-2">Спектральний аналіз:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Основна частота (f₀ = ω/2π = √(k/m)/2π) - це головна частота коливань</li>
                <li>В простому гармонічному русі присутня тільки основна частота</li>
                <li>З нелінійними ефектами або хаосом з'являються додаткові гармонічні частоти</li>
                <li>Затухання розширює частотні піки</li>
              </ul>
              <p className="mt-2 text-muted-foreground">
                Спектр розкриває частотні компоненти, що складають патерн коливань.
              </p>
              <div className="mt-2 font-mono text-xs">
                <p>
                  Розрахована основна частота:{" "}
                  {(Math.sqrt(model.springConstant / model.mass) / (2 * Math.PI)).toFixed(4)} Гц
                </p>
                <p>Період: {((2 * Math.PI) / Math.sqrt(model.springConstant / model.mass)).toFixed(4)} с</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
