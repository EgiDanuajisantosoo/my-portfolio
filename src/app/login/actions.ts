'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const callbackUrl = formData.get('callbackUrl') as string || '/portfolio';

  if (username === 'egiii' && password === '@bakwan010011') {
    // Berhasil login: set cookie yang expired dalam 1 hari
    const cookieStore = await cookies();
    cookieStore.set('dummy_auth', 'true', { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/'
    });
    
    redirect(callbackUrl);
  }

  // Jika salah password, kita lempar throw Error yang akan ditangkap di frontend
  throw new Error("Username atau Password salah.");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('dummy_auth');
  redirect('/portfolio');
}
