export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export const WHITELISTED_USERS: Record<string, { name: string; role: string }> = {
  TWAN67: { name: 'Twanelle Mercer', role: 'Sales Rep' },
  BO: { name: 'Bobby Orr', role: 'Manager' },
};
