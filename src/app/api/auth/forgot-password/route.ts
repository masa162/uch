import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ 
        message: 'メールアドレスを入力してくださいね 😊' 
      }, { status: 400 })
    }

    // ユーザーを検索
    const user = await prisma.user.findFirst({
      where: { email },
      include: { accounts: true }
    })

    if (!user) {
      // セキュリティのため、ユーザーが存在しない場合も成功メッセージを返す
      return NextResponse.json({
        message: 'もしそのメールアドレスでアカウントがあれば、新しいあいことばをお送りしました 📧',
        type: 'success'
      })
    }

    // credentialsアカウントがあるかチェック
    const credentialsAccount = user.accounts.find(account => account.provider === 'credentials')
    
    if (!credentialsAccount) {
      return NextResponse.json({ 
        message: 'そのメールアドレスは、LINEやGoogleでログインするアカウントのようですね。上のボタンからログインしてみてください 😊',
        type: 'info'
      })
    }

    // 仮パスワードを生成（覚えやすい日本語風）
    const tempPasswords = [
      'sakura2025', 'haru-kibo', 'kazoku123', 'egao456', 
      'shiawase789', 'arigatou2025', 'tanoshii123', 'genki456'
    ]
    const tempPassword = tempPasswords[Math.floor(Math.random() * tempPasswords.length)]
    
    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(tempPassword, 12)

    // アカウントのパスワードを更新
    await prisma.account.update({
      where: { id: credentialsAccount.id },
      data: { access_token: hashedPassword }
    })

    // メール送信設定
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    })

    // 温かいメール内容
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '🏠 うちのきろく - 新しいあいことばをお届けします',
      html: `
        <div style="font-family: 'Hiragino Kaku Gothic Pro', 'ヒラギノ角ゴ Pro W3', Meiryo, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #7cbf8c; margin: 0;">🏠 うちのきろく</h1>
            <p style="color: #666; margin: 10px 0 0 0;">家族のあたたかい思い出をつづる場所</p>
          </div>
          
          <div style="background: #f3eac2; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #9d856a; margin: 0 0 15px 0;">💝 新しいあいことばをお届けします</h2>
            <p style="margin: 0;">お疲れさまでした。新しいあいことばをご用意しました。</p>
          </div>

          <div style="background: #d6eadd; padding: 20px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
            <h3 style="color: #4b8158; margin: 0 0 10px 0;">🔑 新しいあいことば</h3>
            <div style="background: white; padding: 15px; border-radius: 5px; font-size: 18px; font-weight: bold; color: #4b8158;">
              ${tempPassword}
            </div>
            <p style="margin: 15px 0 0 0; font-size: 14px; color: #4b8158;">
              ログイン後、お好きなあいことばに変更できます
            </p>
          </div>

          <div style="background: #f7f8fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
            <h4 style="margin: 0 0 10px 0; color: #333;">👥 ご家族へのお願い</h4>
            <p style="margin: 0; font-size: 14px; color: #666;">
              もしログインでお困りでしたら、ご家族の方にLINEログインをおすすめしてください。<br>
              普段お使いのLINEで、パスワードを覚えることなく簡単にログインできます。
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXTAUTH_URL}/auth/signin" 
               style="background: #7cbf8c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              🏠 うちのきろくへログイン
            </a>
          </div>

          <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
            <p>このメールに心当たりがない場合は、そっと削除してください。</p>
            <p>きっと誰かが間違えて入力しただけです 😊</p>
          </div>
        </div>
      `,
    }

    // メール送信
    await transporter.sendMail(mailOptions)

    return NextResponse.json({
      message: '新しいあいことばをメールでお送りしました。メールボックスをご確認くださいね 📬',
      type: 'success'
    })

  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json({
      message: 'すみません、何かうまくいかなかったようです。しばらく待ってからもう一度お試しください 🙏',
      type: 'error'
    }, { status: 500 })
  }
}