"use client";

import { useTodoContext } from "../context/TodoContext";
import Link from "next/link";


export default function CompletePage() {
  const { completeTodos, backBtn } = useTodoContext(); 

  return (
    <main className="min-h-screen bg-slate-50 flex justify-center p-4 pt-12">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-sm border border-slate-100 p-6 h-fit">
        <h1 className="text-2xl font-bold text-slate-800 text-center mb-6">完了済みタスク</h1>
        
        <ul className="space-y-3">
          {completeTodos.map((todo, index) => (
            <li key={index} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-500">
              <div className="flex items-center place-content-between">
                <div>{todo.text}</div>
                {todo.limit && <div className="text-sm text-gray-500">{todo.limit}</div>}
                <button 
                  onClick={() => backBtn(todo.id)}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-xs px-3 py-1.5 rounded-md transition-colors"
                >戻す
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-8 text-center">
          <Link href="/" className="inline-block py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-lg transition-all border border-slate-200">
            戻る
          </Link>
        </div>
      </div>
    </main>
  );
}