import {useTranslations} from 'next-intl';

export default function HomePage() {
  // بنقول للموقع استخدم قاموس "Index" اللي في ملفات الـ JSON
  const t = useTranslations('Index');
  
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}