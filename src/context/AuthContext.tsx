import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import { db } from "@/db";
import { useLiveQuery } from "dexie-react-hooks";

interface AuthContextType {
    user: User | null;
    login: (userId: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for persisted session
        const storedUserId = localStorage.getItem("taskhub_user_id");
        if (storedUserId) {
            db.users.get(storedUserId).then((u) => {
                if (u) setUser(u);
                setLoading(false);
            }).catch(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (userId: string) => {
        const u = await db.users.get(userId);
        if (u) {
            setUser(u);
            localStorage.setItem("taskhub_user_id", userId);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("taskhub_user_id");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
