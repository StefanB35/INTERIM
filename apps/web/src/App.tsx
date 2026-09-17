import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider, RequireAuth, RequireRole } from './features/auth/AuthProvider';
import { ConsentBanner } from './components/ConsentBanner';

const Styleguide = lazy(() => import('./app/Styleguide').then((module) => ({ default: module.Styleguide })));
const LoginPage = lazy(() => import('./features/auth/pages').then((module) => ({ default: module.LoginPage })));
const RegistrationChoicePage = lazy(() => import('./features/auth/pages').then((module) => ({ default: module.RegistrationChoicePage })));
const StructureRegistrationPage = lazy(() => import('./features/auth/pages').then((module) => ({ default: module.StructureRegistrationPage })));
const AnimatorRegistrationPage = lazy(() => import('./features/auth/pages').then((module) => ({ default: module.AnimatorRegistrationPage })));
const HomePage = lazy(() => import('./features/public/PublicPages').then((module) => ({ default: module.HomePage })));
const PublicMissionPage = lazy(() => import('./features/public/PublicPages').then((module) => ({ default: module.PublicMissionPage })));
const PrivacyPage = lazy(() => import('./features/public/LegalPages').then((module) => ({ default: module.PrivacyPage })));
const TermsPage = lazy(() => import('./features/public/LegalPages').then((module) => ({ default: module.TermsPage })));
const NotFoundPage = lazy(() => import('./features/public/LegalPages').then((module) => ({ default: module.NotFoundPage })));
const EmployerDashboardPage = lazy(() => import('./features/employer/EmployerPages').then((module) => ({ default: module.EmployerDashboardPage })));
const EmployerPlanningPage = lazy(() => import('./features/employer/EmployerPages').then((module) => ({ default: module.EmployerPlanningPage })));
const EmployerMissionPage = lazy(() => import('./features/employer/EmployerPages').then((module) => ({ default: module.EmployerMissionPage })));
const AnimatorProfilePage = lazy(() => import('./features/animator/AnimatorPages').then((module) => ({ default: module.AnimatorProfilePage })));
const AnimatorAvailabilityPage = lazy(() => import('./features/animator/AnimatorPages').then((module) => ({ default: module.AnimatorAvailabilityPage })));
const AnimatorProposalsPage = lazy(() => import('./features/animator/AnimatorPages').then((module) => ({ default: module.AnimatorProposalsPage })));
const AnimatorAgendaPage = lazy(() => import('./features/animator/AnimatorPages').then((module) => ({ default: module.AnimatorAgendaPage })));
const AnimatorTensionPage = lazy(() => import('./features/animator/AnimatorPages').then((module) => ({ default: module.AnimatorTensionPage })));

function ProtectedRoute({ role, children }: { role: 'EMPLOYER' | 'ANIMATOR'; children: ReactNode }) { return <RequireAuth><RequireRole role={role}>{children}</RequireRole></RequireAuth>; }

export default function App() {
  return <BrowserRouter><a className="skip-link" href="#main-content">Aller au contenu principal</a><AuthProvider><Suspense fallback={<main id="main-content" className="auth-state"><p>Chargement...</p></main>}><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/styleguide" element={<Styleguide />} />
    <Route path="/connexion" element={<LoginPage />} />
    <Route path="/inscription" element={<RegistrationChoicePage />} />
    <Route path="/inscription/structure" element={<StructureRegistrationPage />} />
    <Route path="/inscription/animateur" element={<AnimatorRegistrationPage />} />
    <Route path="/employeur" element={<ProtectedRoute role="EMPLOYER"><EmployerDashboardPage /></ProtectedRoute>} />
    <Route path="/employeur/planning" element={<ProtectedRoute role="EMPLOYER"><EmployerPlanningPage /></ProtectedRoute>} />
    <Route path="/employeur/missions/:id" element={<ProtectedRoute role="EMPLOYER"><EmployerMissionPage /></ProtectedRoute>} />
    <Route path="/animateur" element={<ProtectedRoute role="ANIMATOR"><AnimatorProfilePage /></ProtectedRoute>} />
    <Route path="/animateur/profil" element={<ProtectedRoute role="ANIMATOR"><AnimatorProfilePage /></ProtectedRoute>} />
    <Route path="/animateur/disponibilites" element={<ProtectedRoute role="ANIMATOR"><AnimatorAvailabilityPage /></ProtectedRoute>} />
    <Route path="/animateur/propositions" element={<ProtectedRoute role="ANIMATOR"><AnimatorProposalsPage /></ProtectedRoute>} />
    <Route path="/animateur/agenda" element={<ProtectedRoute role="ANIMATOR"><AnimatorAgendaPage /></ProtectedRoute>} />
    <Route path="/animateur/tension" element={<ProtectedRoute role="ANIMATOR"><AnimatorTensionPage /></ProtectedRoute>} />
    <Route path="/missions/:slug" element={<PublicMissionPage />} />
    <Route path="/confidentialite" element={<PrivacyPage />} />
    <Route path="/cgu" element={<TermsPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes></Suspense><ConsentBanner /></AuthProvider></BrowserRouter>;
}
