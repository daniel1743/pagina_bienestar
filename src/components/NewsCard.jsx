import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/i18n/i18n';

const NewsCard = ({ article, index }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      <Card className="overflow-hidden group cursor-pointer h-full bg-slate-800/50 border-slate-700 hover:border-pink-500/50 transition-all duration-300">
        <div className="relative overflow-hidden aspect-video">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-semibold rounded-full">
              {article.category}
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        <CardContent className="p-5 space-y-3">
          <h3 className="text-lg font-bold text-slate-100 line-clamp-2 group-hover:text-pink-400 transition-colors">
            {article.title}
          </h3>
          
          <p className="text-sm text-slate-400 line-clamp-3">
            {article.excerpt}
          </p>
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar className="w-4 h-4" />
              <span>{article.date}</span>
            </div>
            
            <motion.div
              className="flex items-center gap-1 text-pink-500 text-sm font-medium"
              whileHover={{ gap: 8 }}
            >
              {t('news.readMore')}
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default NewsCard;