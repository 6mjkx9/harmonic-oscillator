"use client"

import { useState, useEffect } from "react"

export function useAudioContext() {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)

  useEffect(() => {
    // Initialize AudioContext on first user interaction
    const initAudioContext = () => {
      if (!audioContext) {
        try {
          const context = new (window.AudioContext || (window as any).webkitAudioContext)()
          setAudioContext(context)
        } catch (error) {
          console.error("Web Audio API is not supported in this browser", error)
        }
      }
    }

    // Add event listeners for user interaction
    window.addEventListener("click", initAudioContext, { once: true })
    window.addEventListener("keydown", initAudioContext, { once: true })
    window.addEventListener("touchstart", initAudioContext, { once: true })

    return () => {
      window.removeEventListener("click", initAudioContext)
      window.removeEventListener("keydown", initAudioContext)
      window.removeEventListener("touchstart", initAudioContext)

      // Clean up audio context
      if (audioContext) {
        audioContext.close()
      }
    }
  }, [audioContext])

  return audioContext
}
