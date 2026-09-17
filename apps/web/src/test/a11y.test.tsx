import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { axe } from 'vitest-axe';
import { ToastProvider } from '../components/ui';
import { Styleguide } from '../app/Styleguide';
import { AuthProvider } from '../features/auth/AuthProvider';
import { AnimatorRegistrationPage, LoginPage, RegistrationChoicePage, StructureRegistrationPage } from '../features/auth/pages';
import { AnimatorAgendaPage, AnimatorAvailabilityPage, AnimatorProposalsPage, AnimatorTensionPage } from '../features/animator/AnimatorPages';
import { AnimatorProfilePage } from '../features/animator/AnimatorPages';
import { EmployerDashboardPage, EmployerMissionPage, EmployerPlanningPage } from '../features/employer/EmployerPages';
import { HomePage, PublicMissionPage } from '../features/public/PublicPages';

function renderScreen(element: React.ReactElement, path = '/') { const client = new QueryClient({ defaultOptions: { queries: { retry: false } } }); return render(<MemoryRouter initialEntries={[path]}><QueryClientProvider client={client}><ToastProvider><AuthProvider>{element}</AuthProvider></ToastProvider></QueryClientProvider></MemoryRouter>); }
async function expectNoViolations(container: HTMLElement) { const results = await axe(container); expect(results.violations).toHaveLength(0); }

describe('audit RGAA axe des écrans principaux', () => {
  it('accueil public', async () => { const { container } = renderScreen(<HomePage />); await expectNoViolations(container); });
  it('fiche mission publique', async () => { const { container } = renderScreen(<PublicMissionPage />, '/missions/animateur-periscolaire-jeudi-soir-jacques-prevert'); await expectNoViolations(container); });
  it('dashboard employeur', async () => { const { container } = renderScreen(<EmployerDashboardPage />); await expectNoViolations(container); });
  it('planning employeur', async () => { const { container } = renderScreen(<EmployerPlanningPage />); await expectNoViolations(container); });
  it('fiche mission employeur', async () => { const { container } = renderScreen(<EmployerMissionPage />, '/employeur/missions/mission-thu-evening'); await expectNoViolations(container); });
  it('profil animateur', async () => { const { container } = renderScreen(<AnimatorProfilePage />); await expectNoViolations(container); });
  it('disponibilites animateur', async () => { const { container } = renderScreen(<AnimatorAvailabilityPage />); await expectNoViolations(container); });
  it('propositions animateur', async () => { const { container } = renderScreen(<AnimatorProposalsPage />); await expectNoViolations(container); });
  it('agenda animateur', async () => { const { container } = renderScreen(<AnimatorAgendaPage />); await expectNoViolations(container); });
  it('tension animateur', async () => { const { container } = renderScreen(<AnimatorTensionPage />); await expectNoViolations(container); });
  it('connexion', async () => { const { container } = renderScreen(<LoginPage />, '/connexion'); await expectNoViolations(container); });
  it('choix inscription', async () => { const { container } = renderScreen(<RegistrationChoicePage />, '/inscription'); await expectNoViolations(container); });
  it('inscription structure', async () => { const { container } = renderScreen(<StructureRegistrationPage />, '/inscription/structure'); await expectNoViolations(container); });
  it('inscription animateur', async () => { const { container } = renderScreen(<AnimatorRegistrationPage />, '/inscription/animateur'); await expectNoViolations(container); });
  it('styleguide', async () => { const { container } = renderScreen(<Styleguide />, '/styleguide'); await expectNoViolations(container); });
});
