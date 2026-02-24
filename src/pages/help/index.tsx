import { useState, useEffect, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Search,
  ArrowLeft,
  BookOpen,
  Code2,
  GraduationCap,
  HelpCircle,
  FileText,
  Send,
  ChevronRight,
  Mail,
} from 'lucide-react'
import {
  getHelpCategories,
  getDocsByCategory,
  searchDocs,
  getDocById,
  submitSupportContact,
  type HelpCategory,
  type HelpDoc,
} from '@/api/help'
import { cn } from '@/lib/utils'

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'getting-started': BookOpen,
  'api-docs': Code2,
  tutorials: GraduationCap,
  faq: HelpCircle,
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

function SearchBar({
  value,
  onChange,
  placeholder = 'Search documentation...',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
        aria-label="Search documentation"
      />
    </div>
  )
}

function CategoryNav({
  categories,
  activeId,
  onSelect,
}: {
  categories: HelpCategory[]
  activeId: string | null
  onSelect: (id: string) => void
}) {
  const items = categories ?? []
  return (
    <nav className="space-y-1" aria-label="Help categories">
      {items.map((cat) => {
        const Icon = CATEGORY_ICONS[cat.id] ?? FileText
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
              activeId === cat.id
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {cat.title}
          </button>
        )
      })}
    </nav>
  )
}

function TutorialCard({
  doc,
  onClick,
}: {
  doc: HelpDoc
  onClick: () => void
}) {
  return (
    <Card
      className="cursor-pointer transition-all duration-200 hover:shadow-card-hover hover:border-primary/30"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-primary" />
          {doc.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {doc.excerpt}
        </p>
        <span className="inline-flex items-center gap-1 text-sm text-primary mt-2 font-medium">
          Read guide
          <ChevronRight className="h-4 w-4" />
        </span>
      </CardContent>
    </Card>
  )
}

function APIReferenceCard({
  doc,
  onClick,
}: {
  doc: HelpDoc
  onClick: () => void
}) {
  return (
    <Card
      className="cursor-pointer transition-all duration-200 hover:shadow-card-hover hover:border-primary/30"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Code2 className="h-4 w-4 text-primary" />
          {doc.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {doc.excerpt}
        </p>
        <span className="inline-flex items-center gap-1 text-sm text-primary mt-2 font-medium">
          View reference
          <ChevronRight className="h-4 w-4" />
        </span>
      </CardContent>
    </Card>
  )
}

function FAQCard({
  doc,
  onClick,
}: {
  doc: HelpDoc
  onClick: () => void
}) {
  return (
    <Card
      className="cursor-pointer transition-all duration-200 hover:shadow-card-hover hover:border-primary/30"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-primary" />
          {doc.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {doc.excerpt}
        </p>
        <span className="inline-flex items-center gap-1 text-sm text-primary mt-2 font-medium">
          Read answer
          <ChevronRight className="h-4 w-4" />
        </span>
      </CardContent>
    </Card>
  )
}

function DocCard({
  doc,
  categoryId,
  onClick,
}: {
  doc: HelpDoc
  categoryId: string
  onClick: () => void
}) {
  if (categoryId === 'tutorials') return <TutorialCard doc={doc} onClick={onClick} />
  if (categoryId === 'api-docs') return <APIReferenceCard doc={doc} onClick={onClick} />
  if (categoryId === 'faq') return <FAQCard doc={doc} onClick={onClick} />
  return (
    <Card
      className="cursor-pointer transition-all duration-200 hover:shadow-card-hover hover:border-primary/30"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          {doc.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {doc.excerpt}
        </p>
        <span className="inline-flex items-center gap-1 text-sm text-primary mt-2 font-medium">
          Read more
          <ChevronRight className="h-4 w-4" />
        </span>
      </CardContent>
    </Card>
  )
}

function TutorialStep({
  step,
  index,
  isActive,
  isComplete,
}: {
  step: string
  index: number
  isActive: boolean
  isComplete: boolean
}) {
  return (
    <div className="flex gap-4">
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors',
          isComplete && 'bg-success/20 text-success',
          isActive && !isComplete && 'bg-primary/20 text-primary',
          !isActive && !isComplete && 'bg-muted text-muted-foreground'
        )}
      >
        {isComplete ? '✓' : index + 1}
      </div>
      <div className="flex-1 pb-6">
        <p
          className={cn(
            'text-sm font-medium',
            isActive ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {step}
        </p>
      </div>
    </div>
  )
}

function SupportContactForm({
  onSuccess,
}: {
  onSuccess?: () => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = useCallback(() => {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = 'Name is required'
    if (!email.trim()) next.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Invalid email'
    if (!subject.trim()) next.subject = 'Subject is required'
    if (!message.trim()) next.message = 'Message is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }, [name, email, subject, message])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    try {
      const result = await submitSupportContact({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      })
      if (result?.success) {
        toast.success(result.message ?? 'Support request sent successfully.')
        setName('')
        setEmail('')
        setSubject('')
        setMessage('')
        setErrors({})
        onSuccess?.()
      } else {
        toast.error('Failed to send. Please try again.')
      }
    } catch {
      toast.error('Failed to send. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="support-name" className="block text-sm font-medium mb-1.5">
          Name
        </label>
        <Input
          id="support-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className={errors.name ? 'border-destructive' : ''}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'support-name-error' : undefined}
        />
        {errors.name && (
          <p id="support-name-error" className="text-sm text-destructive mt-1">
            {errors.name}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="support-email" className="block text-sm font-medium mb-1.5">
          Email
        </label>
        <Input
          id="support-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={errors.email ? 'border-destructive' : ''}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'support-email-error' : undefined}
        />
        {errors.email && (
          <p id="support-email-error" className="text-sm text-destructive mt-1">
            {errors.email}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="support-subject" className="block text-sm font-medium mb-1.5">
          Subject
        </label>
        <Input
          id="support-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Brief subject"
          className={errors.subject ? 'border-destructive' : ''}
          aria-invalid={!!errors.subject}
        />
        {errors.subject && (
          <p className="text-sm text-destructive mt-1">{errors.subject}</p>
        )}
      </div>
      <div>
        <label htmlFor="support-message" className="block text-sm font-medium mb-1.5">
          Message
        </label>
        <Textarea
          id="support-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe your issue or question..."
          rows={5}
          className={errors.message ? 'border-destructive' : ''}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'support-message-error' : undefined}
        />
        {errors.message && (
          <p id="support-message-error" className="text-sm text-destructive mt-1">
            {errors.message}
          </p>
        )}
      </div>
      <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
        {isSubmitting ? (
          <span className="animate-pulse">Sending...</span>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Send message
          </>
        )}
      </Button>
    </form>
  )
}

export function HelpDocumentationPage() {
  const { category: categoryParam, doc: docParam } = useParams<{
    category?: string
    doc?: string
  }>()
  const navigate = useNavigate()
  const [categories, setCategories] = useState<HelpCategory[]>([])
  const [docs, setDocs] = useState<HelpDoc[]>([])
  const [searchResults, setSearchResults] = useState<
    { id: string; title: string; excerpt: string; slug: string }[]
  >([])
  const [selectedDoc, setSelectedDoc] = useState<HelpDoc | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isLoadingDocs, setIsLoadingDocs] = useState(false)
  const [showSupportForm, setShowSupportForm] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 250)

  useEffect(() => {
    let cancelled = false
    getHelpCategories()
      .then((data) => {
        if (!cancelled) {
          const list = Array.isArray(data) ? data : []
          setCategories(list)
          const first = categoryParam ?? list[0]?.id ?? 'getting-started'
          setActiveCategory(first)
          if (!categoryParam) {
            navigate(`/help/${first}`, { replace: true })
          }
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingCategories(false)
      })
    return () => {
      cancelled = true
    }
  }, [categoryParam, navigate])

  useEffect(() => {
    if (!activeCategory) return
    let cancelled = false
    setIsLoadingDocs(true)
    getDocsByCategory(activeCategory)
      .then((data) => {
        if (!cancelled) {
          setDocs(Array.isArray(data) ? data : [])
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDocs(false)
      })
    return () => {
      cancelled = true
    }
  }, [activeCategory])

  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSearchResults([])
      return
    }
    let cancelled = false
    searchDocs(debouncedSearch).then((data) => {
      if (!cancelled) {
        setSearchResults(Array.isArray(data) ? data : [])
      }
    })
    return () => {
      cancelled = true
    }
  }, [debouncedSearch])

  useEffect(() => {
    if (docParam) {
      let cancelled = false
      getDocById(docParam).then((doc) => {
        if (!cancelled) setSelectedDoc(doc ?? null)
      })
      return () => {
        cancelled = true
      }
    } else {
      setSelectedDoc(null)
    }
  }, [docParam])

  const handleSelectCategory = (id: string) => {
    setActiveCategory(id)
    setSelectedDoc(null)
    navigate(`/help/${id}`, { replace: true })
  }

  const handleSelectDoc = (doc: HelpDoc) => {
    setSelectedDoc(doc)
    navigate(`/help/${activeCategory ?? 'getting-started'}/${doc.slug}`, {
      replace: true,
    })
  }

  const handleBackToDocs = () => {
    setSelectedDoc(null)
    navigate(`/help/${activeCategory ?? 'getting-started'}`, { replace: true })
  }

  const content = selectedDoc?.content ?? selectedDoc?.contentHtml ?? ''
  const isTutorial = activeCategory === 'tutorials' && content
  const steps = isTutorial
    ? content
        .split(/\s*Step \d+:\s*/i)
        .map((s) => s.trim())
        .filter(Boolean)
    : []

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <div className="flex items-center gap-3 w-full sm:w-auto sm:max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search docs..."
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSupportForm(!showSupportForm)}
              aria-label="Contact support"
            >
              <Mail className="h-4 w-4" />
              Support
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left nav */}
          <aside className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Help & Documentation</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingCategories ? (
                  <div className="space-y-2 animate-pulse">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-10 bg-muted rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <CategoryNav
                    categories={categories}
                    activeId={activeCategory}
                    onSelect={handleSelectCategory}
                  />
                )}
              </CardContent>
            </Card>
          </aside>

          {/* Main content */}
          <main className="lg:col-span-9 space-y-6">
            {showSupportForm ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Contact Support
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Submit a support request and we&apos;ll get back to you within 24 hours.
                  </p>
                </CardHeader>
                <CardContent>
                  <SupportContactForm onSuccess={() => setShowSupportForm(false)} />
                </CardContent>
              </Card>
            ) : searchQuery.trim() && debouncedSearch === searchQuery ? (
              <Card>
                <CardHeader>
                  <CardTitle>Search results</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {searchResults.length} result(s) for &quot;{searchQuery}&quot;
                  </p>
                </CardHeader>
                <CardContent>
                  {searchResults.length === 0 ? (
                    <p className="text-muted-foreground">No results found.</p>
                  ) : (
                    <div className="space-y-3">
                      {searchResults.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            getDocById(r.id).then((doc) => {
                              if (doc) {
                                setSelectedDoc(doc)
                                setActiveCategory(doc.categoryId)
                                navigate(`/help/${doc.categoryId}/${doc.slug}`)
                                setSearchQuery('')
                              }
                            })
                          }}
                          className="block w-full text-left p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-secondary/50 transition-colors"
                        >
                          <p className="font-medium">{r.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {r.excerpt}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : selectedDoc ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">{selectedDoc.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Last updated: {selectedDoc.updatedAt}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBackToDocs}
                      aria-label="Back to list"
                    >
                      Back to list
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none">
                  {isTutorial && steps.length > 0 ? (
                    <div className="space-y-0">
                      {steps.map((step, i) => (
                        <TutorialStep
                          key={i}
                          step={step}
                          index={i}
                          isActive={i === 0}
                          isComplete={false}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {content || selectedDoc.excerpt}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                <h2 className="text-xl font-semibold">
                  {categories.find((c) => c.id === activeCategory)?.title ?? 'Documentation'}
                </h2>
                {isLoadingDocs ? (
                  <div className="grid gap-4 sm:grid-cols-2 animate-pulse">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-32 bg-muted rounded-xl" />
                    ))}
                  </div>
                ) : docs.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No documents in this category yet.</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setShowSupportForm(true)}
                      >
                        Contact support
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {docs.map((d) => (
                      <DocCard
                        key={d.id}
                        doc={d}
                        categoryId={activeCategory ?? ''}
                        onClick={() => handleSelectDoc(d)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
