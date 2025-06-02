import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Add role type to the interface
interface AccountContextType {
  signedIn: boolean;
  userEmail: string | null;
  userRole: string | null;
  login: (token: string, role: string) => void;
  logout: () => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider = ({ children }: { children: ReactNode }) => {
  const [signedIn, setSignedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Helper function to extract email from token
  const extractEmailFromToken = (token: string): string | null => {
    if (token.startsWith('token_')) {
      return token.replace('token_', '');
    }
    return null;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');

    if (token) {
      setSignedIn(true);
      setUserEmail(extractEmailFromToken(token));
      setUserRole(role);
    }
  }, []);

  const login = (token: string, role: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
    setSignedIn(true);
    setUserEmail(extractEmailFromToken(token));
    setUserRole(role);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setSignedIn(false);
    setUserEmail(null);
    setUserRole(null);
  };

  return (
    <AccountContext.Provider value={{ signedIn, userEmail, userRole, login, logout }}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAuth = (): AccountContextType => {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AccountProvider');
  }
  return context;
};