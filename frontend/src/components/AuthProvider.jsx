import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => { 
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifySession = async () => {
            try {
                const response = await axios.get("http://localhost:7777/api/me", {
                    withCredentials: true
                });

                if (response.data.success && response.data.user) {
                    setUser(response.data.user);
                } else {
                    setUser(null);
                }
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        verifySession();
    }, []);

    // New Logout Strategy
    const logout = async () => {
        try {
            // Hit your backend route 9 option to clear cookie
            await axios.post("http://localhost:7777/api/logout", {}, { withCredentials: true });
        } catch (err) {
            console.error("Server-side logout issue:", err);
        } finally {
            // Fallback: Clear user memory state to trigger frontend route protection
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);