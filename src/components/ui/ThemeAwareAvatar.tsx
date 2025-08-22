import * as Icons from 'lucide-react';
import { SmartVisualThemeConfig } from '../../config/industry';

export const ThemeAwareAvatar = ({ sender, visualConfig }: { sender: 'user' | 'ai', visualConfig: SmartVisualThemeConfig }) => {
  const baseClasses = "w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center shadow-md transition-all duration-300";
  const style = {
    backgroundColor: sender === 'ai' ? visualConfig.colors.secondary : visualConfig.colors.primary,
    color: sender === 'ai' ? visualConfig.colors.text.onSecondary : visualConfig.colors.text.onPrimary,
  };

  return (
    <div className={baseClasses} style={style}>
      {sender === 'ai' ? <Icons.Bot className="w-6 h-6" /> : <Icons.User className="w-6 h-6" />}
    </div>
  );
};