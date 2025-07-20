import type { NextAuthConfig } from 'next-auth';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { connectToDatabase } from '@/lib/mongodb';
import type { Profile, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { User as UserModel } from '@/models';
import type { IUserDocument } from '@/models/User';

// Define Zitadel OIDC endpoints
const ZITADEL_ISSUER = process.env.ZITADEL_ISSUER || 'http://localhost:8080';

interface ZitadelProfile extends Profile {
  sub: string;
  name?: string;
  preferred_username?: string;
  email?: string;
  email_verified?: boolean;
  picture?: string;
  'urn:zitadel:iam:org:project:roles'?: string[];
}

// Custom Zitadel provider configuration
const ZitadelProvider = {
  id: 'zitadel',
  name: 'Zitadel',
  type: 'oauth' as const,
  wellKnown: `${ZITADEL_ISSUER}/.well-known/openid-configuration`,
  authorization: {
    params: {
      scope: 'openid profile email',
      prompt: 'select_account',
    }
  },
  idToken: true,
  checks: ['pkce', 'state'] as ('pkce' | 'state')[],
  profile(profile: ZitadelProfile) {
    return {
      id: profile.sub,
      name: profile.name || profile.preferred_username || '',
      email: profile.email || '',
      image: profile.picture,
      emailVerified: profile.email_verified,
      // Custom fields
      zitadelId: profile.sub,
      role: profile['urn:zitadel:iam:org:project:roles']?.[0] || 'user',
    };
  },
  clientId: process.env.ZITADEL_CLIENT_ID!,
  clientSecret: process.env.ZITADEL_CLIENT_SECRET!,
};

export const authOptions: NextAuthConfig = {
  providers: [
    ZitadelProvider,
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectToDatabase();
          
          const user = await UserModel.findOne({
            email: (credentials.email as string).toLowerCase()
          }).select('+password') as IUserDocument & { password?: string };

          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.avatar,
            role: user.role,
          };
        } catch (error) {
          console.error('Credentials auth error:', error);
          return null;
        }
      }
    })
  ],
  
  adapter: MongoDBAdapter(
    connectToDatabase().then(({ client }) => client),
    {
      databaseName: process.env.MONGODB_DB || 'kingston-fyi',
    }
  ),

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async signIn({ account }) {
      if (account?.provider === 'zitadel') {
        // Custom user sync logic will be implemented here
        return true;
      }
      if (account?.provider === 'credentials') {
        return true;
      }
      return false;
    },

    async jwt({ token, user, account, profile }) {
      // Initial sign in
      if (account && user) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        token.userId = user.id;
        token.role = (user as ExtendedUser).role || 'user';
        token.zitadelId = (profile as ZitadelProfile)?.sub;
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.expiresAt as number) * 1000) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as string;
        session.user.zitadelId = token.zitadelId as string;
      }
      session.accessToken = token.accessToken as string;
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },

  debug: process.env.NODE_ENV === 'development',

  events: {
    async signIn({ user, account }) {
      // Log sign-in events for audit
      console.log(`User ${user.email} signed in via ${account?.provider}`);
    },
    async signOut() {
      // Log sign-out events for audit
      console.log(`User signed out`);
    },
  },
};

// Extended user type with custom fields
interface ExtendedUser extends User {
  role?: string;
  zitadelId?: string;
}

// Helper function to refresh access token
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const url = `${ZITADEL_ISSUER}/oauth/v2/token`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
      body: new URLSearchParams({
        client_id: process.env.ZITADEL_CLIENT_ID!,
        client_secret: process.env.ZITADEL_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken as string,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expiresAt: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing access token', error);

    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

// Type declarations for extended session and JWT
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      zitadelId: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
    accessToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    userId?: string;
    role?: string;
    zitadelId?: string;
    error?: string;
  }
}
