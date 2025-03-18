'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { List, Id } from '@/app/types';
import BoardList from './BoardList';

interface SortableListProps {
    list: List;
    boardId: Id;
}

function SortableList({ list, boardId }: SortableListProps) {
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
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="touch-manipulation"
            {...attributes}
        >
            <BoardList
                list={list}
                boardId={boardId}
                dragHandleProps={listeners}
                isDragging={isDragging}
            />
        </div>
    );
}

export default SortableList; 