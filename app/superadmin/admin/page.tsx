"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie'; 
import DefaultLayout from '@/components/Layouts/DefaultLaout';
import Admin from '@/components/SuperAdmin/admin';

const AdminPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = Cookies.get('token');
      if (!token) {
        router.push('/superadminsignin');
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <DefaultLayout>
      <Admin />
    </DefaultLayout>
  );
};
export default AdminPage;
