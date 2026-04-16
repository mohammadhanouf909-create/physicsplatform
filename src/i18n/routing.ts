import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'ar'], // اللغات المدعومة
  defaultLocale: 'ar',   // اللغة الافتراضية لما حد يفتح الموقع
  localePrefix: 'always'
});

export const {Link, redirect, usePathname, useRouter} = createNavigation(routing);