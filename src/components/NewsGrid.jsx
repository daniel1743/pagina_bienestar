import React from 'react';
import { motion } from 'framer-motion';
import NewsCard from './NewsCard';
import { useTranslation } from '@/i18n/i18n';

const NewsGrid = ({ articles, category }) => {
  const { t } = useTranslation();

  const filteredArticles = category === 'all' 
    ? articles 
    : articles.filter(article => article.categoryKey === category);

  if (filteredArticles.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400 text-lg">{t('news.noNews')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl md:text-3xl font-bold text-slate-100"
      >
        {t('news.latest')}
      </motion.h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article, index) => (
          <NewsCard key={article.id} article={article} index={index} />
        ))}
      </div>
    </div>
  );
};

export default NewsGrid;