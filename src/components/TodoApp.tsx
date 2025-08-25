import { useState, useEffect } from 'react';
import { TodoInput } from './TodoInput';
import { TodoItem } from './TodoItem';
import { TodoFilters } from './TodoFilters';
import { Card } from '@/components/ui/card';
import { apiService, Todo } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export type FilterType = 'all' | 'active' | 'completed';

export const TodoApp = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load todos from API on mount
  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTodos();
      setTodos(data);
    } catch (error) {
      console.error('Error loading todos:', error);
      toast({
        title: "Error",
        description: "Failed to load todos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (text: string) => {
    try {
      const newTodo = await apiService.createTodo({ text: text.trim() });
      setTodos(prev => [newTodo, ...prev]);
      toast({
        title: "Success",
        description: "Todo added successfully!",
      });
    } catch (error) {
      console.error('Error adding todo:', error);
      toast({
        title: "Error",
        description: "Failed to add todo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleTodo = async (id: number) => {
    try {
      const todo = todos.find(t => t.id === id);
      if (!todo) return;
      
      const updatedTodo = await apiService.updateTodo(id, { completed: !todo.completed });
      setTodos(prev => 
        prev.map(todo => 
          todo.id === id ? updatedTodo : todo
        )
      );
    } catch (error) {
      console.error('Error toggling todo:', error);
      toast({
        title: "Error",
        description: "Failed to update todo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      await apiService.deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
      toast({
        title: "Success",
        description: "Todo deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting todo:', error);
      toast({
        title: "Error",
        description: "Failed to delete todo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const editTodo = async (id: number, newText: string) => {
    try {
      const updatedTodo = await apiService.updateTodo(id, { text: newText.trim() });
      setTodos(prev => 
        prev.map(todo => 
          todo.id === id ? updatedTodo : todo
        )
      );
      toast({
        title: "Success",
        description: "Todo updated successfully!",
      });
    } catch (error) {
      console.error('Error editing todo:', error);
      toast({
        title: "Error",
        description: "Failed to update todo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const clearCompleted = async () => {
    try {
      const completedTodos = todos.filter(todo => todo.completed);
      await Promise.all(completedTodos.map(todo => apiService.deleteTodo(todo.id)));
      setTodos(prev => prev.filter(todo => !todo.completed));
      toast({
        title: "Success",
        description: "Completed todos cleared successfully!",
      });
    } catch (error) {
      console.error('Error clearing completed todos:', error);
      toast({
        title: "Error",
        description: "Failed to clear completed todos. Please try again.",
        variant: "destructive",
      });
    }
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
            
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">Loading todos...</p>
              </div>
            ) : todos.length > 0 ? (
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
            ) : (
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