/* eslint-disable @typescript-eslint/no-explicit-any */
import { LogOut, Settings, User } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from "react";
import { getUserSubscription } from "../services/api";

const UserDropdown = () => {
  const { t } = useLanguage();
  const { user, logout } = useAuth() as any;
  const [subscription, setSubscription] = useState<any>(user?.subscription || null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      getUserSubscription()
        .then(sub => setSubscription(sub))
        .catch(() => setSubscription(null));
    }
  }, [open]);

  const handleLogout = () => {
    logout(navigate);
  };

  if (!user) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage 
            src={user.avatar} 
            alt={user.name} 
          />
          <AvatarFallback className="bg-teampal-200 text-foreground">
            {user.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-4 py-2">
          {subscription?.plan?.name && (
            <div className="text-xs text-purple-600 font-semibold mb-1">
              Gói: {subscription.plan.name}
            </div>
          )}
          <div className="font-bold">{/* workspace?.name || */ "Workspace"}</div>
          <div className="text-xs text-muted-foreground">{/* workspace?.description || */ "Thông tin workspace"}</div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>{t('profile')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>{t('settings')}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
