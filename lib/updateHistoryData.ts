// lib/updateHistoryData.ts

// アップデート情報の型を定義
export interface UpdatePost {
  version: string;
  date: string;
  changes: {
    title: '新機能' | '改善' | '修正' | 'その他';
    details: string[];
  }[];
}

// アップデート履歴のデータ配列
// ★★★ 新しい更新履歴は、この配列の"一番上"に追加してください ★★★
export const updates: UpdatePost[] = [
  {
    version: '1.2.0',
    date: '2025年9月8日',
    changes: [
      {
        title: '新機能',
        details: [
          'サイドバーに設定ページを追加しました。',
          'お問い合わせフォームを設置しました。',
        ],
      },
      {
        title: '改善',
        details: [
          '設定ページで最新のアップデート情報を確認できるようになりました。',
        ],
      },
    ],
  },
  {
    version: '1.1.0',
    date: '2025年8月7日',
    changes: [
      {
        title: 'その他',
        details: [
          'アカウント登録時のユーザIDとパスワードの設定要件を明確に記載しました。',
          '利用規約、プライバシーポリシーを変更しました。',
          'その他軽微なUIの改善を行いました。',
        ],
      },
    ],
  },
  {
    version: '1.0.0',
    date: '2025年8月6日',
    changes: [
      {
        title: 'その他',
        details: [
          'Sync Words のサービス提供を開始しました。',
        ],
      },
    ],
  },
];