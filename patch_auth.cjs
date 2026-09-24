const fs = require('fs');
let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

code = code.replace(
  '          unsubscribeUserDoc = onSnapshot(userRef, async (docSnap) => {',
  '          unsubscribeUserDoc = onSnapshot(userRef, async (docSnap) => {'
);

code = code.replace(
  '            setRole(currentRole as any);\n            setLoading(false);\n          });\n        } catch (error) {',
  '            setRole(currentRole as any);\n            setLoading(false);\n          }, (error) => {\n            console.warn("User document listener error:", error);\n            // If permission denied during signout, ignore\n          });\n        } catch (error) {'
);

fs.writeFileSync('src/contexts/AuthContext.tsx', code);
