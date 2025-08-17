import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { provider } = await request.json()
    
    if (!provider) {
      return NextResponse.json({ error: 'Provider is required' }, { status: 400 })
    }

    let configured = false
    let message = ''

    switch (provider) {
      case 'google':
        configured = !!(
          process.env.GOOGLE_CLIENT_ID && 
          process.env.GOOGLE_CLIENT_SECRET &&
          process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id_here' &&
          process.env.GOOGLE_CLIENT_SECRET !== 'your_google_client_secret_here'
        )
        message = configured 
          ? 'Google OAuth設定が完了しています' 
          : 'GOOGLE_CLIENT_ID と GOOGLE_CLIENT_SECRET の設定が必要です'
        break
        
      case 'line':
        configured = !!(
          process.env.LINE_CHANNEL_ID && 
          process.env.LINE_CHANNEL_SECRET &&
          process.env.LINE_CHANNEL_ID !== 'your_line_channel_id_here' &&
          process.env.LINE_CHANNEL_SECRET !== 'your_line_channel_secret_here'
        )
        message = configured 
          ? 'LINE Login設定が完了しています' 
          : 'LINE_CHANNEL_ID と LINE_CHANNEL_SECRET の設定が必要です'
        break
        
      case 'email':
        configured = !!(
          process.env.EMAIL_SERVER_HOST && 
          process.env.EMAIL_SERVER_PORT &&
          process.env.EMAIL_SERVER_USER &&
          process.env.EMAIL_SERVER_PASSWORD &&
          process.env.EMAIL_FROM &&
          process.env.EMAIL_SERVER_USER !== 'your-email@gmail.com' &&
          process.env.EMAIL_SERVER_PASSWORD !== 'your-app-password' &&
          process.env.EMAIL_FROM !== 'your-email@gmail.com'
        )
        message = configured 
          ? 'Email (SMTP) 設定が完了しています' 
          : 'EMAIL_SERVER_* 環境変数の設定が必要です'
        break
        
      default:
        return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
    }

    return NextResponse.json({
      provider,
      configured,
      message
    })
    
  } catch (error) {
    console.error('Auth config test error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}