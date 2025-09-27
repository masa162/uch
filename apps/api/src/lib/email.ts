interface EmailEnv {
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  EMAIL_RESET_URL_BASE?: string;
  EMAIL_BCC_FOR_AUDIT?: string;
}

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

async function sendViaResend(env: EmailEnv, options: SendMailOptions) {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    console.warn('Resend credentialsが設定されていません。メールは送信されません。');
    console.info('送信予定メール:', options);
    return { ok: false, skipped: true };
  }

  const payload: Record<string, unknown> = {
    from: env.EMAIL_FROM,
    to: [options.to],
    subject: options.subject,
    html: options.html,
  };

  if (options.text) {
    payload['text'] = options.text;
  }

  if (env.EMAIL_BCC_FOR_AUDIT) {
    payload['bcc'] = [env.EMAIL_BCC_FOR_AUDIT];
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Resend送信失敗:', response.status, errText);
    return { ok: false, skipped: false };
  }

  return { ok: true };
}

export async function sendEmail(env: EmailEnv, options: SendMailOptions) {
  // 現状Resendのみサポート。将来プロバイダが増えたら分岐追加。
  return sendViaResend(env, options);
}

export function buildPasswordResetEmail(env: EmailEnv, params: { to: string; token: string; expiresAt: string }) {
  const baseUrl = env.EMAIL_RESET_URL_BASE || 'https://uchinokiroku.com/reset-password';
  const resetUrl = `${baseUrl}?token=${encodeURIComponent(params.token)}`;
  const expiresDate = new Date(params.expiresAt);
  const formattedExpires = isNaN(expiresDate.getTime())
    ? '1時間後'
    : expiresDate.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  const subject = '🏠 あいことばのリセット方法をご案内します';
  const text = `\n${params.to} さま\n\nあいことばをお忘れの場合は、こちらのリンクから新しいあいことばを設定してください。\n${resetUrl}\n\nこのリンクは ${formattedExpires} までご利用いただけます。\nもし心当たりがない場合は、このメールはそっと削除してくださいね。\n\nうちのきろく 運営より`;

  const html = `
    <p>${params.to} さま</p>
    <p>あいことばをお忘れの場合は、下のボタンから新しいあいことばを設定してください。</p>
    <p style="margin:24px 0;">
      <a href="${resetUrl}" style="background:#7cbf8c;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block;">
        あたらしい あいことばをつくる
      </a>
    </p>
    <p>このリンクは ${formattedExpires} までご利用いただけます。時間が過ぎた場合は、もう一度リセットをご依頼ください。</p>
    <p>もし心当たりがない場合は、このメールはそっと削除してくださいね。</p>
    <p style="margin-top:24px;">うちのきろく 運営より</p>
  `;

  return { subject, text, html, resetUrl };
}
