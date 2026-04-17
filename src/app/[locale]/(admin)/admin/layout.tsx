import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* هنا مفيش Navbar مكرر، الـ Navbar الكبير هو اللي هيظهر لوحده من الملف الرئيسي */}
      <main>
        {children}
      </main>
    </div>
  );
}