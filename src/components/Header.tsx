import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import UserDropdown from "@/components/UserDropdown";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/hooks/useLanguage";

const Header = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const { t } = useLanguage();
  
  // Generate breadcrumb segments
  const breadcrumbs = pathSegments.map((segment, index) => {
    // Capitalize first letter
    const displayName = segment.charAt(0).toUpperCase() + segment.slice(1);
    return {
      name: displayName,
      path: '/' + pathSegments.slice(0, index + 1).join('/'),
    };
  });
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 18) return t('goodAfternoon');
    return t('goodEvening');
  };

  return (
    <header className="bg-background border-b border-border py-3 px-6 flex justify-between items-center">
      <div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          {breadcrumbs.length === 0 ? (
            <span>{getGreeting()}, Huy</span>
          ) : (
            breadcrumbs.map((crumb, i) => (
              <div key={i} className="flex items-center">
                {i > 0 && <span className="mx-1">/</span>}
                <span>{crumb.name}</span>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <LanguageToggle />
        <Button variant="outline" size="sm">
          {t('editBrand')}
        </Button>
        <UserDropdown />
      </div>
    </header>
  );
};

export default Header;
