import { getSafeAppCheckToken } from "../lib/firebase";
import React, { useState, useEffect } from "react";
import { auth, app } from "../lib/firebaseAuth";
import { useAuth } from "../contexts/AuthContext";
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebaseAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RavDashboard() {
  const { user, role } = useAuth();
  const [poolQuestions, setPoolQuestions] = useState<any[]>([]);
  const [claimedQuestions, setClaimedQuestions] = useState<any[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<any | null>(null);
  const [draftAnswer, setDraftAnswer] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReasonType, setRejectReasonType] = useState<string>("Irrelevant");
  const [rejectCustomText, setRejectCustomText] = useState("");

  useEffect(() => {
    if (!user) return;
    
    const qPool = query(collection(db, "ask_rav"), where("status", "==", "pool"));
    const unsubPool = onSnapshot(qPool, (snap) => {
      setPoolQuestions(snap.docs.map(d => {
        const data = d.data();
        return { 
          ...data, 
          id: d.id,
          text: data.text || data.question || "" 
        };
      }));
    }, (error) => {
      console.warn("Pool questions listener error:", error);
    });

    const qClaimed = query(collection(db, "ask_rav"), where("ravId", "==", user.uid));
    const unsubClaimed = onSnapshot(qClaimed, (snap) => {
      setClaimedQuestions(snap.docs.map(d => {
        const data = d.data();
        return { 
          ...data, 
          id: d.id,
          text: data.text || data.question || ""
        };
      }).filter((q: any) => q.status === "claimed"));
    }, (error) => {
      console.warn("Claimed questions listener error:", error);
    });

    return () => {
      unsubPool();
      unsubClaimed();
    };
  }, [user]);

  const claimQuestion = async (questionId: string) => {
    if (!user) return;
    try {
      const qRef = doc(db, "ask_rav", questionId);
      await updateDoc(qRef, {
        status: "claimed",
        ravId: user.uid,
        claimedAt: serverTimestamp()
      });
    } catch (e: any) {
      console.error(e);
      alert("Failed to claim question: " + e.message);
    }
  };

  const draftWithAI = async (q: any) => {
    try {
      setIsDrafting(true);
      const res = await fetch("/api/ai/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + (await auth.currentUser?.getIdToken() || ""), "X-Firebase-AppCheck": await getSafeAppCheckToken() },
        body: JSON.stringify({
          questionText: q.text,
          photoData: q.photoData || null
        })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate draft");
      }
      const data = await res.json();
      if (data.draftAnswer) {
        setDraftAnswer((prev) => prev ? prev + "\n" + data.draftAnswer : data.draftAnswer);
      }
    } catch (e: any) {
      console.error(e);
      alert("Failed to draft answer: " + e.message);
    } finally {
      setIsDrafting(false);
    }
  };

  const submitAnswer = async (questionId: string) => {
    if (!draftAnswer || !draftAnswer.trim() || !user) return;
    try {
      setIsSubmitting(true);
      const qRef = doc(db, "ask_rav", questionId);
      await updateDoc(qRef, {
        status: "answered",
        answer: draftAnswer,
        answeredAt: serverTimestamp(),
        ravId: user.uid,
        rav_answered: user.email ? user.email.toLowerCase() : ""
      });
      setActiveQuestion(null);
      setDraftAnswer("");
    } catch (e: any) {
      console.error(e);
      alert("Failed to submit answer: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitRejection = async () => {
    if (!rejectId) return;
    try {
      const qRef = doc(db, "ask_rav", rejectId);
      const finalReason = rejectReasonType === "Custom" ? rejectCustomText : rejectReasonType;
      await updateDoc(qRef, {
        status: "rejected",
        answer: `Administrative Action: Question rejected.\nReason: ${finalReason}`,
        answeredAt: serverTimestamp()
      });
      setRejectId(null);
      setRejectCustomText("");
      setRejectReasonType("Irrelevant");
    } catch (e: any) {
      console.error(e);
      alert("Failed to reject question: " + e.message);
    }
  };

  if (activeQuestion) {
    return (
      <div className="p-4 bg-muted/20 min-h-screen">
        <Button variant="outline" className="mb-4" onClick={() => { setActiveQuestion(null); setDraftAnswer(""); }}>&larr; Back to Dashboard</Button>
        <div className="bg-card p-6 rounded-xl shadow-sm border space-y-4">
          <div>
            <h3 className="font-bold text-lg mb-1">User's Question</h3>
            <p className="bg-muted/50 p-3 rounded-lg text-sm">{activeQuestion.text}</p>
          </div>
          {activeQuestion.photoData && (
            <div className="my-4">
              <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Attached Photo</h4>
              <img src={activeQuestion.photoData} alt="User attachment" className="max-h-64 rounded-xl border shadow-sm object-contain" />
            </div>
          )}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs uppercase font-bold bg-primary/10 text-primary px-2 py-1 rounded-full">
              Category: {activeQuestion.scannedProductInfo?.category || "General"}
            </span>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg">Your Answer</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-destructive border-destructive" onClick={async () => {
                  try {
                    await updateDoc(doc(db, "ask_rav", activeQuestion.id), { status: "pool", ravId: null, claimedAt: null });
                    setActiveQuestion(null);
                  } catch(e) { console.error(e); }
                }}>Drop / Return to Pool</Button>
                <Button size="sm" variant="secondary" onClick={() => draftWithAI(activeQuestion)} disabled={isDrafting}>
                  {isDrafting ? "Drafting..." : "Draft with AI (Co-Pilot)"}
                </Button>
              </div>
            </div>
            <Textarea
              className="min-h-[200px] mb-4 bg-transparent"
              value={draftAnswer}
              onChange={(e) => setDraftAnswer(e.target.value)}
              placeholder="Write the halachic answer here..."
              dir="auto"
            />
            <Button 
              className="w-full" 
              onClick={() => submitAnswer(activeQuestion.id)}
              disabled={isSubmitting || !draftAnswer || !draftAnswer.trim()}
            >
              {isSubmitting ? "Submitting..." : "Submit Answer"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-muted/20 min-h-screen">
      <h2 className="text-2xl font-bold text-primary mb-6">Rav Workspace</h2>
      
      <Dialog open={!!rejectId} onOpenChange={() => setRejectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Question</DialogTitle>
            <DialogDescription>Select a reason or provide a custom one.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={rejectReasonType} onValueChange={setRejectReasonType}>
              <SelectTrigger>
                <SelectValue placeholder="Select Reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Irrelevant">Not related to halacha / irrelevant</SelectItem>
                <SelectItem value="Inappropriate">Inappropriate language or content</SelectItem>
                <SelectItem value="Duplicate">Duplicate question</SelectItem>
                <SelectItem value="Custom">Custom / Write my own</SelectItem>
              </SelectContent>
            </Select>
            {rejectReasonType === "Custom" && (
              <Textarea 
                placeholder="Type your custom rejection reason..."
                className="w-full resize-none min-h-[100px]"
                value={rejectCustomText}
                onChange={(e) => setRejectCustomText(e.target.value)}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={submitRejection}>Submit Rejection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="mb-8">
        <h3 className="font-semibold mb-3 flex items-center justify-between">
          <span>The Open Pool</span>
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{poolQuestions.length} Questions</span>
        </h3>
        <div className="space-y-3">
          {poolQuestions.map(q => (
            <div key={q.id} className="bg-card p-4 rounded-xl border shadow-sm flex justify-between gap-4">
              <div className="flex gap-3 mb-3 flex-1">
                {q.photoData && (
                  <img src={q.photoData} alt="Attached" className="w-16 h-16 rounded-md object-cover flex-shrink-0" />
                )}
                <div className="flex flex-col">
                  <p className="text-sm font-medium">{q.text}</p>
                  {role === "admin" && (
                    <p className="text-xs text-muted-foreground mt-1">From: {q.user_asked || q.userId}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Button size="sm" onClick={() => claimQuestion(q.id)}>Claim</Button>
                {role === "admin" && (
                  <Button size="sm" variant="destructive" onClick={() => setRejectId(q.id)}>Reject</Button>
                )}
              </div>
            </div>
          ))}
          {poolQuestions.length === 0 && <p className="text-sm text-muted-foreground italic">Pool is empty.</p>}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3 flex items-center justify-between">
          <span>Your Claimed Tasks</span>
          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">{claimedQuestions.length} Claimed</span>
        </h3>
        <div className="space-y-3">
          {claimedQuestions.map(q => (
            <div key={q.id} className="bg-card p-4 rounded-xl border border-primary/20 shadow-sm">
              <div className="flex gap-3 mb-3">
                {q.photoData && (
                  <img src={q.photoData} alt="Attached" className="w-16 h-16 rounded-md object-cover flex-shrink-0" />
                )}
                <p className="text-sm font-medium">{q.text}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setActiveQuestion(q)}>Open Draft Panel</Button>
            </div>
          ))}
          {claimedQuestions.length === 0 && <p className="text-sm text-muted-foreground italic">No claimed tasks.</p>}
        </div>
      </div>
    </div>
  );
}
