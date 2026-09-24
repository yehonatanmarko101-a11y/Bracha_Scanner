import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { collection, query, where, getDocs, doc, updateDoc, setDoc, onSnapshot, serverTimestamp, deleteDoc, addDoc } from "firebase/firestore";
import { db } from "../lib/firebaseAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function AdminDashboard() {
  const { user, role } = useAuth();
  const [emailToSearch, setEmailToSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [flaggedUsers, setFlaggedUsers] = useState<any[]>([]);
  const [staffUsers, setStaffUsers] = useState<any[]>([]);
  const [searchedEmail, setSearchedEmail] = useState("");
  
  const [dedications, setDedications] = useState<any[]>([]);
  const [newDedicationCategory, setNewDedicationCategory] = useState("לעילוי נשמת");
  const [newDedicationName, setNewDedicationName] = useState("");
  const [newDedicationParent, setNewDedicationParent] = useState("");
  const [newDedicationGender, setNewDedicationGender] = useState("male");
  const [newDedicationListType, setNewDedicationListType] = useState("temporary");
  const [newDedicationDays, setNewDedicationDays] = useState("30");

  useEffect(() => {
    loadFlaggedUsers();
    loadStaffUsers();
    
    const qDedications = query(collection(db, "blessing_dedications"));
    const unsubDedications = onSnapshot(qDedications, (snap) => {
      let list = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      const now = Date.now();
      list = list.filter(d => {
        if (d.listType === 'temporary' && d.createdAt && d.durationDays) {
          const createdMs = d.createdAt.seconds * 1000;
          const expirationMs = createdMs + (d.durationDays * 24 * 60 * 60 * 1000);
          return now < expirationMs;
        }
        return true;
      });
      setDedications(list);
    }, (error) => {
      console.warn("Dedications listener error:", error);
    });

    return () => {
      unsubDedications();
    };
  }, []);

  const loadStaffUsers = async () => {
    try {
      const qAdmin = query(collection(db, "users"), where("role", "==", "admin"));
      const qRav = query(collection(db, "users"), where("role", "==", "rav"));
      const snaps1 = await getDocs(qAdmin);
      const snaps2 = await getDocs(qRav);
      
      const all: any[] = [];
      snaps1.docs.forEach(d => {
        if (!d.id.startsWith("preApproved_")) {
          all.push({ id: d.id, ...d.data() });
        }
      });
      snaps2.docs.forEach(d => {
        if (!d.id.startsWith("preApproved_")) {
          all.push({ id: d.id, ...d.data() });
        }
      });
      
      setStaffUsers(all);
    } catch (e) {
      console.error("Failed to load staff users", e);
    }
  };

  const loadFlaggedUsers = async () => {
    try {
      const q = query(collection(db, "users"), where("spamWarningCount", ">", 0));
      const q2 = query(collection(db, "users"), where("isBannedUntil", "!=", null));
      const snaps1 = await getDocs(q);
      const snaps2 = await getDocs(q2);
      
      const all: any = {};
      snaps1.docs.forEach(d => {
        if (!d.id.startsWith("preApproved_")) {
          all[d.id] = { id: d.id, ...d.data() };
        }
      });
      snaps2.docs.forEach(d => {
        if (!d.id.startsWith("preApproved_")) {
          all[d.id] = { id: d.id, ...d.data() };
        }
      });
      
      setFlaggedUsers(Object.values(all));
    } catch (e) {
      console.error("Failed to load flagged users", e);
    }
  };

  const searchUser = async () => {
    if (!emailToSearch.trim()) return;
    const searchEmail = emailToSearch.trim().toLowerCase();
    setSearchedEmail(searchEmail);
    try {
      const q = query(collection(db, "users"), where("email", "==", searchEmail));
      const snaps = await getDocs(q);
      setSearchResults(snaps.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e: any) {
      console.error(e);
      alert("Failed to search. Are you an admin? Error: " + e.message);
    }
  };

  const promoteUser = async (targetUserId: string, targetEmail: string, newRole: "rav" | "admin") => {
    try {
      if (newRole === "admin" && user?.email !== "yehonatanmarko100@gmail.com") {
        alert("Only yehonatanmarko100@gmail.com is able to add admins.");
        return;
      }
      
      const userDocRef = doc(db, "users", targetUserId);
      await updateDoc(userDocRef, { role: newRole });
      alert(`User promoted to ${newRole}!`);
      
      searchUser();
      loadStaffUsers();
    } catch (e: any) {
      console.error(e);
      alert("Failed to promote: " + e.message);
    }
  };

  
  const banUser = async (targetUserId: string, duration: '24h' | '7d' | 'forever') => {
    try {
      const userDocRef = doc(db, "users", targetUserId);
      let bannedUntil = 0;
      if (duration === '24h') bannedUntil = Date.now() + 24 * 60 * 60 * 1000;
      else if (duration === '7d') bannedUntil = Date.now() + 7 * 24 * 60 * 60 * 1000;
      else if (duration === 'forever') bannedUntil = -1;
      
      await updateDoc(userDocRef, { bannedUntil });
      alert("User has been banned.");
    } catch (e: any) {
      console.error(e);
      alert("Failed to ban: " + e.message);
    }
  };

  const unbanUser = async (targetUserId: string) => {
    try {
      const userDocRef = doc(db, "users", targetUserId);
      await updateDoc(userDocRef, { bannedUntil: 0 });
      alert("User has been unbanned.");
    } catch (e: any) {
      console.error(e);
      alert("Failed to unban: " + e.message);
    }
  };

  const demoteUser = async (targetUserId: string, newRole: "rav" | "user") => {
    try {
      if (!isSuperAdminEmail) {
        alert("Only yehonatanmarko100@gmail.com is able to demote staff.");
        return;
      }
      
      const userDocRef = doc(db, "users", targetUserId);
      await updateDoc(userDocRef, { role: newRole });
      alert(`User demoted to ${newRole}!`);
      
      searchUser();
      loadStaffUsers();
    } catch (e: any) {
      console.error(e);
      alert("Failed to demote: " + e.message);
    }
  };

  const addPreApprovedUser = async (newRole: "rav" | "admin") => {
    if (!searchedEmail) return;
    try {
      if (newRole === "admin" && user?.email !== "yehonatanmarko100@gmail.com") {
        alert("Only yehonatanmarko100@gmail.com is able to add admins.");
        return;
      }

      const preApprovedRef = doc(db, "users", `preApproved_${searchedEmail}`);
      await setDoc(preApprovedRef, {
        email: searchedEmail,
        name: `Pre-approved ${newRole}`,
        role: newRole,
        isPreApproved: true
      });

      alert(`Successfully pre-approved ${searchedEmail} as ${newRole}! When they sign in, they will automatically receive this role.`);
      setEmailToSearch("");
      setSearchResults([]);
      setSearchedEmail("");
      loadStaffUsers();
    } catch (e: any) {
      console.error(e);
      alert("Failed to pre-approve: " + e.message);
    }
  };

  const liftBan = async (targetUserId: string) => {
    try {
      const userDocRef = doc(db, "users", targetUserId);
      await updateDoc(userDocRef, {
        isBannedUntil: null,
        spamWarningCount: 0
      });
      alert("Ban lifted!");
      loadFlaggedUsers();
    } catch (e: any) {
      console.error(e);
      alert("Failed to lift ban: " + e.message);
    }
  };

  const addDedication = async () => {
    if (!newDedicationName.trim() || !newDedicationParent.trim()) {
      alert("Please enter both name and parent's name.");
      return;
    }
    try {
      await addDoc(collection(db, "blessing_dedications"), {
        category: newDedicationCategory,
        name: newDedicationName.trim(),
        parentName: newDedicationParent.trim(),
        gender: newDedicationGender,
        listType: newDedicationListType,
        durationDays: newDedicationListType === "temporary" ? parseInt(newDedicationDays) || 30 : null,
        createdAt: serverTimestamp()
      });
      setNewDedicationName("");
      setNewDedicationParent("");
      setNewDedicationGender("male");
      setNewDedicationListType("temporary");
      setNewDedicationDays("30");
      alert("Dedication added successfully!");
    } catch (e: any) {
      console.error(e);
      alert("Failed to add dedication: " + e.message);
    }
  };

  const removeDedication = async (id: string) => {
    try {
      await deleteDoc(doc(db, "blessing_dedications", id));
      alert("Dedication removed.");
    } catch (e: any) {
      console.error(e);
      alert("Failed to remove dedication: " + e.message);
    }
  };

  // Ensure current user is admin, mainly a visual check.
  const isSuperAdminEmail = user?.email === "yehonatanmarko100@gmail.com";

  return (
    <div className="p-4 bg-muted/20 min-h-screen">
      <h2 className="text-2xl font-bold text-primary mb-4">Super Admin Dashboard</h2>
      
      <div className="bg-card p-4 rounded-xl shadow-sm mb-6 border">
        <h3 className="font-semibold mb-2">User Lookup</h3>
        <div className="flex gap-2 mb-4">
          <Input 
            className="bg-transparent"
            placeholder="User Email" 
            value={emailToSearch} 
            onChange={e => setEmailToSearch(e.target.value)} 
          />
          <Button onClick={searchUser}>Search</Button>
        </div>
        
        {searchResults.map((u: any) => (
          <div key={u.id} className="p-3 border rounded-lg flex justify-between items-center bg-background mb-2">
            <div>
              <p className="font-medium">{u.name} ({u.email})</p>
              <p className="text-xs text-muted-foreground">Role: {u.role}</p>
            </div>
            <div className="flex gap-2">
              {u.role !== 'rav' && u.role !== 'admin' && (
                <Button size="sm" onClick={() => promoteUser(u.id, u.email, "rav")}>Promote to Rav</Button>
              )}
              {isSuperAdminEmail && u.role !== 'admin' && (
                <Button size="sm" variant="secondary" onClick={() => promoteUser(u.id, u.email, "admin")}>Promote to Admin</Button>
              )}
              {isSuperAdminEmail && u.role === 'admin' && u.email !== "yehonatanmarko100@gmail.com" && (
                <Button size="sm" variant="destructive" onClick={() => demoteUser(u.id, "rav")}>Demote to Rav</Button>
              )}
              
              {((isSuperAdminEmail && (u.role === 'admin' || u.role === 'rav') && u.email !== "yehonatanmarko100@gmail.com") || u.role === 'rav') && (
                <Button size="sm" variant="destructive" onClick={() => demoteUser(u.id, "user")}>Demote to User</Button>
              )}
              {u.role !== 'admin' && u.role !== 'rav' && (
                <>
                  {(!u.bannedUntil || u.bannedUntil < Date.now() && u.bannedUntil !== -1) ? (
                    <select 
                      className="text-sm border rounded p-1 bg-destructive/10 text-destructive border-destructive"
                      onChange={(e) => {
                        if(e.target.value) {
                           banUser(u.id, e.target.value as any);
                           e.target.value = '';
                        }
                      }}
                      title="Ban User"
                    >
                      <option value="">Ban User...</option>
                      <option value="24h">Ban 24 Hours</option>
                      <option value="7d">Ban 7 Days</option>
                      <option value="forever">Ban Forever</option>
                    </select>
                  ) : (
                    <Button size="sm" variant="outline" className="text-destructive border-destructive" onClick={() => unbanUser(u.id)}>Unban</Button>
                  )}
                </>
              )}

            </div>
          </div>
        ))}

        {searchResults.length === 0 && searchedEmail && (
          <div className="p-4 border border-dashed rounded-lg text-center bg-background">
            <p className="text-sm text-muted-foreground mb-3">No registered user with email: <strong>{searchedEmail}</strong></p>
            <div className="flex justify-center gap-2">
              <Button size="sm" onClick={() => addPreApprovedUser("rav")}>Add to Ravs List</Button>
              {isSuperAdminEmail && (
                <Button size="sm" variant="secondary" onClick={() => addPreApprovedUser("admin")}>Add to Admins List</Button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-card p-4 rounded-xl shadow-sm border mb-6">
        <h3 className="font-semibold mb-4">Staff Directory (Admins & Ravs)</h3>
        <div className="space-y-6">
          
          <div>
            <h4 className="font-medium text-sm text-primary mb-2 uppercase tracking-wider">Admins</h4>
            <div className="space-y-2">
              {staffUsers.filter((u: any) => u.role === 'admin').map((u: any) => (
                <div key={u.id} className="p-3 border rounded-lg flex justify-between items-center bg-background">
                  <div>
                    <p className="font-medium">{u.name} ({u.email})</p>
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">{u.role}</p>
                  </div>
                  {isSuperAdminEmail && u.email !== "yehonatanmarko100@gmail.com" && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => demoteUser(u.id, "rav")}>Demote to Rav</Button>
                      <Button size="sm" variant="destructive" onClick={() => demoteUser(u.id, "user")}>Demote to User</Button>
                    </div>
                  )}
                </div>
              ))}
              {staffUsers.filter((u: any) => u.role === 'admin').length === 0 && <p className="text-sm text-muted-foreground">No admins found.</p>}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm text-primary mb-2 uppercase tracking-wider">Ravs</h4>
            <div className="space-y-2">
              {staffUsers.filter((u: any) => u.role === 'rav').map((u: any) => (
                <div key={u.id} className="p-3 border rounded-lg flex justify-between items-center bg-background">
                  <div>
                    <p className="font-medium">{u.name} ({u.email})</p>
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">{u.role}</p>
                  </div>
                  <Button size="sm" variant="destructive" onClick={() => demoteUser(u.id, "user")}>Demote to User</Button>
                </div>
              ))}
              {staffUsers.filter((u: any) => u.role === 'rav').length === 0 && <p className="text-sm text-muted-foreground">No ravs found.</p>}
            </div>
          </div>

        </div>
      </div>

      <div className="bg-card p-4 rounded-xl shadow-sm border mb-6">
        <h3 className="font-semibold mb-4">Manage Blessings Dedications</h3>
        
        <div className="space-y-4 mb-6">
          <h4 className="text-sm font-medium text-muted-foreground">Add New Dedication</h4>
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
            <Select value={newDedicationCategory} onValueChange={setNewDedicationCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="לעילוי נשמת">לעילוי נשמת</SelectItem>
                <SelectItem value="לרפואת">לרפואת</SelectItem>
                <SelectItem value="להצלחת">להצלחת</SelectItem>
                <SelectItem value="לזיווג הגון">לזיווג הגון</SelectItem>
                <SelectItem value="לזרע של קיימא">לזרע של קיימא</SelectItem>
              </SelectContent>
            </Select>
            <Input 
              placeholder="Person's Name" 
              value={newDedicationName} 
              onChange={e => setNewDedicationName(e.target.value)} 
            />
            <Select value={newDedicationGender} onValueChange={setNewDedicationGender}>
              <SelectTrigger>
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">בן</SelectItem>
                <SelectItem value="female">בת</SelectItem>
              </SelectContent>
            </Select>
            <Input 
              placeholder="Parent's Name" 
              value={newDedicationParent} 
              onChange={e => setNewDedicationParent(e.target.value)} 
            />
            <Select value={newDedicationListType} onValueChange={setNewDedicationListType}>
              <SelectTrigger>
                <SelectValue placeholder="List Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="temporary">Temporary</SelectItem>
                <SelectItem value="permanent">Permanent</SelectItem>
              </SelectContent>
            </Select>
            {newDedicationListType === "temporary" && (
              <Input 
                type="number"
                placeholder="Days" 
                value={newDedicationDays} 
                onChange={e => setNewDedicationDays(e.target.value)} 
                min="1"
              />
            )}
          </div>
          <Button onClick={addDedication} className="w-full sm:w-auto">Add Dedication</Button>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Temporary Dedications ({dedications.filter(d => d.listType !== 'permanent').length})</h4>
            {dedications.filter(d => d.listType !== 'permanent').map(d => (
              <div key={d.id} className="p-3 border rounded-lg bg-background flex justify-between items-center gap-4">
                <div>
                  <p className="font-medium">{d.category} {d.name} {d.gender === 'female' ? 'בת' : 'בן'} {d.parentName}</p>
                  <p className="text-xs text-muted-foreground">Added: {d.createdAt?.seconds ? new Date(d.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}</p>
                </div>
                <Button size="sm" variant="destructive" onClick={() => removeDedication(d.id)} className="shrink-0">Remove</Button>
              </div>
            ))}
            {dedications.filter(d => d.listType !== 'permanent').length === 0 && <p className="text-sm text-muted-foreground italic">No temporary dedications.</p>}
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Permanent Dedications ({dedications.filter(d => d.listType === 'permanent').length})</h4>
            {dedications.filter(d => d.listType === 'permanent').map(d => (
              <div key={d.id} className="p-3 border rounded-lg bg-background flex justify-between items-center gap-4">
                <div>
                  <p className="font-medium">{d.category} {d.name} {d.gender === 'female' ? 'בת' : 'בן'} {d.parentName}</p>
                  <p className="text-xs text-muted-foreground">Added: {d.createdAt?.seconds ? new Date(d.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}</p>
                </div>
                <Button size="sm" variant="destructive" onClick={() => removeDedication(d.id)} className="shrink-0">Remove</Button>
              </div>
            ))}
            {dedications.filter(d => d.listType === 'permanent').length === 0 && <p className="text-sm text-muted-foreground italic">No permanent dedications.</p>}
          </div>
        </div>
      </div>

      <div className="bg-card p-4 rounded-xl shadow-sm border">
        <h3 className="font-semibold mb-4">Flagged or Banned Users</h3>
        <div className="space-y-3">
          {flaggedUsers.map((u: any) => (
            <div key={u.id} className="p-3 border rounded-lg flex justify-between items-center bg-background">
              <div>
                <p className="font-medium">{u.name} ({u.email})</p>
                <p className="text-xs text-muted-foreground">
                  Spam warnings: {u.spamWarningCount || 0}
                  {u.isBannedUntil && <span> | Banned until: {new Date(u.isBannedUntil.seconds * 1000).toLocaleString()}</span>}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => liftBan(u.id)}>Lift Ban</Button>
            </div>
          ))}
          {flaggedUsers.length === 0 && <p className="text-sm text-muted-foreground">No flagged users at this time.</p>}
        </div>
      </div>
    </div>
  );
}
