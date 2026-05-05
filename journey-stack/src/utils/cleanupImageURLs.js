/**
 * cleanupImageURLs — stub
 *
 * This was a one-off migration script to fix broken Firestore/Firebase Storage
 * URLs that were created during the old Firebase backend. The app is now fully
 * on PostgreSQL + Cloudinary, so this utility is no longer needed.
 */
export async function cleanupBrokenImageURLs() {
  console.info('cleanupBrokenImageURLs: no-op — Firebase has been removed.');
  return { fixed: 0, skipped: 0 };
}
