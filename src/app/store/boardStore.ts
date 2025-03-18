import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { getLocalStorage, setLocalStorage } from '../utils/localStorage';
import { Board, List, Card, Id } from '../types';

const STORAGE_KEY = 'trello-clone-board';

interface BoardState {
    boards: Board[];
    currentBoard: Board | null;

    // ボード操作
    createBoard: (title: string) => Board;
    updateBoard: (id: Id, title: string) => void;
    deleteBoard: (id: Id) => void;
    setCurrentBoard: (id: Id) => void;

    // リスト操作
    addList: (boardId: Id, title: string) => List;
    updateList: (boardId: Id, listId: Id, title: string) => void;
    deleteList: (boardId: Id, listId: Id) => void;
    moveList: (boardId: Id, sourceIndex: number, destinationIndex: number) => void;

    // カード操作
    addCard: (boardId: Id, listId: Id, title: string, description?: string) => Card;
    updateCard: (boardId: Id, listId: Id, cardId: Id, data: Partial<Card>) => void;
    deleteCard: (boardId: Id, listId: Id, cardId: Id) => void;
    moveCard: (
        boardId: Id,
        sourceListId: Id,
        destinationListId: Id,
        sourceIndex: number,
        destinationIndex: number
    ) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
    boards: getLocalStorage<Board[]>(STORAGE_KEY, []),
    currentBoard: null,

    createBoard: (title) => {
        const newBoard: Board = {
            id: uuidv4(),
            title,
            lists: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        set((state) => {
            const updatedBoards = [...state.boards, newBoard];
            setLocalStorage(STORAGE_KEY, updatedBoards);
            return { boards: updatedBoards, currentBoard: newBoard };
        });

        return newBoard;
    },

    updateBoard: (id, title) => {
        set((state) => {
            const updatedBoards = state.boards.map((board) => {
                if (board.id === id) {
                    return { ...board, title, updatedAt: new Date() };
                }
                return board;
            });

            const updatedCurrentBoard = state.currentBoard?.id === id
                ? { ...state.currentBoard, title, updatedAt: new Date() }
                : state.currentBoard;

            setLocalStorage(STORAGE_KEY, updatedBoards);
            return { boards: updatedBoards, currentBoard: updatedCurrentBoard };
        });
    },

    deleteBoard: (id) => {
        set((state) => {
            const updatedBoards = state.boards.filter((board) => board.id !== id);
            const updatedCurrentBoard = state.currentBoard?.id === id ? null : state.currentBoard;

            setLocalStorage(STORAGE_KEY, updatedBoards);
            return { boards: updatedBoards, currentBoard: updatedCurrentBoard };
        });
    },

    setCurrentBoard: (id) => {
        set((state) => {
            const board = state.boards.find((board) => board.id === id) || null;
            return { currentBoard: board };
        });
    },

    addList: (boardId, title) => {
        const newList: List = {
            id: uuidv4(),
            title,
            cards: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        set((state) => {
            const updatedBoards = state.boards.map((board) => {
                if (board.id === boardId) {
                    return {
                        ...board,
                        lists: [...board.lists, newList],
                        updatedAt: new Date(),
                    };
                }
                return board;
            });

            const updatedCurrentBoard = state.currentBoard?.id === boardId
                ? {
                    ...state.currentBoard,
                    lists: [...state.currentBoard.lists, newList],
                    updatedAt: new Date(),
                }
                : state.currentBoard;

            setLocalStorage(STORAGE_KEY, updatedBoards);
            return { boards: updatedBoards, currentBoard: updatedCurrentBoard };
        });

        return newList;
    },

    updateList: (boardId, listId, title) => {
        set((state) => {
            const updatedBoards = state.boards.map((board) => {
                if (board.id === boardId) {
                    const updatedLists = board.lists.map((list) => {
                        if (list.id === listId) {
                            return { ...list, title, updatedAt: new Date() };
                        }
                        return list;
                    });

                    return { ...board, lists: updatedLists, updatedAt: new Date() };
                }
                return board;
            });

            const updatedCurrentBoard = state.currentBoard?.id === boardId
                ? {
                    ...state.currentBoard,
                    lists: state.currentBoard.lists.map((list) => {
                        if (list.id === listId) {
                            return { ...list, title, updatedAt: new Date() };
                        }
                        return list;
                    }),
                    updatedAt: new Date(),
                }
                : state.currentBoard;

            setLocalStorage(STORAGE_KEY, updatedBoards);
            return { boards: updatedBoards, currentBoard: updatedCurrentBoard };
        });
    },

    deleteList: (boardId, listId) => {
        set((state) => {
            const updatedBoards = state.boards.map((board) => {
                if (board.id === boardId) {
                    return {
                        ...board,
                        lists: board.lists.filter((list) => list.id !== listId),
                        updatedAt: new Date(),
                    };
                }
                return board;
            });

            const updatedCurrentBoard = state.currentBoard?.id === boardId
                ? {
                    ...state.currentBoard,
                    lists: state.currentBoard.lists.filter((list) => list.id !== listId),
                    updatedAt: new Date(),
                }
                : state.currentBoard;

            setLocalStorage(STORAGE_KEY, updatedBoards);
            return { boards: updatedBoards, currentBoard: updatedCurrentBoard };
        });
    },

    moveList: (boardId, sourceIndex, destinationIndex) => {
        set((state) => {
            const board = state.boards.find((b) => b.id === boardId);
            if (!board) return state;

            const newLists = [...board.lists];
            const [removed] = newLists.splice(sourceIndex, 1);
            newLists.splice(destinationIndex, 0, removed);

            const updatedBoards = state.boards.map((b) => {
                if (b.id === boardId) {
                    return { ...b, lists: newLists, updatedAt: new Date() };
                }
                return b;
            });

            const updatedCurrentBoard = state.currentBoard?.id === boardId
                ? { ...state.currentBoard, lists: newLists, updatedAt: new Date() }
                : state.currentBoard;

            setLocalStorage(STORAGE_KEY, updatedBoards);
            return { boards: updatedBoards, currentBoard: updatedCurrentBoard };
        });
    },

    addCard: (boardId, listId, title, description = '') => {
        const newCard: Card = {
            id: uuidv4(),
            title,
            description,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        set((state) => {
            const updatedBoards = state.boards.map((board) => {
                if (board.id === boardId) {
                    const updatedLists = board.lists.map((list) => {
                        if (list.id === listId) {
                            return {
                                ...list,
                                cards: [...list.cards, newCard],
                                updatedAt: new Date(),
                            };
                        }
                        return list;
                    });

                    return { ...board, lists: updatedLists, updatedAt: new Date() };
                }
                return board;
            });

            const updatedCurrentBoard = state.currentBoard?.id === boardId
                ? {
                    ...state.currentBoard,
                    lists: state.currentBoard.lists.map((list) => {
                        if (list.id === listId) {
                            return {
                                ...list,
                                cards: [...list.cards, newCard],
                                updatedAt: new Date(),
                            };
                        }
                        return list;
                    }),
                    updatedAt: new Date(),
                }
                : state.currentBoard;

            setLocalStorage(STORAGE_KEY, updatedBoards);
            return { boards: updatedBoards, currentBoard: updatedCurrentBoard };
        });

        return newCard;
    },

    updateCard: (boardId, listId, cardId, data) => {
        set((state) => {
            const updatedBoards = state.boards.map((board) => {
                if (board.id === boardId) {
                    const updatedLists = board.lists.map((list) => {
                        if (list.id === listId) {
                            const updatedCards = list.cards.map((card) => {
                                if (card.id === cardId) {
                                    return { ...card, ...data, updatedAt: new Date() };
                                }
                                return card;
                            });

                            return { ...list, cards: updatedCards, updatedAt: new Date() };
                        }
                        return list;
                    });

                    return { ...board, lists: updatedLists, updatedAt: new Date() };
                }
                return board;
            });

            const updatedCurrentBoard = state.currentBoard?.id === boardId
                ? {
                    ...state.currentBoard,
                    lists: state.currentBoard.lists.map((list) => {
                        if (list.id === listId) {
                            return {
                                ...list,
                                cards: list.cards.map((card) => {
                                    if (card.id === cardId) {
                                        return { ...card, ...data, updatedAt: new Date() };
                                    }
                                    return card;
                                }),
                                updatedAt: new Date(),
                            };
                        }
                        return list;
                    }),
                    updatedAt: new Date(),
                }
                : state.currentBoard;

            setLocalStorage(STORAGE_KEY, updatedBoards);
            return { boards: updatedBoards, currentBoard: updatedCurrentBoard };
        });
    },

    deleteCard: (boardId, listId, cardId) => {
        set((state) => {
            const updatedBoards = state.boards.map((board) => {
                if (board.id === boardId) {
                    const updatedLists = board.lists.map((list) => {
                        if (list.id === listId) {
                            return {
                                ...list,
                                cards: list.cards.filter((card) => card.id !== cardId),
                                updatedAt: new Date(),
                            };
                        }
                        return list;
                    });

                    return { ...board, lists: updatedLists, updatedAt: new Date() };
                }
                return board;
            });

            const updatedCurrentBoard = state.currentBoard?.id === boardId
                ? {
                    ...state.currentBoard,
                    lists: state.currentBoard.lists.map((list) => {
                        if (list.id === listId) {
                            return {
                                ...list,
                                cards: list.cards.filter((card) => card.id !== cardId),
                                updatedAt: new Date(),
                            };
                        }
                        return list;
                    }),
                    updatedAt: new Date(),
                }
                : state.currentBoard;

            setLocalStorage(STORAGE_KEY, updatedBoards);
            return { boards: updatedBoards, currentBoard: updatedCurrentBoard };
        });
    },

    moveCard: (boardId, sourceListId, destinationListId, sourceIndex, destinationIndex) => {
        set((state) => {
            const board = state.boards.find((b) => b.id === boardId);
            if (!board) return state;

            const sourceList = board.lists.find((l) => l.id === sourceListId);
            const destinationList = board.lists.find((l) => l.id === destinationListId);

            if (!sourceList || !destinationList) return state;

            const newSourceCards = [...sourceList.cards];
            const [movedCard] = newSourceCards.splice(sourceIndex, 1);

            const newDestinationCards =
                sourceListId === destinationListId
                    ? newSourceCards
                    : [...destinationList.cards];

            newDestinationCards.splice(destinationIndex, 0, movedCard);

            const updatedBoards = state.boards.map((b) => {
                if (b.id === boardId) {
                    const updatedLists = b.lists.map((list) => {
                        if (list.id === sourceListId) {
                            return {
                                ...list,
                                cards: sourceListId === destinationListId ? newDestinationCards : newSourceCards,
                                updatedAt: new Date(),
                            };
                        }
                        if (list.id === destinationListId && sourceListId !== destinationListId) {
                            return {
                                ...list,
                                cards: newDestinationCards,
                                updatedAt: new Date(),
                            };
                        }
                        return list;
                    });

                    return { ...b, lists: updatedLists, updatedAt: new Date() };
                }
                return b;
            });

            const updatedCurrentBoard = state.currentBoard?.id === boardId
                ? {
                    ...state.currentBoard,
                    lists: state.currentBoard.lists.map((list) => {
                        if (list.id === sourceListId) {
                            return {
                                ...list,
                                cards: sourceListId === destinationListId ? newDestinationCards : newSourceCards,
                                updatedAt: new Date(),
                            };
                        }
                        if (list.id === destinationListId && sourceListId !== destinationListId) {
                            return {
                                ...list,
                                cards: newDestinationCards,
                                updatedAt: new Date(),
                            };
                        }
                        return list;
                    }),
                    updatedAt: new Date(),
                }
                : state.currentBoard;

            setLocalStorage(STORAGE_KEY, updatedBoards);
            return { boards: updatedBoards, currentBoard: updatedCurrentBoard };
        });
    },
})); 