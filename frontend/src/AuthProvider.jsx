import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await axios.get(
        "http://localhost:7777/api/me",
        { withCredentials: true }
      );

      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (emailId, password) => {
    const res = await axios.post(
      "http://localhost:7777/api/login",
      { emailId, password },
      { withCredentials: true }
    );

    if (res.data.success) {
      setUser(res.data.user);
    }

    return res.data;
  };

  const logout = async () => {
    await axios.post(
      "http://localhost:7777/api/logout",
      {},
      { withCredentials: true }
    );

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);