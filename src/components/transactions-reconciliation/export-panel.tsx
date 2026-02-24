/**
 * ExportPanel - Select format, fields, trigger export, progress, download.
 */

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Download, Loader2 } from 'lucide-react'
import type { ExportJob } from '@/types/transactions-reconciliation'

const FORMAT_OPTIONS = [
  { value: 'csv', label: 'CSV' },
  { value: 'excel', label: 'Excel' },
  { value: 'json', label: 'JSON' },
  { value: 'artifact', label: 'Artifact (PDF)' },
]

const FIELD_OPTIONS = [
  { value: 'date', label: 'Date' },
  { value: 'description', label: 'Description' },
  { value: 'amount', label: 'Amount' },
  { value: 'account', label: 'Account' },
  { value: 'category', label: 'Category' },
  { value: 'tags', label: 'Tags' },
  { value: 'status', label: 'Reconciliation Status' },
  { value: 'confidence', label: 'Confidence' },
  { value: 'notes', label: 'Notes' },
]

export interface ExportPanelProps {
  formatOptions?: typeof FORMAT_OPTIONS
  fields?: string[]
  onExport: (format: 'csv' | 'excel' | 'json' | 'artifact', fields: string[]) => void
  exportStatus: ExportJob | null
  className?: string
}

export function ExportPanel({
  formatOptions = FORMAT_OPTIONS,
  fields: defaultFields = ['date', 'description', 'amount', 'account', 'category', 'status'],
  onExport,
  exportStatus,
  className,
}: ExportPanelProps) {
  const [format, setFormat] = useState<'csv' | 'excel' | 'json' | 'artifact'>('csv')
  const [selectedFields, setSelectedFields] = useState<string[]>(defaultFields)

  const handleToggleField = useCallback((value: string, checked: boolean) => {
    setSelectedFields((prev) =>
      checked ? [...prev, value] : prev.filter((f) => f !== value)
    )
  }, [])

  const handleExport = useCallback(() => {
    if (selectedFields.length > 0) {
      onExport(format, selectedFields)
    }
  }, [format, selectedFields, onExport])

  const isExporting = exportStatus?.status === 'running'
  const isComplete = exportStatus?.status === 'complete'

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Export</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Format</label>
          <Select value={format} onValueChange={(v) => setFormat(v as typeof format)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(formatOptions ?? []).map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Fields to include</label>
          <div className="grid grid-cols-2 gap-2">
            {(FIELD_OPTIONS ?? []).map((f) => (
              <label
                key={f.value}
                className="flex items-center gap-2 cursor-pointer text-sm"
              >
                <Checkbox
                  checked={selectedFields.includes(f.value)}
                  onCheckedChange={(checked) =>
                    handleToggleField(f.value, checked === true)
                  }
                />
                {f.label}
              </label>
            ))}
          </div>
        </div>

        {isComplete && exportStatus?.downloadUrl ? (
          <a href={exportStatus.downloadUrl} download>
            <Button className="w-full gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
          </a>
        ) : (
          <Button
            onClick={handleExport}
            disabled={isExporting || selectedFields.length === 0}
            className="w-full gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-pulse" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export
              </>
            )}
          </Button>
        )}

        {exportStatus?.progress != null && exportStatus.progress < 100 && (
          <div className="space-y-1">
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${exportStatus.progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {exportStatus.progress}% complete
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
