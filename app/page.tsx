"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PlusCircle, Volume2, VolumeX } from "lucide-react"
import SimulationView from "@/components/simulation-view"
import ModelsList from "@/components/models-list"
import ComparisonView from "@/components/comparison-view"
import { type OscillationModel, defaultModel } from "@/lib/models"
import { useToast } from "@/hooks/use-toast"

export default function HarmonicOscillationSimulation() {
  const [activeTab, setActiveTab] = useState("simulation")
  const [models, setModels] = useState<OscillationModel[]>([defaultModel])
  const [activeModelId, setActiveModelId] = useState(defaultModel.id)
  const [comparisonModels, setComparisonModels] = useState<string[]>([])
  const [soundEnabled, setSoundEnabled] = useState(false)
  const { toast } = useToast()

  const activeModel = models.find((model) => model.id === activeModelId) || defaultModel

  const handleCreateModel = () => {
    const newModel: OscillationModel = {
      ...defaultModel,
      id: `model-${Date.now()}`,
      name: `Model ${models.length + 1}`,
      createdAt: new Date().toISOString(),
    }

    setModels([...models, newModel])
    setActiveModelId(newModel.id)
    toast({
      title: "New model created",
      description: `Created "${newModel.name}" with default parameters`,
    })
  }

  const handleUpdateModel = (updatedModel: OscillationModel) => {
    setModels(models.map((model) => (model.id === updatedModel.id ? updatedModel : model)))
  }

  const handleDeleteModel = (id: string) => {
    if (models.length <= 1) {
      toast({
        title: "Cannot delete model",
        description: "You must have at least one model",
        variant: "destructive",
      })
      return
    }

    const newModels = models.filter((model) => model.id !== id)
    setModels(newModels)

    if (activeModelId === id) {
      setActiveModelId(newModels[0].id)
    }

    // Remove from comparison if present
    if (comparisonModels.includes(id)) {
      setComparisonModels(comparisonModels.filter((modelId) => modelId !== id))
    }

    toast({
      title: "Model deleted",
      description: "The model has been removed",
    })
  }

  const handleToggleComparison = (id: string) => {
    if (comparisonModels.includes(id)) {
      setComparisonModels(comparisonModels.filter((modelId) => modelId !== id))
    } else {
      if (comparisonModels.length < 2) {
        setComparisonModels([...comparisonModels, id])
      } else {
        toast({
          title: "Comparison limit reached",
          description: "You can compare a maximum of 2 models at once",
          variant: "destructive",
        })
      }
    }
  }

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
    toast({
      title: `Sound ${!soundEnabled ? "enabled" : "disabled"}`,
      description: `Oscillation sounds are now ${!soundEnabled ? "on" : "off"}`,
    })
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-card p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-4">Oscillation Models</h2>

        <Button onClick={handleCreateModel} className="mb-4 w-full" variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Model
        </Button>

        <div className="flex-1 overflow-auto">
          <ModelsList
            models={models}
            activeModelId={activeModelId}
            comparisonModels={comparisonModels}
            onSelectModel={setActiveModelId}
            onDeleteModel={handleDeleteModel}
            onToggleComparison={handleToggleComparison}
          />
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Button onClick={toggleSound} variant="ghost" className="w-full justify-start">
            {soundEnabled ? (
              <>
                <Volume2 className="mr-2 h-4 w-4" /> Sound On
              </>
            ) : (
              <>
                <VolumeX className="mr-2 h-4 w-4" /> Sound Off
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Harmonic Oscillation Simulation</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Interactive physics simulation with accurate calculations and real-time visualization
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="simulation">Single Simulation</TabsTrigger>
            <TabsTrigger value="comparison" disabled={comparisonModels.length < 2}>
              Comparison Mode
            </TabsTrigger>
          </TabsList>

          <TabsContent value="simulation" className="mt-0">
            <SimulationView model={activeModel} onUpdateModel={handleUpdateModel} soundEnabled={soundEnabled} />
          </TabsContent>

          <TabsContent value="comparison" className="mt-0">
            {comparisonModels.length >= 2 ? (
              <ComparisonView
                models={models.filter((model) => comparisonModels.includes(model.id))}
                onUpdateModel={handleUpdateModel}
                soundEnabled={soundEnabled}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                <p className="text-lg text-gray-500 dark:text-gray-400 mb-4">
                  Select two models to compare from the sidebar
                </p>
                <Button onClick={() => setActiveTab("simulation")}>Return to Simulation</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
