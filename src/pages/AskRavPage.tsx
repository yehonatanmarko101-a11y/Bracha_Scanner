import { getSafeAppCheckToken } from "../lib/firebase";
import React, { useState, useEffect } from "react";
import { Send, Image as ImageIcon, MessageCircle, RefreshCw, LayoutDashboard, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDeviceId } from "../lib/deviceId";
import Markdown from "react-markdown";
import { useSettings } from "../contexts/SettingsContext";
import { auth, app } from "../lib/firebaseAuth";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebaseAuth";
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc, addDoc, setDoc, serverTimestamp, Timestamp, deleteDoc } from "firebase/firestore";
import AdminDashboard from "../components/AdminDashboard";
import RavDashboard from "../components/RavDashboard";

export default function AskRavPage() {
  const { t, language } = useSettings();
  const { user, role } = useAuth();
  
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [questionsByUid, setQuestionsByUid] = useState<any[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  
  // View mode for Ravs/Admins
  const [activeView, setActiveView] = useState<"user" | "dashboard">("user");

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!user) return;
    
    // Subscribe to past questions from this user by UID in ask_rav
    const q1 = query(collection(db, "ask_rav"), where("userId", "==", user.uid));
    const unsub1 = onSnapshot(q1, (snap) => {
      setQuestionsByUid(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      console.error("Failed to subscribe by uid:", err);
    });

    return () => {
      unsub1();
    };
  }, [user]);

  const questions = React.useMemo(() => {
    const combinedMap = new Map<string, any>();
    
    const normalize = (qDoc: any) => {
      const createdAtVal = qDoc.createdAt 
        ? (qDoc.createdAt.toDate ? qDoc.createdAt.toDate() : new Date(qDoc.createdAt))
        : (qDoc.date_asked?.toDate ? qDoc.date_asked.toDate() : new Date());
      
      return {
        id: qDoc.id,
        userId: qDoc.userId || "",
        user_asked: qDoc.user_asked || "",
        text: qDoc.text || qDoc.question || "",
        question: qDoc.question || qDoc.text || "",
        scannedProductInfo: qDoc.scannedProductInfo || { category: "General", hasPhoto: false },
        status: qDoc.status || (qDoc.answer ? "answered" : "pool"),
        createdAt: createdAtVal,
        answer: qDoc.answer || null,
        ...qDoc
      };
    };

    [...questionsByUid].forEach(q => {
      if (q.hiddenFromUser) return;
      combinedMap.set(q.id, normalize(q));
    });

    const list = Array.from(combinedMap.values());
    list.sort((a, b) => {
      const da = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
      const db = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
      return db - da;
    });
    return list;
  }, [questionsByUid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isSubmitting || !user) return;

    setIsSubmitting(true);
    const questionText = question.trim();

    try {
      // Step 1: Check client-side ban status in user doc first
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);
      const userData = userSnap.exists() ? userSnap.data() : { spamWarningCount: 0, isBannedUntil: null };

      if (userData.isBannedUntil) {
        const banEnd = userData.isBannedUntil.toDate ? userData.isBannedUntil.toDate() : new Date(userData.isBannedUntil);
        if (banEnd > new Date()) {
          alert(`Access Suspended:\n\nYour access to Ask the Rav is temporarily suspended until ${banEnd.toLocaleString()} due to repeated spam or typos.`);
          setIsSubmitting(false);
          return;
        }
      }

      // Step 2: Call the filter API (this includes the typo regex check as "code" check)
      let filterRes;
      try {
        filterRes = await fetch("/api/ask/filter", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + (await auth.currentUser?.getIdToken() || ""), "X-Firebase-AppCheck": await getSafeAppCheckToken() },
          body: JSON.stringify({ text: questionText, userId: user.uid, deviceId: getDeviceId() })
        });
      } catch (err) {
        // network error, continue submission
      }

      
      if (filterRes) {
        const filterData = await filterRes.json();
        if (filterRes.status === 429 || filterRes.status === 403) {
           alert(filterData.error || "Rate limit exceeded.");
           setIsSubmitting(false);
           return;
        }
        
        if (filterData.success && !filterData.isValidQuestion) {

          if (filterData.rejectedBy === "ai") {
            const currentCount = (userData.spamWarningCount || 0) + 1;
            if (currentCount >= 3) {
              const unbanTime = Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000);
              await setDoc(userDocRef, {
                spamWarningCount: 0,
                isBannedUntil: unbanTime,
                role: userData.role || "user"
              }, { merge: true });
              alert(`Access Suspended:\n\nYou have been temporarily blocked for 24 hours. Reason: ${filterData.reason}`);
            } else {
              await setDoc(userDocRef, {
                spamWarningCount: currentCount,
                role: userData.role || "user"
              }, { merge: true });
              alert(`Warning:\n\nYour question was rejected: ${filterData.reason}. Please ask a real halachic question. (Strikes: ${currentCount}/3)`);
            }
          } else {
            // Rejected by code (local heuristics / typos)
            alert("Oops! That doesn't look like a valid question. " + filterData.reason);
          }
          setIsSubmitting(false);
          return;
        }
      }

      // Step 3: Handle Valid Submission - submit locally
      try {
          console.log("Updating user spam warning count...");
          await setDoc(userDocRef, { spamWarningCount: 0, role: userData.role || "user" }, { merge: true });
        } catch (e: any) {
          console.error("Failed to update user doc:", e);
          throw new Error("Failed to update user doc: " + e.message);
        }

        const newDocRef = doc(collection(db, "ask_rav"));
        const questionData = {
          userId: user.uid,
          user_asked: user.email ? user.email.toLowerCase() : "",
          text: questionText,
          scannedProductInfo: { category: category || "General", hasPhoto: !!photo },
          photoData: photo,
          status: "pool",
          createdAt: serverTimestamp()
        };

        try {
          console.log("Adding question document to ask_rav...");
          await setDoc(newDocRef, questionData);
        } catch (e: any) {
          console.error("Failed to add question:", e);
          throw new Error("Failed to submit question: " + e.message);
        }
        setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      alert("Failed to submit: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (q: any, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (q.status === "pool") {
        await deleteDoc(doc(db, "ask_rav", q.id));
      } else {
        await updateDoc(doc(db, "ask_rav", q.id), { hiddenFromUser: true });
      }
    } catch(err: any) {
      console.error("Failed to delete question", err);
    }
  };

  if (activeView === "dashboard") {
    return (
      <div className="pb-16 relative w-full pt-12">
        <div className="absolute top-2 right-4 z-10">
          <Button variant="outline" size="sm" onClick={() => setActiveView("user")}>
            Switch to User View
          </Button>
        </div>
        {role === "admin" && (
          <Tabs defaultValue="rav" className="w-full">
            <TabsList className="w-full flex h-12 mb-0 bg-muted/50 rounded-none border-b">
              <TabsTrigger value="admin" className="flex-1 rounded-none data-[state=active]:bg-background">Super Admin</TabsTrigger>
              <TabsTrigger value="rav" className="flex-1 rounded-none data-[state=active]:bg-background">Questions Pool (Rav)</TabsTrigger>
            </TabsList>
            <TabsContent value="admin" className="m-0 border-none outline-none items-stretch flex-col">
              <AdminDashboard />
            </TabsContent>
            <TabsContent value="rav" className="m-0 border-none outline-none items-stretch flex-col">
              <RavDashboard />
            </TabsContent>
          </Tabs>
        )}
        {role === "rav" && <RavDashboard />}
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="h-[calc(100vh-80px)] flex items-center justify-center p-4">
        <Card className="max-w-sm w-full border-none shadow-lg text-center p-6 bg-card">
          <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-4">
            <Send size={32} />
          </div>
          <h2 className="text-2xl font-serif text-primary font-bold mb-2">Question Submitted!</h2>
          <p className="text-muted-foreground mb-6">A rabbi will review your question and respond shortly.</p>
          <Button onClick={() => { setQuestion(""); setCategory(""); setPhoto(null); setSubmitted(false); }} className="w-full rounded-xl">Ask Another Question</Button>
        </Card>
      </div>
    );
  }

  return (
    <div dir={language === "he" ? "rtl" : "ltr"} className={language === "he" ? "text-right p-4 max-w-md mx-auto pt-8 pb-12 relative" : "p-4 max-w-md mx-auto pt-8 pb-12 relative"}>
      {(role === "admin" || role === "rav") && (
        <div className={`absolute top-4 ${language === "he" ? "left-4" : "right-4"}`}>
          <Button variant="outline" size="sm" onClick={() => setActiveView("dashboard")} className="gap-2">
            <LayoutDashboard size={14} /> Open {role === "admin" ? "Admin" : "Rav"} Dashboard
          </Button>
        </div>
      )}

      <div className="mb-6 mt-4">
        <h1 className="text-3xl font-serif font-bold text-primary mb-2">{t('ask_title')}</h1>
        <p className="text-muted-foreground text-sm">{t('ask_sub')}</p>
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg text-start">
          <p className="text-xs text-blue-800 dark:text-blue-300 font-medium flex items-start gap-2">
            <span className="mt-0.5">ℹ️</span>
            <span>
              {language === 'he' 
                ? 'שימו לב: ניתן לשאול רק שאלות הקשורות לברכות וכשרות המאכלים.'
                : 'Please note: You can only ask questions related to food blessings (Brachot) and Kashrut.'}
            </span>
          </p>
        </div>
      </div>

      <Card className="border-none shadow-sm mb-8 bg-card">
        <CardHeader>
          <CardTitle className="text-lg">{language === 'he' ? 'שאלה חדשה' : 'New Question'}</CardTitle>
          <CardDescription>{language === 'he' ? 'בחר קטגוריה וספק פרטים.' : 'Select a category and provide details.'}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('category')}</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full rounded-xl bg-muted/50 border-none">
                  <SelectValue placeholder={language === 'he' ? 'בחר קטגוריה' : 'Select a category'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brachot">{language === 'he' ? 'ברכות' : 'Brachot (Blessings)'}</SelectItem>
                  <SelectItem value="kashrut">{language === 'he' ? 'כשרות' : 'Kashrut'}</SelectItem>
                  
                  
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('question')}</label>
              <Textarea
                placeholder={language === 'he' ? 'למשל, איזו ברכה מברכים על סלט פירות עם תפוחים וענבים?' : 'e.g. What bracha do I make on a fruit salad with apples and grapes?'}
                className="min-h-[120px] rounded-xl bg-muted/50 border-none resize-none"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                maxLength={500}
              />
              <div className={`text-xs text-muted-foreground font-mono ${language === "he" ? "text-left" : "text-right"}`}>
                {question.length}/500
              </div>
            </div>

            <div>
              <label htmlFor="question-photo-upload" className="w-full flex flex-col items-center justify-center gap-2 border-dashed border-2 p-3 rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                {photo ? (
                  <div className="flex flex-col items-center gap-2">
                     <img src={photo} alt="Attached" className="max-h-48 rounded object-contain border" />
                     <span className="text-sm font-medium">Photo Attached (Tap to change)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-foreground/80 py-4">
                     <ImageIcon size={18} />
                     <span className="text-sm font-medium">{t('attach_photo')}</span>
                  </div>
                )}
                <input 
                  id="question-photo-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handlePhotoUpload} 
                />
              </label>
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-6 mt-4 font-semibold shadow-md" disabled={!question.trim() || isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="animate-spin" size={16} /> Submitting...
                </span>
              ) : (
                t('submit')
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <div className="mt-8">
        <h2 className="text-xl font-serif font-bold text-primary mb-4 px-1">{t('past_questions')}</h2>
        {questions.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm bg-muted/30 rounded-2xl border-2 border-dashed border-border/50">
            <MessageCircle size={32} className="mx-auto mb-3 opacity-30" />
            {t('no_questions')}
          </div>
        ) : (
          <div className="space-y-3">
              {questions.map((q) => {
                const isExpanded = expandedQuestionId === q.id || q.status === "answered" || q.status === "rejected";
                const getStatusStyle = (status: string) => {
                  if (status === 'pool' || status === 'claimed') return 'bg-yellow-100 text-yellow-800';
                  if (status === 'rejected') return 'bg-destructive/20 text-destructive';
                  return 'bg-success/20 text-success';
                };
                const getStatusText = (status: string) => {
                  if (status === 'pool' || status === 'claimed') return t('pending') || 'Pending';
                  if (status === 'rejected') return language === 'he' ? 'נדחה' : 'Rejected';
                  return t('answered') || 'Answered';
                };

                return (
                  <div 
                    key={q.id} 
                    onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                    className="p-4 rounded-xl bg-card border border-border shadow-sm cursor-pointer transition-all hover:bg-muted/30"
                  >
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{language === "he" ? (q.scannedProductInfo?.category === "brachot" ? "ברכות" : q.scannedProductInfo?.category === "kashrut" ? "כשרות" : (q.scannedProductInfo?.category === "shabbat" ? "שבת" : (q.scannedProductInfo?.category === "other" ? "כללי" : q.scannedProductInfo?.category || "כללי"))) : (q.scannedProductInfo?.category || "General")}</span>
                       <div className="flex items-center gap-2">
                         {(q.status === 'pool' || q.status === 'answered' || q.status === 'rejected') && (
                           <Button variant="ghost" size="sm" className="h-6 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={(e) => handleDeleteQuestion(q, e)}>
                             <Trash2 size={12} className="mr-1"/> Delete
                           </Button>
                         )}
                         <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getStatusStyle(q.status)}`}>
                           {getStatusText(q.status)}
                         </span>
                       </div>
                    </div>
                    <div className="flex gap-3">
                      {q.photoData ? (
                        <img src={q.photoData} alt="Attached" className="w-12 h-12 rounded object-cover shadow-sm shrink-0" />
                      ) : (
                        q.scannedProductInfo?.hasPhoto && <div className="w-12 h-12 rounded bg-muted flex items-center justify-center shrink-0"><ImageIcon size={16} className="opacity-50"/></div>
                      )}
                      <p className={`text-sm ${isExpanded ? "" : "line-clamp-2"}`}>{q.text}</p>
                    </div>
                    {(q.status === "answered" || q.status === "rejected") && q.answer && (
                      <div className="mt-4 pt-4 border-t border-border animate-in fade-in duration-200">
                        <p className={`text-xs font-bold mb-1 uppercase tracking-wider ${q.status === 'rejected' ? 'text-destructive' : 'text-primary'}`}>
                          {q.status === 'rejected' ? 'Admin Note:' : "Rabbi's Answer:"}
                        </p>
                        <div className={`text-sm p-3 rounded-xl border ${q.status === 'rejected' ? 'bg-destructive/5 border-destructive/10 text-foreground' : 'bg-primary/5 border-primary/10 text-foreground'} ${language === "he" ? "text-right" : "text-left"}`} dir={language === "he" ? "rtl" : "ltr"}>
                          <div className="markdown-body">
                            <Markdown>{q.answer}</Markdown>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
