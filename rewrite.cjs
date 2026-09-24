const fs = require('fs');

let content = fs.readFileSync('src/pages/ScanPage.tsx', 'utf-8');

const startIndex = content.indexOf('{/* VERIFICATION STEP */}');
const endIndex = content.indexOf('{!imageSrc && (');

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find blocks");
  process.exit(1);
}

const replacement = `
        {scanResult && !isScanning && (
          <Card className="w-full max-w-sm animate-in slide-in-from-bottom-4 shadow-2xl border-none shrink-0 mb-8 flex flex-col h-full max-h-[80vh] overflow-y-auto">
            <CardContent className="p-0 flex flex-col h-full relative">
               
               {/* Header Section */}
               <div className="bg-primary text-primary-foreground p-4 text-center rounded-t-xl shrink-0 flex items-center justify-between">
                  <div className="text-left flex-1 min-w-0 pr-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wider opacity-80 mb-0.5">{t('identified')}</h2>
                    <h3 className="text-2xl font-bold truncate">{scanResult.name}</h3>
                    {scanResult.confidence > 0 && <p className="text-xs opacity-90">Confidence: {Math.round(scanResult.confidence * 100)}%</p>}
                  </div>
                  <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-white/20 shrink-0">
                    <img src={imageSrc as string} className="w-full h-full object-cover" alt="Scanned food" />
                  </div>
               </div>

               {/* Multiple Blessings Alert */}
               {scanResult.requires_multiple_blessings && (
                  <div className="bg-blue-50 dark:bg-blue-950/30 p-3 flex items-start gap-2 border-b border-blue-100 dark:border-blue-900/50">
                    <Info className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" size={16} />
                    <p className="text-xs font-medium text-blue-800 dark:text-blue-300">
                      This food requires multiple blessings depending on how you eat it. Read carefully.
                    </p>
                  </div>
               )}

               <div className="p-4 flex-1 flex flex-col bg-card overflow-y-auto">
                 
                 {/* Blessing Card */}
                 <div className="bg-muted p-4 rounded-xl text-center shadow-sm mb-4">
                   <h3 className="text-2xl font-hebrew font-bold mb-1 min-h-[30px] leading-tight text-foreground" dir="rtl">
                      {scanResult.details?.traditions?.[tradition]?.text || scanResult.details?.hebrew_text || "שֶׁהַכֹּל נִהְיֶה בִּדְבָרוֹ"}
                   </h3>
                   <p className="text-sm italic opacity-80 text-muted-foreground">{scanResult.details?.transliteration}</p>
                 </div>

                 {/* AI Tag */}
                 <div className="flex items-center justify-between bg-orange-50 dark:bg-orange-950/30 p-2.5 rounded-lg border border-orange-200 dark:border-orange-900/50 mb-4">
                    <span className="text-xs font-medium text-orange-800 dark:text-orange-300 flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"/>
                      {t('ai_disclaimer')}
                    </span>
                    <Link to="/ask" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                      {t('ask_rabbi')} <ExternalLink size={10} />
                    </Link>
                 </div>

                 {/* Instructions */}
                 <div className="mb-4">
                   <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{t('how_to_eat')}</h4>
                   <div className="bg-muted/30 border border-border/50 p-3.5 rounded-xl">
                     <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                       {renderTextWithLinks(language === 'he' ? (scanResult.how_to_eat_instructions_he || scanResult.details?.instructions?.he) : (scanResult.how_to_eat_instructions_en || scanResult.details?.instructions?.en || "1. Say blessing.\\n2. Eat food."))}
                     </p>
                   </div>
                 </div>

                 {/* Feedback Section */}
                 <div className="pt-2 mt-auto">
                   <h4 className="text-xs font-semibold text-center mb-2 text-muted-foreground">Was this helpful?</h4>
                   <div className="flex gap-2">
                     <Button 
                      variant="outline" 
                      className="flex-1 rounded-xl h-10 border-success/30 hover:bg-success/10 hover:text-success"
                      onClick={() => handleFeedback("up")}
                     >
                       <ThumbsUp size={16} className="mr-2" /> Yes
                     </Button>
                     <Button 
                      variant="outline" 
                      className="flex-1 rounded-xl h-10 border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => {
                        setFeedbackType("down");
                        setShowFeedbackModal(true);
                      }}
                     >
                       <ThumbsDown size={16} className="mr-2" /> No
                     </Button>
                   </div>
                   {feedbackSuccess && <p className="text-xs text-center text-success mt-2 font-medium">Thanks! We'll improve based on your feedback.</p>}
                 </div>

                 <Button onClick={retake} variant="secondary" className="w-full rounded-xl py-5 font-semibold mt-4">
                    {t('scan_another')}
                 </Button>
               </div>
            </CardContent>
          </Card>
        )}
        
`;

content = content.substring(0, startIndex) + replacement + content.substring(endIndex);

// Add handleFeedback fn
const handleSaveToHistoryMarker = 'const handleSaveToHistory = async (resultToSave: any) => {';
const handleFeedbackFn = `
  const submitFeedbackText = async () => {
    if (!user || !scanResult) return;
    try {
      await addDoc(collection(db, \`feedbacks\`), {
        userId: user.uid,
        foodDetected: scanResult.name,
        confidence: scanResult.confidence,
        explanation: feedbackText,
        language: language,
        tradition: tradition,
        timestamp: serverTimestamp()
      });
      setShowFeedbackModal(false);
      setFeedbackText("");
      setFeedbackSuccess(true);
      setTimeout(() => setFeedbackSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFeedback = async (type: "up") => {
    setFeedbackSuccess(true);
    setTimeout(() => setFeedbackSuccess(false), 2000);
    if (!user || !scanResult) return;
    try {
      await addDoc(collection(db, \`feedbacks\`), {
        userId: user.uid,
        foodDetected: scanResult.name,
        confidence: scanResult.confidence,
        type: type,
        language: language,
        tradition: tradition,
        timestamp: serverTimestamp()
      });
    } catch(e) {}
  };

`;

content = content.replace(handleSaveToHistoryMarker, handleFeedbackFn + handleSaveToHistoryMarker);

// Add the feedback modal to the end of the return statement
const modalCode = `
      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-lg font-bold text-foreground">What was wrong?</h3>
              <p className="text-sm text-muted-foreground">Examples: Wrong food detected, Instructions unclear, Missing information.</p>
              <textarea 
                className="w-full min-h-[100px] p-3 text-sm rounded-xl border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Please explain the issue..."
                value={feedbackText}
                maxLength={300}
                onChange={(e) => setFeedbackText(e.target.value)}
              />
              <div className="flex gap-3 justify-end items-center">
                <span className="text-xs text-muted-foreground flex-1">{feedbackText.length}/300</span>
                <Button variant="ghost" onClick={() => setShowFeedbackModal(false)}>Cancel</Button>
                <Button onClick={submitFeedbackText} disabled={!feedbackText.trim()}>Submit</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
`;

content = content.replace(/    <\/div>\n  \);\n}\n$/, modalCode);

const bigImageMarker = `        ) : (
          <div className="relative w-full max-w-sm aspect-square md:aspect-[3/4] rounded-2xl overflow-hidden shadow-lg shrink-0">
            <img src={imageSrc} alt="Scanned food" className="w-full h-full object-cover" />
            {isScanning && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-md">
                <RefreshCw className="animate-spin mb-4" size={32} />
                <p className="font-medium text-lg">{t('identifying')}</p>
              </div>
            )}
          </div>
        )}`;

const newBigImage = `        ) : (
          (!scanResult || isScanning) && (
            <div className="relative w-full max-w-sm aspect-square md:aspect-[3/4] rounded-2xl overflow-hidden shadow-lg shrink-0">
              <img src={imageSrc} alt="Scanned food" className="w-full h-full object-cover" />
              {isScanning && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-md">
                  <RefreshCw className="animate-spin mb-4" size={32} />
                  <p className="font-medium text-lg">{t('identifying')}</p>
                </div>
              )}
            </div>
          )
        )}`;

content = content.replace(bigImageMarker, newBigImage);


fs.writeFileSync('src/pages/ScanPage.tsx', content);
