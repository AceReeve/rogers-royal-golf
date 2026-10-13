import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { CACHE_CONTROL } from '@/lib/http/cache-control'

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.from('tours').select('*').eq('id', id).maybeSingle()

    if (error) throw error
    if (!data) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
    }

    return NextResponse.json(
      { tour: data },
      {
        headers: {
          'Cache-Control': CACHE_CONTROL.detail,
        },
      }
    )
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch tour' },
      { status: 500 }
    )
  }
}
