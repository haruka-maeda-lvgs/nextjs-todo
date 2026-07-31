import { SortableContext } from "@dnd-kit/sortable";
import { UncategorizedList } from "./UncategorizedList";
import { useDroppable } from "@dnd-kit/core";

export function UncategorizedContainer ({todos, todayStr}:{todos: any[], todayStr: string}){
  const {setNodeRef, isOver} = useDroppable({id:"uncategorized"});

  return(
    <div ref={setNodeRef}
      className={`min-h-[60px] p-2 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200 mb-6 transition-all 
        ${isOver ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-slate-50/50"}`}
      >
      <SortableContext id="uncategorized" items={todos.map((todo) => todo.id)}>
        <ul className="space-y-2 min-h-[44px] flex flex-col justify-center">
        {todos.length === 0 ? (
          <p>タスクが表示されるよ</p>
        ) : (
          
            <UncategorizedList />
        )}
        </ul>
      </SortableContext>
    </div>
  )
}