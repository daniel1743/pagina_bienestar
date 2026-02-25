import { supabase } from '@/lib/customSupabaseClient';

const PUBLISHED_STATUS_VALUES = ['published', 'publicado', 'active'];
const STRATEGY_STORAGE_KEY = 'bec_articles_query_strategy_v1';

let cachedStrategyKey = null;

const QUERY_STRATEGIES = [
  { key: 'published_updated_at', filter: 'published_flag', orderBy: 'updated_at' },
  { key: 'status_updated_at', filter: 'status', orderBy: 'updated_at' },
  { key: 'status_published_at', filter: 'status', orderBy: 'published_at' },
  { key: 'status_created_at', filter: 'status', orderBy: 'created_at' },
  { key: 'published_at_created_at', filter: 'published_at_not_null', orderBy: 'created_at' },
];

const applyPublishedFilter = (query, filter) => {
  if (filter === 'published_flag') return query.eq('published', true);
  if (filter === 'status') return query.in('status', PUBLISHED_STATUS_VALUES);
  if (filter === 'published_at_not_null') return query.not('published_at', 'is', null);
  return query;
};

const applyOrdering = (query, orderBy) => {
  if (!orderBy) return query;
  return query.order(orderBy, { ascending: false });
};

const getStoredStrategyKey = () => {
  if (cachedStrategyKey) return cachedStrategyKey;
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(STRATEGY_STORAGE_KEY);
  cachedStrategyKey = value || null;
  return cachedStrategyKey;
};

const setStoredStrategyKey = (strategyKey) => {
  cachedStrategyKey = strategyKey || null;
  if (typeof window === 'undefined') return;
  if (!strategyKey) {
    window.localStorage.removeItem(STRATEGY_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(STRATEGY_STORAGE_KEY, strategyKey);
};

const getStrategiesInOrder = () => {
  const preferred = getStoredStrategyKey();
  if (!preferred) return QUERY_STRATEGIES;

  const preferredStrategy = QUERY_STRATEGIES.find((item) => item.key === preferred);
  if (!preferredStrategy) return QUERY_STRATEGIES;

  return [preferredStrategy, ...QUERY_STRATEGIES.filter((item) => item.key !== preferred)];
};

export const getArticleTimestamp = (article) =>
  new Date(article?.updated_at || article?.published_at || article?.created_at || 0).getTime();

export const fetchPublishedArticles = async ({ limit } = {}) => {
  let lastError = null;
  const strategies = getStrategiesInOrder();

  for (const strategy of strategies) {
    let query = supabase.from('articles').select('*');
    query = applyPublishedFilter(query, strategy.filter);
    query = applyOrdering(query, strategy.orderBy);
    if (typeof limit === 'number') query = query.limit(limit);

    const { data, error } = await query;
    if (error) {
      lastError = error;
      continue;
    }

    setStoredStrategyKey(strategy.key);
    return {
      data: Array.isArray(data) ? data : [],
      strategy: strategy.key,
      error: null,
    };
  }

  if (lastError) {
    setStoredStrategyKey(null);
    console.warn('No se pudo consultar artículos publicados con ninguna estrategia.', lastError);
  }

  return {
    data: [],
    strategy: null,
    error: lastError,
  };
};
