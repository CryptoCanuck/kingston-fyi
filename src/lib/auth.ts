import NextAuth from 'next-auth';
import { authOptions } from './auth.config';

// Initialize NextAuth with our configuration
const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

// Export auth functions and handlers
export { auth, signIn, signOut };
export const { GET, POST } = handlers;

// Helper function to get the current session
export async function getSession() {
  return await auth();
}

// Helper function to get the current user
export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

// Helper function to check if user is authenticated
export async function isAuthenticated() {
  const session = await auth();
  return !!session?.user;
}

// Helper function to check if user has a specific role
export async function hasRole(role: string) {
  const session = await auth();
  return session?.user?.role === role;
}

// Helper function to check if user is an admin
export async function isAdmin() {
  return await hasRole('admin');
}

// Helper function to check if user is a business owner
export async function isBusinessOwner() {
  return await hasRole('business_owner');
}

// Helper function to check if user is a moderator
export async function isModerator() {
  return await hasRole('moderator');
}

// Helper function to require authentication
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session;
}

// Helper function to require specific role
export async function requireRole(role: string) {
  const session = await requireAuth();
  if (session.user.role !== role) {
    throw new Error('Forbidden');
  }
  return session;
}