
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'en' | 'vn';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations dictionary
const translations = {
  en: {
    'dashboard': 'Dashboard',
    'agents': 'Agents',
    'tasks': 'Tasks',
    'settings': 'Settings',
    'logout': 'Log out',
    'profile': 'Profile',
    'search': 'Search...',
    'addFolder': 'Add Folder',
    'addAgent': 'Add Agent',
    'addTask': 'Add Task',
    'folderName': 'Folder Name',
    'create': 'Create',
    'cancel': 'Cancel',
    'home': 'Home',
    'darkMode': 'Dark Mode',
    'lightMode': 'Light Mode',
    'language': 'Language',
    'english': 'English',
    'vietnamese': 'Vietnamese',
    'goodMorning': 'Good morning',
    'goodAfternoon': 'Good afternoon',
    'goodEvening': 'Good evening',
    'editBrand': 'Edit brand',
    'manageWorkspace': 'Manage Workspace',
    'createWorkspace': 'Create Workspace',
    'workspaceName': 'Workspace Name',
    'tutorial': 'Tutorial',
    'whatsNew': 'What\'s New',
    'roadmap': 'Roadmap',
    'termsOfUse': 'Terms of Use',
    'privacyPolicy': 'Privacy Policy',
    'yourRecentChats': 'Your recent chats',
    'upgradeAccount': 'Upgrade Account',
    'taskManagement': 'Task Management',
    'assignedTasks': 'Assigned Tasks',
    'unassignedTasks': 'Unassigned Tasks',
    'todo': 'To Do',
    'inProgress': 'In Progress',
    'completed': 'Completed',
    'assign': 'Assign',
    'toDo': 'To Do',
    'createTask': 'Create Task',
    'taskTitle': 'Task Title',
    'taskDescription': 'Task Description',
    'assignTo': 'Assign To',
    'dueDate': 'Due Date',
  },
  vn: {
    'dashboard': 'Bảng điều khiển',
    'agents': 'Đại lý',
    'tasks': 'Nhiệm vụ',
    'settings': 'Cài đặt',
    'logout': 'Đăng xuất',
    'profile': 'Hồ sơ',
    'search': 'Tìm kiếm...',
    'addFolder': 'Thêm thư mục',
    'addAgent': 'Thêm đại lý',
    'addTask': 'Thêm nhiệm vụ',
    'folderName': 'Tên thư mục',
    'create': 'Tạo',
    'cancel': 'Hủy',
    'home': 'Trang chủ',
    'darkMode': 'Chế độ tối',
    'lightMode': 'Chế độ sáng',
    'language': 'Ngôn ngữ',
    'english': 'Tiếng Anh',
    'vietnamese': 'Tiếng Việt',
    'goodMorning': 'Chào buổi sáng',
    'goodAfternoon': 'Chào buổi chiều',
    'goodEvening': 'Chào buổi tối',
    'editBrand': 'Chỉnh sửa thương hiệu',
    'manageWorkspace': 'Quản lý không gian làm việc',
    'createWorkspace': 'Tạo không gian làm việc',
    'workspaceName': 'Tên không gian làm việc',
    'tutorial': 'Hướng dẫn',
    'whatsNew': 'Có gì mới',
    'roadmap': 'Lộ trình',
    'termsOfUse': 'Điều khoản sử dụng',
    'privacyPolicy': 'Chính sách bảo mật',
    'yourRecentChats': 'Các cuộc trò chuyện gần đây',
    'upgradeAccount': 'Nâng cấp tài khoản',
    'taskManagement': 'Quản lý nhiệm vụ',
    'assignedTasks': 'Nhiệm vụ đã giao',
    'unassignedTasks': 'Nhiệm vụ chưa giao',
    'todo': 'Cần làm',
    'inProgress': 'Đang thực hiện',
    'completed': 'Đã hoàn thành',
    'assign': 'Giao nhiệm vụ',
    'toDo': 'Cần làm',
    'createTask': 'Tạo nhiệm vụ',
    'taskTitle': 'Tiêu đề nhiệm vụ',
    'taskDescription': 'Mô tả nhiệm vụ',
    'assignTo': 'Giao cho',
    'dueDate': 'Ngày hết hạn',
  }
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Try to get the language from localStorage
    const savedLanguage = localStorage.getItem('language');
    return (savedLanguage === 'en' || savedLanguage === 'vn') ? savedLanguage : 'en';
  });

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Translation function
  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
