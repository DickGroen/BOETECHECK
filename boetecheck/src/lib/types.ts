export type AnalyzeResult = {
  verdict: 'waarschijnlijk' | 'mogelijk' | 'laag'
  summary: string
  findings: Finding[]
  kenteken?: string
  bedrag?: string
  datum?: string
  deadline?: string
}

export type Finding = {
  type: 'positief' | 'aandachtspunt' | 'fout'
  tekst: string
  artikel?: string
}

export type UploadResponse = {
  success: boolean
  fileId: string
  filename: string
  error?: string
}

export type OrderMetadata = {
  email: string
  kenteken?: string
  bedrag?: string
  deadline?: string
  verdict: string
  summary: string
  findings: string // JSON stringified Finding[]
}

export type CheckoutSession = {
  sessionId: string
  url: string
}
