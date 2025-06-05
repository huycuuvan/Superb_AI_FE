
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme, type Theme } from '@/hooks/useTheme';

type ThemeToggleProps = {
  className?: string;
  variant?: 'ghost' | 'outline' | 'default' | 'link' | 'secondary' | null | undefined;
  size?: 'default' | 'sm' | 'lg' | 'icon' | null | undefined;
};

export const ThemeToggle = ({
  className,
  variant = 'ghost',
  size = 'icon',
  ...props
}: ThemeToggleProps) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  
  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={className}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      {...props}
    >
      {isDark ? (
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
      )}
      <span className="sr-only">
        {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      </span>
    </Button>
  );
};
