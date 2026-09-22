"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import ProfileCard from "@/components/ui/ProfileCard";
import { setProfile } from "@/libs/redux/slices/profileSlice";
import { TesterProfile } from "@/db/type";
import Spinner from "../ui/Loader";


interface User {
  id: string;
  email: string;
  role?: string;
}


const TesterPage = ({ user }: { user: User }) => {
  const { data: session } = useSession();
  const dispatch = useDispatch();

  const [profile, setProfileData] = useState<TesterProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/testerProfile/${user.id}`);
        const data = await res.json();

        if (res.ok) {
          setProfileData(data);
          dispatch(setProfile(data)); 
        } else {
          console.error("Profile fetch error:", data.error);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchProfile();
    }
  }, [user, dispatch]);

  if (loading) {
    return (
        
        <div className="flex justify-center items-center h-[70vh]">
          <Spinner className="w-12 h-12" />
        </div>
     
    );
  }

  if (!profile) {
    return <p>Profile not found</p>;
  }

  const currentUser =
    session?.user?.id && session?.user?.role
      ? { id: session.user.id, role: session.user.role }
      : undefined;

  return <ProfileCard profiles={profile} currentUser={currentUser} />;
};

export default TesterPage;
