import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const LanguageToggle = ({ className }: { className?: string }) => {
  const { currentLanguage, changeLanguage, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 px-0 hover:bg-accent hover:text-accent-foreground ${className}`}
        >
          {currentLanguage === "en" ? "EN" : "VN"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-popover text-popover-foreground border border-border"
      >
        <DropdownMenuItem
          onClick={() => changeLanguage("en")}
          className="hover:bg-accent hover:text-accent-foreground cursor-pointer"
        >
          {t("english")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeLanguage("vi")}
          className="hover:bg-accent hover:text-accent-foreground cursor-pointer"
        >
          {t("vietnamese")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
