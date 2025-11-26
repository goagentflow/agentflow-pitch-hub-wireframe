import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login page on mount
    navigate("/login");
  }, [navigate]);

  return null;
};

export default Index;
