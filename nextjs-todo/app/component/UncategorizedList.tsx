"use client"

import { useSortable, SortableContext } from "@dnd-kit/sortable";
import { useTodoContext } from "../context/TodoContext";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import Modal from "react-modal";
import TaskDetailModal from "./TaskDetailModal";

if(typeof window !== "undefined"){
    Modal.setAppElement("body");
}

const modalStyle = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        backgroundColor: "rgba(0,0,0,0.85)"
    },
    content: {
        position: "absolute",
        top: "5rem",
        left: "5rem",
        right: "5rem",
        bottom: "5rem",
        backgroundColor: "#ffffff",
        borderRadius: "1rem",
        padding: "1.5rem"
    }
} as const;

export function UncategorizedList() {
    const { todos, setTaskMemo } = useTodoContext();
    const [selectedTodo, setSelectedTodo] = useState<any>(null);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const todayStr = new Date().toLocaleDateString('sv-SE');

    return (
        <div>
            <ul>
                <SortableContext items={todos.map((todo) => todo.id)}>
                    {todos.map((todo, index) => (
                        <UncategorizedItem 
                            key={todo.id} 
                            todo={todo} 
                            index={index} 
                            onOpenModal={() => {
                                setSelectedTodo(todo);
                                setSelectedIndex(index);
                            }}
                        />
                    ))}
                </SortableContext>
            </ul>
            {selectedTodo && selectedIndex !== null && (
                <TaskDetailModal 
                    isOpen={!!selectedTodo} 
                    style={modalStyle} 
                    onClose={() => {
                        setSelectedTodo(null);
                        setSelectedIndex(null);
                    }} 
                    todo={selectedTodo} 
                    todayStr={todayStr}
                    index={selectedIndex}
                    onMemoChange={(newMemo) =>{
                        setTaskMemo(selectedIndex, newMemo);
                        setSelectedTodo((prev: any) => ({...prev, memo: newMemo}))
                    }}
                />
            )}
        </div>
    );
}

function UncategorizedItem({ todo, index, onOpenModal }: { todo: any; index: number; onOpenModal: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: todo.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const { completeBtn, deleteBtn } = useTodoContext();
    const priorityLabel: Record<string, string> = {
        high: "高",
        middle: "中",
        low: "低"
    };
    const todayStr = new Date().toLocaleDateString('sv-SE');
    const isOverDue = todo.limit ? todo.limit < todayStr : false;
    return (
        <li 
            ref={setNodeRef}
            style={style}
            className="flex items-center justify-between p-3.5 mb-2 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all"
        >
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-3 shrink-0">
                    <span
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1 select-none"
                    >
                        ⋮⋮
                    </span>
                    <span className="font-medium text-gray-800">{todo.text}</span>
                    <div>
                        {todo.limit && (
                            <span className={`text-[10px] text-gray-400 bg-slate-100 px-1.5 py-0.5 rounded ${
                                isOverDue
                                ? "text-red-500 bg-red-50 font-bold border border-red-200"
                                : "text-gray-400 bg-slate-100"}`}>
                                {todo.limit}
                            </span>
                        )}
                        {todo.priority && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                todo.priority === "high"
                                    ? "bg-red-50 text-red-500 font-semibold"
                                    : "bg-slate-100 text-gray-500"
                            }`}>
                                優先度: {priorityLabel[todo.priority] || todo.priority}
                            </span>
                        )}
                        {todo.memo &&(
                            <span className="text-xs text-gray-400 italic truncate mt-0.5">{todo.memo}</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button 
                    onClick={onOpenModal}
                    className="hover:text-gray-700 text-gray-500 font-semibold text-xs px-2 py-1.5 rounded-md transition-colors"
                >
                    詳細
                </button>
                <button 
                    onClick={() => completeBtn(index)}
                    className="hover:text-gray-700 text-gray-500 font-semibold text-xs px-3 py-1.5 rounded-md transition-colors"
                >
                    完了
                </button>
                <button 
                    onClick={() => deleteBtn(index)}
                    className="hover:text-red-700 text-red-500 font-semibold text-xs px-3 py-1.5 rounded-md transition-colors"
                >
                    削除
                </button>
            </div>
        </li>
    );
}