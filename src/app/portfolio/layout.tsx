import Navbar from '@/components/Navbar';
import '../globals.css';
import { cookies } from 'next/headers';
import { getDictionary, Language } from '@/i18n/dictionaries';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const lang = (cookieStore.get('NEXT_LOCALE')?.value || 'id') as Language;
  const dict = getDictionary(lang);

  return (
    <>
      <Navbar dict={dict.navbar} />
      <main>{children}</main>
    </>
  );
}
