import { supabase } from './supabase'

/**
 * Get current authenticated user session
 */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  return data.user
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { user: data.user, error }
}

/**
 * Sign out current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return error
}

/**
 * Get session
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  return { session: data.session, error }
}
