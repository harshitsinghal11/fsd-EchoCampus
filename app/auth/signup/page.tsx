"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthApiError } from "@supabase/supabase-js";
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from "lucide-react";

import {
  ensureOwnUserRow,
  ensureStudentSessionCode,
  fetchUserRole,
} from "@/lib/authProfile";
import { supabase } from "@/lib/supabaseClient";

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedName = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      setErrorMessage("Full name is required.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
          },
        },
      });

      if (error || !data.user) {
        throw new Error(error?.message || "Signup failed.");
      }

      // Supabase Email Enumeration Protection:
      // If the email already exists, Supabase returns a fake user object with an empty identities array.
      if (data.user.identities && data.user.identities.length === 0) {
        throw new Error("An account with this email already exists. Please log in instead.");
      }

      if (data.session) {
        await ensureOwnUserRow(data.user);
        const role = await fetchUserRole(data.user.id);

        sessionStorage.setItem("userRole", role);

        if (role === "faculty" || role === "admin") {
          sessionStorage.removeItem("userSessionCode");
          router.replace("/main/faculty/dashboard/");
          return;
        }

        const sessionCode = await ensureStudentSessionCode(data.user.id);
        sessionStorage.setItem("userSessionCode", sessionCode);
        router.replace("/main/student/dashboard/");
        return;
      }

      setSuccessMessage("Account created. Check your email to confirm it, then sign in. Faculty status will be automatically detected.");
    } catch (error: unknown) {
      let message =
        error instanceof Error ? error.message : "Something went wrong.";

      if (error instanceof AuthApiError) {
        const statusText = error.status ? ` (HTTP ${error.status})` : "";
        message = `${error.message}${statusText}`;
      }

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-black flex items-center justify-center p-4 sm:p-6 md:p-8">

      <div className="relative w-full max-w-md">
        {/* Glassmorphism Card */}
        <div className="bg-slate-800/40 backdrop-blur-xl rounded-[1.5rem] md:rounded-3xl shadow-2xl border border-slate-700/50 p-6 sm:p-8 md:p-10">

          {/* Header */}
          <div className="text-center mb-8">
            <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
              Join <span className="text-blue-400">EchoCampus</span>
            </h3>
            <p className="text-sm md:text-base text-slate-400 font-medium">
              Create your account to get started.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5 md:space-y-6">

            {/* Full Name Input */}
            <div className="space-y-1.5 md:space-y-2">
              <label htmlFor="full_name" className="block text-sm font-semibold text-slate-300">
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  id="full_name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 md:py-4 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 hover:bg-slate-900/80"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

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
                  minLength={8}
                  className="w-full pl-11 pr-12 py-3 md:py-4 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 hover:bg-slate-900/80"
                  placeholder="Create a password"
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

            {/* Faculty Checkbox Removed - Handled Automatically by Backend Trigger */}

            {/* Alert Messages (Dark Theme Optimized) */}
            {errorMessage && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-3 text-sm text-teal-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                {successMessage}
              </div>
            )}

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
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Footer Link */}
          <p className="mt-6 md:mt-8 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
