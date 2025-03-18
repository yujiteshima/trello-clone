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

      {isCreating && (
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">新しいボード</h2>
          <div className="space-y-4">
            <input
              type="text"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              placeholder="ボードのタイトルを入力"
              className="w-full p-2 border border-gray-300 rounded"
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
          <p className="col-span-full text-center text-gray-500 py-8">
            まだボードがありません。新しいボードを作成してください。
          </p>
        ) : (
          boards.map((board) => (
            <Link href={`/board/${board.id}`} key={board.id} className="w-full">
              <Card className="h-32 hover:shadow-md transition-shadow cursor-pointer">
                <h2 className="text-lg font-semibold">{board.title}</h2>
                <p className="text-sm text-gray-500">
                  {board.lists.length}リスト ·
                  {board.lists.reduce((acc, list) => acc + list.cards.length, 0)}カード
                </p>
                <p className="text-xs text-gray-400 mt-2">
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
