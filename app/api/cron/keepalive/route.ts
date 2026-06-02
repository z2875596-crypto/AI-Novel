import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    // 执行轻量查询保持 Supabase 活跃
    await supabase.from('_keepalive').select('1').limit(1)
    return NextResponse.json({ ok: true, timestamp: new Date().toISOString() })
  } catch {
    return NextResponse.json({ ok: true, timestamp: new Date().toISOString() })
  }
}
