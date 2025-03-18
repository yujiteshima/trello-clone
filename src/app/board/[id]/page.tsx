'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useBoardStore } from '@/app/store/boardStore';
import Button from '@/app/components/ui/Button';
import Link from 'next/link';

export default function BoardPage() {
    const params = useParams();
    const boardId = params.id as string;
    const { boards, currentBoard, setCurrentBoard } = useBoardStore();

    useEffect(() => {
        if (boardId) {
            setCurrentBoard(boardId);
        }
    }, [boardId, setCurrentBoard]);

    if (!currentBoard) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-4">ボードが見つかりません</h2>
                <Link href="/">
                    <Button>ホームに戻る</Button>
                </Link>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">{currentBoard.title}</h1>
                <Link href="/">
                    <Button variant="secondary">ボード一覧に戻る</Button>
                </Link>
            </div>

            <div className="mb-4">
                <p className="text-sm text-gray-500">
                    作成日: {new Date(currentBoard.createdAt).toLocaleDateString()}
                </p>
            </div>

            <div className="border-t border-gray-200 pt-4">
                <p className="text-center text-gray-500 py-12">
                    このボードには、次のステップでリストとカードが追加されます。
                </p>
            </div>
        </div>
    );
} 