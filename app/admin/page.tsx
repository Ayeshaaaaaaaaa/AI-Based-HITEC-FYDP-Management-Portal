"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Admin from '@/components/Admin/index';
import Cookies from 'js-cookie'; 
import DefaultLayout from '@/components/Layouts/AdminDefaultLaout';

const AdminPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = Cookies.get('token');
      if (!token) {
        router.push('/adminsignin');
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
