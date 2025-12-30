import { redirect } from 'next/navigation';

export default function Page() {
  // Legacy route: redirect to admin home
  redirect('/admin');
}
