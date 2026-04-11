declare module 'pdf-parse';
import { NextRequest, NextResponse } from 'next/server'
import { analyzeBoete } from '@/lib/analyze'
import type { AnalyzeResult } from '@/lib/types'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Geen bestand ontvangen' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Bestand te groot (max 10MB)' }, { status: 400 })
    }

    const fileType = file.type || 'application/octet-stream'

    if (!ALLOWED_TYPES.includes(fileType) && !file.name.match(/\.(jpg|jpeg|png|pdf|heic)$/i)) {
      return NextResponse.json(
        { error: 'Bestandstype niet ondersteund. Gebruik .jpg, .png, .pdf of .heic' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    let result: AnalyzeResult

    if (fileType === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      // Extract text from PDF
      let extractedText = ''
      try {
        const pdfParse = (await import('pdf-parse')).default
        const pdfData = await pdfParse(buffer)
        extractedText = pdfData.text
      } catch {
        // PDF parse failed, try as image
        console.log('PDF text extraction failed, sending as base64')
      }

      if (extractedText && extractedText.length > 100) {
        result = await analyzeBoete(undefined, undefined, extractedText)
      } else {
        // PDF might be scanned — send first page as image via base64
        const base64 = buffer.toString('base64')
        result = await analyzeBoete(base64, 'image/png', undefined)
      }
    } else {
      // Image file
      const base64 = buffer.toString('base64')
      const mediaType = fileType.startsWith('image/') ? fileType : 'image/jpeg'
      result = await analyzeBoete(base64, mediaType, undefined)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Analyze error:', error)
    
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'API configuratiefout. Controleer ANTHROPIC_API_KEY.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Analyse mislukt. Probeer opnieuw of neem contact op.' },
      { status: 500 }
    )
  }
}
