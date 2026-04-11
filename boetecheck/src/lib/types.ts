export type AnalyzeResult = {
  verdict: 'waarschijnlijk' | 'mogelijk' | 'lage_kans' | 'onvoldoende_leesbaar'
  confidence?: 'laag' | 'midden' | 'hoog'
  summary: string
  findings: Finding[]
  what_this_means?: string
  recommended_next_step?: string
  deadline_warning?: string
  disclaimer?: string
  kenteken?: string
  bedrag?: string
  datum?: string
  deadline?: string
}

export type Finding = {
  title?: string
  severity?: 'laag' | 'midden' | 'hoog'
  description?: string
  type?: 'positief' | 'aandachtspunt' | 'fout'
  tekst?: string
  artikel?: string
}

export type OrderMetadata = {
  email: string
  kenteken?: string
  bedrag?: string
  deadline?: string
  verdict: string
  summary: string
  findings: string
}

export type CheckoutSession = {
  sessionId: string
  url: string
}
