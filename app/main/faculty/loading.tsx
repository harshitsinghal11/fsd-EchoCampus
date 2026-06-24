import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="w-full h-[calc(100vh-100px)] flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p className="text-slate-400 font-medium animate-pulse">Loading page...</p>
    </div>
  );
}
