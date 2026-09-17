import { http, HttpResponse } from 'msw';
import { demoAnimators, demoAvailability, demoCandidates, demoContract, demoEmployer, demoGroup, demoMatchRun, demoMission, demoProposals, demoSchool, demoSessions, demoTension, demoTensionCommunes, demoUser } from './fixtures';

const list = <T>(data: T[]) => ({ data, total: data.length });
const mockAnimatorProfiles = {
  'alex.dubois@test.apik': { ...demoAnimators[0], id: 'animator-alex-dubois', userId: 'user-animator-demo', firstName: 'Alex', lastName: 'Dubois' },
  'sarah.kone@test.apik': { ...demoAnimators[1], id: 'animator-sarah-kone', userId: 'user-animator-sarah', firstName: 'Sarah', lastName: 'Koné' },
  'thomas.leroy@test.apik': { ...demoAnimators[2], id: 'animator-thomas-leroy', userId: 'user-animator-thomas', firstName: 'Thomas', lastName: 'Leroy' },
  'animateur@apik.test': { ...demoAnimators[0], id: 'animator-demo', userId: 'user-animator-demo', firstName: 'Sofia', lastName: 'Delaunay' },
};
let currentUser = demoUser;
let currentAnimator = mockAnimatorProfiles['animateur@apik.test'];
export const handlers = [
  http.post('/api/auth/refresh', () => HttpResponse.json({ accessToken: 'mock-access-token' })),
  http.post('/api/auth/login', async ({ request }) => { const body = await request.json() as { email?: string }; const email = body.email?.toLowerCase() ?? ''; const animator = email.includes('animateur') || email in mockAnimatorProfiles; currentAnimator = mockAnimatorProfiles[email as keyof typeof mockAnimatorProfiles] ?? currentAnimator; currentUser = animator ? { ...demoUser, id: currentAnimator.userId, email: body.email ?? email, role: 'ANIMATOR' } : demoUser; return HttpResponse.json({ accessToken: 'mock-access-token', user: currentUser }); }),
  http.post('/api/auth/logout', () => { currentUser = demoUser; currentAnimator = mockAnimatorProfiles['animateur@apik.test']; return new HttpResponse(null, { status: 204 }); }),
  http.post('/api/auth/register/employer', () => HttpResponse.json({ ok: true }, { status: 201 })),
  http.post('/api/auth/register/animator', () => HttpResponse.json({ ok: true }, { status: 201 })),
  http.get('/api/me', () => HttpResponse.json(currentUser)),
  http.get('/api/employer/profile', () => HttpResponse.json(demoEmployer)),
  http.put('/api/employer/profile', async ({ request }) => HttpResponse.json({ ...demoEmployer, ...(await request.json() as object) })),
  http.get('/api/schools', () => HttpResponse.json(list([demoSchool]))),
  http.get('/api/groups', () => HttpResponse.json(list([demoGroup]))),
  http.get('/api/animators', () => HttpResponse.json(list(demoAnimators))),
  http.get('/api/animators/profile', () => HttpResponse.json(currentAnimator)),
  http.put('/api/animators/profile', async ({ request }) => { currentAnimator = { ...currentAnimator, ...(await request.json() as object) }; return HttpResponse.json(currentAnimator); }),
  http.get('/api/animators/availability', () => HttpResponse.json(list(demoAvailability))),
  http.post('/api/animators/availability', () => HttpResponse.json(demoAvailability[0], { status: 201 })),
  http.get('/api/sessions', () => HttpResponse.json(list(demoSessions))),
  http.get('/api/sessions/:id', ({ params }) => HttpResponse.json(demoSessions.find((session) => session.id === params.id) ?? demoSessions[0])),
  http.get('/api/missions', () => HttpResponse.json(list([demoMission]))),
  http.post('/api/missions', async ({ request }) => HttpResponse.json({ ...demoMission, ...(await request.json() as object) }, { status: 201 })),
  http.get('/api/missions/:id', () => HttpResponse.json(demoMission)),
  http.get('/api/missions/:id/candidates', () => HttpResponse.json(list(demoCandidates))),
  http.get('/api/match-runs/:id', () => HttpResponse.json(demoMatchRun)),
  http.get('/api/animator/proposals', () => HttpResponse.json(list(demoProposals))),
  http.post('/api/animator/proposals/:id/accept', () => HttpResponse.json({ status: 'ACCEPTED' }, { status: 200 })),
  http.post('/api/animator/proposals/:id/pass', () => HttpResponse.json({ status: 'PASSED' }, { status: 200 })),
  http.post('/api/missions/:id/apply', () => HttpResponse.json({ status: 'APPLIED' }, { status: 201 })),
  http.post('/api/missions/:id/accept', () => HttpResponse.json({ status: 'FILLED', contractId: demoContract.id }, { status: 200 })),
  http.post('/api/sessions/:id/remove-animator', () => HttpResponse.json({ removed: true }, { status: 200 })),
  http.get('/api/contracts', () => HttpResponse.json(list([demoContract]))),
  http.get('/api/tension-indicators', () => HttpResponse.json(list([demoTension]))),
  http.get('/api/tension-indicators/communes', () => HttpResponse.json(list(demoTensionCommunes))),
  http.get('/api/public/missions/:slug', () => HttpResponse.json(demoMission)),
  http.get('/api/public/missions/', () => HttpResponse.json(demoMission)),
];
