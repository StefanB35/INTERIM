import { useEffect, useState } from 'react';

const consentKey = 'apik-cookie-consent';

type ConsentChoice = 'accepted' | 'refused';

export function ConsentBanner() {
  const [choice, setChoice] = useState<ConsentChoice | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(consentKey);
    if (stored === 'accepted' || stored === 'refused') setChoice(stored);
  }, []);

  const saveChoice = (value: ConsentChoice) => {
    window.localStorage.setItem(consentKey, value);
    setChoice(value);
  };

  if (choice) return null;

  return <aside className="consent-banner" aria-label="Préférences de cookies">
    <div>
      <strong>Votre confidentialité compte.</strong>
      <p>Apik n'active aucun outil de mesure non essentiel sans votre choix.</p>
    </div>
    <div className="consent-banner__actions">
      <button type="button" onClick={() => saveChoice('refused')}>Refuser</button>
      <button type="button" onClick={() => saveChoice('accepted')}>Accepter</button>
    </div>
  </aside>;
}
