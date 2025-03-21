'use client';

import { createContext, useContext, ReactNode } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
    useSensor,
    useSensors,
    TouchSensor,
    DragOverEvent,
    KeyboardSensor,
    MouseSensor,
    MeasuringStrategy,
} from '@dnd-kit/core';
import {
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { Id } from '../types';
import { useBoardStore } from '../store/boardStore';
import { useState } from 'react';
import CardItem from '../components/board/CardItem';

interface DragAndDropContextProps {
    children: ReactNode;
    boardId: Id;
}

interface DragAndDropContextValue {
    activeId: Id | null;
    activeType: 'list' | 'card' | null;
    activeListId: Id | null;
    overListId: Id | null;
    overCardId: Id | null;
    overIndex: number | null;
    placeholderStyle: Record<string, string | number> | null;
}

const DragAndDropContext = createContext<DragAndDropContextValue>({
    activeId: null,
    activeType: null,
    activeListId: null,
    overListId: null,
    overCardId: null,
    overIndex: null,
    placeholderStyle: null,
});

export const useDragAndDrop = () => useContext(DragAndDropContext);

export function DragAndDropProvider({ children }: DragAndDropContextProps) {
    const { moveList, moveCard, currentBoard } = useBoardStore();
    const [activeId, setActiveId] = useState<Id | null>(null);
    const [activeType, setActiveType] = useState<'list' | 'card' | null>(null);
    const [activeListId, setActiveListId] = useState<Id | null>(null);
    const [overListId, setOverListId] = useState<Id | null>(null);
    const [overCardId, setOverCardId] = useState<Id | null>(null);
    const [overIndex, setOverIndex] = useState<number | null>(null);
    const [placeholderStyle, setPlaceholderStyle] = useState<Record<string, string | number> | null>(null);

    // マウスとタッチ操作のセンサーを設定
    const sensors = useSensors(
        // PCでのマウス操作用センサー
        useSensor(MouseSensor, {
            // ドラッグの開始に必要な距離を短く設定
            activationConstraint: {
                distance: 3,
            },
        }),

        // モバイルでのタッチ操作用センサー - モバイルでの競合を避けるため調整
        useSensor(TouchSensor, {
            // タッチ操作の検出設定
            activationConstraint: {
                delay: 250, // 長押し時間（ミリ秒）- スクロールとの区別のため長めに設定
                tolerance: 8, // ドラッグ開始までの許容移動ピクセル数（大きめに設定）
            },
        }),

        // キーボード操作用センサー
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // ドラッグ開始時の処理
    const handleDragStart = (event: DragStartEvent) => {
        // ドラッグ中はページスクロールを防止
        document.body.style.overflow = 'hidden';
        // ドラッグ中のクラスを追加
        document.body.classList.add('dragging-active');

        const { active } = event;
        const activeId = active.id as Id;

        // data-typeとdata-list-idをdataAttributesから取得
        const type = active.data.current?.type as 'list' | 'card';
        const listId = active.data.current?.listId as Id;

        setActiveId(activeId);
        setActiveType(type);

        if (type === 'card') {
            setActiveListId(listId);
        }
    };

    // ドラッグオーバー時の処理を追加
    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;

        if (!over) {
            setOverListId(null);
            setOverCardId(null);
            setOverIndex(null);
            setPlaceholderStyle(null);
            return;
        }

        const activeId = active.id as Id;
        const overId = over.id as Id;

        if (activeId === overId) return;

        const activeType = active.data.current?.type as 'list' | 'card';
        const overType = over.data.current?.type as 'list' | 'card';

        // 現在のカードの位置とサイズを取得して視覚的なフィードバックに使用
        if (activeType === 'card') {
            // カードをリストにドラッグした場合の処理
            if (overType === 'list') {
                // リストのID変更を適用
                setOverListId(overId);
                setOverCardId(null);

                // リストの最後にカードを追加するためのプレースホルダーを表示
                setOverIndex(
                    currentBoard?.lists.find(list => list.id === overId)?.cards.length || 0
                );

                // プレースホルダーのスタイルを設定
                setPlaceholderStyle({
                    minHeight: '70px',
                    maxWidth: '260px',
                    width: '100%',
                    margin: '8px auto',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: '2px dashed rgb(59, 130, 246)',
                    borderRadius: '0.375rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                });

                // データ上で実際に移動はドロップ時に行うが、視覚的なフィードバックを強化
                setActiveListId(overId);
            }

            // カードを別のカードにドラッグした場合
            if (overType === 'card') {
                const sourceListId = active.data.current?.listId as Id;
                const targetListId = over.data.current?.listId as Id;

                setOverListId(targetListId);
                setOverCardId(overId);

                // 対象のカード情報を取得
                const targetList = currentBoard?.lists.find(list => list.id === targetListId);
                const overCardIndex = targetList?.cards.findIndex(card => card.id === overId) || 0;

                // 挿入位置インデックスを設定（常に下）
                setOverIndex(overCardIndex + 1);

                // リスト最後尾に追加する場合と同じスタイルを使用
                setPlaceholderStyle({
                    minHeight: '70px',
                    maxWidth: '260px',
                    width: '100%',
                    margin: '8px auto',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: '2px dashed rgb(59, 130, 246)',
                    borderRadius: '0.375rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                });

                // リスト間のドラッグなら、現在のリストIDを更新
                if (sourceListId !== targetListId) {
                    setActiveListId(targetListId);
                }
            }
        }
    };

    // ドラッグ終了時の処理
    const handleDragEnd = (event: DragEndEvent) => {
        // ドラッグ終了時にページスクロールを元に戻す
        document.body.style.overflow = '';
        // ドラッグ中のクラスを削除
        document.body.classList.remove('dragging-active');
        // プレースホルダーの状態をリセット
        setOverListId(null);
        setOverCardId(null);
        setOverIndex(null);
        setPlaceholderStyle(null);

        const { active, over } = event;

        if (!over) {
            resetDragState();
            return;
        }

        const activeId = active.id as Id;
        const overId = over.id as Id;

        if (activeId === overId) {
            resetDragState();
            return;
        }

        const activeType = active.data.current?.type as 'list' | 'card';

        if (activeType === 'list') {
            handleListDragEnd(activeId, overId);
        } else if (activeType === 'card') {
            const activeListId = active.data.current?.listId as Id;
            const overListId = over.data.current?.listId as Id || activeListId;
            const overType = over.data.current?.type as 'list' | 'card';

            handleCardDragEnd(activeId, overId, activeListId, overListId, overType);
        }

        resetDragState();
    };

    // ドラッグのキャンセル処理
    const handleDragCancel = () => {
        // ドラッグキャンセル時もスクロールを元に戻す
        document.body.style.overflow = '';
        // ドラッグ中のクラスを削除
        document.body.classList.remove('dragging-active');
        resetDragState();
    };

    // リストのドラッグ終了処理
    const handleListDragEnd = (activeId: Id, overId: Id) => {
        if (!currentBoard) return;

        const activeIndex = currentBoard.lists.findIndex(list => list.id === activeId);
        const overIndex = currentBoard.lists.findIndex(list => list.id === overId);

        if (activeIndex !== -1 && overIndex !== -1) {
            moveList(currentBoard.id, activeIndex, overIndex);
        }
    };

    // カードのドラッグ終了処理
    const handleCardDragEnd = (
        activeId: Id,
        overId: Id,
        activeListId: Id,
        overListId: Id,
        overType: 'list' | 'card'
    ) => {
        if (!currentBoard) return;

        const activeList = currentBoard.lists.find(list => list.id === activeListId);
        if (!activeList) return;

        const activeIndex = activeList.cards.findIndex(card => card.id === activeId);

        // カードをリストにドロップした場合（リストの末尾に追加）
        if (overType === 'list') {
            const overList = currentBoard.lists.find(list => list.id === overId);
            if (!overList) return;

            // 視覚的に表示されているプレースホルダーの位置（overIndex）と一致させる
            // リストの場合は最後に追加するので問題ないはず
            moveCard(
                currentBoard.id,
                activeListId,
                overId,
                activeIndex,
                overList.cards.length
            );
            return;
        }

        // カードを別のカードにドロップした場合
        const overList = currentBoard.lists.find(list => list.id === overListId);
        if (!overList) return;

        // 視覚的なフィードバックと実際の挿入位置を一致させるため、
        // overIndexが存在する場合はそれを使用し、存在しない場合のみoverId（カードのID）から位置を計算
        let insertPosition;
        if (overIndex !== null) {
            insertPosition = overIndex;
        } else {
            insertPosition = overList.cards.findIndex(card => card.id === overId);
        }

        moveCard(
            currentBoard.id,
            activeListId,
            overListId,
            activeIndex,
            insertPosition
        );
    };

    // ドラッグ状態をリセット
    const resetDragState = () => {
        setActiveId(null);
        setActiveType(null);
        setActiveListId(null);
    };

    return (
        <DragAndDropContext.Provider
            value={{
                activeId,
                activeType,
                activeListId,
                overListId,
                overCardId,
                overIndex,
                placeholderStyle
            }}
        >
            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
                modifiers={[restrictToWindowEdges]}
                measuring={{
                    droppable: {
                        strategy: MeasuringStrategy.Always
                    },
                }}
            >
                {children}

                <DragOverlay adjustScale={true} dropAnimation={{
                    duration: 300,
                    easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
                }}>
                    {activeId && activeType === 'card' && activeListId ? (
                        <div className="max-w-[260px] w-full opacity-90 bg-white rounded shadow-lg transform transition-transform duration-300 ease-in-out overflow-hidden" style={{ maxHeight: 'min(80vh, 400px)' }}>
                            {currentBoard && (
                                <CardItem
                                    card={currentBoard.lists
                                        .find(list => list.id === activeListId)?.cards
                                        .find(card => card.id === activeId) || {
                                        id: activeId,
                                        title: '移動中のカード',
                                        createdAt: new Date(),
                                        updatedAt: new Date()
                                    }}
                                    listId={activeListId}
                                    boardId={currentBoard.id}
                                />
                            )}
                        </div>
                    ) : activeId && activeType === 'list' ? (
                        <div className="w-72 opacity-80 bg-white rounded shadow-lg transform transition-transform duration-300 ease-in-out">
                            {currentBoard && (
                                <div className="p-3 bg-gray-100 rounded border border-gray-200">
                                    <h3 className="font-semibold text-gray-800">
                                        {currentBoard.lists.find(list => list.id === activeId)?.title || '移動中のリスト'}
                                    </h3>
                                    <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                                        <div className="h-4 w-full bg-gray-200 rounded"></div>
                                        <div className="h-4 w-3/4 bg-gray-200 rounded mt-2"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </DragAndDropContext.Provider>
    );
} 