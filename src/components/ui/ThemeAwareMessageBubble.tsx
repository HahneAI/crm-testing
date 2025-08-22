import * as Icons from 'lucide-react';
import { SmartVisualThemeConfig } from '../../config/industry';
import { ThemeAwareAvatar } from './ThemeAwareAvatar';
import { Message } from '../../types/job';

const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);

  if (seconds < 5) return "just now";
  if (minutes < 1) return `${seconds} seconds ago`;
  if (minutes < 60) return `${minutes} minutes ago`;

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatMessageText = (text: string) => {
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');

  const lines = html.split('\n');
  let inList = false;
  html = lines.map(line => {
    if (line.startsWith('- ')) {
      const listItem = `<li>${line.substring(2)}</li>`;
      if (!inList) {
        inList = true;
        return `<ul>${listItem}`;
      }
      return listItem;
    } else {
      if (inList) {
        inList = false;
        return `</ul>${line}`;
      }
      return line;
    }
  }).join('<br />');

  if (inList) {
    html += '</ul>';
  }

  return html.replace(/<br \/>/g, '\n').replace(/\n/g, '<br />');
};

const StatusIcon = ({ status }: { status: Message['status'] }) => {
    switch (status) {
        case 'sending': return <Icons.Clock className="h-3 w-3 opacity-60" />;
        case 'sent': return <Icons.Check className="h-3 w-3 opacity-60" />;
        case 'delivered': return <Icons.CheckCheck className="h-3 w-3 opacity-60" />;
        case 'error': return <Icons.AlertCircle className="h-3 w-3 text-red-400" />;
        default: return null;
    }
};

export const ThemeAwareMessageBubble = ({ message, visualConfig }: { message: Message, visualConfig: SmartVisualThemeConfig }) => {
  const animationClass = visualConfig.animations.messageEntry === 'grow' ? 'landscaping-grow' : 'tech-slide';

  const bubbleStyles = {
    backgroundColor: message.sender === 'user'
      ? visualConfig.colors.primary
      : visualConfig.colors.elevated,
    color: message.sender === 'user'
      ? visualConfig.colors.text.onPrimary
      : visualConfig.colors.text.primary,
    borderRadius: visualConfig.patterns.componentShape === 'organic' ? '1.5rem' : '0.75rem'
  };

  return (
    <div className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      {message.sender === 'ai' && <ThemeAwareAvatar sender="ai" visualConfig={visualConfig} />}
      <div
        className={`max-w-md lg:max-w-2xl px-5 py-3 shadow-md message-bubble-animate ${animationClass} transition-all duration-300`}
        style={bubbleStyles}
      >
        <div
          className="text-base whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: formatMessageText(message.text) }}
        />
        <div className="flex items-center justify-end mt-2">
          <p className="text-xs opacity-60">
            {formatRelativeTime(message.timestamp)}
          </p>
          {message.sender === 'user' && message.status && (
            <div className="ml-2">
              <StatusIcon status={message.status} />
            </div>
          )}
        </div>
      </div>
      {message.sender === 'user' && <ThemeAwareAvatar sender="user" visualConfig={visualConfig} />}
    </div>
  );
};