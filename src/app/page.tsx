'use client';

import { useState } from 'react';
import { useBoardStore } from './store/boardStore';
import Button from './components/ui/Button';
import Card from './components/ui/Card';
import Link from 'next/link';
import { useBreakpoint } from './hooks/useMediaQuery';

export default function Home() {
  const { boards, createBoard } = useBoardStore();
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { isMobile } = useBreakpoint();

  // ボードの作成を処理
  const handleCreateBoard = () => {
    if (newBoardTitle.trim()) {
      createBoard(newBoardTitle);
      setNewBoardTitle('');
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className={`
        ${isMobile ? 'flex flex-col space-y-2' : 'flex justify-between items-center'} 
      `}>
        <h1 className="text-2xl font-bold">ボード一覧</h1>
        <Button
          onClick={() => setIsCreating(true)}
          disabled={isCreating}
          fullWidth={isMobile}
        >
          新しいボードを作成
        </Button>
      </div>

      <Card className="mb-6">
        <h2 className="text-lg font-semibold mb-2">このアプリについて</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
          ドラッグアンドドロップ機能を備えたTrelloライクなカンバンボードアプリです。
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs rounded-full">Next.js 15</span>
          <span className="px-2 py-1 bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-100 text-xs rounded-full">React 19</span>
          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 text-xs rounded-full">TailwindCSS</span>
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs rounded-full">TanStack Table</span>
          <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 text-xs rounded-full">dnd-kit</span>
          <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 text-xs rounded-full">Zustand</span>
        </div>
      </Card>

      {isCreating && (
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">新しいボード</h2>
          <div className="space-y-4">
            <input
              type="text"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              placeholder="ボードのタイトルを入力"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded"
              autoFocus
            />
            <div className={`${isMobile ? 'flex flex-col space-y-2' : 'flex space-x-2'}`}>
              <Button
                onClick={handleCreateBoard}
                fullWidth={isMobile}
              >
                作成
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setIsCreating(false);
                  setNewBoardTitle('');
                }}
                fullWidth={isMobile}
              >
                キャンセル
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {boards.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">
            まだボードがありません。新しいボードを作成してください。
          </p>
        ) : (
          boards.map((board) => (
            <Link href={`/board/${board.id}`} key={board.id} className="w-full">
              <Card className="h-32 hover:shadow-md transition-shadow cursor-pointer">
                <h2 className="text-lg font-semibold">{board.title}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {board.lists.length}リスト ·
                  {board.lists.reduce((acc, list) => acc + list.cards.length, 0)}カード
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  作成: {new Date(board.createdAt).toLocaleDateString()}
                </p>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
