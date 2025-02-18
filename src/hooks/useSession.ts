// hooks/useSession.js
import { useCookies } from "react-cookie";

const useSession = () => {
  const [cookies] = useCookies(["cookie-name"]);

  return cookies;
};

export default useSession;
