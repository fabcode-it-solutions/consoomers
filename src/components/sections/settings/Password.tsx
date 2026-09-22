"use client";
import { useSession } from 'next-auth/react';
import React from 'react'
import ChangePassword from './UpdatePassword';
import Heading from '@/components/ui/Heading';

const Password = () => {
 const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return <p>Please log in to access settings.</p>;

  const userId = session.user?.id;
  if (!userId) return <p>User ID not available.</p>;

  return (
    <div className="md:px-6 max-w-lg mx-auto">
    <div className='flex justify-center mb-5'>  <Heading>Password Settings</Heading></div>
      <ChangePassword userId={userId} />
    </div>
  );
};

export default Password
