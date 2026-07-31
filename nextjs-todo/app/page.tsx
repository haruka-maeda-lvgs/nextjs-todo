"use client"
import { useState } from "react"
import Link from "next/link";
import { useTodoContext } from "./context/TodoContext"
import { CategoryCard } from "./component/CategoryCard";
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor, pointerWithin } from "@dnd-kit/core";
import { UncategorizedContainer } from "./component/UncategorizedContainer";
import { SortableContext } from "@dnd-kit/sortable";

export default function TodoApp (){
  const { todos, completeTodos, addBtn, categories, moveTaskToCategory, reorderTasksInCategory, reorderUncategorizedTasks} = useTodoContext();
  const { addCategory, reorderCategories } = useTodoContext();
  const [inputText, setInputText ] = useState('');
  const [ categoryTitle, setCategoryTitle ] = useState('');
  const todayStr = new Date().toLocaleDateString('sv-SE');
  const sensors = useSensors(
    useSensor(PointerSensor,{
      activationConstraint:{
        distance: 8,
      }
    })
  )
  const AddCategoryBtn = () => {
    addCategory(categoryTitle);
    setCategoryTitle('');
  };

  const categoryColor = [
    "bg-zinc-100 border-zinc-300 text-zinc-800 focus:ring-zinc-300",
    "bg-slate-100 border-slate-300 text-slate-800 focus: ring-slate-300 ",
    "bg-neutral-100 border-neutral-300 text-neutral-800 focus:ring-neutral-300",
    "bg-gray-100 border-gray-300 text-gray-800 focus:ring-gray-300",
    "bg-stone-100 border-stone-300 text-stone-800 focus:ring-stone-300",
    "bg-slate-200/60 border-slate-300 text-slate-800 focus:ring-slate-300",
    "bg-zinc-200/60 border-zinc-300 text-zinc-800 focus:ring-zinc-300",
    "bg-neutral-200/60 border-neutral-300 text-neutral-800 focus:ring-neutral-300",
    "bg-stone-200/60 border-stone-300 text-stone-800 focus:ring-stone-300",
    "bg-gray-200/60 border-gray-300 text-gray-800 focus:ring-gray-300",
  ]
  
  const handleDragEnd = (e: DragEndEvent) =>{
    const {active, over} = e;

    if (!over) return;

    const taskId = String(active.id)
    const overId = String(over.id)

    const isCategoryActive = categories.some((cat) => cat.id === taskId);
    const isCategoryOver = categories.some((cat) => cat.id === overId);

    if(isCategoryActive && isCategoryOver){
      reorderCategories(taskId,overId);
      return;
    }

    const isUncategorizedActive = todos.some((todo) => todo.id === taskId);
    if(isUncategorizedActive){
      const isOverUncategorizedTask = todos.some((todo) => todo.id === overId);
      if(isOverUncategorizedTask && taskId !== overId){
        reorderUncategorizedTasks(taskId,overId);
        return;
      }

      if(overId === "uncategorized"){
        return;
      }
    }

    const currentCategory = categories.find((cat) =>
      cat.todos.some((todo) => todo.id === taskId)
    );

    let targetCategoryId = categories.find((cat) => cat.id === overId)?.id;

    if(!targetCategoryId) {
      const parentCategory = categories.find((cat) =>
      cat.todos.some((todo) => todo.id === overId)
    );
    targetCategoryId = parentCategory?.id;
    }

    if(!targetCategoryId){
      targetCategoryId = "uncategorized";
    }

    if(currentCategory && currentCategory.id === targetCategoryId){
      if(taskId !== overId){
        reorderTasksInCategory(currentCategory.id, taskId, overId);
      }
    } else {
      moveTaskToCategory(targetCategoryId, taskId);
    }
  };

  return(
    <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={pointerWithin}>
      <main className="min-h-screen bg-slate-50 flex justify-center p-4 pt-12">
        <div className="text-center bg-white w-full max-w-xl rounded-2xl shadow-sm border border-slate-100 p-6 h-fit">
          <h1 className="text-2xl font-bold text-slate-800 text-center">
           TODO
          </h1>
          <div className="flex gap-2 mb-6">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="タスクを入力"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
            />
            <button onClick={() =>{
              addBtn(inputText);
              setInputText('');
              }}
              className="bg-gray-500 hover:bg-gray-600 active:scale-95 text-white font-medium px-4 py-2 rounded-lg transition-all shadow-sm"
              >
                追加
            </button>
          </div>
          <UncategorizedContainer todos={todos} todayStr={todayStr} />
          <div className="flex flex-wrap gap-2 mt-4">
            <input 
              type="text"
              value={categoryTitle}
              onChange={(e) =>setCategoryTitle(e.target.value)}
              placeholder="カテゴリを入力" 
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
            />
            <button onClick={AddCategoryBtn}
              className="bg-gray-500 hover:bg-gray-600 active:scale-95 text-white font-medium px-4 py-2 rounded-lg transition-all shadow-sm"
            >
              追加
            </button>
          </div>
            <SortableContext id="categories-group" items={categories.map((cat) => cat.id)}>
              {categories.map((cat,index) => {
                const colorClass = categoryColor[index % categoryColor.length];
                return(
                  <CategoryCard 
                    key={cat.id} 
                    cat={cat}
                    colorClass={colorClass} />
                )
              })}
            </SortableContext>
          
          {completeTodos.length > 0 && 
            <div className="mt-8 text-center">
              <Link href="/complete" className="inline-block py-2.5 px-4 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-medium text-sm rounded-lg transition-all border border-slate-200">完了済みタスク</Link>
            </div>
          }   
        </div>
      </main>
    </DndContext>
  )
}



