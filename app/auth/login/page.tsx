"use client";
import Link from "next/link";
import { ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import {
  ensureOwnUserRow,
  ensureStudentSessionCode,
  fetchUserRole,
} from "@/lib/authProfile";
import { ROUTES } from "@/lib/routes";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  useEffect(() => {
    const checkAuth = async () => {
      const role = sessionStorage.getItem("userRole");
      if (role === "student") {
        router.replace(ROUTES.STUDENT.DASHBOARD);
        return;
      } else if (role === "faculty" || role === "admin") {
        router.replace(ROUTES.FACULTY.DASHBOARD);
        return;
      }

      // If no sessionStorage role, check if a Supabase session exists
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const fetchedRole = await fetchUserRole(session.user.id);
        sessionStorage.setItem("userRole", fetchedRole);
        if (fetchedRole === "student") {
          const sessionCode = await ensureStudentSessionCode(session.user.id);
          if (sessionCode) sessionStorage.setItem("userSessionCode", sessionCode);
          router.replace(ROUTES.STUDENT.DASHBOARD);
        } else if (fetchedRole === "faculty" || fetchedRole === "admin") {
          router.replace(ROUTES.FACULTY.DASHBOARD);
        }
      }
    };
    checkAuth();
  }, [router]);

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
        router.replace(ROUTES.FACULTY.DASHBOARD);
      }
      else if (role === "student") {
        // Generate/Get Session Code
        const sessionCode = await ensureStudentSessionCode(authData.user.id);

        sessionStorage.setItem("userSessionCode", sessionCode || "");
        sessionStorage.setItem("userRole", "student");
        router.replace(ROUTES.STUDENT.DASHBOARD);
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
    <div className="min-h-[100dvh] w-full bg-background flex items-center justify-center p-4 sm:p-6 md:p-8">

      <div className="relative w-full max-w-md">
        {/* Glassmorphism Card matching the Dashboard */}
        <div className="bg-surface backdrop-blur-xl rounded-[1.5rem] md:rounded-3xl shadow-2xl border border-border p-6 sm:p-8">

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-2 md:mb-3 tracking-tight">
              Echo<span className="text-primary">Campus</span>
            </h1>
            <p className="text-base md:text-lg text-text-muted font-medium tracking-wide">
              Meet. Learn. Build.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 md:space-y-5">

            {/* Email Input */}
            <div className="space-y-1.5 md:space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-text-secondary">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-text-disabled group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-2.5 md:py-3 bg-surface border border-border rounded-xl text-text-primary placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-input-focus/50 focus:border-primary/50 transition-all duration-200 hover:bg-surface-hover"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5 md:space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-text-secondary">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-disabled group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-12 py-2.5 md:py-3 bg-surface border border-border rounded-xl text-text-primary placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-input-focus/50 focus:border-primary/50 transition-all duration-200 hover:bg-surface-hover"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-disabled hover:text-text-secondary transition-colors duration-200"
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
              className="w-full mt-2 md:mt-4 bg-button-primary text-text-primary py-3 md:py-3.5 px-6 rounded-xl font-semibold text-base md:text-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-input-focus focus:ring-offset-2 focus:ring-offset-background disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none group"
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
                    <ArrowRight className="ml-2 h-5 w-5 " />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Footer Link */}
          <p className="mt-5 md:mt-6 text-center text-sm text-text-muted">
            New here?{" "}
            <Link href={ROUTES.AUTH.SIGNUP} className="font-semibold text-primary hover:text-primary-light transition-colors">
              Create a student account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
