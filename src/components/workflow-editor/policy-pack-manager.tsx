/**
 * PolicyPackManager - Editable templates for Privacy, Terms, DPA, Cookie Policy.
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { FileText, Shield, Cookie } from 'lucide-react'
import {
  fetchPolicyDocuments,
  updatePolicyDocument,
} from '@/api/workflow-editor'
import type { PolicyDocument } from '@/types/workflow-editor'
import { toast } from 'sonner'

const POLICY_TYPES = [
  { type: 'Privacy' as const, label: 'Privacy Policy', icon: Shield },
  { type: 'Terms' as const, label: 'Terms of Service', icon: FileText },
  { type: 'DPA' as const, label: 'Data Processing Addendum', icon: FileText },
  { type: 'Cookie' as const, label: 'Cookie Policy', icon: Cookie },
]

export function PolicyPackManager() {
  const [policies, setPolicies] = useState<PolicyDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchPolicyDocuments()
      .then((list) => {
        if (!cancelled) {
          const arr = Array.isArray(list) ? list : []
          setPolicies(arr)
        }
      })
      .catch(() => {
        if (!cancelled) setPolicies([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleEdit = (p: PolicyDocument) => {
    setEditingId(p.id)
    setEditContent(p.content ?? '')
  }

  const handleSave = async () => {
    if (!editingId) return
    try {
      const updated = await updatePolicyDocument(editingId, {
        content: editContent,
      })
      setPolicies((prev) =>
        (prev ?? []).map((x) => (x.id === updated.id ? updated : x))
      )
      setEditingId(null)
      toast.success('Policy updated')
    } catch (e) {
      toast.error((e as Error)?.message ?? 'Failed to update')
    }
  }

  return (
    <Card className="rounded-xl border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Policy Documents</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground py-4">Loading...</p>
        ) : (
          <Tabs defaultValue={POLICY_TYPES[0]?.type ?? 'Privacy'}>
            <TabsList className="w-full flex-wrap h-auto gap-1">
              {(POLICY_TYPES ?? []).map(({ type, label, icon: Icon }) => (
                <TabsTrigger key={type} value={type} className="flex-1 min-w-0">
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
            {(POLICY_TYPES ?? []).map(({ type }) => {
              const policy = (policies ?? []).find((p) => p.type === type)
              const isEditing = editingId === policy?.id
              return (
                <TabsContent key={type} value={type} className="mt-4">
                  {policy ? (
                    <div className="space-y-3">
                      <Textarea
                        value={isEditing ? editContent : policy.content ?? ''}
                        onChange={(e) => {
                          if (isEditing) setEditContent(e.target.value)
                        }}
                        readOnly={!isEditing}
                        rows={8}
                        className="font-mono text-sm"
                      />
                      {isEditing ? (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSave}>
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(null)
                              setEditContent(policy.content ?? '')
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(policy)}
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No {type} policy defined
                    </p>
                  )}
                </TabsContent>
              )
            })}
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
