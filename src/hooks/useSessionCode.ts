// hooks/useSessionCode.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ensureStudentSessionCode } from "@/lib/authProfile";

export function useSessionCode() {
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchCode = async () => {
      let storedCode = sessionStorage.getItem("userSessionCode");

      if (!storedCode) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id) {
            storedCode = await ensureStudentSessionCode(session.user.id);
            if (storedCode) {
              sessionStorage.setItem("userSessionCode", storedCode);
            }
          }
        } catch (error) {
          console.error("Failed to recover session code:", error);
        }
      }

      setCode(storedCode);
    };

    fetchCode();
  }, []);

  return code;
}
