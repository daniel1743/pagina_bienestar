import { supabase } from '@/lib/customSupabaseClient';

export const fetchCommentsWithProfiles = async ({
  articleId = null,
  onlyApproved = false,
  ascending = false,
  limit = 500,
}) => {
  let baseQuery = supabase
    .from('comments')
    .select('*, articles(title, slug)');
  if (articleId) baseQuery = baseQuery.eq('article_id', articleId);
  if (onlyApproved) baseQuery = baseQuery.eq('status', 'approved');
  baseQuery = baseQuery.order('created_at', { ascending }).limit(limit);

  const base = await baseQuery;
  if (base.error) {
    return { data: [], error: base.error, usedFallback: true };
  }

  const comments = base.data || [];
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

  return { data: enriched, error: null, usedFallback: false };
};
