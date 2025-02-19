// hooks/useSession.js
import { useCookies } from "react-cookie";

const useSession = (name: string) => {
  const [cookies, set, remove] = useCookies([name]);
  return {
    data: cookies,
    set,
    remove,
  };
};

export default useSession;
