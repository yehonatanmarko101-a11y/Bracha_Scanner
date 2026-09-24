const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const banFunction = `
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
`;

code = code.replace(
  'const demoteUser = async (targetUserId: string, newRole: "rav" | "user") => {',
  banFunction + '\n  const demoteUser = async (targetUserId: string, newRole: "rav" | "user") => {'
);

// Add Banned status display in the search result
const statusCheck = `
            <div>
              <p className="font-semibold">{u.name}</p>
              <p className="text-sm text-muted-foreground">{u.email}</p>
              <p className="text-xs text-muted-foreground">Role: {u.role}</p>
              {u.bannedUntil === -1 && <p className="text-xs text-destructive font-bold mt-1">BANNED (Forever)</p>}
              {u.bannedUntil > Date.now() && <p className="text-xs text-destructive font-bold mt-1">BANNED (Until {new Date(u.bannedUntil).toLocaleDateString()})</p>}
            </div>
`;
code = code.replace(
  /<div>\s*<p className="font-semibold">\{u\.name\}<\/p>\s*<p className="text-sm text-muted-foreground">\{u\.email\}<\/p>\s*<p className="text-xs text-muted-foreground">Role: \{u\.role\}<\/p>\s*<\/div>/g,
  statusCheck
);

// Add ban buttons in the search result
const actionButtons = `
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
`;

code = code.replace(
  /\{\(\(isSuperAdminEmail && \(u\.role === 'admin' \|\| u\.role === 'rav'\) && u\.email !== "yehonatanmarko100@gmail\.com"\) \|\| u\.role === 'rav'\) && \(\s*<Button size="sm" variant="destructive" onClick=\{\(\) => demoteUser\(u\.id, "user"\)\}>Demote to User<\/Button>\s*\)\}/g,
  actionButtons
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
