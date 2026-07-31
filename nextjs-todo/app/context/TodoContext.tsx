"use client";
import { arrayMove } from "@dnd-kit/sortable";
import { ReactNode, useState, useContext, useEffect } from "react";
import { createContext } from "react";

type Todo ={
    id: string;
    text: string;
    limit: string;
    categoryId?: string;
    priority?: string;
    memo?: string;
}

type TodoContextType = {
    todos: Todo[];
    completeTodos: Todo[];
    setLimit:(index: number, limitDate: string) => void;
    addBtn: (text: string) => void;
    completeBtn: (index: number) => void;
    deleteBtn: (index: number) => void;
    categoryCompleteBtn:(categoryId: string, todoId: string) => void;
    categoryDeleteBtn:(categoryId: string, todoId: string) => void;
    deleteCategoryBtn:(categoryId: string) => void;
    backBtn: (todoId: string) => void;
    categories: Category[];
    addCategory:(title: string) => void;
    addTodoToCategory:(categoryId: string, text: string) => void;
    setCategoryLimit: (categoryId: string, todoId: string, limit: string) => void;
    moveTaskToCategory: (todoId: string, targetCategoryId: string) => void;
    reorderCategories: (activeId: string, overId: string) => void;
    reorderTasksInCategory:(categoryId: string, activeTaskId: string, overTaskId: string) => void;
    reorderUncategorizedTasks:(activeTaskId:string, overTaskId: string) => void;
    setPriority:(index: number, priority: string)=> void;
    setCategoryTaskPriority:(categoryId: string, taskId: string, priority:string) => void;
    setTaskMemo:(index: number, memo: string) => void;
    setCategoryTaskMemo:(categoryId: string, taskId: string, memo: string) => void;
}

export type Category = {
    id: string;
    title: string;
    todos: Todo[];
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export function TodoProvider({children}: {children: ReactNode}){
    const[todos, setTodos] = useState<Todo[]>([]);
    const[completeTodos, setCompleteTodos] = useState<Todo[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const savedTodos = localStorage.getItem("todos");
        if(savedTodos) setTodos(JSON.parse(savedTodos));

        const savedCompleteTodos = localStorage.getItem("completeTodos");
        if(savedCompleteTodos) setCompleteTodos(JSON.parse(savedCompleteTodos));

        const savedCategories = localStorage.getItem("categories");
        if(savedCategories) setCategories(JSON.parse(savedCategories));
    }, []);

    useEffect(() => {
        localStorage.setItem("todos", JSON.stringify(todos));
        },[todos]);
    
    useEffect(() => {
        localStorage.setItem("completeTodos", JSON.stringify(completeTodos));
        },[completeTodos]);

    useEffect(() => {
        localStorage.setItem("categories", JSON.stringify(categories));
        },[categories]);

    const setLimit = (index: number, limitDate: string) => {
        const newTodos = [...todos];
        newTodos[index].limit = limitDate;
        setTodos(newTodos);
    }

    const addBtn = (text: string) => {
        if(text.trim() ==='') return;
        setTodos([...todos, {id: crypto.randomUUID(), text, limit: ''}]);
    };
    
    const addCategory = (title: string) =>{
        if(title.trim() === "") return;
        
        const newCategory: Category = {
        id: crypto.randomUUID(),
        title: title,
        todos: []
        };

        setCategories([...categories, newCategory])
    };

    const completeBtn = (index: number) => {
        setCompleteTodos([...completeTodos, todos[index]]);
        const newTodos = todos.filter((_, i)=> i !== index);
        setTodos(newTodos);
    };

    const deleteBtn = (index: number) => {
        const newTodos = todos.filter((_, i) => i !== index);
        setTodos(newTodos)
    };

    const setCategoryLimit = (categoryId: string, todoId: string, limit: string) => {
        setCategories(
            categories.map((cat) => {
            if (cat.id !== categoryId) return cat;
            return {
                ...cat,
                todos: cat.todos.map((todo) =>
                todo.id === todoId ? { ...todo, limit } : todo
                ),
            };
            })
        );
    };

    const categoryCompleteBtn = (categoryId: string, todoId: string) => {
        const targetCategory = categories.find((cat) => cat.id === categoryId); 
        if(!targetCategory) return;

        const completedTodo = targetCategory.todos.find((todo) => todo.id === todoId);
        if(!completedTodo) return;

        setCompleteTodos([
            ...completeTodos,
            {...completedTodo,categoryId}
        ]);

        const newCategories = categories.map((cat) => {
            if (cat.id !== categoryId){
                return cat;
            }
            return{
                ...cat,
                todos: cat.todos.filter((todo) => todo.id !== todoId),
            }
        });
        
        setCategories(newCategories);
    };
        
    const categoryDeleteBtn = (categoryId: string, todoId: string) => {
        const newCategories = categories.map((cat) => {
            if(cat.id !== categoryId){
                return cat;
            }
            return{
                ...cat,
                todos: cat.todos.filter((todo) => todo.id !== todoId),
            };
        });
        setCategories(newCategories);
    };

    const deleteCategoryBtn = (categoryId: string) => {
        setCategories(categories.filter((cat) => cat.id !== categoryId));
    }

    const backBtn = (todoId: string) =>{
        const backTodo = completeTodos.find((todo) => todo.id === todoId);
        if(!backTodo) return;

        setCompleteTodos(completeTodos.filter((todo) => todo.id !== todoId));

        if(backTodo.categoryId){
            const targetCategoryExists = categories.some((cat) => cat.id ===backTodo.categoryId);
            if(targetCategoryExists){
                setCategories(
                    categories.map((cat) => {
                        if(cat.id !== backTodo.categoryId) return cat;
                        return{
                            ...cat,
                            todos:[...cat.todos, backTodo],
                        };
                    })
                );
            } else {
                setTodos([...todos, backTodo]);
            }
        } else {
            setTodos([...todos, backTodo]);
        }
    }
    

    const addTodoToCategory = (categoryId: string, text: string) => {
        if(text.trim() === "" ) return;
    
        const newTodo: Todo = {
            id:crypto.randomUUID(),
            text, 
            limit: '',
        };

        setCategories(categories.map((cat) => {
            if(cat.id === categoryId) {
                return{
                    ...cat,
                    todos: [...cat.todos, newTodo],
                };
            }
            return cat;
        })
        );
    }

    const moveTaskToCategory =(targetCategoryId: string, todoId: string) =>{
        let movedTodo : Todo | undefined;
        const foundInTodos = todos.find((t) => t.id === todoId);
        if(foundInTodos){
            movedTodo = foundInTodos;
            setTodos(todos.filter((t) => t.id !== todoId));
        } else {
            const updateCategories = categories.map((cat) =>{
                const found = cat.todos.find((t) => t.id === todoId);
                if(found){
                    movedTodo = found;
                    return{
                        ...cat,
                        todos: cat.todos.filter((t) => t.id !== todoId),
                    };
                }
                return cat;
            });
            setCategories(updateCategories);
        }

        if(!movedTodo) return;

        if(targetCategoryId ==="uncategorized"){
            setTodos((prev) => [...prev, movedTodo!]);
        } else{
            setCategories((prev) =>
                prev.map((cat) => {
                    if(cat.id === targetCategoryId) {
                        return{
                            ...cat,
                            todos: [...cat.todos, movedTodo!],
                        };
                    }
                    return cat;
                })
            );
        }
    };

    const reorderTasksInCategory = (categoryId: string, activeTaskId: string, overTaskId: string) => {
        setCategories((prevCategories) => {
            return prevCategories.map((cat) => {
                if(cat.id !== categoryId) return cat;
            
                const oldIndex = cat.todos.findIndex((todo) => todo.id === activeTaskId);
                const newIndex = cat.todos.findIndex((todo) => todo.id === overTaskId);

                if(oldIndex !== -1 && newIndex!== -1){
                    return {
                        ...cat,
                        todos: arrayMove(cat.todos, oldIndex,newIndex)
                    };
                }
                return cat;
            })
        })
    };

    const reorderUncategorizedTasks=(activeTaskId:string, overTaskId: string) => {
        setTodos((prevTodos) => {
            
            const oldIndex = prevTodos.findIndex((todo) => todo.id === activeTaskId);
            const newIndex = prevTodos.findIndex((todo) => todo.id === overTaskId);

            if(oldIndex !== -1 && newIndex!== -1){
                return arrayMove(prevTodos, oldIndex,newIndex);
            }
            return prevTodos;
        })
    };
    

    const reorderCategories =(activeId: string, overId: string) => {
        setCategories((prevCategories) =>{
            const oldIndex = prevCategories.findIndex((cat) => cat.id === activeId)
            const newIndex = prevCategories.findIndex((cat) => cat.id === overId)

            if (oldIndex !== -1 && newIndex !== -1) {
                return arrayMove(prevCategories, oldIndex, newIndex)
            } 
            return prevCategories;
        });
    };

    const setPriority = (index: number, priority: string) => {
        setTodos((prevTodos) => {
            const newTodos = [...prevTodos];
            newTodos[index] = {...newTodos[index], priority};
            return newTodos;
        });
    };

    const setCategoryTaskPriority = (categoryId: string, taskId: string, priority:string) =>{
        setCategories((prevCategories) =>
            prevCategories.map((cat)=> {
                if(cat.id !== categoryId) return cat;

                return{
                    ...cat,
                    todos:cat.todos.map((todo)=>
                        todo.id === taskId ? {...todo, priority}: todo
                    ),
                };
            })
        );
    };

    const setTaskMemo =(index: number, memo: string)=>{
        setTodos((prev) => {
            const newTodos = [...prev];
            newTodos[index] = {...newTodos[index], memo};
            return newTodos;
        });
    };

    const setCategoryTaskMemo = (categoryId: string, taskId: string, memo: string) =>{
        setCategories((prev) =>
            prev.map((cat) =>{
                if (cat.id !== categoryId) return cat;
                return{
                    ...cat,
                    todos: cat.todos.map((todo) =>
                        todo.id === taskId ? {...todo, memo}: todo
                    ),
                }
            })
        );
    };


    return (
            <TodoContext.Provider value={{ todos, completeTodos, categories, addBtn, setLimit, completeBtn, deleteBtn, backBtn, addCategory, addTodoToCategory, categoryCompleteBtn, categoryDeleteBtn, deleteCategoryBtn, setCategoryLimit, moveTaskToCategory, reorderCategories,reorderTasksInCategory, reorderUncategorizedTasks, setPriority, setCategoryTaskPriority, setTaskMemo, setCategoryTaskMemo}}>
            {children}
            </TodoContext.Provider>
    );
}

export function useTodoContext() {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error("useTodoContext must be used within a TodoProvider");
  }
  return context;
}