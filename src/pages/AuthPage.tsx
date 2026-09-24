import React, { useState } from "react";
import { Mail, Lock, User as UserIcon, LogIn, ChevronRight, HelpCircle, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useSettings } from "../contexts/SettingsContext";
import { useAuth } from "../contexts/AuthContext";
import Logo from "../components/Logo";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
import { auth } from "../lib/firebaseAuth";

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const { language, setLanguage, t } = useSettings();
  const { signInAsGuest } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  // UI States
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // Embedded Translations for the Auth Page to keep everything centralized and robust
  const localized = {
    en: {
      welcome: "Welcome to BrachaScanner",
      tagline: "Uncover correct blessings list immediately using advanced AI.",
      sign_in_title: "Sign In to Your Account",
      sign_up_title: "Create Your Account",
      email_label: "Email Address",
      password_label: "Password",
      name_label: "Full Name",
      btn_sign_in: "Sign In",
      btn_sign_up: "Create Account",
      btn_google: "Continue with Google",
      toggle_to_signup: "Don't have an account? Sign Up",
      toggle_to_signin: "Already have an account? Sign In",
      guest_btn: "Continue as Guest",
      guest_desc: "You can sign in later in your profile menu.",
      loading: "Processing, please wait...",
      err_weak_password: "Password must be at least 6 characters.",
      err_missing_fields: "Please fill out all required fields.",
      success_message: "Signed in successfully!",
      agree_terms: "I agree to the ",
      terms: "Terms of Service",
      and: " and ",
      privacy: "Privacy Policy",
    },
    he: {
      welcome: "ברוכים הבאים לסורק הברכות",
      tagline: "גלה את הברכה הנכונה באופן מיידי באמצעות בינה מלאכותית.",
      sign_in_title: "התחבר לחשבון שלך",
      sign_up_title: "צור חשבון חדש",
      email_label: "כתובת אימייל",
      password_label: "סיסמה",
      name_label: "שם מלא",
      btn_sign_in: "התחברות",
      btn_sign_up: "הרשמה",
      btn_google: "המשך עם Google",
      toggle_to_signup: "אין לך חשבון? להרשמה",
      toggle_to_signin: "כבר יש לך חשבון? להתחברות",
      guest_btn: "המשך כאורח",
      guest_desc: "תוכל להתחבר במועד מאוחר יותר דרך תפריט הפרופיל.",
      loading: "מבצע פעולה, נא להמתין...",
      err_weak_password: "הסיסמה חייבת להכיל לפחות 6 תווים.",
      err_missing_fields: "אנא מלא את כל השדות הנדרשים.",
      success_message: "התחברת בהצלחה!",
      agree_terms: "אני מסכים ל",
      terms: "תנאי השימוש",
      and: " ול",
      privacy: "מדיניות הפרטיות",
    }
  };

  const strings = language === "he" ? localized.he : localized.en;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    if (!agreed) {
      setError(language === "he" ? "יש להסכים לתנאי השימוש ומדיניות הפרטיות" : "You must agree to the Terms and Privacy Policy.");
      return;
    }
    
    if (!email.trim() || !password.trim() || (isSignUp && !name.trim())) {
      setError(strings.err_missing_fields);
      return;
    }

    if (password.length < 6) {
      setError(strings.err_weak_password);
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (cred.user) {
          await updateProfile(cred.user, { displayName: name });
          await sendEmailVerification(cred.user);
          const { doc, getDoc, setDoc } = await import("firebase/firestore");
          const { db } = await import("../lib/firebaseAuth");
          const userRef = doc(db, "users", cred.user.uid);
          await setDoc(userRef, {
            name: name,
            userID: cred.user.uid,
            userId: cred.user.uid,
            role: "user",
            email: email.toLowerCase()
          });
          setError("Account created! Please check your email to verify your account before logging in.");
          setIsSignUp(false);
          setLoading(false);
          return;
        }

      } else {
        
        const cred = await signInWithEmailAndPassword(auth, email, password);
        if (!cred.user.emailVerified) {
           setError("Please verify your email address before logging in. Check your inbox.");
           setLoading(false);
           auth.signOut();
           return;
        }

      }
      localStorage.setItem("device_logged_in", "true");
      onAuthSuccess();
    } catch (error: any) {
      console.error("Auth error:", error);
      if (error.code === 'auth/operation-not-allowed') {
         setError("Email/password login is not currently active for this preview. Use Guest or Google Login instead.");
      } else {
         setError(error.message || "Failed to authenticate");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestContinue = async () => {
    try {
      setLoading(true);
      await signInAsGuest();
      onAuthSuccess();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] overflow-y-auto bg-gradient-to-br from-background via-muted/30 to-background flex flex-col p-4 max-w-md mx-auto relative select-none">
      
      {/* Header Language Picker */}
      <div className="flex justify-between items-center w-full pt-4 px-2">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles size={20} className="animate-pulse" />
          <span className="font-serif font-bold tracking-tight text-lg">BrachaScanner</span>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setLanguage(language === "en" ? "he" : "en")}
          className="rounded-full text-xs font-medium px-3 py-1 border-muted bg-card/50"
        >
          {language === "en" ? "עברית" : "English"}
        </Button>
      </div>

      {/* Main Form Center Card */}
      <div className="flex-1 flex flex-col justify-center py-8">
        <div className="text-center space-y-2 mb-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <Logo size={110} variant="full" />
          <p className="text-muted-foreground text-sm max-w-[280px] mx-auto mt-2">
            {strings.tagline}
          </p>
        </div>

        <Card className="border-none shadow-xl bg-card/80 backdrop-blur-md rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          <CardContent className="p-6 space-y-6">
            <h3 className="font-bold text-lg text-foreground/90 border-b border-border/60 pb-3">
              {isSignUp ? strings.sign_up_title : strings.sign_in_title}
            </h3>

            {error && (
              <div className="bg-destructive/10 text-destructive text-xs py-3 px-4 rounded-xl font-medium border border-destructive/20 animate-in shake">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-1.5 relative">
                  <span className={`absolute ${language === "he" ? "right-3.5" : "left-3.5"} top-[38px] text-muted-foreground`}>
                    <UserIcon size={18} />
                  </span>
                  <label className="text-xs font-semibold text-muted-foreground/80 block px-1 text-start">
                    {strings.name_label}
                  </label>
                  <Input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={language === "he" ? "משה כהן" : "John Doe"}
                    className="rounded-xl bg-muted/30 border-none h-11 ps-10 text-start"
                    disabled={loading}
                  />
                </div>
              )}

              <div className="space-y-1.5 relative">
                <span className={`absolute ${language === "he" ? "right-3.5" : "left-3.5"} top-[38px] text-muted-foreground`}>
                  <Mail size={18} />
                </span>
                <label className="text-xs font-semibold text-muted-foreground/80 block px-1 text-start">
                  {strings.email_label}
                </label>
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="rounded-xl bg-muted/30 border-none h-11 ps-10 text-start text-xs"
                  disabled={loading}
                />
              </div>

              <div className="space-y-1.5 relative">
                <span className={`absolute ${language === "he" ? "right-3.5" : "left-3.5"} top-[38px] text-muted-foreground`}>
                  <Lock size={18} />
                </span>
                <label className="text-xs font-semibold text-muted-foreground/80 block px-1 text-start">
                  {strings.password_label}
                </label>
                <Input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-xl bg-muted/30 border-none h-11 ps-10 text-start"
                  disabled={loading}
                />
              </div>

              <div className="flex items-start space-x-2 pt-2 px-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className={`mt-1 rounded border-muted-foreground/30 text-primary focus:ring-primary h-4 w-4 shrink-0 ${language === "he" ? "ml-2" : "mr-2"}`}
                />
                <label
                  htmlFor="terms"
                  className="text-xs text-muted-foreground leading-tight"
                >
                  {strings.agree_terms}
                  <a href="/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    {strings.terms}
                  </a>
                  {strings.and}
                  <a href="/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    {strings.privacy}
                  </a>
                </label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/95 text-white rounded-xl py-6 font-semibold shadow-md shadow-primary/20 mt-2 hover:scale-[1.01] transition-all disabled:opacity-50"
                disabled={loading || !agreed}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{strings.loading}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn size={18} />
                    <span>{isSignUp ? strings.btn_sign_up : strings.btn_sign_in}</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="h-[1px] bg-border/60 flex-1" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Or</span>
              <div className="h-[1px] bg-border/60 flex-1" />
            </div>

            {/* Google Login Button */}
            <GoogleSignInButton 
              onSuccess={onAuthSuccess} 
              language={language}
              disabled={!agreed}
            />


            {/* Toggle form link */}
            <div className="text-center pt-2">
              <button 
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer transition-all"
              >
                {isSignUp ? strings.toggle_to_signin : strings.toggle_to_signup}
              </button>
            </div>

          </CardContent>
        </Card>
      </div>

    </div>
  );
}
