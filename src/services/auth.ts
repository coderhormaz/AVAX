import { ethers } from 'ethers';
import { supabase, type WalletTransaction } from './supabase';
import bcrypt from 'bcryptjs';

export interface AuthUser {
  id: string;
  email?: string;
  fullName?: string;
  wallet: {
    address: string;
    privateKey: string;
    balance: string;
  };
  loginMethod: 'email' | 'local';
  stats: {
    totalTokens: number;
    totalNfts: number;
    totalTransactions: number;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  fullName: string;
}

export interface LocalLoginData {
  username: string;
  privateKey?: string; // Optional for existing users
}

class AuthService {
  private currentUser: AuthUser | null = null;

  // Generate new AVAX wallet
  private generateWallet() {
    const wallet = ethers.Wallet.createRandom();
    return {
      address: wallet.address,
      privateKey: wallet.privateKey
    };
  }

  // Hash private key for storage (simple encryption)
  private hashPrivateKey(privateKey: string): string {
    return bcrypt.hashSync(privateKey, 10);
  }

  // Get wallet balance
  async getWalletBalance(address: string): Promise<string> {
    try {
      const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
      const balance = await provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
      return '0.0';
    }
  }

  // Email Signup
  async signupWithEmail(credentials: SignupCredentials): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      // 1. Create wallet
      const wallet = this.generateWallet();
      
      // 2. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.fullName,
          }
        }
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Failed to create user' };
      }

      // 3. Update user profile with wallet info
      const { error: profileError } = await supabase
        .from('users')
        .update({
          wallet_address: wallet.address,
          wallet_private_key: this.hashPrivateKey(wallet.privateKey),
          full_name: credentials.fullName
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
      }

      // 4. Get wallet balance
      const balance = await this.getWalletBalance(wallet.address);

      // 5. Create AuthUser object
      const user: AuthUser = {
        id: authData.user.id,
        email: credentials.email,
        fullName: credentials.fullName,
        wallet: {
          address: wallet.address,
          privateKey: wallet.privateKey,
          balance
        },
        loginMethod: 'email',
        stats: {
          totalTokens: 0,
          totalNfts: 0,
          totalTransactions: 0
        }
      };

      this.currentUser = user;
      return { success: true, user };

    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Failed to create account' };
    }
  }

  // Email Login
  async loginWithEmail(credentials: LoginCredentials): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      // 1. Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Failed to authenticate' };
      }

      // 2. Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        return { success: false, error: 'Failed to load user profile' };
      }

      // 3. Get wallet balance
      const balance = await this.getWalletBalance(profile.wallet_address);

      // 4. Create AuthUser object (Note: private key is hashed in DB, need to handle this)
      const user: AuthUser = {
        id: profile.id,
        email: profile.email || credentials.email,
        fullName: profile.full_name,
        wallet: {
          address: profile.wallet_address,
          privateKey: profile.wallet_private_key, // This is hashed - handle carefully
          balance
        },
        loginMethod: 'email',
        stats: {
          totalTokens: profile.total_tokens_created,
          totalNfts: profile.total_nfts_created,
          totalTransactions: profile.total_transactions
        }
      };

      this.currentUser = user;
      return { success: true, user };

    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Failed to login' };
    }
  }

  // Local Login (existing functionality)
  async loginLocally(data: LocalLoginData): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      let wallet;
      
      if (data.privateKey) {
        // Use provided private key
        try {
          wallet = new ethers.Wallet(data.privateKey);
        } catch {
          return { success: false, error: 'Invalid private key' };
        }
      } else {
        // Generate new wallet
        const newWallet = this.generateWallet();
        wallet = { address: newWallet.address, privateKey: newWallet.privateKey };
      }

      // Get balance
      const balance = await this.getWalletBalance(wallet.address);

      // Create local user
      const user: AuthUser = {
        id: `local-${Date.now()}`,
        fullName: data.username,
        wallet: {
          address: wallet.address,
          privateKey: wallet.privateKey,
          balance
        },
        loginMethod: 'local',
        stats: {
          totalTokens: 0,
          totalNfts: 0,
          totalTransactions: 0
        }
      };

      this.currentUser = user;
      
      // Store in localStorage for persistence
      localStorage.setItem('avax_local_user', JSON.stringify({
        username: data.username,
        address: wallet.address,
        privateKey: wallet.privateKey
      }));

      return { success: true, user };

    } catch (error) {
      console.error('Local login error:', error);
      return { success: false, error: 'Failed to create local session' };
    }
  }

  // Logout
  async logout(): Promise<void> {
    if (this.currentUser?.loginMethod === 'email') {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('avax_local_user');
    }
    this.currentUser = null;
  }

  // Get current user
  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  // Restore session on app load
  async restoreSession(): Promise<AuthUser | null> {
    try {
      // Check for Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Restore email user
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          const balance = await this.getWalletBalance(profile.wallet_address);
          
          const user: AuthUser = {
            id: profile.id,
            email: profile.email,
            fullName: profile.full_name,
            wallet: {
              address: profile.wallet_address,
              privateKey: profile.wallet_private_key,
              balance
            },
            loginMethod: 'email',
            stats: {
              totalTokens: profile.total_tokens_created,
              totalNfts: profile.total_nfts_created,
              totalTransactions: profile.total_transactions
            }
          };

          this.currentUser = user;
          return user;
        }
      }

      // Check for local session
      const localUser = localStorage.getItem('avax_local_user');
      if (localUser) {
        const userData = JSON.parse(localUser);
        const balance = await this.getWalletBalance(userData.address);

        const user: AuthUser = {
          id: `local-${userData.username}`,
          fullName: userData.username,
          wallet: {
            address: userData.address,
            privateKey: userData.privateKey,
            balance
          },
          loginMethod: 'local',
          stats: {
            totalTokens: 0,
            totalNfts: 0,
            totalTransactions: 0
          }
        };

        this.currentUser = user;
        return user;
      }

      return null;

    } catch (error) {
      console.error('Session restore error:', error);
      return null;
    }
  }

  // Save transaction to database (for email users)
  async saveTransaction(transaction: Partial<WalletTransaction>): Promise<void> {
    if (this.currentUser?.loginMethod === 'email') {
      try {
        await supabase.from('wallet_transactions').insert({
          user_id: this.currentUser.id,
          ...transaction
        });

        // Update user stats
        await supabase
          .from('users')
          .update({
            total_transactions: this.currentUser.stats.totalTransactions + 1,
            last_active_at: new Date().toISOString()
          })
          .eq('id', this.currentUser.id);

      } catch (error) {
        console.error('Failed to save transaction:', error);
      }
    }
  }
}

export const authService = new AuthService();
