"use client";
import Link from "next/link";
import { ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import {
  ensureOwnUserRow,
  ensureStudentSessionCode,
  fetchUserRole,
} from "@/lib/authProfile";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError || !authData.user) {
        toast.error(authError?.message || "Login failed");
        setIsLoading(false);
        return;
      }

      // 2. Ensure the companion public.users row exists, then read role
      await ensureOwnUserRow(authData.user);
      const role = await fetchUserRole(authData.user.id);
      console.log(`[auth] Logged in as: ${role.toUpperCase()}`);

      // 3. Routing Logic
      if (role === "faculty" || role === "admin") {
        sessionStorage.setItem("userRole", role);
        router.replace("/main/faculty/dashboard/");
      }
      else if (role === "student") {
        // Generate/Get Session Code
        const sessionCode = await ensureStudentSessionCode(authData.user.id);

        sessionStorage.setItem("userSessionCode", sessionCode || "");
        sessionStorage.setItem("userRole", "student");
        router.replace("/main/student/dashboard/");
      }
      else {
        toast.error("Unknown role");
        setIsLoading(false);
      }

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      console.error("Critical Login Error:", error);
      toast.error(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-950 to-black flex items-center justify-center p-4 sm:p-6 md:p-8">
      
      <div className="relative w-full max-w-md">
        {/* Glassmorphism Card matching the Dashboard */}
        <div className="bg-slate-800/40 backdrop-blur-xl rounded-[1.5rem] md:rounded-3xl shadow-2xl border border-slate-700/50 p-6 sm:p-8 md:p-10">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 md:mb-3 tracking-tight">
              Echo<span className="text-blue-400">Campus</span>
            </h1>
            <p className="text-base md:text-lg text-slate-400 font-medium tracking-wide">
              Meet. Learn. Build.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5 md:space-y-6">
            
            {/* Email Input */}
            <div className="space-y-1.5 md:space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-300">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 md:py-4 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 hover:bg-slate-900/80"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5 md:space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-300">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-12 py-3 md:py-4 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 hover:bg-slate-900/80"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 md:mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 md:py-4 px-6 rounded-xl font-semibold text-base md:text-lg shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none group"
            >
              <span className="flex items-center justify-center">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    Login Now
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Footer Link */}
          <p className="mt-6 md:mt-8 text-center text-sm text-slate-400">
            New here?{" "}
            <Link href="/auth/signup" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              Create a student account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
