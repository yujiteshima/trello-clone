'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card as CardType, Id } from '@/app/types';
import CardItem from './CardItem';

interface SortableCardProps {
    card: CardType;
    listId: Id;
    boardId: Id;
}

function SortableCard({ card, listId, boardId }: SortableCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: card.id,
        data: {
            type: 'card',
            card,
            listId,
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
            {...attributes}
            className={`touch-manipulation ${isDragging ? 'border-2 border-blue-400' : ''}`}
        >
            <div className="cursor-grab active:cursor-grabbing" {...listeners}>
                <CardItem card={card} listId={listId} boardId={boardId} />
            </div>
        </div>
    );
}

export default SortableCard; 