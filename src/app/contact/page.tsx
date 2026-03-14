import type { Metadata } from 'next';
import LegalPageLayout from '@/components/LegalPageLayout';

export const metadata: Metadata = {
  title: 'お問い合わせ',
  description: 'Chain News Japan へのお問い合わせ方法、受付内容、回答方針のご案内。',
};

export default function ContactPage() {
  return (
    <LegalPageLayout
      title="お問い合わせ"
      lead="Chain News Japanに関するご意見・ご要望・掲載内容に関するご連絡・権利関係のお問い合わせ等は、以下の窓口までご連絡ください。"
    >
      <section>
        <h2>1. 受付内容</h2>
        <ul>
          <li>掲載内容の誤り、表示不具合、リンク切れに関するご連絡</li>
          <li>権利関係、著作権、削除依頼、引用表記等に関するご相談</li>
          <li>広告掲載、業務提携、媒体に関するお問い合わせ</li>
          <li>プライバシー、個人情報の取扱いに関するご連絡</li>
        </ul>
      </section>

      <section>
        <h2>2. お問い合わせ方法</h2>
        <p>以下のメールアドレスへご連絡ください。件名に「お問い合わせ種別」（例：削除依頼 / 広告掲載 / 不具合報告など）を記載いただけると、対応がスムーズです。</p>
        <ul>
          <li>メールアドレス: <a href="mailto:chainnewsjapan@gmail.com">chainnewsjapan@gmail.com</a></li>
          <li>対応言語: 日本語</li>
          <li>受付時間: 平日 10:00〜18:00（土日祝を除く）</li>
        </ul>
      </section>

      <section>
        <h2>3. 回答方針</h2>
        <p>お問い合わせ内容を確認のうえ、必要に応じて回答します。すべてのお問い合わせに対する返信を保証するものではありません。また、内容によっては回答までに時間を要する場合があります。</p>
      </section>

      <section>
        <h2>4. 対応できない内容</h2>
        <ul>
          <li>個別銘柄の将来価格予想、売買タイミング、投資判断に関するご相談</li>
          <li>相場の見通しや資産運用アドバイスの依頼</li>
          <li>誹謗中傷、脅迫、違法行為、営業スパムその他不適切な内容</li>
        </ul>
        <p>当サイトは投資助言を行っていないため、個別の投資相談には対応しません。</p>
      </section>

      <section>
        <h2>5. 個人情報の取扱い</h2>
        <p>お問い合わせ時に取得した氏名、メールアドレス、問い合わせ内容等は、回答対応、本人確認、記録保管、必要な法的対応のために利用します。詳細はプライバシーポリシーをご確認ください。</p>
      </section>

      <section>
        <h2>6. 権利侵害に関するご連絡</h2>
        <p>当サイト上の表示に関して著作権、商標権、肖像権、その他の権利侵害があるとお考えの場合は、対象ページURL、対象箇所、権利内容、連絡先を明記のうえご連絡ください。内容を確認のうえ、必要に応じて速やかに対応します。</p>
      </section>
    </LegalPageLayout>
  );
}