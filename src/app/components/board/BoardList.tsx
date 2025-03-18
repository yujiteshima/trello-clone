'use client';

import { useState } from 'react';
import { List, Card as CardType, Id } from '@/app/types';
import { useBoardStore } from '@/app/store/boardStore';
import Card from '../ui/Card';
import Button from '../ui/Button';
import CardItem from './CardItem';

interface BoardListProps {
    list: List;
    boardId: Id;
}

function BoardList({ list, boardId }: BoardListProps) {
    const { updateList, deleteList, addCard } = useBoardStore();
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(list.title);
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [newCardTitle, setNewCardTitle] = useState('');

    // リストのタイトル編集を保存
    const handleSaveTitle = () => {
        if (title.trim()) {
            updateList(boardId, list.id, title);
            setIsEditing(false);
        }
    };

    // カードの追加
    const handleAddCard = () => {
        if (newCardTitle.trim()) {
            addCard(boardId, list.id, newCardTitle);
            setNewCardTitle('');
            setIsAddingCard(false);
        }
    };

    return (
        <div className="w-72 shrink-0 bg-gray-100 rounded-md p-2 flex flex-col h-[calc(100vh-200px)]">
            <div className="flex items-center justify-between mb-2 p-2">
                {isEditing ? (
                    <div className="flex w-full">
                        <input
                            type="text"
                            className="flex-grow px-2 py-1 border rounded mr-2"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            autoFocus
                        />
                        <div className="flex space-x-1">
                            <Button size="sm" onClick={handleSaveTitle}>保存</Button>
                            <Button size="sm" variant="secondary" onClick={() => {
                                setIsEditing(false);
                                setTitle(list.title);
                            }}>キャンセル</Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <h3
                            className="font-semibold text-gray-800 cursor-pointer"
                            onClick={() => setIsEditing(true)}
                        >
                            {list.title}
                        </h3>
                        <Button
                            size="sm"
                            variant="danger"
                            onClick={() => deleteList(boardId, list.id)}
                        >
                            削除
                        </Button>
                    </>
                )}
            </div>

            <div className="flex-grow overflow-y-auto space-y-2 p-1">
                {list.cards.map((card) => (
                    <CardItem
                        key={card.id}
                        card={card}
                        listId={list.id}
                        boardId={boardId}
                    />
                ))}
            </div>

            <div className="mt-2 p-1">
                {isAddingCard ? (
                    <div className="space-y-2">
                        <input
                            type="text"
                            className="w-full px-3 py-2 border rounded"
                            placeholder="カードのタイトルを入力"
                            value={newCardTitle}
                            onChange={(e) => setNewCardTitle(e.target.value)}
                            autoFocus
                        />
                        <div className="flex space-x-2">
                            <Button size="sm" onClick={handleAddCard}>追加</Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                    setIsAddingCard(false);
                                    setNewCardTitle('');
                                }}
                            >
                                キャンセル
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Button
                        variant="secondary"
                        fullWidth
                        onClick={() => setIsAddingCard(true)}
                    >
                        + カードを追加
                    </Button>
                )}
            </div>
        </div>
    );
}

export default BoardList; 