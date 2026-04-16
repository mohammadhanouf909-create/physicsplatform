import React from 'react';
import { BookOpen, Clock } from 'lucide-react';

interface CourseCardProps {
  title: string;
  description: string;
  duration: string;
  lessonsCount: number;
}

export default function CourseCard({ title, description, duration, lessonsCount }: CourseCardProps) {
  return (
    <div className="group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      <div className="h-40 bg-blue-50 flex items-center justify-center">
         {/* هنا ممكن تحط صورة الكورس مستقبلاً */}
         <BookOpen className="h-12 w-12 text-blue-600" />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700">{title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-gray-500 leading-relaxed">
          {description}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{lessonsCount} درس</span>
          </div>
        </div>
      </div>
    </div>
  );
}