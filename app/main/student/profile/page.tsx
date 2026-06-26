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
} from "lucide-react";
import { ProfileSkeleton } from '@/components/shared/Skeletons';
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
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl md:rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl relative">

          {/* Header Section */}
          <div className="bg-linear-to-r from-slate-900 to-slate-800 border-b border-slate-700/50 px-8 py-6 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="w-28 h-28 rounded-full bg-linear-to-br from-teal-400 to-blue-500 p-1 shadow-lg shadow-teal-500/20 group cursor-default shrink-0">
                <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center border-4 border-slate-900 transition-colors">
                  <User className="w-12 h-12 text-teal-400" />
                </div>
              </div>

              <div className="text-center md:text-left text-white">
                <h1 className="text-4xl font-extrabold tracking-tight mb-3">Student Profile</h1>
              </div>
            </div>
          </div>

          {/* Profile Details Grid */}
          <div className="px-8 py-10 relative">
            <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
              Account Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Email */}
              <div className="group relative p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/60 hover:border-teal-500/30 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-slate-900/80 text-teal-400 border border-slate-700/50 shadow-sm">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                      Email Address
                    </label>
                    <p className="text-white font-medium truncate" title={student.email}>{student.email}</p>
                  </div>
                </div>
              </div>

              {/* Session Code (Anonymous ID) */}
              <div className="group relative p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/60 hover:border-teal-500/30 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-slate-900/80 text-teal-400 border border-slate-700/50 shadow-sm">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <label className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      Anonymous Username
                    </label>
                    <p className="text-white font-mono text-lg font-bold tracking-widest truncate">
                      {student.sessionCode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Type */}
              <div className="group relative p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/60 hover:border-teal-500/30 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-slate-900/80 text-teal-400 border border-slate-700/50 shadow-sm">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                      Account Type
                    </label>
                    <p className="text-white font-medium">Verified Student</p>
                  </div>
                </div>
              </div>

              {/* Joined Date */}
              <div className="group relative p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/60 hover:border-teal-500/30 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-slate-900/80 text-teal-400 border border-slate-700/50 shadow-sm">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                      Joined Date
                    </label>
                    <p className="text-white font-medium">{student.joinedAt}</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Back Button */}
            <div className="mt-10 pt-8 border-t border-slate-700/50 flex justify-end">
              <button
                onClick={() => router.push('/main/student/dashboard')}
                className="group flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white bg-slate-800 hover:bg-teal-600 border border-slate-700/50 hover:border-teal-500 transition-all shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
