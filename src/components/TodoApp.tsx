import { useState, useEffect } from 'react';
import { TodoInput } from './TodoInput';
import { TodoItem } from './TodoItem';
import { TodoFilters } from './TodoFilters';
import { Card } from '@/components/ui/card';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export type FilterType = 'all' | 'active' | 'completed';

export const TodoApp = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');

  // Load todos from localStorage on mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      try {
        const parsedTodos = JSON.parse(savedTodos).map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt)
        }));
        setTodos(parsedTodos);
      } catch (error) {
        console.error('Error loading todos from localStorage:', error);
      }
    }
  }, []);

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: text.trim(),
      completed: false,
      createdAt: new Date()
    };
    setTodos(prev => [newTodo, ...prev]);
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => 
      prev.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const editTodo = (id: string, newText: string) => {
    setTodos(prev => 
      prev.map(todo => 
        todo.id === id ? { ...todo, text: newText.trim() } : todo
      )
    );
  };

  const clearCompleted = () => {
    setTodos(prev => prev.filter(todo => !todo.completed));
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const completedCount = todos.filter(todo => todo.completed).length;
  const activeCount = todos.length - completedCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent mb-4">
            Todo List
          </h1>
          <p className="text-muted-foreground text-lg">
            Stay organized and productive
          </p>
        </div>

        {/* Main Todo Container */}
        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <div className="p-6">
            <TodoInput onAddTodo={addTodo} />
            
            {todos.length > 0 && (
              <>
                <TodoFilters 
                  filter={filter} 
                  onFilterChange={setFilter}
                  activeCount={activeCount}
                  completedCount={completedCount}
                  onClearCompleted={clearCompleted}
                />
                
                <div className="space-y-2 mt-6">
                  {filteredTodos.map(todo => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onToggle={toggleTodo}
                      onDelete={deleteTodo}
                      onEdit={editTodo}
                    />
                  ))}
                </div>

                {filteredTodos.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-lg">
                      {filter === 'active' && 'No active todos'}
                      {filter === 'completed' && 'No completed todos'}
                    </p>
                  </div>
                )}
              </>
            )}

            {todos.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">Your todo list is empty</p>
                <p>Add a task above to get started!</p>
              </div>
            )}
          </div>
        </Card>

        {/* Stats */}
        {todos.length > 0 && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-4">
              <span>{activeCount} active</span>
              <span>•</span>
              <span>{completedCount} completed</span>
              <span>•</span>
              <span>{todos.length} total</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};