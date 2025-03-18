'use client';

import { useState } from 'react';
import { List, Id } from '@/app/types';
import { useBoardStore } from '@/app/store/boardStore';
import Button from '../ui/Button';
import Card from '../ui/Card';
import SortableCard from './SortableCard';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDragAndDrop } from '@/app/context/DragAndDropContext';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';

interface BoardListProps {
    list: List;
    boardId: Id;
    dragHandleProps?: SyntheticListenerMap;
    isDragging?: boolean;
}

function BoardList({ list, boardId, dragHandleProps, isDragging }: BoardListProps) {
    const { updateList, deleteList, addCard } = useBoardStore();
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(list.title);
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [newCardTitle, setNewCardTitle] = useState('');
    const { activeId } = useDragAndDrop();

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
        <div className={`w-72 shrink-0 bg-gray-100 rounded-md p-2 flex flex-col h-[calc(100vh-200px)] ${isDragging ? 'border-2 border-blue-400' : ''}`}>
            <div
                className="flex items-center justify-between mb-2 p-2 cursor-grab active:cursor-grabbing"
                {...dragHandleProps}
            >
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

            <div
                className="flex-grow overflow-y-auto space-y-2 p-1"
                data-type="list"
                data-id={list.id}
            >
                <SortableContext
                    items={list.cards.map(card => card.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {list.cards.map((card) => (
                        <SortableCard
                            key={card.id}
                            card={card}
                            listId={list.id}
                            boardId={boardId}
                        />
                    ))}
                </SortableContext>
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