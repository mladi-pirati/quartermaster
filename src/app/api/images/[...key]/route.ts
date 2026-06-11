import { getS3Object } from '@/lib/s3'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params
  const s3Key = key.join('/')

  try {
    const object = await getS3Object(s3Key)

    if (!object.Body) {
      return new NextResponse(null, { status: 404 })
    }

    const stream = object.Body.transformToWebStream()

    return new NextResponse(stream, {
      headers: {
        'Content-Type': object.ContentType ?? 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
        ...(object.ContentLength
          ? { 'Content-Length': String(object.ContentLength) }
          : {}),
      },
    })
  } catch {
    return new NextResponse(null, { status: 404 })
  }
}
