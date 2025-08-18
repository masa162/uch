# タスク詳細: TSK-015

**ID**: `TSK-015`
**タイトル**: サイドバーコンポーネントの移植
**ステータス**: 未着手
**優先度**: 高

## 1. タスクの目的

アプリケーションの主要なナビゲーション要素であるサイドバーを旧プロジェクトから移植し、共通レイアウトに組み込む。これにより、ユーザーがサイト内を効率的に移動できる基盤を構築する。

## 2. 手順

`/Users/nakayamamasayuki/Documents/GitHub/uch/src/components/Sidebar.tsx` ファイルを新規作成し、以下の内容をコピー＆ペーストしてください。

```typescript
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Tag, Calendar, BookOpen, Menu, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  // 仮のデータ
  const tags = ['家族', '旅行', '日常', '料理', 'イベント'];
  const monthlyArchives = [
    { year: 2025, month: '08', count: 5 },
    { year: 2025, month: '07', count: 12 },
    { year: 2025, month: '06', count: 8 },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 検索ロジックをここに実装
    console.log('検索実行');
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-base-100 shadow-lg transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}
    >
      <div className="p-4 flex items-center justify-between md:justify-center">
        <Link href="/">
          <Image
            src="/images/ogp/title_sq.png"
            alt="うちのきろく"
            width={120}
            height={120}
            className="cursor-pointer"
          />
        </Link>
        <button className="md:hidden text-gray-600" onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      <div className="p-4">
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="検索..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>
        </form>

        <nav className="space-y-2">
          {/* タグ一覧 */}
          <div>
            <button
              className="w-full flex items-center justify-between p-2 text-gray-700 hover:bg-base-200 rounded-md"
              onClick={() => setIsTagsOpen(!isTagsOpen)}
            >
              <span className="flex items-center">
                <Tag size={18} className="mr-2" />
                タグ一覧
              </span>
              <span className="text-sm">{isTagsOpen ? '▲' : '▼'}</span>
            </button>
            {isTagsOpen && (
              <ul className="ml-4 mt-1 space-y-1">
                {tags.map((tag) => (
                  <li key={tag}>
                    <Link
                      href={`/tags/${tag}`}
                      className="block p-2 text-gray-600 hover:bg-base-200 rounded-md"
                    >
                      {tag}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 月別アーカイブ */}
          <div>
            <button
              className="w-full flex items-center justify-between p-2 text-gray-700 hover:bg-base-200 rounded-md"
              onClick={() => setIsArchiveOpen(!isArchiveOpen)}
            >
              <span className="flex items-center">
                <Calendar size={18} className="mr-2" />
                月別アーカイブ
              </span>
              <span className="text-sm">{isArchiveOpen ? '▲' : '▼'}</span>
            </button>
            {isArchiveOpen && (
              <ul className="ml-4 mt-1 space-y-1">
                {monthlyArchives.map((archive) => (
                  <li key={`${archive.year}-${archive.month}`}>
                    <Link
                      href={`/archive/${archive.year}/${archive.month}`}
                      className="block p-2 text-gray-600 hover:bg-base-200 rounded-md"
                    >
                      {archive.year}年{archive.month}月 ({archive.count})
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* エッセイ */}
          <div>
            <Link
              href="/essays"
              className="w-full flex items-center p-2 text-gray-700 hover:bg-base-200 rounded-md"
            >
              <BookOpen size={18} className="mr-2" />
              エッセイ
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
```

## 3. 完了の定義

*   `src/components/Sidebar.tsx` が上記内容で作成されていること。

## 4. 検証方法

PMがファイル内容を読み取り、意図通りに作成されていることを確認する。
