'use client'

import AuthenticatedLayout from '@/components/AuthenticatedLayout'

export default function AboutPage() {
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="prose prose-lg max-w-none">
          {/* ヘッダー */}
          <h1 className="text-4xl font-bold text-center mb-8">このサイトについて</h1>

          <div className="bg-primary/10 p-6 rounded-lg mb-8">
            <blockquote className="text-xl text-center italic text-primary-dark mb-0">
              おかえりなさい 🏠 ここは、家族みんなの「思い出」がゆっくり育つ場所です。
            </blockquote>
          </div>

          <p className="text-lg text-center mb-12">
            最初にお伝えしたいのは、とてもシンプルなこと――<strong>機能よりも、心を。完璧さよりも、あたたかさを。</strong> そんな想いで、このサイトをつくっています。
          </p>

          <hr className="my-8 border-base-300" />

          {/* どんなサイト？ */}
          <h2 className="text-2xl font-bold text-primary-dark mb-4">どんなサイト？</h2>
          <p className="mb-4">
            <strong>うちのきろく</strong>は、家族の何気ない毎日や出来事を「思い出」としてやさしく残し、家族だけで安心して共有できる小さなリビングのような場所です。
          </p>
          <ul className="list-disc list-inside mb-8 space-y-2">
            <li>家族だけの"あいことば"で入れる、クローズドな記録の部屋</li>
            <li>やさしい言葉づかいと絵文字で、年齢を問わず使いやすいUI</li>
            <li>ひとつひとつの投稿を"宝箱"のように大切に扱う設計</li>
          </ul>

          <hr className="my-8 border-base-300" />

          {/* 大切にしていること */}
          <h2 className="text-2xl font-bold text-primary-dark mb-4">大切にしていること</h2>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li><strong>フレンドリー</strong>：むずかしい言葉や専門用語を避け、親しみやすく。</li>
            <li><strong>あたたかさ</strong>：失敗を責めず、「もういちどやってみましょうね」と寄り添う。</li>
            <li><strong>ゆるさ</strong>：完璧でなくて大丈夫。できるところから、少しずつ。</li>
            <li><strong>親近感</strong>：家族の距離感で、やさしいコミュニケーションを。</li>
          </ul>
          <div className="bg-base-200 p-4 rounded-lg mb-8">
            <p className="mb-0 text-sm">
              たとえば、「ログイン」=「おかえりなさい」/「パスワード」=「あいことば」/「エラー」=「あれれ？」など、言葉の置き換えもその一環です。
            </p>
          </div>

          <hr className="my-8 border-base-300" />

          {/* できること */}
          <h2 className="text-2xl font-bold text-primary-dark mb-4">できること（主な機能）</h2>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li><strong>思い出を書く</strong>：テキストや写真で、かんたん投稿。</li>
            <li><strong>家族だけで共有</strong>：外部に公開しない、安心のプライベート空間。</li>
            <li><strong>やさしい認証</strong>：LINEなど普段使うサービスでの"かんたんログイン"にも対応。</li>
            <li><strong>見返す楽しみ</strong>：タグや月別表示で、振り返りやすく。</li>
          </ul>
          <div className="bg-base-200 p-4 rounded-lg mb-8">
            <p className="mb-0 text-sm">
              将来的には、イベントごとのまとめ、アルバム表示、印刷用レイアウトなども検討中です。
            </p>
          </div>

          <hr className="my-8 border-base-300" />

          {/* 使いかた */}
          <h2 className="text-2xl font-bold text-primary-dark mb-4">使いかた（3ステップ）</h2>
          <ol className="list-decimal list-inside mb-4 space-y-2">
            <li><strong>あいことばを入力</strong>して「おかえりなさい」。</li>
            <li><strong>思い出を書く</strong>（タイトル・本文・写真を選ぶだけ）。</li>
            <li><strong>家族で読んで、ほほえむ</strong>（コメントやリアクションで温かく）。</li>
          </ol>
          <div className="bg-base-200 p-4 rounded-lg mb-8">
            <p className="mb-0 text-sm">
              うまくいかない時は「あれれ？」と表示されます。少し休んで、もう一度おためしくださいね 😊
            </p>
          </div>

          <hr className="my-8 border-base-300" />

          {/* 安心への取り組み */}
          <h2 className="text-2xl font-bold text-primary-dark mb-4">安心への取り組み</h2>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li><strong>家族のための設計</strong>：高齢の方にも使いやすい導線・文言。</li>
            <li><strong>認証の工夫</strong>：複数のログイン手段を用意。覚えることはできるだけ少なく。</li>
            <li><strong>責めないメッセージ</strong>：失敗の原因探しより、いっしょに解決。</li>
          </ul>
          <div className="bg-base-200 p-4 rounded-lg mb-8">
            <p className="mb-0 text-sm">
              もし「あいことば」を忘れても大丈夫。新しい"あいことば"をお送りします。
            </p>
          </div>

          <hr className="my-8 border-base-300" />

          {/* よくある質問 */}
          <h2 className="text-2xl font-bold text-primary-dark mb-4">よくある質問（FAQ）</h2>
          <div className="space-y-4 mb-8">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-bold text-lg">Q. 間違って投稿したら？</h3>
              <p>A. あわてなくて大丈夫です。編集・非表示・削除のいずれかで落ち着いて対応できます。</p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-bold text-lg">Q. あいことばを忘れました。</h3>
              <p>A. 中山正之にお知らせください。確認のうえ、新しい"あいことば"をご案内します。</p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-bold text-lg">Q. 写真はどのくらいのサイズがいい？</h3>
              <p>A. スマホ表示でも見やすいサイズ（目安1〜2MB以内）をおすすめしています。難しければそのままでもOKです。
              動画は1本につき15分までの制限があります。</p>
            </div>
          </div>

          <hr className="my-8 border-base-300" />

          {/* 運営について */}
          <h2 className="text-2xl font-bold text-primary-dark mb-4">運営について</h2>
          <ul className="list-disc list-inside mb-8 space-y-2">
            <li><strong>サイト名</strong>：うちのきろく</li>
            <li><strong>目的</strong>：家族のやさしい記録と共有</li>
            <li><strong>更新方針</strong>：「家族の絆が深まるか」「みんなが使いやすいか」「温かい気持ちになれるか」「誰も置き去りにしていないか」を判断基準にします。</li>
          </ul>

          <hr className="my-8 border-base-300" />

          {/* 開発メモ */}
          <details className="mb-8">
            <summary className="text-xl font-bold text-primary-dark cursor-pointer hover:text-primary transition-colors">
              開発メモ（開発者向け・要約）
            </summary>
            <div className="mt-4 p-4 bg-base-200 rounded-lg">
              <ul className="list-disc list-inside space-y-2">
                <li><strong>フレームワーク</strong>：Next.js（App Router）/ TypeScript / React</li>
                <li><strong>認証</strong>：OAuth（Google / LINE など）＋ あいことば運用</li>
                <li><strong>UI/UX</strong>：やさしい言い換え・絵文字・控えめなアニメーション（hover:scale-[102%] 等）</li>
                <li><strong>レポジトリ</strong>：`uch`（アプリ）/ `uch-docs`（ドキュメント）</li>
              </ul>
              <p className="mt-4 text-sm">
                詳細な設計や運用ルールは設計書をご覧ください（アーキテクチャ、セキュリティ、レイアウト仕様など）。
              </p>
            </div>
          </details>

          <hr className="my-8 border-base-300" />

          {/* メッセージ */}
          <div className="bg-primary/5 p-8 rounded-xl text-center mb-8">
            <blockquote className="text-lg italic text-primary-dark">
              家族って、完璧じゃなくていい。<br />
              失敗しても、わからなくても、いっしょに進めばいい。<br />
              ここは、そんな家族のための、小さな"心の居場所"です。
            </blockquote>
          </div>

          {/* 最後に */}
          <h3 className="text-xl font-bold text-primary-dark mb-4">最後に</h3>
          <p className="mb-8">
            もしこのページを読んで、「すこし安心した」「使ってみたい」と感じてもらえたなら、それがいちばんのごほうびです。
            これからも、<strong>機能よりも、心を。</strong> ゆっくり育てていきます。
          </p>

          <div className="text-center mb-8">
            <p className="text-lg font-semibold">— うちのきろく 制作チーム</p>
          </div>

          <div className="text-center text-sm text-base-content/60">
            <p><em>最終更新日：2025年9月20日</em></p>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}