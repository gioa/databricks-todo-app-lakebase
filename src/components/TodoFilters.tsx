import { Button } from '@/components/ui/button';
import { FilterType } from './TodoApp';
import { cn } from '@/lib/utils';

interface TodoFiltersProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  activeCount: number;
  completedCount: number;
  onClearCompleted: () => void;
}

export const TodoFilters = ({ 
  filter, 
  onFilterChange, 
  activeCount, 
  completedCount, 
  onClearCompleted 
}: TodoFiltersProps) => {
  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' }
  ];

  return (
    <div className="flex items-center justify-between border-t pt-4 mt-4">
      <div className="flex gap-1">
        {filters.map(filterOption => (
          <Button
            key={filterOption.key}
            size="sm"
            variant={filter === filterOption.key ? "default" : "ghost"}
            onClick={() => onFilterChange(filterOption.key)}
            className={cn(
              "transition-all duration-200",
              filter === filterOption.key
                ? "bg-primary hover:bg-primary/90 shadow-md"
                : "hover:bg-accent"
            )}
          >
            {filterOption.label}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{activeCount} left</span>
        {completedCount > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onClearCompleted}
            className="text-xs hover:text-destructive hover:bg-destructive/10"
          >
            Clear completed
          </Button>
        )}
      </div>
    </div>
  );
};