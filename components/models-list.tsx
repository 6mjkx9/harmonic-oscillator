"use client"

import type { OscillationModel } from "@/lib/models"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal, Trash2, Edit, Copy, GitCompareArrowsIcon as CompareArrows } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ModelsListProps {
  models: OscillationModel[]
  activeModelId: string
  comparisonModels: string[]
  onSelectModel: (id: string) => void
  onDeleteModel: (id: string) => void
  onToggleComparison: (id: string) => void
}

export default function ModelsList({
  models,
  activeModelId,
  comparisonModels,
  onSelectModel,
  onDeleteModel,
  onToggleComparison,
}: ModelsListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <ScrollArea className="h-[calc(100vh-240px)]">
      <div className="space-y-3 pr-3">
        {models.map((model) => (
          <Card
            key={model.id}
            className={`cursor-pointer transition-all ${
              activeModelId === model.id
                ? "border-blue-500 dark:border-blue-400 shadow-sm"
                : "hover:border-gray-300 dark:hover:border-gray-700"
            }`}
            onClick={() => onSelectModel(model.id)}
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base flex items-center">
                    {model.name}
                    {comparisonModels.includes(model.id) && (
                      <Badge variant="outline" className="ml-2 bg-blue-50 dark:bg-blue-900 text-xs">
                        Comparing
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">Created: {formatDate(model.createdAt)}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleComparison(model.id)
                      }}
                    >
                      <CompareArrows className="mr-2 h-4 w-4" />
                      {comparisonModels.includes(model.id) ? "Remove from comparison" : "Add to comparison"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        // Implement edit functionality
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        // Implement duplicate functionality
                      }}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 dark:text-red-400"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteModel(model.id)
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>Mass:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{model.mass} kg</span>
                </div>
                <div className="flex justify-between">
                  <span>Spring constant:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{model.springConstant} N/m</span>
                </div>
                <div className="flex justify-between">
                  <span>Amplitude:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{model.amplitude}</span>
                </div>
                {model.damping > 0 && (
                  <div className="flex justify-between">
                    <span>Damping:</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{model.damping}</span>
                  </div>
                )}
                {model.chaosMode && (
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className="bg-amber-50 dark:bg-amber-900 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200"
                    >
                      Chaos Mode
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  )
}
