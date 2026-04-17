import React from 'react';
import { BookOpen, Clock } from 'lucide-react';
import { Course } from '@/types/database'; // استيراد النوع اللي لسه محدثينه
import { formatPrice } from '@/lib/utils';  // عشان نعرض السعر بشكل شيك

interface CourseCardProps {
  course: Course; // تعديل الـ Props عشان تستقبل كائن الكورس كامل
}

export default function CourseCard({ course }: CourseCardProps) {
  // بنستخرج البيانات اللي محتاجينها من كائن الكورس
  const { title, description, price, thumbnail_url } = course;

  return (
    <div className="group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      <div className="h-40 bg-blue-50 flex items-center justify-center overflow-hidden">
        {thumbnail_url ? (
          <img 
            src={thumbnail_url} 
            alt={title} 
            className="h-full w-full object-cover transition-transform group-hover:scale-105" 
          />
        ) : (
          <BookOpen className="h-12 w-12 text-blue-600" />
        )}
      </div>
      
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
           <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Physics</span>
           <span className="text-sm font-bold text-gray-900">{formatPrice(price)}</span>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 truncate">
          {title}
        </h3>
        
        <p className="mt-2 line-clamp-2 text-sm text-gray-500 leading-relaxed">
          {description || "لا يوجد وصف متاح لهذا الكورس حالياً."}
        </p>
        
        <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>8 ساعات</span> {/* ممكن نربطها بـ duration مستقبلاً */}
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>12 درس</span>
          </div>
        </div>
      </div>
    </div>
  );
}