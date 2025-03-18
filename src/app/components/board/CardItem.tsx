'use client';

import { useState } from 'react';
import { Card as CardType, Id } from '@/app/types';
import { useBoardStore } from '@/app/store/boardStore';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface CardItemProps {
    card: CardType;
    listId: Id;
    boardId: Id;
    isMobile?: boolean;
}

function CardItem({ card, listId, boardId, isMobile = false }: CardItemProps) {
    const { updateCard, deleteCard } = useBoardStore();
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(card.title);
    const [description, setDescription] = useState(card.description || '');

    // カードの更新を保存
    const handleSave = () => {
        if (title.trim()) {
            updateCard(boardId, listId, card.id, {
                title,
                description: description.trim() ? description : undefined,
            });
            setIsEditing(false);
        }
    };

    return (
        <Card
            className={`shadow-sm hover:shadow-md transition-shadow cursor-pointer ${isMobile ? 'w-full' : ''}`}
            onClick={() => !isEditing && setIsEditing(true)}
        >
            {isEditing ? (
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            タイトル
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border rounded"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            説明
                        </label>
                        <textarea
                            className="w-full px-3 py-2 border rounded"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className={`${isMobile ? 'flex flex-col space-y-2' : 'flex justify-between'}`}>
                        <div className={`${isMobile ? '' : 'flex space-x-2'}`}>
                            <Button
                                size="sm"
                                onClick={handleSave}
                                fullWidth={isMobile}
                                className={isMobile ? 'mb-2' : ''}
                            >
                                保存
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                    setIsEditing(false);
                                    setTitle(card.title);
                                    setDescription(card.description || '');
                                }}
                                fullWidth={isMobile}
                            >
                                キャンセル
                            </Button>
                        </div>
                        <Button
                            size="sm"
                            variant="danger"
                            onClick={() => deleteCard(boardId, listId, card.id)}
                            fullWidth={isMobile}
                            className={isMobile ? 'mt-4' : ''}
                        >
                            削除
                        </Button>
                    </div>
                </div>
            ) : (
                <div>
                    <h4 className="font-medium">{card.title}</h4>
                    {card.description && (
                        <p className="text-sm text-gray-600 mt-1">{card.description}</p>
                    )}
                </div>
            )}
        </Card>
    );
}

export default CardItem; 