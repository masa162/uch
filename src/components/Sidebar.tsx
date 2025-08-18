'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Sidebar() {
  return (
    <div className="card bg-base-100 shadow-xl p-6 space-y-4">
      {/* 検索ボックス */}
      <div className="form-control">
        <input 
          type="text" 
          placeholder="記事を検索..." 
          className="input input-bordered" 
        />
      </div>
      
      {/* 発見とメモ */}
      <div className="space-y-2">
        <h3 className="font-bold text-primary-dark">🔍 発見とメモ</h3>
        <ul className="menu">
          <li>
            <a className="hover:bg-primary-light hover:text-primary-dark transition-colors">
              🏷️ タグ一覧
            </a>
          </li>
          <li>
            <a className="hover:bg-primary-light hover:text-primary-dark transition-colors">
              📂 月別アーカイブ
            </a>
          </li>
          <li>
            <a className="hover:bg-primary-light hover:text-primary-dark transition-colors">
              📝 エッセイ
            </a>
          </li>
        </ul>
      </div>
      
      {/* よく使われるタグ */}
      <div className="space-y-2">
        <h3 className="font-bold text-primary-dark">🏷️ 人気のタグ</h3>
        <div className="flex flex-wrap gap-2">
          <span className="badge badge-primary badge-outline">家族</span>
          <span className="badge badge-primary badge-outline">思い出</span>
          <span className="badge badge-primary badge-outline">旅行</span>
          <span className="badge badge-primary badge-outline">料理</span>
          <span className="badge badge-primary badge-outline">季節</span>
        </div>
      </div>
    </div>
  );
}