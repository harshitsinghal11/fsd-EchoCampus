'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
  User,
  Mail,
  Shield,
  Calendar,
  ArrowLeft,
  LogOut,
} from "lucide-react";
import { ProfileSkeleton } from '@/components/shared/Skeletons';
import ProfileActions from '@/components/shared/ProfileActions';
import { toast } from 'sonner';

export default function StudentProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // State for student details
  const [student, setStudent] = useState({
    email: '',
    sessionCode: '',
    joinedAt: '',
    role: 'Student'
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          router.push('/auth/login');
          return;
        }

        const { data: profileData, error: dbError } = await supabase
          .from('student_profiles')
          .select(`
            session_code,
            users:user_id ( created_at, email )
          `)
          .eq('user_id', user.id)
          .single();

        if (dbError) {
          toast.error("Failed to load profile data");
          console.error("Database Error:", dbError);
        }

        const userData = Array.isArray(profileData?.users)
          ? profileData?.users[0]
          : profileData?.users;

        setStudent({
          email: user.email || 'No Email',
          sessionCode: profileData?.session_code || 'Not Generated',
          joinedAt: userData?.created_at
            ? new Date(userData.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
            : 'Unknown',
          role: 'Student'
        });

      } catch (err) {
        toast.error("Failed to load profile data");
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 md:space-y-8 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Main Card */}
        <div className="bg-surface rounded-2xl overflow-hidden border border-border shadow-md relative">

          {/* Header Section */}
          <div className="bg-surface border-b border-border px-8 py-6 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="w-28 h-28 rounded-full bg-linear-to-br from-primary-light to-primary p-1 shadow-lg shadow-primary/20 group cursor-default shrink-0">
                <div className="w-full h-full bg-surface-hover rounded-full flex items-center justify-center border-4 border-background transition-colors">
                  <User className="w-12 h-12 text-primary" />
                </div>
              </div>

              <div className="text-center md:text-left text-text-primary">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary mb-3">Student Profile</h1>
              </div>
            </div>
          </div>

          {/* Profile Details Grid */}
          <div className="px-8 py-10 relative">
            <h2 className="text-xl font-bold text-text-primary mb-8 flex items-center gap-2">
              Account Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Email */}
              <div className="group relative p-6 rounded-2xl bg-surface border border-border hover:bg-surface-hover hover:border-primary/30 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-surface-hover text-primary border border-border shadow-sm">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1 block">
                      Email Address
                    </label>
                    <p className="text-text-primary font-medium truncate" title={student.email}>{student.email}</p>
                  </div>
                </div>
              </div>

              {/* Session Code (Anonymous ID) */}
              <div className="group relative p-6 rounded-2xl bg-surface border border-border hover:bg-surface-hover hover:border-primary/30 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-surface-hover text-primary border border-border shadow-sm">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <label className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-2">
                      Anonymous Username
                    </label>
                    <p className="text-text-primary font-mono text-lg font-bold tracking-widest truncate">
                      {student.sessionCode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Type */}
              <div className="group relative p-6 rounded-2xl bg-surface border border-border hover:bg-surface-hover hover:border-primary/30 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-surface-hover text-primary border border-border shadow-sm">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1 block">
                      Account Type
                    </label>
                    <p className="text-text-primary font-medium">Verified Student</p>
                  </div>
                </div>
              </div>

              {/* Joined Date */}
              <div className="group relative p-6 rounded-2xl bg-surface border border-border hover:bg-surface-hover hover:border-primary/30 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-surface-hover text-primary border border-border shadow-sm">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1 block">
                      Joined Date
                    </label>
                    <p className="text-text-primary font-medium">{student.joinedAt}</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <ProfileActions dashboardRoute="/main/student/dashboard" />

          </div>
        </div>
      </div>
    </div>
  );
}
