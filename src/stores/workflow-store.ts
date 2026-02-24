/**
 * Workflow Editor Zustand store.
 * Manages template, nodes, edges, selection, pan/zoom, simulation state.
 */

import { create } from 'zustand'
import type {
  WorkflowTemplate,
  WorkflowNode,
  WorkflowEdge,
  WorkflowNodeType,
  SimulationResult,
} from '@/types/workflow-editor'

interface WorkflowState {
  // Template
  template: WorkflowTemplate | null
  templates: WorkflowTemplate[]
  setTemplate: (t: WorkflowTemplate | null) => void
  setTemplates: (t: WorkflowTemplate[]) => void

  // Nodes & edges
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  setNodes: (n: WorkflowNode[]) => void
  setEdges: (e: WorkflowEdge[]) => void
  addNode: (n: WorkflowNode) => void
  updateNode: (id: string, updates: Partial<WorkflowNode>) => void
  removeNode: (id: string) => void
  addEdge: (e: WorkflowEdge) => void
  removeEdge: (id: string) => void

  // Selection
  selectedNodeId: string | null
  selectedEdgeId: string | null
  setSelectedNode: (id: string | null) => void
  setSelectedEdge: (id: string | null) => void

  // Canvas
  pan: { x: number; y: number }
  zoom: number
  setPan: (p: { x: number; y: number }) => void
  setZoom: (z: number) => void

  // Simulation
  simulationResult: SimulationResult | null
  isSimulating: boolean
  setSimulationResult: (r: SimulationResult | null) => void
  setIsSimulating: (v: boolean) => void

  // UI
  isSimulationPanelOpen: boolean
  isPropertiesPanelOpen: boolean
  setSimulationPanelOpen: (v: boolean) => void
  setPropertiesPanelOpen: (v: boolean) => void
}

export const useWorkflowStore = create<WorkflowState>((set) => ({
  template: null,
  templates: [],
  setTemplate: (t) => set({ template: t }),
  setTemplates: (t) => set({ templates: t }),

  nodes: [],
  edges: [],
  setNodes: (n) => set({ nodes: n ?? [] }),
  setEdges: (e) => set({ edges: e ?? [] }),
  addNode: (n) =>
    set((s) => ({
      nodes: [...(s.nodes ?? []), n],
    })),
  updateNode: (id, updates) =>
    set((s) => ({
      nodes: (s.nodes ?? []).map((node) =>
        node.id === id ? { ...node, ...updates } : node
      ),
    })),
  removeNode: (id) =>
    set((s) => {
      const edges = s.edges ?? []
      const edgeConnectedToRemoved =
        s.selectedEdgeId &&
        edges.some(
          (e) =>
            e.id === s.selectedEdgeId &&
            (e.fromNodeId === id || e.toNodeId === id)
        )
      return {
        nodes: (s.nodes ?? []).filter((n) => n.id !== id),
        edges: edges.filter((e) => e.fromNodeId !== id && e.toNodeId !== id),
        selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
        selectedEdgeId: edgeConnectedToRemoved ? null : s.selectedEdgeId,
      }
    }),
  addEdge: (e) =>
    set((s) => ({
      edges: [...(s.edges ?? []), e],
    })),
  removeEdge: (id) =>
    set((s) => ({
      edges: (s.edges ?? []).filter((e) => e.id !== id),
      selectedEdgeId: s.selectedEdgeId === id ? null : s.selectedEdgeId,
    })),

  selectedNodeId: null,
  selectedEdgeId: null,
  setSelectedNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
  setSelectedEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),

  pan: { x: 0, y: 0 },
  zoom: 1,
  setPan: (p) => set({ pan: p }),
  setZoom: (z) => set({ zoom: Math.max(0.25, Math.min(2, z)) }),

  simulationResult: null,
  isSimulating: false,
  setSimulationResult: (r) => set({ simulationResult: r }),
  setIsSimulating: (v) => set({ isSimulating: v }),

  isSimulationPanelOpen: false,
  isPropertiesPanelOpen: true,
  setSimulationPanelOpen: (v) => set({ isSimulationPanelOpen: v }),
  setPropertiesPanelOpen: (v) => set({ isPropertiesPanelOpen: v }),
}))

export function generateNodeId(): string {
  return `n${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function generateEdgeId(): string {
  return `e${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
