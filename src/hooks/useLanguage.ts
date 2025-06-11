import { useTranslation } from "react-i18next";

export const useLanguage = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);
  };

  const getCurrentLanguage = () => {
    return i18n.language;
  };

  return {
    t,
    changeLanguage,
    getCurrentLanguage,
    currentLanguage: i18n.language,
  };
};
