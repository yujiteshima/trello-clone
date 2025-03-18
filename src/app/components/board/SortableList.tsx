'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { List, Id } from '@/app/types';
import BoardList from './BoardList';

interface SortableListProps {
    list: List;
    boardId: Id;
    isMobile?: boolean;
}

function SortableList({ list, boardId, isMobile = false }: SortableListProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: list.id,
        data: {
            type: 'list',
            list,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1 : 0,
        width: isMobile ? '100%' : undefined,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`touch-manipulation ${isMobile ? 'w-full' : ''}`}
            {...attributes}
        >
            <BoardList
                list={list}
                boardId={boardId}
                dragHandleProps={listeners}
                isDragging={isDragging}
                isMobile={isMobile}
            />
        </div>
    );
}

export default SortableList; 