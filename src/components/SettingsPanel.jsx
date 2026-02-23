import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/i18n/i18n';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const SettingsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, updateFontFamily, updateFontSize, updatePrimaryColor, updateSecondaryColor, updateAccentColor, updateLanguage, resetTheme } = useTheme();
  const { t } = useTranslation();
  const { toast } = useToast();

  const [localTheme, setLocalTheme] = useState(theme);

  useEffect(() => {
    setLocalTheme(theme);
  }, [theme]);

  const handleSave = () => {
    updateFontFamily(localTheme.fontFamily);
    updateFontSize(localTheme.fontSize);
    updatePrimaryColor(localTheme.primaryColor);
    updateSecondaryColor(localTheme.secondaryColor);
    updateAccentColor(localTheme.accentColor);
    updateLanguage(localTheme.language);
    
    toast({
      title: t('settings.saved'),
      duration: 2000,
    });
  };

  const handleReset = () => {
    resetTheme();
    toast({
      title: t('settings.reset_success'),
      duration: 2000,
    });
  };

  const fontFamilies = ['Poppins', 'Inter', 'Playfair Display', 'Montserrat'];

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="ghost"
        size="icon"
        className="relative hover:bg-slate-700/50 text-slate-100"
        aria-label={t('settings.title')}
      >
        <Settings className="h-5 w-5" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full sm:w-96 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-l border-slate-700 shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-100">{t('settings.title')}</h2>
                  <Button
                    onClick={() => setIsOpen(false)}
                    variant="ghost"
                    size="icon"
                    className="hover:bg-slate-700/50"
                  >
                    <X className="h-5 w-5 text-slate-100" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fontFamily" className="text-slate-200">{t('settings.fontFamily')}</Label>
                    <Select
                      value={localTheme.fontFamily}
                      onValueChange={(value) => setLocalTheme({ ...localTheme, fontFamily: value })}
                    >
                      <SelectTrigger id="fontFamily">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontFamilies.map((font) => (
                          <SelectItem key={font} value={font}>
                            <span style={{ fontFamily: font }}>{font}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fontSize" className="text-slate-200">
                      {t('settings.fontSize')}: {localTheme.fontSize}px
                    </Label>
                    <Slider
                      id="fontSize"
                      min={14}
                      max={18}
                      step={1}
                      value={[localTheme.fontSize]}
                      onValueChange={(value) => setLocalTheme({ ...localTheme, fontSize: value[0] })}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primaryColor" className="text-slate-200">{t('settings.primaryColor')}</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={localTheme.primaryColor}
                        onChange={(e) => setLocalTheme({ ...localTheme, primaryColor: e.target.value })}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={localTheme.primaryColor}
                        onChange={(e) => setLocalTheme({ ...localTheme, primaryColor: e.target.value })}
                        className="flex-1 text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor" className="text-slate-200">{t('settings.secondaryColor')}</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={localTheme.secondaryColor}
                        onChange={(e) => setLocalTheme({ ...localTheme, secondaryColor: e.target.value })}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={localTheme.secondaryColor}
                        onChange={(e) => setLocalTheme({ ...localTheme, secondaryColor: e.target.value })}
                        className="flex-1 text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accentColor" className="text-slate-200">{t('settings.accentColor')}</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        id="accentColor"
                        type="color"
                        value={localTheme.accentColor}
                        onChange={(e) => setLocalTheme({ ...localTheme, accentColor: e.target.value })}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={localTheme.accentColor}
                        onChange={(e) => setLocalTheme({ ...localTheme, accentColor: e.target.value })}
                        className="flex-1 text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-slate-200">{t('settings.language')}</Label>
                    <Select
                      value={localTheme.language}
                      onValueChange={(value) => setLocalTheme({ ...localTheme, language: value })}
                    >
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">{t('spanish')}</SelectItem>
                        <SelectItem value="en">{t('english')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
                  >
                    {t('settings.save')}
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="flex-1 border-slate-600 text-slate-200 hover:bg-slate-700"
                  >
                    {t('settings.reset')}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default SettingsPanel;