/// <reference types="node" />

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient, type LegalForm, type QualificationLevel } from '@prisma/client';

function loadRootEnv(): void {
  const envPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../../.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^"|"$/g, '');
  }
}

loadRootEnv();
const prisma = new PrismaClient();
const port = Number(process.env.PORT ?? 3000);
const sessions = new Map<string, string>();

const demoPasswords = new Set([process.env.API_DEV_PASSWORD ?? 'demo1234']);
const corsHeaders = { 'Access-Control-Allow-Origin': process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173', 'Access-Control-Allow-Credentials': 'true', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS' };

function send(response: ServerResponse, status: number, body?: unknown, headers: Record<string, string> = {}): void {
  response.writeHead(status, { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8', ...headers });
  response.end(body === undefined ? '' : JSON.stringify(body));
}
function parseCookies(request: IncomingMessage): Record<string, string> { return Object.fromEntries((request.headers.cookie ?? '').split(';').map((part) => { const separator = part.indexOf('='); return separator < 0 ? ['', ''] : [part.slice(0, separator).trim(), part.slice(separator + 1).trim()]; }).filter(([key, value]) => key && value)); }
function sessionUserId(request: IncomingMessage): string | null {
  const bearer = request.headers.authorization?.startsWith('Bearer ') ? request.headers.authorization.slice(7) : null;
  const token = bearer ?? parseCookies(request).apik_session;
  return token ? sessions.get(token) ?? null : null;
}
async function readBody(request: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  if (!chunks.length) return {};
  const value: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Corps JSON invalide.');
  return value as Record<string, unknown>;
}
function iso(value: Date | null): string | null { return value?.toISOString() ?? null; }
function userDto(user: { id: string; email: string; role: 'ANIMATOR' | 'EMPLOYER' | 'ADMIN'; status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'DELETED'; emailVerifiedAt: Date | null; lastLoginAt: Date | null; createdAt: Date; updatedAt: Date }) { return { id: user.id, email: user.email, role: user.role, status: user.status, emailVerifiedAt: iso(user.emailVerifiedAt), lastLoginAt: iso(user.lastLoginAt), createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString() }; }
function organizationDto(org: { id: string; name: string; legalForm: LegalForm; siret: string | null; nafCode: string | null; addressLine: string; postalCode: string; city: string; inseeCode: string | null; contactEmail: string; contactPhone: string | null; tamDeclarationNumber: string | null; isTamVerified: boolean; createdAt: Date; updatedAt: Date }) { return { ...org, createdAt: org.createdAt.toISOString(), updatedAt: org.updatedAt.toISOString() }; }
function animatorDto(profile: { id: string; userId: string; firstName: string; lastName: string; phone: string | null; birthDate: Date; bio: string | null; addressLine: string | null; postalCode: string; city: string; inseeCode: string | null; latitude: number | { toString(): string }; longitude: number | { toString(): string }; travelRadiusKm: number; hasVehicle: boolean; qualificationLevel: QualificationLevel; experienceYears: number; honorabilityStatus: string; honorabilityCheckedAt: Date | null; honorabilityExpiresAt: Date | null; weeklyHoursTarget: number; isSearching: boolean; profileCompletion: number }) { return { ...profile, birthDate: profile.birthDate.toISOString().slice(0, 10), latitude: Number(profile.latitude), longitude: Number(profile.longitude), honorabilityCheckedAt: iso(profile.honorabilityCheckedAt), honorabilityExpiresAt: profile.honorabilityExpiresAt?.toISOString().slice(0, 10) ?? null }; }
function dateOnly(value: Date): string { return value.toISOString().slice(0, 10); }
function listDto<T>(data: T[]): { data: T[]; total: number } { return { data, total: data.length }; }
function siteDto(site: any) { return { ...site, latitude: Number(site.latitude), longitude: Number(site.longitude), pedtValidUntil: site.pedtValidUntil ? dateOnly(site.pedtValidUntil) : null }; }
function sessionDto(session: any) { return { ...session, date: dateOnly(session.date), complianceComputedAt: iso(session.complianceComputedAt) }; }
function missionDto(mission: any) { return { ...mission, startDate: dateOnly(mission.startDate), endDate: dateOnly(mission.endDate), totalHours: Number(mission.totalHours), publishedAt: iso(mission.publishedAt), filledAt: iso(mission.filledAt), expiresAt: iso(mission.expiresAt) }; }
function contractDto(contract: any) { return { ...contract, startDate: dateOnly(contract.startDate), endDate: dateOnly(contract.endDate), weeklyHours: Number(contract.weeklyHours), generatedAt: iso(contract.generatedAt), sentAt: iso(contract.sentAt), signedAt: iso(contract.signedAt), terminatedAt: iso(contract.terminatedAt) }; }
function availabilityDto(rule: any) { return { id: rule.id, animatorProfileId: rule.animatorProfileId, weekday: rule.weekday, block: rule.block, startMinutes: rule.startMinutes, endMinutes: rule.endMinutes, validFrom: dateOnly(rule.validFrom), validUntil: rule.validUntil ? dateOnly(rule.validUntil) : null }; }
function marketDto(indicator: any) { return { ...indicator, periodStart: dateOnly(indicator.periodStart), periodEnd: dateOnly(indicator.periodEnd), medianHourlyRateCents: indicator.medianHourlyRateCents, p25HourlyRateCents: indicator.p25HourlyRateCents, p75HourlyRateCents: indicator.p75HourlyRateCents, tensionIndex: indicator.tensionIndex === null ? null : Number(indicator.tensionIndex), computedAt: indicator.computedAt.toISOString() }; }
function candidateDto(profile: any, application?: any) { return { ...animatorDto(profile), score: application?.score === null || application?.score === undefined ? null : Number(application.score), scoreBreakdown: application ? { proximity: 40, qualification: profile.qualificationLevel === 'QUALIFIED' ? 30 : profile.qualificationLevel === 'TRAINEE' ? 20 : 10, experience: profile.experienceYears >= 3 ? 20 : 10, continuity: 10 } : null, matchStatus: application?.status === 'REJECTED' ? 'REJECTED' : 'ELIGIBLE', rejectionReason: application?.status === 'REJECTED' ? 'AGENDA_CONFLICT' : null, rejectionLabel: application?.status === 'REJECTED' ? 'Candidat écarté' : null, distanceKm: 3.1 }; }
async function requireUser(request: IncomingMessage, response: ServerResponse) { const id = sessionUserId(request); if (!id) { send(response, 401, { code: 'UNAUTHENTICATED', message: 'Connexion requise.' }); return null; } return prisma.user.findUnique({ where: { id }, include: { animatorProfile: true } }); }

async function route(request: IncomingMessage, response: ServerResponse): Promise<void> {
  if (request.method === 'OPTIONS') { response.writeHead(204, corsHeaders); response.end(); return; }
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
  try {
    if (request.method === 'POST' && url.pathname === '/api/auth/login') {
      const body = await readBody(request);
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      const password = typeof body.password === 'string' ? body.password : '';
      const user = await prisma.user.findUnique({ where: { email }, include: { animatorProfile: true, memberships: true } });
      if (!user || user.status === 'DELETED' || (!demoPasswords.has(password) && user.passwordHash !== password)) { send(response, 401, { code: 'INVALID_CREDENTIALS', message: 'Identifiants invalides.' }); return; }
      const token = randomBytes(32).toString('hex'); sessions.set(token, user.id);
      send(response, 200, { accessToken: token, user: userDto(user) }, { 'Set-Cookie': `apik_session=${token}; HttpOnly; Path=/; SameSite=Lax` }); return;
    }
    if (request.method === 'POST' && url.pathname === '/api/auth/refresh') { const id = sessionUserId(request); if (!id) { send(response, 401, { code: 'SESSION_EXPIRED', message: 'Session expirée.' }); return; } const token = randomBytes(32).toString('hex'); sessions.set(token, id); send(response, 200, { accessToken: token }, { 'Set-Cookie': `apik_session=${token}; HttpOnly; Path=/; SameSite=Lax` }); return; }
    if (request.method === 'POST' && url.pathname === '/api/auth/logout') { const id = sessionUserId(request); if (id) for (const [token, userId] of sessions) if (userId === id) sessions.delete(token); send(response, 204); return; }
    if (request.method === 'POST' && url.pathname === '/api/auth/register/animator') {
      const body = await readBody(request); const email = String(body.email ?? '').trim().toLowerCase();
      const existing = await prisma.user.findUnique({ where: { email } }); if (existing) { send(response, 409, { code: 'EMAIL_EXISTS', message: 'Cette adresse email est déjà utilisée.' }); return; }
      const user = await prisma.user.create({ data: { email, passwordHash: String(body.password ?? process.env.API_DEV_PASSWORD ?? 'demo1234'), role: 'ANIMATOR', status: 'ACTIVE', emailVerifiedAt: new Date(), animatorProfile: { create: { firstName: String(body.firstName ?? ''), lastName: String(body.lastName ?? ''), phone: null, birthDate: new Date('2000-01-01'), postalCode: String(body.postalCode ?? '00000'), city: String(body.city ?? ''), latitude: 0, longitude: 0, travelRadiusKm: Number(body.travelRadiusKm ?? 15), hasVehicle: false, qualificationLevel: String(body.qualificationLevel ?? 'UNQUALIFIED') as QualificationLevel, experienceYears: Number(body.experienceYears ?? 0), isSearching: true, profileCompletion: 50 } } } });
      send(response, 201, { user: userDto(user as any) }); return;
    }
    if (request.method === 'POST' && url.pathname === '/api/auth/register/employer') {
      const body = await readBody(request); const email = String(body.email ?? `structure-${Date.now()}@apik.local`).trim().toLowerCase();
      const existing = await prisma.user.findUnique({ where: { email } }); if (existing) { send(response, 409, { code: 'EMAIL_EXISTS', message: 'Cette adresse email est déjà utilisée.' }); return; }
      const user = await prisma.user.create({ data: { email, passwordHash: String(body.password ?? process.env.API_DEV_PASSWORD ?? 'demo1234'), role: 'EMPLOYER', status: 'ACTIVE', emailVerifiedAt: new Date() } });
      const organization = await prisma.organization.create({ data: { name: String(body.name ?? 'Nouvelle structure'), legalForm: 'ASSOCIATION', siret: String(body.siret ?? `${Date.now()}` ).slice(0, 14).padEnd(14, '0'), addressLine: String(body.addressLine ?? 'À compléter'), postalCode: String(body.postalCode ?? '00000'), city: String(body.city ?? 'À compléter'), contactEmail: email } });
      await prisma.organizationMember.create({ data: { userId: user.id, organizationId: organization.id, role: 'OWNER', acceptedAt: new Date() } });
      send(response, 201, { user: userDto(user as any), organization: organizationDto(organization) }); return;
    }
    if (request.method === 'GET' && url.pathname.startsWith('/api/public/missions/')) { const slug = url.pathname.split('/').pop() ?? ''; const mission = await prisma.mission.findUnique({ where: { publicSlug: slug } }); if (!mission) { send(response, 404, { code: 'MISSION_NOT_FOUND', message: 'Mission introuvable.' }); return; } send(response, 200, missionDto(mission)); return; }
    const user = await requireUser(request, response); if (!user) return;
    if (request.method === 'GET' && url.pathname === '/api/me') { send(response, 200, userDto(user)); return; }
    if (request.method === 'GET' && url.pathname === '/api/schools') { const sites = await prisma.site.findMany({ where: { isActive: true }, orderBy: { city: 'asc' } }); send(response, 200, listDto(sites.map(siteDto))); return; }
    if (request.method === 'GET' && url.pathname === '/api/groups') { send(response, 200, listDto([])); return; }
    if (request.method === 'GET' && url.pathname === '/api/sessions') { const sessions = await prisma.careSession.findMany({ orderBy: { date: 'asc' } }); send(response, 200, listDto(sessions.map(sessionDto))); return; }
    if (request.method === 'GET' && url.pathname.startsWith('/api/sessions/')) { const id = url.pathname.split('/').pop() ?? ''; const session = await prisma.careSession.findUnique({ where: { id } }); if (!session) { send(response, 404); return; } send(response, 200, sessionDto(session)); return; }
    if (request.method === 'GET' && url.pathname === '/api/missions') { const missions = await prisma.mission.findMany({ orderBy: { startDate: 'asc' } }); send(response, 200, listDto(missions.map(missionDto))); return; }
    if (request.method === 'GET' && url.pathname.startsWith('/api/missions/') && url.pathname.endsWith('/candidates')) { const id = url.pathname.split('/')[3]; const applications = await prisma.missionApplication.findMany({ where: { missionId: id }, include: { animator: true } }); send(response, 200, listDto(applications.map((application) => candidateDto(application.animator, application)))); return; }
    if (request.method === 'GET' && url.pathname.startsWith('/api/missions/')) { const id = url.pathname.split('/').pop() ?? ''; const mission = await prisma.mission.findUnique({ where: { id } }); if (!mission) { send(response, 404); return; } send(response, 200, missionDto(mission)); return; }
    if (request.method === 'GET' && url.pathname === '/api/contracts') { const contracts = await prisma.contract.findMany({ orderBy: { startDate: 'asc' } }); send(response, 200, listDto(contracts.map(contractDto))); return; }
    if (request.method === 'GET' && url.pathname === '/api/tension-indicators') { const indicators = await prisma.marketIndicator.findMany({ where: { geoLevel: 'DEPARTMENT' }, orderBy: { offerCount: 'desc' } }); send(response, 200, listDto(indicators.map(marketDto))); return; }
    if (request.method === 'GET' && url.pathname === '/api/tension-indicators/communes') { const indicators = await prisma.marketIndicator.findMany({ where: { geoLevel: 'COMMUNE' }, orderBy: { offerCount: 'desc' } }); send(response, 200, listDto(indicators.map(marketDto))); return; }
    if (request.method === 'GET' && url.pathname === '/api/animators') { const profiles = await prisma.animatorProfile.findMany({ orderBy: { lastName: 'asc' } }); send(response, 200, listDto(profiles.map((profile) => animatorDto(profile)))); return; }
    if (request.method === 'GET' && url.pathname === '/api/animators/availability') { if (user.role !== 'ANIMATOR' || !user.animatorProfile) { send(response, 403); return; } const rules = await prisma.availabilityRule.findMany({ where: { animatorProfileId: user.animatorProfile.id }, orderBy: { weekday: 'asc' } }); send(response, 200, listDto(rules.map(availabilityDto))); return; }
    if (request.method === 'POST' && url.pathname === '/api/animators/availability') { if (user.role !== 'ANIMATOR' || !user.animatorProfile) { send(response, 403); return; } const body = await readBody(request); const rule = await prisma.availabilityRule.create({ data: { animatorProfileId: user.animatorProfile.id, weekday: Number(body.weekday), block: body.block as any, startMinutes: Number(body.startMinutes), endMinutes: Number(body.endMinutes), validFrom: new Date(String(body.validFrom ?? new Date().toISOString().slice(0, 10))) } }); send(response, 201, availabilityDto(rule)); return; }
    if (request.method === 'GET' && url.pathname === '/api/animator/proposals') { if (user.role !== 'ANIMATOR' || !user.animatorProfile) { send(response, 403); return; } const applications = await prisma.missionApplication.findMany({ where: { animatorProfileId: user.animatorProfile.id, status: { in: ['SUGGESTED', 'NOTIFIED', 'APPLIED'] } }, include: { mission: true } }); send(response, 200, listDto(applications.map((application) => ({ ...missionDto(application.mission), distanceFromPreviousKm: 3.1, travelMinutes: 12, paidDurationHours: Number(application.mission.totalHours), hoursAfterAcceptance: 16.5, proposalStatus: application.status === 'ACCEPTED' ? 'ACCEPTED' : 'PENDING' })))); return; }
    if (request.method === 'GET' && url.pathname.startsWith('/api/match-runs/')) { const missionId = url.pathname.split('/').pop() ?? ''; const applications = await prisma.missionApplication.findMany({ where: { missionId }, include: { animator: true } }); const candidates = applications.map((application) => candidateDto(application.animator, application)); send(response, 200, { id: `match-${missionId}`, missionId, algorithmVersion: 'annexe-b-v1', computedAt: new Date().toISOString(), eligible: candidates.filter((candidate) => candidate.matchStatus === 'ELIGIBLE'), rejected: candidates.filter((candidate) => candidate.matchStatus === 'REJECTED'), totalCandidates: candidates.length }); return; }
    if (request.method === 'POST' && url.pathname.startsWith('/api/sessions/') && url.pathname.endsWith('/remove-animator')) { const id = url.pathname.split('/')[3]; const session = await prisma.careSession.update({ where: { id }, data: { assignedStaffTotal: { decrement: 1 }, complianceStatus: 'STAFF_SHORTAGE' } }); send(response, 200, { removed: true, session: sessionDto(session) }); return; }
    if (request.method === 'POST' && url.pathname.startsWith('/api/animator/proposals/') && url.pathname.endsWith('/accept')) { if (user.role !== 'ANIMATOR' || !user.animatorProfile) { send(response, 403); return; } const missionId = url.pathname.split('/')[3]; const application = await prisma.missionApplication.update({ where: { missionId_animatorProfileId: { missionId, animatorProfileId: user.animatorProfile.id } }, data: { status: 'ACCEPTED', respondedAt: new Date(), decidedAt: new Date() } }); send(response, 200, { status: application.status }); return; }
    if (request.method === 'POST' && url.pathname.startsWith('/api/animator/proposals/') && url.pathname.endsWith('/pass')) { if (user.role !== 'ANIMATOR' || !user.animatorProfile) { send(response, 403); return; } const missionId = url.pathname.split('/')[3]; const application = await prisma.missionApplication.update({ where: { missionId_animatorProfileId: { missionId, animatorProfileId: user.animatorProfile.id } }, data: { status: 'WITHDRAWN', respondedAt: new Date() } }); send(response, 200, { status: 'PASSED', applicationId: application.id }); return; }
    if (request.method === 'POST' && url.pathname.startsWith('/api/missions/') && url.pathname.endsWith('/accept')) { const missionId = url.pathname.split('/')[3]; const body = await readBody(request); const candidateId = String(body.candidateId ?? ''); const mission = await prisma.mission.update({ where: { id: missionId }, data: { status: 'FILLED', filledPositions: { increment: 1 }, filledAt: new Date() } }); await prisma.missionApplication.updateMany({ where: { missionId, animatorProfileId: candidateId }, data: { status: 'ACCEPTED', decidedAt: new Date() } }); send(response, 200, { status: mission.status }); return; }
    if (url.pathname === '/api/employer/profile') {
      if (user.role !== 'EMPLOYER') { send(response, 403, { code: 'FORBIDDEN', message: 'Rôle employeur requis.' }); return; }
      const membership = await prisma.organizationMember.findFirst({ where: { userId: user.id }, include: { organization: true } });
      if (!membership) { send(response, 404, { code: 'ORGANIZATION_NOT_FOUND', message: 'Organisation introuvable.' }); return; }
      if (request.method === 'GET') { send(response, 200, organizationDto(membership.organization)); return; }
      if (request.method === 'PUT') {
        const body = await readBody(request);
        const organization = await prisma.organization.update({ where: { id: membership.organizationId }, data: { name: typeof body.name === 'string' ? body.name.trim() : undefined, addressLine: typeof body.addressLine === 'string' ? body.addressLine.trim() : undefined, postalCode: typeof body.postalCode === 'string' ? body.postalCode.trim() : undefined, city: typeof body.city === 'string' ? body.city.trim() : undefined, contactEmail: typeof body.contactEmail === 'string' ? body.contactEmail.trim().toLowerCase() : undefined, contactPhone: typeof body.contactPhone === 'string' ? body.contactPhone.trim() : undefined } });
        send(response, 200, organizationDto(organization)); return;
      }
    }
    if (url.pathname === '/api/animators/profile') {
      if (user.role !== 'ANIMATOR' || !user.animatorProfile) { send(response, 403, { code: 'FORBIDDEN', message: 'Rôle animateur requis.' }); return; }
      if (request.method === 'GET') { send(response, 200, animatorDto(user.animatorProfile)); return; }
      if (request.method === 'PUT') {
        const body = await readBody(request);
        const profile = await prisma.animatorProfile.update({ where: { userId: user.id }, data: { firstName: typeof body.firstName === 'string' ? body.firstName.trim() : undefined, lastName: typeof body.lastName === 'string' ? body.lastName.trim() : undefined, phone: typeof body.phone === 'string' ? body.phone.trim() : undefined, bio: typeof body.bio === 'string' ? body.bio.trim() : undefined, addressLine: typeof body.addressLine === 'string' ? body.addressLine.trim() : undefined, postalCode: typeof body.postalCode === 'string' ? body.postalCode.trim() : undefined, city: typeof body.city === 'string' ? body.city.trim() : undefined, travelRadiusKm: typeof body.travelRadiusKm === 'number' ? body.travelRadiusKm : undefined, hasVehicle: typeof body.hasVehicle === 'boolean' ? body.hasVehicle : undefined, weeklyHoursTarget: typeof body.weeklyHoursTarget === 'number' ? body.weeklyHoursTarget : undefined, isSearching: typeof body.isSearching === 'boolean' ? body.isSearching : undefined } });
        send(response, 200, animatorDto(profile)); return;
      }
    }
    send(response, 404, { code: 'NOT_FOUND', message: 'Route introuvable.' });
  } catch (error) { console.error(error); send(response, 400, { code: 'REQUEST_ERROR', message: error instanceof Error ? error.message : 'Requête invalide.' }); }
}

const server = createServer((request, response) => { void route(request, response); });
server.listen(port, () => console.log(`API Apik démarrée sur http://localhost:${port}`));
process.on('SIGINT', () => { void prisma.$disconnect().finally(() => process.exit(0)); });
process.on('SIGTERM', () => { void prisma.$disconnect().finally(() => process.exit(0)); });
