// hooks/useSessionCode.ts
import { useEffect, useState } from "react";

export function useSessionCode() {
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    setCode(sessionStorage.getItem("userSessionCode"));
  }, []);

  return code;
}
