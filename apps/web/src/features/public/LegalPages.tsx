import { Link } from 'react-router-dom';
import { useDocumentMeta } from '../../lib/seo';
import './public.css';

function LegalLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return <main id="main-content" className="legal-page">
    <header className="legal-page__header"><Link to="/" aria-label="Retour à l'accueil"><img src="/logo-apik.svg" alt="Apik" width="56" height="56" /></Link><Link to="/">Accueil</Link></header>
    <article className="legal-page__content"><p className="public-kicker">Apik</p><h1>{title}</h1>{children}</article>
  </main>;
}

export function PrivacyPage() {
  useDocumentMeta('Politique de confidentialité · Apik', 'Découvrez comment Apik protège et traite vos données personnelles.');
  return <LegalLayout title="Politique de confidentialité"><p className="legal-notice">Document à compléter et à faire valider par le responsable de traitement et un conseil juridique avant mise en production.</p><h2>Données traitées</h2><p>Apik traite les données nécessaires à la création de compte, à la vérification des profils, au calcul de conformité et à la mise en relation entre structures et animateurs.</p><h2>Vos droits</h2><p>Vous pouvez demander l'accès, la rectification, l'effacement, la limitation ou la portabilité de vos données, selon les conditions prévues par le RGPD.</p><h2>Conservation et contact</h2><p>La durée de conservation, l'identité du responsable de traitement, le contact dédié et les éventuels sous-traitants doivent être renseignés avant publication.</p></LegalLayout>;
}

export function TermsPage() {
  useDocumentMeta('Conditions générales d’utilisation · Apik', 'Consultez les conditions générales d’utilisation du service Apik.');
  return <LegalLayout title="Conditions générales d’utilisation"><p className="legal-notice">Document à compléter et à faire valider juridiquement avant mise en production.</p><h2>Objet du service</h2><p>Apik facilite le suivi des seuils d'encadrement périscolaire et la mise en relation entre structures et animateurs.</p><h2>Comptes et responsabilités</h2><p>Chaque utilisateur est responsable de l'exactitude de ses informations, de la sécurité de ses accès et du respect des obligations applicables à son activité.</p><h2>Informations à compléter</h2><p>L'identité de l'éditeur, les conditions tarifaires éventuelles, les règles de suspension, le droit applicable et les coordonnées de contact doivent être validés et ajoutés.</p></LegalLayout>;
}

export function NotFoundPage() {
  useDocumentMeta('Page introuvable · Apik', 'La page demandée n’existe pas ou a été déplacée.');
  return <LegalLayout title="Page introuvable"><p>Cette page n'existe pas ou a été déplacée.</p><Link className="public-button public-button--primary" to="/">Retour à l'accueil</Link></LegalLayout>;
}
