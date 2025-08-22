import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  const token = auth.replace('Bearer ','')
  if (process.env.CRON_SECRET && token !== process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY!)
  const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const { data: threads } = await supa
    .from('threads')
    .select('id,title,category,created_at')
    .or('open_today.eq.true,created_at.gte.' + new Date(Date.now()-24*60*60*1000).toISOString())

  const { data: subs } = await supa.from('subscriptions').select('email')

  if (!subs?.length) return NextResponse.json({ ok: true, sent: 0 })

  const html = `
    <div style="font-family:system-ui,Segoe UI,Roboto,Arial">
      <h2>Foros abiertos de hoy</h2>
      <ul>
        ${(threads||[]).map(t=>`<li><strong>[${'${t.category}'}]</strong> ${'${t.title}'}</li>`).join('') || '<li>Sin novedades por ahora</li>'}
      </ul>
      <p>Ingresa al foro: <a href="${'${req.nextUrl.origin}'}">${'${req.nextUrl.origin}'}</a></p>
    </div>`

  await Promise.allSettled(subs.map(s => resend.emails.send({
    from: 'Foro Criollo <noreply@forocriollo.com>',
    to: s.email,
    subject: 'Foros abiertos de hoy',
    html
  })))

  return NextResponse.json({ ok: true, sent: subs.length })
}
