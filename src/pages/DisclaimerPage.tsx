import { Button } from "@/components/ui/button";
import { useSettings } from "../contexts/SettingsContext";

export default function DisclaimerPage() {
  const { t, setHasAcceptedDisclaimer } = useSettings();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-sm space-y-6">
        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl font-bold">!</span>
        </div>
        <h1 className="text-3xl font-serif font-bold text-foreground">
          {t('disclaimer_title')}
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          {t('disclaimer_msg')}
        </p>
        <Button 
          size="lg" 
          className="w-full mt-8 rounded-full text-lg py-6"
          onClick={() => setHasAcceptedDisclaimer(true)}
        >
          {t('disclaimer_btn')}
        </Button>
      </div>
    </div>
  );
}
