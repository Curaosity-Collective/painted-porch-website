export interface ProfileStore {
  find(id: string): Promise<{ exists: boolean; error?: string }>;
  create(values: { id: string; email: string; full_name: string }): Promise<{ error?: string }>;
}

/** Provision explicitly: this project may not have an Auth profile trigger. */
export async function ensureInviteProfile(store: ProfileStore, user: { id: string; email: string }, fullName: string) {
  const existing = await store.find(user.id);
  if (existing.error) throw new Error("Unable to check the account's profile.");
  if (!existing.exists) {
    // Use the protected database's default role; never take privileges from metadata.
    const created = await store.create({ id: user.id, email: user.email, full_name: fullName });
    if (created.error) throw new Error("The account exists, but its Users-list entry could not be created. Please retry.");
  }
  const verified = await store.find(user.id);
  if (verified.error || !verified.exists) throw new Error("The account's Users-list entry could not be verified. Please retry.");
}