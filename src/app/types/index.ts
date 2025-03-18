export type Id = string;

export interface Card {
    id: Id;
    title: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface List {
    id: Id;
    title: string;
    cards: Card[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Board {
    id: Id;
    title: string;
    lists: List[];
    createdAt: Date;
    updatedAt: Date;
} 