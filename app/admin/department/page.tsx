"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie'; 
import DefaultLayout from '@/components/Layouts/AdminDefaultLaout';
import AdminDepartment from '@/components/AdminDept';

const FacultyPage = () => {
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
    // Optionally render a loading spinner or message
    return <p>Loading...</p>;
  }

  return (
    <DefaultLayout>
      <AdminDepartment />
    </DefaultLayout>
  );
};
export default FacultyPage;
