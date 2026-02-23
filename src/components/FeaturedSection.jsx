import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/i18n/i18n';
import { Button } from '@/components/ui/button';

const FeaturedSection = ({ article }) => {
  const { t } = useTranslation();

  if (!article) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full h-[500px] md:h-[600px] rounded-2xl overflow-hidden group mb-8"
    >
      <img
        src={article.image}
        alt={article.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
      
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 space-y-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="inline-block px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-sm font-bold rounded-full mb-4">
            {t('news.featured')}
          </span>
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-5xl font-bold text-white max-w-4xl leading-tight"
        >
          {article.title}
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-slate-200 max-w-2xl"
        >
          {article.excerpt}
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-4 pt-4"
        >
          <div className="flex items-center gap-2 text-slate-300">
            <Calendar className="w-5 h-5" />
            <span className="text-sm">{article.date}</span>
          </div>
          
          <Button className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold">
            {t('news.readMore')}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default FeaturedSection;