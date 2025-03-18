'use client';

import { createContext, useContext, ReactNode } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    TouchSensor,
    DragOverEvent,
    KeyboardSensor,
    MouseSensor,
} from '@dnd-kit/core';
import {
    SortableContext,
    horizontalListSortingStrategy,
    verticalListSortingStrategy,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { Id } from '../types';
import { useBoardStore } from '../store/boardStore';
import { useState } from 'react';

interface DragAndDropContextProps {
    children: ReactNode;
    boardId: Id;
}

interface DragAndDropContextValue {
    activeId: Id | null;
    activeType: 'list' | 'card' | null;
    activeListId: Id | null;
}

const DragAndDropContext = createContext<DragAndDropContextValue>({
    activeId: null,
    activeType: null,
    activeListId: null,
});

export const useDragAndDrop = () => useContext(DragAndDropContext);

export function DragAndDropProvider({ children, boardId }: DragAndDropContextProps) {
    const { moveList, moveCard, currentBoard } = useBoardStore();
    const [activeId, setActiveId] = useState<Id | null>(null);
    const [activeType, setActiveType] = useState<'list' | 'card' | null>(null);
    const [activeListId, setActiveListId] = useState<Id | null>(null);

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

        if (!over) return;

        const activeId = active.id as Id;
        const overId = over.id as Id;

        if (activeId === overId) return;

        const activeType = active.data.current?.type as 'list' | 'card';
        const overType = over.data.current?.type as 'list' | 'card';

        // カードをリストにドラッグした場合の処理
        if (activeType === 'card' && overType === 'list') {
            const activeListId = active.data.current?.listId as Id;
            if (activeListId === overId) return; // 同じリスト内なら何もしない

            // ここで視覚的なフィードバックを提供できます
        }
    };

    // ドラッグ終了時の処理
    const handleDragEnd = (event: DragEndEvent) => {
        // ドラッグ終了時にページスクロールを元に戻す
        document.body.style.overflow = '';
        // ドラッグ中のクラスを削除
        document.body.classList.remove('dragging-active');

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

        const overIndex = overList.cards.findIndex(card => card.id === overId);

        moveCard(
            currentBoard.id,
            activeListId,
            overListId,
            activeIndex,
            overIndex
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
            }}
        >
            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
                modifiers={[restrictToWindowEdges]}
            >
                {children}

                <DragOverlay adjustScale={true} dropAnimation={{
                    duration: 300,
                    easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
                }}>
                    {activeId && activeType ? (
                        <div className="opacity-80 bg-white rounded shadow-lg">
                            <div className="p-2">
                                {activeType === 'list' ? '移動中のリスト' : '移動中のカード'}
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </DragAndDropContext.Provider>
    );
} 