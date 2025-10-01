export interface OscillationModel {
  id: string
  name: string
  description?: string
  createdAt: string

  // Physics parameters
  amplitude: number
  frequency: number
  phase: number
  mass: number
  springConstant: number

  // Additional parameters
  initialVelocity: number
  damping: number
  chaosMode: boolean
}

export const defaultModel: OscillationModel = {
  id: "default-model",
  name: "Default Model",
  description: "Standard harmonic oscillator with default parameters",
  createdAt: new Date().toISOString(),

  amplitude: 100,
  frequency: 1,
  phase: 0,
  mass: 1,
  springConstant: 10,

  initialVelocity: 0,
  damping: 0,
  chaosMode: false,
}

export function calculateAngularFrequency(model: OscillationModel): number {
  return Math.sqrt(model.springConstant / model.mass)
}

export function calculatePeriod(model: OscillationModel): number {
  const angularFrequency = calculateAngularFrequency(model)
  return (2 * Math.PI) / (angularFrequency * model.frequency)
}

export function calculatePosition(model: OscillationModel, time: number): number {
  const { amplitude, frequency, phase, damping } = model
  const angularFrequency = calculateAngularFrequency(model)
  const dampingFactor = Math.exp(-damping * time)

  return amplitude * dampingFactor * Math.cos(angularFrequency * frequency * time + (phase * Math.PI) / 180)
}

export function calculateVelocity(model: OscillationModel, time: number): number {
  const { amplitude, frequency, phase, damping } = model
  const angularFrequency = calculateAngularFrequency(model)
  const dampingFactor = Math.exp(-damping * time)

  // Derivative of position with respect to time
  const velocityFromPosition =
    -amplitude *
    angularFrequency *
    frequency *
    dampingFactor *
    Math.sin(angularFrequency * frequency * time + (phase * Math.PI) / 180)

  // Additional term from damping
  const velocityFromDamping =
    -damping * amplitude * dampingFactor * Math.cos(angularFrequency * frequency * time + (phase * Math.PI) / 180)

  return velocityFromPosition + velocityFromDamping
}

export function calculateAcceleration(model: OscillationModel, time: number): number {
  const { amplitude, frequency, phase, damping } = model
  const angularFrequency = calculateAngularFrequency(model)
  const omega = angularFrequency * frequency
  const dampingFactor = Math.exp(-damping * time)
  const phaseRad = (phase * Math.PI) / 180

  // Second derivative of position
  return (
    -amplitude *
    dampingFactor *
    // Term from simple harmonic motion
    (Math.pow(omega, 2) * Math.cos(omega * time + phaseRad) +
      // First damping term
      2 * damping * omega * Math.sin(omega * time + phaseRad) +
      // Second damping term
      Math.pow(damping, 2) * Math.cos(omega * time + phaseRad))
  )
}

export function calculateEnergies(
  model: OscillationModel,
  time: number,
): {
  kinetic: number
  potential: number
  total: number
} {
  const position = calculatePosition(model, time)
  const velocity = calculateVelocity(model, time)

  const kineticEnergy = 0.5 * model.mass * Math.pow(velocity, 2)
  const potentialEnergy = 0.5 * model.springConstant * Math.pow(position, 2)
  const totalEnergy = kineticEnergy + potentialEnergy

  return {
    kinetic: kineticEnergy,
    potential: potentialEnergy,
    total: totalEnergy,
  }
}

export function getModelColor(index: number): string {
  const colors = [
    "#3b82f6", // blue
    "#ef4444", // red
    "#10b981", // green
    "#f59e0b", // amber
    "#8b5cf6", // purple
  ]

  return colors[index % colors.length]
}
