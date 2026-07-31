"use client"

import { useState } from "react";
import { Category } from "../context/TodoContext";
import { useTodoContext } from "../context/TodoContext";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SortableContext } from "@dnd-kit/sortable";
import Modal from "react-modal";
import TaskDetailModal from "./TaskDetailModal";

if(typeof window !== "undefined"){
    Modal.setAppElement("body");
}

type Props = {
    cat: Category;
    colorClass: string;
};

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
        backgroundColor: "paleturquoise",
        borderRadius: "1rem",
        padding: "1.5rem"
    }
} as const;

const todayStr = new Date().toLocaleDateString('sv-SE');

export function CategoryCard({cat,colorClass}: Props) {
    const [ categoryInput, setCategoryInput ] = useState('');
    const { addTodoToCategory, deleteCategoryBtn, setCategoryLimit, setCategoryTaskPriority, setCategoryTaskMemo} = useTodoContext();
    const [ selectedTodo, setSelectedTodo ] = useState<any>(null);
    const [ selectedIndex, setSelectedIndex ] = useState<number | null>(null);
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({id: cat.id})

    const style = {
        transform:CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }
    return(
        <div ref={setNodeRef} 
            style= {style}
            className={`mt-4 rounded-lg ${colorClass}`}>
            <div>
                <span
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-2 select-none"
                >⋮⋮
                </span>
                <span>{cat.title}</span>
            </div>
            <div className="flex gap-2 mb-6">
                <input 
                    type="text"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)} 
                    className={`flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${colorClass}`}
                />
                <button onClick={
                    (e) => {
                        e.stopPropagation();
                        addTodoToCategory(cat.id, categoryInput);
                        setCategoryInput("");
                    }
                }
                    className="text-gray-500 hover:text-gray-800 font-semibold text-xs px-3 py-1.5 rounded-md transition-colors"
                >
                    追加
                </button>
                <button onClick={() => deleteCategoryBtn(cat.id)}
                    className="text-red-500 hover:text-red-700 font-semibold text-xs px-3 py-1.5 rounded-md transition-colors"
                >
                    削除
                </button>
            </div>
            <ul>
                <SortableContext items ={cat.todos.map((todo) => todo.id)}>
                    {cat.todos.map((todo,index) => (
                        <TodoItem 
                            key={todo.id} 
                            todo={todo} 
                            cat={cat} 
                            index={index} 
                            onOpenModal={() => {
                                setSelectedTodo(todo);
                                setSelectedIndex(index);
                            }}/>
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
                    onLimitChange ={(newLimit) => {
                        setCategoryLimit(cat.id, selectedTodo.id, newLimit);
                        setSelectedTodo({...selectedTodo, limit: newLimit});
                    }}
                    onPriorityChange={(newPriority) =>{
                        setCategoryTaskPriority(cat.id, selectedTodo.id, newPriority);
                        setSelectedTodo({...selectedTodo, priority: newPriority})
                    }}
                    onMemoChange={(newMemo) =>{
                        setCategoryTaskMemo(cat.id, selectedTodo.id, newMemo);
                        setSelectedTodo((prev: any) => ({...prev, memo: newMemo}))
                    }}
                />
            )}
        </div>
    );
}

function TodoItem({todo, cat, onOpenModal}:{todo:any, cat:any, index: number, onOpenModal:() => void}) {
    
    const {attributes,listeners, setNodeRef, transform, transition} = useSortable({id: todo.id});

    const style ={
        transform:CSS.Transform.toString(transform),
        transition,
    };

    const { categoryCompleteBtn, categoryDeleteBtn } = useTodoContext();
    const priorityLabel: Record<string, string> = {
        high: "優先度: 高",
        middle: "優先度: 中",
        low: "優先度: 低"
    };
    const todayStr = new Date().toLocaleDateString('sv-SE');
    const isOverDue = todo.limit ? todo.limit < todayStr : false;

    return(
        <li 
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 transition-all"
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
                                : "text-gray-400 bg-slate-100"
                            }`}>
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
            
            <div>
                <div className="App">
                    <button 
                        onClick={onOpenModal}
                        className="hover:text-gray-700 text-gray-500 font-semibold text-xs px-2 py-1.5 rounded-md transition-colors"
                    >
                        詳細
                    </button>
                </div>
                <button onClick={(e) => {
                    e.stopPropagation();
                    categoryCompleteBtn(cat.id, todo.id);
                }}
                className="hover:text-gray-700 text-gray-500 font-semibold text-xs px-3 py-1.5 rounded-md transition-colors" 
                >
                    完了
                </button>
                <button onClick={(e) => {
                    e.stopPropagation();
                    categoryDeleteBtn(cat.id, todo.id);
                }}
                    className="hover:text-red-700 text-red-500 font-semibold text-xs px-3 py-1.5 rounded-md transition-colors"
                >
                    削除
                </button>
            </div>
        </li>
    );
}