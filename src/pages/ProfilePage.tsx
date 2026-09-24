import React, { useState, useRef } from "react";
import { User, Shield, Moon, Settings, ChevronRight, HelpCircle, AlertCircle, FileText, Mail, Sun, Upload, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSettings } from "../contexts/SettingsContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { auth, googleSignOut } from "../lib/firebaseAuth";
import { updateProfile } from "firebase/auth";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { t, language, setLanguage, tradition, setTradition, theme, setTheme } = useSettings();
  const { role } = useAuth();
  const navigate = useNavigate();
  
  const [showHowToUse, setShowHowToUse] = useState(false);
  const [showReport, setShowReport] = useState(false);
  
  const [reportMsg, setReportMsg] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Authenticated details from active Firebase authentication
  const currentUser = auth.currentUser;
  const isRealUser = currentUser !== null;
  const userDisplayName = currentUser?.displayName || currentUser?.email || 'Guest User';
  const userSubText = `${language === 'en' ? 'English' : 'עברית'} • ${tradition}`;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const maxSize = 256;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        try {
          await updateProfile(currentUser, { photoURL: dataUrl });
          window.location.reload();
        } catch (err) {
          console.error("Failed to update profile photo", err);
          alert("Failed to update profile photo. Size might be too large.");
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleResetPhoto = async () => {
    if (!currentUser) return;
    try {
      await updateProfile(currentUser, { photoURL: "" });
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportSubmit = async () => {
    if (!reportMsg.trim()) return;
    setIsSubmittingReport(true);
    try {
      await addDoc(collection(db, "app_reports"), {
        userId: currentUser?.uid || 'guest',
        email: currentUser?.email || 'guest',
        message: reportMsg,
        language,
        tradition,
        createdAt: serverTimestamp()
      });
      setReportSubmitted(true);
      setTimeout(() => {
        setShowReport(false);
        setReportSubmitted(false);
        setReportMsg("");
      }, 2000);
    } catch (e) {
      console.error("Failed to submit report:", e);
      alert("Failed to submit report. Ensure you have the right permissions.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await googleSignOut();
      localStorage.removeItem('device_logged_in');
      window.location.reload();
    } catch (e) {
      console.error("Sign out error:", e);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`p-4 max-w-md mx-auto space-y-6 pt-8 pb-12 ${language === "he" ? "text-right" : "text-left"}`} dir={language === "he" ? "rtl" : "ltr"}
    >
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary mb-2 transition-transform duration-300">{t('profile_title')}</h1>
        <p className="text-muted-foreground text-sm">{t('profile_sub')}</p>
      </div>

      <Card className="border-none shadow-md overflow-hidden relative group transition-all duration-300 hover:shadow-lg bg-card text-card-foreground">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4 border-b border-border pb-6 mb-6">
            <div className="relative group/avatar cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary relative shadow-inner overflow-hidden border-2 border-primary/20">
                {isRealUser ? (
                  currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary text-white flex items-center justify-center text-3xl font-bold font-serif uppercase">
                      {userDisplayName.substring(0, 2)}
                    </div>
                  )
                ) : (
                  <User size={40} />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                  <Upload className="text-white w-6 h-6" />
                </div>
              </div>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handlePhotoUpload} 
            />

            {currentUser?.photoURL && (
              <Button variant="ghost" size="sm" onClick={handleResetPhoto} className="h-7 text-xs text-muted-foreground mt-0 pt-0">
                <RefreshCcw className="w-3 h-3 mr-1" />
                {language === 'he' ? 'אפס תמונה' : 'Reset Photo'}
              </Button>
            )}

            <div className="text-center">
              <h2 className="font-bold text-xl tracking-tight">{userDisplayName}</h2>
              <p className="text-sm text-muted-foreground">{userSubText}</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Language Selection */}
            <div className="space-y-3">
               <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground px-2">{t('language')}</h3>
               <div className="flex gap-2 p-1 bg-muted/40 rounded-xl">
                 <Button 
                   variant={language === 'en' ? 'default' : 'ghost'} 
                   className="flex-1 rounded-lg transition-transform focus-visible:scale-95 duration-150"
                   onClick={() => setLanguage('en')}
                 >
                   English
                 </Button>
                 <Button 
                   variant={language === 'he' ? 'default' : 'ghost'} 
                   className="flex-1 rounded-lg transition-transform focus-visible:scale-95 duration-150"
                   onClick={() => setLanguage('he')}
                 >
                   עברית
                 </Button>
               </div>
            </div>

            {/* Appearance / Theme Selection */}
            <div className="space-y-3">
               <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground px-2">
                 {language === 'he' ? 'ערכת נושא' : 'Theme Mode'}
               </h3>
               <div className="flex gap-2 p-1 bg-muted/40 rounded-xl">
                 <Button 
                   variant={theme === 'light' ? 'default' : 'ghost'} 
                   className="flex-1 rounded-lg gap-2 transition-transform focus-visible:scale-95 duration-150"
                   onClick={() => setTheme('light')}
                 >
                   <Sun size={16} />
                   {language === 'he' ? 'יום' : 'Light'}
                 </Button>
                 <Button 
                   variant={theme === 'dark' ? 'default' : 'ghost'} 
                   className="flex-1 rounded-lg gap-2 transition-transform focus-visible:scale-95 duration-150"
                   onClick={() => setTheme('dark')}
                 >
                   <Moon size={16} />
                   {language === 'he' ? 'לילה' : 'Dark'}
                 </Button>
               </div>
            </div>

            {/* Tradition Selection */}
            <div className="space-y-3">
               <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground px-2">{t('tradition')}</h3>
               <div className="flex flex-col gap-2">
                 <Button 
                   variant={tradition === 'ashkenazi' ? 'default' : 'outline'} 
                   className="w-full justify-start rounded-xl px-4 py-6 transition-all duration-200 hover:translate-x-1"
                   onClick={() => setTradition('ashkenazi')}
                 >
                   <div className="flex items-center w-full">
                     <span className={`flex-1 text-start`}>{t('ashkenazi')}</span>
                     {tradition === 'ashkenazi' && <div className="w-2 h-2 rounded-full bg-primary-foreground mx-2" />}
                   </div>
                 </Button>
                 <Button 
                   variant={tradition === 'sephardi' ? 'default' : 'outline'} 
                   className="w-full justify-start rounded-xl px-4 py-6 transition-all duration-200 hover:translate-x-1"
                   onClick={() => setTradition('sephardi')}
                 >
                   <div className="flex items-center w-full">
                     <span className={`flex-1 text-start`}>{t('sephardi')}</span>
                     {tradition === 'sephardi' && <div className="w-2 h-2 rounded-full bg-primary-foreground mx-2" />}
                   </div>
                 </Button>
                 <Button 
                   variant={tradition === 'yemenite' ? 'default' : 'outline'} 
                   className="w-full justify-start rounded-xl px-4 py-6 transition-all duration-200 hover:translate-x-1"
                   onClick={() => setTradition('yemenite')}
                 >
                   <div className="flex items-center w-full">
                     <span className={`flex-1 text-start`}>{t('yemenite')}</span>
                     {tradition === 'yemenite' && <div className="w-2 h-2 rounded-full bg-primary-foreground mx-2" />}
                   </div>
                 </Button>
               </div>
            </div>



            <div className="border-t border-border pt-6 mt-6 space-y-1">
               <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-2">Support & Info</h3>
               {role === "admin" && (
                 <SettingRow icon={<Shield size={20} />} title={t('admin_panel')} onClick={() => navigate('/admin')} />
               )}
               <SettingRow icon={<HelpCircle size={20} />} title={t('how_to_use')} onClick={() => setShowHowToUse(true)} />
               <SettingRow icon={<AlertCircle size={20} />} title={t('report_mistake')} onClick={() => setShowReport(true)} />
               <SettingRow icon={<FileText size={20} />} title={t('privacy_policy')} onClick={() => navigate('/privacy')} />
            </div>
            
            <Button 
              variant="ghost" 
              onClick={handleSignOut} 
              className="w-full text-destructive hover:bg-destructive/10 rounded-xl mt-4"
            >
               {t('sign_out')}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center text-xs text-muted-foreground pt-4">
        <p>BrachaScanner v1.1.0</p>
      </div>

      {/* How To Use Dialog */}
      <Dialog open={showHowToUse} onOpenChange={setShowHowToUse}>
        <DialogContent className="max-w-sm rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">How to Use BrachaScanner</DialogTitle>
            <DialogDescription className="text-base text-foreground/80 mt-4 space-y-3 leading-relaxed">
              <span className="block">1. <strong>Scan a food</strong>: On the main tab, use the camera or attach a gallery photo of any food item.</span>
              <span className="block">2. <strong>Confirm</strong>: The AI will identify the food and show you the correct category and blessing.</span>
              <span className="block">3. <strong>Follow instructions</strong>: Read the "how to eat" section to understand the order and secondary ingredients rules.</span>
              <span className="block">4. <strong>Ask a Rabbi</strong>: If you're unsure or the meal is complex, tap on the "Ask a Rabbi" tab to send a question with a photo.</span>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Button onClick={() => setShowHowToUse(false)} className="w-full rounded-xl" size="lg">Got it</Button>
          </div>
        </DialogContent>
      </Dialog>

       {/* Report a Mistake Dialog */}
      <Dialog open={showReport} onOpenChange={setShowReport}>
        <DialogContent className="max-w-sm rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif text-destructive flex items-center gap-2">
              <AlertCircle size={24} /> Report a Mistake
            </DialogTitle>
            <DialogDescription>
              Found incorrect blessing info? Let the author know!
            </DialogDescription>
          </DialogHeader>
          
          {reportSubmitted ? (
            <div className="py-8 text-center text-success font-medium animate-in fade-in zoom-in">
              Report sent successfully! Thank you.
            </div>
          ) : (
             <div className="space-y-4 mt-2">
               <Textarea 
                 value={reportMsg} 
                 onChange={e => setReportMsg(e.target.value)} 
                 placeholder="Describe the issue you found..." 
                 className="min-h-[120px] resize-none rounded-xl bg-muted/50 border-none"
               />
               <Button 
                  onClick={handleReportSubmit} 
                  disabled={isSubmittingReport || !reportMsg.trim()} 
                  className="w-full rounded-xl bg-destructive hover:bg-destructive/90 text-white" 
                  size="lg"
               >
                 {isSubmittingReport ? "Sending..." : "Submit Report"}
               </Button>
             </div>
          )}
        </DialogContent>
      </Dialog>

    </motion.div>
  );
}

function SettingRow({ icon, title, onClick }: { icon: React.ReactNode, title: string, onClick?: () => void }) {
  return (
    <div onClick={onClick} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-xl cursor-pointer transition-colors">
      <div className="flex items-center gap-3">
        <div className="text-primary bg-primary/10 p-2 rounded-lg">
          {icon}
        </div>
        <span className="font-medium">{title}</span>
      </div>
      <ChevronRight size={16} className="text-muted-foreground" />
    </div>
  );
}
