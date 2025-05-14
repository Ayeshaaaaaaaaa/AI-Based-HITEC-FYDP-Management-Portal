"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie'; 
import DefaultLayout from '@/components/Layouts/AdminDefaultLaout';
import Student from '@/components/student';

const StudentPage = () => {
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
      <Student />
    </DefaultLayout>
  );
};
export default StudentPage;
