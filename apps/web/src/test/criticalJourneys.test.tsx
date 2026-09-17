import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../components/ui';
import { EmployerMissionPage, EmployerPlanningPage } from '../features/employer/EmployerPages';
import { StructureRegistrationPage } from '../features/auth/pages';

function renderWithProviders(element: React.ReactElement, initialEntries = ['/']) { const client = new QueryClient({ defaultOptions: { queries: { retry: false } } }); return render(<MemoryRouter initialEntries={initialEntries}><QueryClientProvider client={client}><ToastProvider>{element}</ToastProvider></QueryClientProvider></MemoryRouter>); }

describe('parcours critiques F16', () => {
  it('inscription structure nominale en trois étapes', async () => {
    const user = userEvent.setup(); renderWithProviders(<StructureRegistrationPage />);
    await user.type(screen.getByLabelText(/SIRET/), '73282932000074'); await user.click(screen.getByRole('button', { name: 'Continuer' }));
    const school = await screen.findByPlaceholderText('Jacques Prévert'); await user.type(school, 'Jacques'); await screen.findByRole('option', { name: /École élémentaire Jacques Prévert/ }); await user.click(screen.getByRole('option', { name: /École élémentaire Jacques Prévert/ })); await user.click(screen.getByRole('button', { name: 'Voir les seuils' }));
    expect(await screen.findByRole('heading', { name: '3. Ce que nous en déduisons' })).toBeInTheDocument(); await user.click(screen.getByRole('button', { name: 'Enregistrer ma structure' })); expect(await screen.findByRole('heading', { name: 'Structure enregistrée' })).toBeInTheDocument();
  });

  it('déclaration de créneau et franchissement du seuil', async () => {
    const user = userEvent.setup(); renderWithProviders(<EmployerPlanningPage />); await screen.findAllByRole('button', { name: /Conforme/ }); await user.click(screen.getAllByRole('button', { name: /Conforme/ })[0]); await user.click(screen.getByRole('button', { name: 'Retirer un animateur' })); expect(await screen.findByText('Seuil franchi : 1 animateur à trouver. La mission est ouverte automatiquement.')).toBeInTheDocument(); expect(screen.getAllByRole('button', { name: /2 \/ 3.*Défaut/ })).toHaveLength(1);
  });

  it('matching nominal et génération de contrat', async () => {
    const user = userEvent.setup(); renderWithProviders(<EmployerMissionPage />, ['/employeur/missions/mission-thu-evening']); await waitFor(() => expect(screen.getAllByRole('button', { name: 'Sélectionner ce candidat' }).length).toBeGreaterThan(0)); await user.click(screen.getAllByRole('button', { name: 'Sélectionner ce candidat' })[0]); expect(await screen.findByText('Contrat généré')).toBeInTheDocument(); expect(screen.getByText('Aperçu du contrat')).toBeInTheDocument(); expect(screen.getByText('Pourvue')).toBeInTheDocument();
  });
});
