import { useEffect } from "react";
import { logout } from "./auth";
import { useNavigate } from "react-router-dom";

const Logout = ({ setAuthState }) => {
  const navigate = useNavigate();

  useEffect(() => {
    logout();
    setAuthState({
      status: false,
      user: null,
    });
    navigate("/login");
  }, []);

  return null;
};

export default Logout;
