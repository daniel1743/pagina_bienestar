import { supabase } from '@/lib/customSupabaseClient';

const isMissingCommentsUsersRelation = (error) => {
  const message = String(error?.message || '').toLowerCase();
  return (
    error?.code === 'PGRST200' &&
    message.includes("relationship between 'comments' and 'users'")
  );
};

export const fetchCommentsWithProfiles = async ({
  articleId = null,
  onlyApproved = false,
  ascending = false,
  limit = 500,
}) => {
  let query = supabase
    .from('comments')
    .select('*, articles(title, slug), users(user_profiles(name, photo_url))');

  if (articleId) query = query.eq('article_id', articleId);
  if (onlyApproved) query = query.eq('status', 'approved');

  query = query.order('created_at', { ascending }).limit(limit);

  const direct = await query;
  if (!direct.error) {
    return { data: direct.data || [], error: null, usedFallback: false };
  }

  if (!isMissingCommentsUsersRelation(direct.error)) {
    return { data: [], error: direct.error, usedFallback: false };
  }

  let fallbackQuery = supabase
    .from('comments')
    .select('*, articles(title, slug)');
  if (articleId) fallbackQuery = fallbackQuery.eq('article_id', articleId);
  if (onlyApproved) fallbackQuery = fallbackQuery.eq('status', 'approved');
  fallbackQuery = fallbackQuery.order('created_at', { ascending }).limit(limit);

  const fallback = await fallbackQuery;
  if (fallback.error) {
    return { data: [], error: fallback.error, usedFallback: true };
  }

  const comments = fallback.data || [];
  const userIds = [...new Set(comments.map((c) => c.user_id).filter(Boolean))];
  let profilesByUserId = {};

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('user_id,name,photo_url')
      .in('user_id', userIds);

    profilesByUserId = Object.fromEntries(
      (profiles || []).map((profile) => [profile.user_id, profile]),
    );
  }

  const enriched = comments.map((comment) => ({
    ...comment,
    user_profile: profilesByUserId[comment.user_id] || null,
  }));

  return { data: enriched, error: null, usedFallback: true };
};
