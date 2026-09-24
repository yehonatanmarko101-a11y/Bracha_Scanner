import { admin } from "../lib/firebaseAdmin";

export async function verifyAppCheck(req: any, res: any, next: any) {
    const appCheckToken = req.header('X-Firebase-AppCheck');

    if (!appCheckToken) {
        if (process.env.NODE_ENV !== "production" || !process.env.ENFORCE_APP_CHECK) {
             console.warn("App Check token missing, bypassing for development/preview.");
             return next();
        }
        return res.status(401).json({ error: 'Unauthorized: App Check token missing' });
    }

    try {
        const appCheckClaims = await admin.appCheck().verifyToken(appCheckToken);
        // If verifyToken() succeeds, the token is valid.
        req.appCheckClaims = appCheckClaims;
        return next();
    } catch (err) {
        console.error("App Check verification failed", err);
        if (process.env.NODE_ENV !== "production" || !process.env.ENFORCE_APP_CHECK) {
             console.warn("App Check token invalid, bypassing for development/preview.");
             return next();
        }
        return res.status(401).json({ error: 'Unauthorized: Invalid App Check token' });
    }
}
