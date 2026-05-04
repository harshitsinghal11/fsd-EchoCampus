import { useState } from "react";
import { AlertCircle, CheckCircle2, MessageSquare, Send } from "lucide-react";

interface ComplaintFormProps {
  sessionCode: string | null;
  userEmail: string;
}
export default function ComplaintForm({ sessionCode, userEmail }: ComplaintFormProps) {
  const [complaint, setComplaint] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitComplaint() {
    if (!complaint.trim()) {
      setMsg("Please enter your complaint before submitting");
      setMsgType("error");
      return;
    }

    if (!userEmail) {
      setMsg("Missing user email");
      setMsgType("error");
      return;
    }

    setLoading(true);
    setMsg("");
    setMsgType("");

    const res = await fetch("/api/complaints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionCode, complaint, email: userEmail }),
    });

    const data = await res.json();
    console.log("API response:", data);

    if (data.error) {
      setMsg(data.error);
      setMsgType("error");
    } else {
      setMsg("Thank you! Your complaint has been submitted successfully.");
      setMsgType("success");
      setComplaint("");
    }
    setLoading(false);
  }

  const charCount = complaint.length;
  const maxChars = 500;

  return (
    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
      {/* Header */}
      <div className="bg-orange-500/10 border border-orange-500/20 px-6 py-4 rounded-xl">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-orange-400" />
          <h2 className="text-xl font-semibold text-white">Submit a Complaint</h2>
        </div>
        <p className="text-slate-300 text-sm mt-1">
          We value your feedback and will review your complaint promptly
        </p>
      </div>
      
      {/* Current Session name */}
      <div>
        <p className="text-sm font-bold px-2 py-4 text-slate-100">
          {sessionCode}
        </p>  
      </div>

      {/* Form Body */}
      <div className="space-y-4">
        {/* Textarea */}
        <div>
          <textarea
            id="complaint"
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            placeholder="Please provide detailed information about your complaint..."
            maxLength={maxChars}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all resize-none text-slate-100 placeholder-slate-400"
            rows={6}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-slate-400">
              Be as specific as possible to help us address your concern
            </span>
            <span className={`text-xs font-medium ${charCount > maxChars * 0.9 ? 'text-orange-400' : 'text-slate-400'}`}>
              {charCount} / {maxChars}
            </span>
          </div>
        </div>

        {/* Message Display */}
        {msg && (
          <div
            className={`flex items-start gap-3 p-4 rounded-lg border ${
              msgType === "success"
                ? "bg-teal-500/20 border-teal-500/30"
                : "bg-orange-500/20 border-orange-500/30"
            }`}
          >
            {msgType === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            )}
            <p className={`text-sm ${msgType === "success" ? "text-teal-400" : "text-orange-400"}`}>
              {msg}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={submitComplaint}
          disabled={loading || !complaint.trim()}
          className="w-full bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5 text-orange-400" />
              <span>Submit</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}