import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";

export default function PrivacyPolicyPage() {
  const { language } = useSettings();
  const isHe = language === 'he';

  return (
    <div className={`min-h-screen bg-background p-4 sm:p-6 md:p-8 flex justify-center pb-24 ${isHe ? 'text-right' : 'text-left'}`} dir={isHe ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-2xl bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8 mt-4 md:mt-8 relative">
        <Link 
          to="/" 
          className={`absolute top-6 ${isHe ? 'left-6' : 'right-6'} w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors`}
        >
          <ArrowLeft size={20} className="text-muted-foreground" />
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
             <Shield className="text-primary" size={24} />
          </div>
          <h1 className="text-2xl font-serif font-bold text-foreground">
            {isHe ? "מדיניות פרטיות" : "Privacy Policy"}
          </h1>
        </div>

        <div className="prose prose-sm prose-p:text-muted-foreground prose-headings:text-foreground">
          {isHe ? (
            <>
              <p>תאריך עדכון אחרון: {new Date().toLocaleDateString('he-IL')}</p>
              
              <h2 className="text-lg font-bold mt-6 mb-2">1. אוסף הנתונים</h2>
              <p>
                האפליקציה "ברכות" אוספת מידע מינימלי וחיוני בלבד לפעולתה. המידע עשוי לכלול תמונות של מזון שאתה מצלם, בחירות הגדרות אישיות (כגון מנהג), והיסטוריית בקשות לאחזור שאתה בוחר לשמור בחשבונך.
              </p>
              
              <h2 className="text-lg font-bold mt-6 mb-2">2. שימוש במידע</h2>
              <p>
                התמונות נועדו לניתוח בזמן אמת על-ידי מערכות בינה מלאכותית בכדי לזהות מאכלים ולספק את הברכות הנכונות. המידע נשמר באופן מאובטח בתשתיות ענן מקצועיות ומוכרות, ואינו נמכר או מועבר לצדדים שלישיים לצרכי פרסום. בעת דיווח על "שאל את הרב" או "דיווח על מאכל חסר", הבקשות מעובדות פנימית ונשמרות במערכות המידע המאובטחות של האפליקציה.
              </p>

              <h2 className="text-lg font-bold mt-6 mb-2">3. שמירת נתונים ואבטחה</h2>
              <p>
                אנו נוקטים באמצעי אבטחה מחמירים בהתאם לסטנדרטים המקובלים בתעשייה להגנה על המידע שלך. תמונות והיסטוריית שימוש נשמרים בענן בשרתים מאובטחים כדי לאפשר לך גישה למידע שלך מכל מכשיר. כל התקשורת מתבצעת על גבי חיבורים מוצפנים ומאובטחים (HTTPS).
              </p>

              <h2 className="text-lg font-bold mt-6 mb-2">4. המשתמש וזכויותיו</h2>
              <p>
                אם יצרת חשבון באפליקציה, תוכל בכל עת לגשת לנתוניך ולהיסטוריה דרך דף ה"פרופיל", וליצור קשר במידה ותרצה למחוק את החשבון והמידע שיצרת משרתינו.
              </p>

              <h2 className="text-lg font-bold mt-6 mb-2">5. פרטי התקשרות</h2>
              <p>
                לשאלות בנושא מדיניות פרטיות, ניתן ליצור עימנו קשר באמצעות מערכת "שאל את הרב" או לעדכן אותנו בכל נושא באפליקציה.
              </p>
            </>
          ) : (
            <>
              <p>Last updated: {new Date().toLocaleDateString('en-US')}</p>

              <h2 className="text-lg font-bold mt-6 mb-2">1. Data Collection</h2>
              <p>
                The "Brachot" app collects only the minimum necessary functionality data. Information collected may include images of food you scan, individual configuration choices (like your minhag/tradition), and history logs and questions that you affirmatively choose to save to your account.
              </p>

              <h2 className="text-lg font-bold mt-6 mb-2">2. Use of Information</h2>
              <p>
                Images are used for real-time analysis by artificial intelligence systems to identify foods and suggest correct blessings. Your information is securely stored in professional cloud infrastructure. None of your data is sold or shared with third parties for marketing or advertising. Information such as "Ask a Rav" or missing food feedback is stored securely within the application's secure databases.
              </p>

              <h2 className="text-lg font-bold mt-6 mb-2">3. Data Security and Retention</h2>
              <p>
                We use industry-standard security principles and infrastructure to protect your data. Images and usage history are stored securely in the cloud to allow you cross-device access to your personal history. All network interactions happen over encrypted and secure connections (HTTPS).
              </p>

              <h2 className="text-lg font-bold mt-6 mb-2">4. User Rights</h2>
              <p>
                By creating an account, you can access your profile to view stored data. Should you desire your account or any related stored questions deleted from our servers, you may reach out and we will delete your record manually.
              </p>

              <h2 className="text-lg font-bold mt-6 mb-2">5. Contact Information</h2>
              <p>
                If you have privacy-related concerns or wish to request data deletions, you can reach out via the "Ask the Rav" module or any contact methodology provided in-app.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
