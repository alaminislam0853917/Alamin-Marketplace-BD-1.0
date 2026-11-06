import React from 'react';
import { Megaphone } from 'lucide-react';

interface NoticeBarProps {
  notice?: string;
}

export const NoticeBar: React.FC<NoticeBarProps> = ({ notice }) => {
  if (!notice || notice.trim() === '') {
    return null;
  }

  return (
    <div className="bg-teal-900 text-teal-50 px-3 py-2 text-xs sm:text-sm font-medium flex items-center shadow-inner overflow-hidden border-b border-teal-800">
      <div className="flex items-center gap-1.5 bg-teal-800 px-2.5 py-1 rounded-md flex-shrink-0 z-10 shadow-xs mr-3">
        <Megaphone className="w-3.5 h-3.5 text-teal-300 animate-pulse" />
        <span className="font-semibold text-teal-200 text-xs">বিজ্ঞপ্তি:</span>
      </div>
      <div className="relative flex overflow-x-hidden w-full whitespace-nowrap">
        <div className="animate-marquee inline-block whitespace-nowrap">
          <span className="mx-4">{notice}</span>
          <span className="mx-4 text-teal-400">•</span>
          <span className="mx-4">{notice}</span>
          <span className="mx-4 text-teal-400">•</span>
        </div>
      </div>
    </div>
  );
};
