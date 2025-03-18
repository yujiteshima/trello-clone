'use client';

import { useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    createColumnHelper,
    flexRender,
} from '@tanstack/react-table';
import { useBoardStore } from '@/app/store/boardStore';
import { List, Id } from '@/app/types';
import Button from '../ui/Button';
import SortableList from './SortableList';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { DragAndDropProvider } from '@/app/context/DragAndDropContext';

interface BoardContainerProps {
    boardId: Id;
}

function BoardContainer({ boardId }: BoardContainerProps) {
    const { currentBoard, addList } = useBoardStore();
    const [isAddingList, setIsAddingList] = useState(false);
    const [newListTitle, setNewListTitle] = useState('');

    // 新しいリストの追加
    const handleAddList = () => {
        if (newListTitle.trim() && currentBoard) {
            addList(currentBoard.id, newListTitle);
            setNewListTitle('');
            setIsAddingList(false);
        }
    };

    const columnHelper = createColumnHelper<List>();

    // TanStack Tableのカラム定義
    const columns = [
        columnHelper.accessor('id', {
            header: 'ID',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('title', {
            header: 'タイトル',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor(row => row.cards.length, {
            id: 'cardCount',
            header: 'カード数',
            cell: info => info.getValue(),
        }),
    ];

    const table = useReactTable({
        data: currentBoard?.lists || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (!currentBoard) {
        return <div>ボードが見つかりません</div>;
    }

    return (
        <DragAndDropProvider boardId={boardId}>
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{currentBoard.title}のリスト</h2>
                    <Button
                        onClick={() => setIsAddingList(true)}
                        disabled={isAddingList}
                    >
                        + 新しいリストを追加
                    </Button>
                </div>

                {isAddingList && (
                    <div className="p-4 bg-white rounded-md shadow-sm mb-4">
                        <h3 className="text-lg font-semibold mb-2">新しいリスト</h3>
                        <div className="space-y-3">
                            <input
                                type="text"
                                className="w-full px-3 py-2 border rounded"
                                placeholder="リストのタイトルを入力"
                                value={newListTitle}
                                onChange={(e) => setNewListTitle(e.target.value)}
                                autoFocus
                            />
                            <div className="flex space-x-2">
                                <Button onClick={handleAddList}>追加</Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setIsAddingList(false);
                                        setNewListTitle('');
                                    }}
                                >
                                    キャンセル
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* TanStack Table データ表示 */}
                <div className="bg-white p-4 rounded-md shadow-sm overflow-x-auto mb-6">
                    <h3 className="text-lg font-semibold mb-3">リスト概要</h3>
                    <table className="min-w-full border-collapse">
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th
                                            key={header.id}
                                            className="text-left p-2 border-b-2 border-gray-200"
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-gray-50">
                                    {row.getVisibleCells().map(cell => (
                                        <td
                                            key={cell.id}
                                            className="p-2 border-b border-gray-200"
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ボードリスト表示（ドラッグアンドドロップ対応） */}
                <div className="flex space-x-4 overflow-x-auto pb-4">
                    <SortableContext
                        items={currentBoard.lists.map(list => list.id)}
                        strategy={horizontalListSortingStrategy}
                    >
                        {currentBoard.lists.map(list => (
                            <SortableList
                                key={list.id}
                                list={list}
                                boardId={currentBoard.id}
                            />
                        ))}
                    </SortableContext>
                </div>
            </div>
        </DragAndDropProvider>
    );
}

export default BoardContainer; 