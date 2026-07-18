// hooks/useSessionCode.ts
import { useEffect, useState } from "react";

export function useSessionCode() {
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCode(sessionStorage.getItem("userSessionCode"));
  }, []);

  return code;
}
