"use client"
import Modal from "react-modal";
import { useTodoContext } from "../context/TodoContext";
import React, { useEffect } from "react";


const modalStyle = {
    
} as const;

type Props ={
    isOpen: boolean;
    style:any;
    todo:any;
    children?: React.ReactNode;
    todayStr: any;
    onClose: () => void;
    index: number;
    onLimitChange?: (newLimit: string) => void;
    onPriorityChange?: (newPriority: string) => void;
    onMemoChange?:(newMemo: string) => void;
}

export default function TaskDetailModal({isOpen, style, onClose, todayStr, todo, index, onLimitChange, onPriorityChange, onMemoChange}:Props){
    if(!isOpen) return null;
    
    const { setLimit, setPriority, setTaskMemo } = useTodoContext();
    const isOverDue = todo.limit ? todo.limit < todayStr : false;

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) =>{
        const value = e.target.value;
        if(onLimitChange){
            onLimitChange(value);
        }else{
            setLimit(index, value);
        }
    };

    const handlePriorityChange = (e:React.ChangeEvent<HTMLSelectElement>) =>{
        const value = e.target.value;
        if (onPriorityChange){
            onPriorityChange(value);
        }else if(setPriority){
            setPriority(index, value);
        }
    }

    const handleMemoChange = (e:React.ChangeEvent<HTMLTextAreaElement>) =>{
        const value = e.target.value;
        if (onMemoChange){
            onMemoChange(value);
        }else if(setTaskMemo){
            setTaskMemo(index, value);
        }
    };

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }
        return() =>{
            document.body.classList.remove('overflow-hidden');
        }
    }, [isOpen]);
    
    return(
        <Modal 
            isOpen={isOpen}  
            onRequestClose={onClose}
            style={{
                overlay: {
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    zIndex: 1000,
                },
                content: {
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: "#ffffff",
                    borderRadius: "1rem",
                    padding: "1.5rem",
                    width: "90%",
                    maxWidth: "500px",
                    maxHeight: "80vh",
                }
            }}
                parentSelector={() =>document.body}
                className="bg-white rounded-2xl p-6 max-w-lg w-full outline-none"
                overlayClassName="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center"
            >
            <div 
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onKeyDown={(e)=> e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
            >
                <h2>{todo.text}</h2>
                <textarea 
                    value= {todo.memo|| ""}
                    onChange={handleMemoChange}
                    placeholder="詳細を記載"
                    className="w-full border rounded p-2 mb-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"

                />
                <input 
                    type="date" 
                    value={todo.limit || ""}
                    onChange={handleDateChange}
                    className={`text-xs border rounded p-1 ${
                    isOverDue ? "text-red-500 border-red-500 font-bold" : ""
                    }`}
                />
                <select 
                    name="priority" 
                    id="priority"
                    value={todo.priority || "middle"}
                    onChange={handlePriorityChange}
                    className="border rounded p-1"
                >
                    <option value="high">高</option>
                    <option value="middle">中</option>
                    <option value="low">低</option>
                </select>
                <button onClick={onClose}>閉じる</button>
            </div>
            
        </Modal>
    )
}