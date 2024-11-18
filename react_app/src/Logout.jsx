import { useEffect } from "react";
import { logout } from "./auth";
import { useNavigate } from "react-router-dom";

const Logout = ({ setAuthState }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const doLogout = async () => {
      await logout();
      setAuthState(null);
      navigate("/login");
    };

    doLogout();
  }, []);

  return null;
};

export default Logout;
