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
} from '@dnd-kit/core';
import {
    SortableContext,
    horizontalListSortingStrategy,
    verticalListSortingStrategy,
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
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // ドラッグ開始までに8px移動する必要があります
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250, // タッチして250ms待機するとドラッグ開始
                tolerance: 5, // 5px以上の移動でドラッグとみなす
            },
        })
    );

    // ドラッグ開始時の処理
    const handleDragStart = (event: DragStartEvent) => {
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

    // ドラッグ終了時の処理
    const handleDragEnd = (event: DragEndEvent) => {
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
                onDragEnd={handleDragEnd}
                modifiers={[restrictToWindowEdges]}
            >
                {children}

                {/* オーバーレイは将来的に実装 */}
                <DragOverlay>
                    {activeId && activeType ? (
                        <div className="opacity-50">
                            {/* ドラッグ中の要素のプレビュー */}
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </DragAndDropContext.Provider>
    );
} 