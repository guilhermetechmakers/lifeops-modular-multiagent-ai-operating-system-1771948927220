/**
 * ReconciliationWorkspace - Match transactions to statement items, resolve conflicts.
 */

import { useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link2, Unlink, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Transaction, StatementItem } from '@/types/transactions-reconciliation'

export interface ReconciliationWorkspaceProps {
  selectedTransactions: Transaction[]
  statementItems: StatementItem[]
  onMatch: (transactionId: string, statementItemId: string, reason?: string) => void
  onUnmatch: (transactionId: string) => void
  onClose?: () => void
  className?: string
}

export function ReconciliationWorkspace({
  selectedTransactions = [],
  statementItems = [],
  onMatch,
  onUnmatch,
  onClose,
  className,
}: ReconciliationWorkspaceProps) {
  const txs = Array.isArray(selectedTransactions) ? selectedTransactions : []
  const stmts = Array.isArray(statementItems) ? statementItems : []

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

  const getSuggestedMatch = useCallback(
    (tx: Transaction): StatementItem | null => {
      const match = stmts.find(
        (s) =>
          !s.reconciledWithTransactionId &&
          Math.abs(s.amount - Math.abs(tx.amount)) < 0.01 &&
          s.date === tx.date
      )
      return match ?? null
    },
    [stmts]
  )

  if (txs.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>Select transactions to reconcile</p>
          <p className="text-sm mt-1">Load a bank statement to match line items</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Reconciliation Workspace</CardTitle>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {txs.length} transaction(s) selected. {stmts.length} statement item(s) loaded.
        </p>

        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {txs.map((tx) => {
            const suggested = getSuggestedMatch(tx)
            const matchedStmt = stmts.find((s) => s.reconciledWithTransactionId === tx.id) ?? null

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50"
              >
                <div>
                  <p className="font-medium text-sm">{tx.merchant}</p>
                  <p className="text-xs text-muted-foreground">{tx.description}</p>
                  <p
                    className={cn(
                      'text-sm font-medium mt-1',
                      tx.amount >= 0 ? 'text-success' : 'text-destructive'
                    )}
                  >
                    {formatAmount(tx.amount)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {tx.reconciled && matchedStmt ? (
                    <>
                      <Badge variant="default" className="bg-success/20 text-success">
                        Matched
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onUnmatch(tx.id)}
                        aria-label="Unmatch"
                      >
                        <Unlink className="h-4 w-4" />
                      </Button>
                    </>
                  ) : suggested ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onMatch(tx.id, suggested.id)}
                      className="gap-1"
                    >
                      <Link2 className="h-4 w-4" />
                      Match to {formatAmount(suggested.amount)}
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">No suggested match</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {stmts.length === 0 && (
          <div className="p-4 rounded-lg border border-dashed border-border text-center text-sm text-muted-foreground">
            Load a bank statement (CSV or manual entry) to see suggested matches.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
