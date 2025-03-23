'use client';

import { useState } from 'react';
import { List, Id } from '@/app/types';
import { useBoardStore } from '@/app/store/boardStore';
import Button from '../ui/Button';
import SortableCard from './SortableCard';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { useDragAndDrop } from '@/app/context/DragAndDropContext';
import React from 'react';

interface BoardListProps {
    list: List;
    boardId: Id;
    dragHandleProps?: SyntheticListenerMap;
    isDragging?: boolean;
    isMobile?: boolean;
}

function BoardList({ list, boardId, dragHandleProps, isDragging, isMobile = false }: BoardListProps) {
    const { updateList, deleteList, addCard } = useBoardStore();
    const { activeType, activeId, overListId, overIndex, placeholderStyle, activeListId } = useDragAndDrop();
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
        <div
            className={`
                ${isMobile ? 'w-full max-w-[280px]' : 'w-[280px] shrink-0'} 
                bg-gray-100 
                rounded-md 
                p-2 
                flex 
                flex-col 
                ${isMobile ? 'h-auto min-h-[300px]' : 'h-[calc(100vh-380px)]'}
                ${isDragging ? 'border-2 border-blue-400' : ''}
                mx-auto
            `}
        >
            <div
                className="flex items-center justify-between mb-2 p-2 cursor-grab active:cursor-grabbing"
                style={{ touchAction: 'none' }}
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
                        <div className="flex items-center">
                            <div className="text-xs text-gray-500 mr-2">
                                {list.cards.length} カード
                            </div>
                            <Button
                                size="sm"
                                variant="danger"
                                onClick={() => deleteList(boardId, list.id)}
                            >
                                削除
                            </Button>
                        </div>
                    </>
                )}
            </div>

            <div
                className={`
                    flex-grow 
                    overflow-y-auto 
                    overflow-x-hidden
                    space-y-2 
                    p-1
                    ${isMobile ? 'max-h-64' : ''}
                    ${list.cards.length === 0 ? 'min-h-[150px] flex flex-col justify-center' : ''}
                    scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent
                `}
                data-type="list"
                data-id={list.id}
            >
                <SortableContext
                    items={list.cards.map(card => card.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {list.cards.length > 0 ? (
                        list.cards.map((card, index) => (
                            <React.Fragment key={card.id}>
                                {/* カードの上にプレースホルダーを表示（条件を修正） */}
                                {activeType === 'card' &&
                                    activeId !== card.id &&
                                    overListId === list.id &&
                                    overIndex === index &&
                                    // 最初のカードの上にあるプレースホルダーのみ表示
                                    index === 0 &&
                                    placeholderStyle && (
                                        <div
                                            className="animate-pulse border-2 border-dashed border-blue-400 bg-blue-50 rounded-md p-2 my-2"
                                            style={{
                                                minHeight: '70px',
                                                height: 'auto',
                                                opacity: 0.7
                                            }}
                                        >
                                            <div className="flex items-center justify-center text-blue-400 text-sm p-2">
                                                カードをここに追加
                                            </div>
                                        </div>
                                    )}

                                <SortableCard
                                    card={card}
                                    listId={list.id}
                                    boardId={boardId}
                                    isMobile={isMobile}
                                />

                                {/* カードの下にプレースホルダーを表示 */}
                                {activeType === 'card' &&
                                    activeId !== card.id &&
                                    overListId === list.id &&
                                    overIndex === index + 1 &&
                                    // カードの最後の要素では表示しない
                                    index < list.cards.length - 1 &&
                                    // またプレースホルダーが重複しないように、自分の下にだけ表示
                                    (activeId !== list.cards[index + 1]?.id) &&
                                    placeholderStyle && (
                                        <div
                                            className="animate-pulse border-2 border-dashed border-blue-400 bg-blue-50 rounded-md p-2 my-2 mx-auto"
                                            style={{
                                                minHeight: '70px',
                                                maxWidth: '260px',
                                                width: '100%',
                                                opacity: 0.7
                                            }}
                                        >
                                            <div className="flex items-center justify-center text-blue-400 text-sm p-2">
                                                カードをここに追加
                                            </div>
                                        </div>
                                    )}
                            </React.Fragment>
                        ))
                    ) : (
                        // カードがない場合のプレースホルダー
                        activeType === 'card' &&
                            overListId === list.id &&
                            placeholderStyle ? (
                            <div className="py-1 flex justify-center items-center h-full flex-col">
                                <div
                                    className="animate-pulse border-2 border-dashed border-blue-400 bg-blue-50 rounded-md p-2 my-2 mx-auto"
                                    style={{
                                        minHeight: '70px',
                                        maxWidth: '260px',
                                        width: '100%',
                                        opacity: 0.7,
                                        alignSelf: 'flex-start'
                                    }}
                                >
                                    <div className="flex items-center justify-center text-blue-400 text-sm p-2">
                                        カードをここに追加
                                    </div>
                                </div>
                                <div className="flex-grow"></div>
                            </div>
                        ) : <div className="min-h-[70px] w-full flex justify-center items-center my-2">
                            <div className="text-gray-400 text-sm">カードはありません</div>
                        </div>
                    )}

                    {/* リストの末尾にプレースホルダーを表示（カードがある場合のみ） */}
                    {activeType === 'card' &&
                        overListId === list.id &&
                        overIndex === list.cards.length &&
                        list.cards.length > 0 &&
                        placeholderStyle && (
                            <div
                                className="animate-pulse border-2 border-dashed border-blue-400 bg-blue-50 rounded-md p-2 my-2 mx-auto"
                                style={{
                                    minHeight: '70px',
                                    maxWidth: '260px',
                                    width: '100%',
                                    opacity: 0.7
                                }}
                            >
                                <div className="flex items-center justify-center text-blue-400 text-sm p-2">
                                    カードをここに追加
                                </div>
                            </div>
                        )}
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
                        <div className={`${isMobile ? 'flex flex-col space-y-2' : 'flex space-x-2'}`}>
                            <Button
                                size="sm"
                                onClick={handleAddCard}
                                fullWidth={isMobile}
                            >
                                追加
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                    setIsAddingCard(false);
                                    setNewCardTitle('');
                                }}
                                fullWidth={isMobile}
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