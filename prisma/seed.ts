import {
  PrismaClient,
  UserRole,
  AccountStatus,
  LegalForm,
  SlotBlock,
  AgeGroup,
  QualificationLevel,
  HonorabilityStatus,
  ComplianceStatus,
  OrgMemberRole,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Nettoyage des tables de test...");
  await prisma.assignment.deleteMany();
  await prisma.careSession.deleteMany();
  await prisma.missionSlot.deleteMany();
  await prisma.missionApplication.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.supervisionRule.deleteMany();
  await prisma.animatorProfile.deleteMany();
  await prisma.staffMember.deleteMany();
  await prisma.siteAccess.deleteMany();
  await prisma.site.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  console.log("📜 1. Insertion du barème réglementaire (CASF art. R227-16)...");
  // Moins de 6 ans, sans PEDT (1 pour 10)
  await prisma.supervisionRule.create({
    data: {
      ageGroup: AgeGroup.UNDER_6,
      requiresPedt: false,
      durationOver5h: false,
      childrenPerStaff: 10,
      legalReference: "CASF art. R227-16 (Accueil de loisirs classique)",
      version: "2016-1051",
      effectiveFrom: new Date("2016-08-01"),
    },
  });

  // Moins de 6 ans, avec PEDT (1 pour 14)
  await prisma.supervisionRule.create({
    data: {
      ageGroup: AgeGroup.UNDER_6,
      requiresPedt: true,
      durationOver5h: false,
      childrenPerStaff: 14,
      legalReference: "Décret n° 2016-1051 (Taux assoupli PEDT périscolaire)",
      version: "2016-1051",
      effectiveFrom: new Date("2016-08-01"),
    },
  });

  // 6 ans et plus, sans PEDT (1 pour 14)
  await prisma.supervisionRule.create({
    data: {
      ageGroup: AgeGroup.SIX_AND_OVER,
      requiresPedt: false,
      durationOver5h: false,
      childrenPerStaff: 14,
      legalReference: "CASF art. R227-16 (Accueil de loisirs classique)",
      version: "2016-1051",
      effectiveFrom: new Date("2016-08-01"),
    },
  });

  // 6 ans et plus, avec PEDT (1 pour 18)
  await prisma.supervisionRule.create({
    data: {
      ageGroup: AgeGroup.SIX_AND_OVER,
      requiresPedt: true,
      durationOver5h: false,
      childrenPerStaff: 18,
      legalReference: "Décret n° 2016-1051 (Taux assoupli PEDT périscolaire)",
      version: "2016-1051",
      effectiveFrom: new Date("2016-08-01"),
    },
  });

  console.log("🏢 2. Création de l'organisation employeur et du site...");
  const userOrg = await prisma.user.create({
    data: {
      email: "directeur@rennes-periscolaire.fr",
      passwordHash: "$argon2id$v=19$m=65536,t=3,p=4$dummyhashorganizer",
      role: UserRole.EMPLOYER,
      status: AccountStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
  });

  const org = await prisma.organization.create({
    data: {
      name: "Direction Enfance Éducation Rennes",
      legalForm: LegalForm.COMMUNE,
      siret: "21350238800012",
      nafCode: "8411Z",
      addressLine: "Place de la Mairie",
      postalCode: "35000",
      city: "Rennes",
      inseeCode: "35238",
      contactEmail: "enfance@rennes.fr",
      isTamVerified: true,
      tamDeclarationNumber: "TAM-35-2026-0012",
    },
  });

  await prisma.organizationMember.create({
    data: {
      userId: userOrg.id,
      organizationId: org.id,
      role: OrgMemberRole.OWNER,
      acceptedAt: new Date(),
    },
  });

  const site = await prisma.site.create({
    data: {
      organizationId: org.id,
      name: "Groupe Scolaire Moulin du Comte",
      uaiCode: "0352211A",
      schoolName: "École Primaire Publique Moulin du Comte",
      addressLine: "14 Rue Moulin du Comte",
      postalCode: "35000",
      city: "Rennes",
      inseeCode: "35238",
      latitude: 48.1092,
      longitude: -1.7045,
      hasPedt: true,
    },
  });

  // Salarié permanent présent sur place
  const staffPermanent = await prisma.staffMember.create({
    data: {
      organizationId: org.id,
      firstName: "Camille",
      lastName: "Dumont",
      qualificationLevel: QualificationLevel.QUALIFIED,
      honorabilityStatus: HonorabilityStatus.VERIFIED,
      isActive: true,
    },
  });

  console.log("🏃 3. Création des profils animateurs de test...");
  // Animateur 1 : BAFA validé + Honorabilité OK
  const userAnim1 = await prisma.user.create({
    data: {
      email: "alex.dubois@test.apik",
      passwordHash: "$argon2id$v=19$m=65536,t=3,p=4$dummyhashanimator1",
      role: UserRole.ANIMATOR,
      status: AccountStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
  });

  const anim1 = await prisma.animatorProfile.create({
    data: {
      userId: userAnim1.id,
      firstName: "Alex",
      lastName: "Dubois",
      birthDate: new Date("1998-05-14"),
      phone: "0611223344",
      postalCode: "35000",
      city: "Rennes",
      latitude: 48.111339,
      longitude: -1.68002,
      travelRadiusKm: 15,
      hasVehicle: true,
      qualificationLevel: QualificationLevel.QUALIFIED,
      experienceYears: 4,
      honorabilityStatus: HonorabilityStatus.VERIFIED,
      honorabilityCheckedAt: new Date(),
      honorabilityExpiresAt: new Date("2027-06-30"),
      isSearching: true,
    },
  });

  // Animateur 2 : Stagiaire BAFA + Honorabilité OK
  const userAnim2 = await prisma.user.create({
    data: {
      email: "sarah.kone@test.apik",
      passwordHash: "$argon2id$v=19$m=65536,t=3,p=4$dummyhashanimator2",
      role: UserRole.ANIMATOR,
      status: AccountStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.animatorProfile.create({
    data: {
      userId: userAnim2.id,
      firstName: "Sarah",
      lastName: "Koné",
      birthDate: new Date("2003-11-20"),
      phone: "0622334455",
      postalCode: "35700",
      city: "Rennes",
      latitude: 48.125,
      longitude: -1.65,
      travelRadiusKm: 10,
      hasVehicle: false,
      qualificationLevel: QualificationLevel.TRAINEE,
      experienceYears: 1,
      honorabilityStatus: HonorabilityStatus.VERIFIED,
      honorabilityCheckedAt: new Date(),
      honorabilityExpiresAt: new Date("2027-06-30"),
      isSearching: true,
    },
  });

  // Animateur 3 : Non vérifié TAM (verrou bloquant du matching)
  const userAnim3 = await prisma.user.create({
    data: {
      email: "thomas.leroy@test.apik",
      passwordHash: "$argon2id$v=19$m=65536,t=3,p=4$dummyhashanimator3",
      role: UserRole.ANIMATOR,
      status: AccountStatus.PENDING_VERIFICATION,
    },
  });

  await prisma.animatorProfile.create({
    data: {
      userId: userAnim3.id,
      firstName: "Thomas",
      lastName: "Leroy",
      birthDate: new Date("2001-02-10"),
      phone: "0633445566",
      postalCode: "35000",
      city: "Rennes",
      latitude: 48.105,
      longitude: -1.67,
      qualificationLevel: QualificationLevel.UNQUALIFIED,
      honorabilityStatus: HonorabilityStatus.PENDING,
      isSearching: true,
    },
  });

  console.log("📅 4. Création d'un créneau périscolaire du soir en déficit...");
  // Date : Vendredi prochain
  const sessionDate = new Date();
  sessionDate.setDate(sessionDate.getDate() + 2);

  // 16h30 à 18h30 (990 min à 1110 min)
  const startsAt = new Date(sessionDate);
  startsAt.setHours(16, 30, 0, 0);
  const endsAt = new Date(sessionDate);
  endsAt.setHours(18, 30, 0, 0);

  // 36 enfants de plus de 6 ans, avec PEDT (taux 1/18 => 2 animateurs requis)
  const careSession = await prisma.careSession.create({
    data: {
      siteId: site.id,
      date: sessionDate,
      block: SlotBlock.EVENING,
      startMinutes: 990,
      endMinutes: 1110,
      childrenUnder6: 0,
      children6AndOver: 36,
      requiredStaffTotal: 2,
      assignedStaffTotal: 1, // Seulement 1 permanent affecté
      qualifiedCount: 1,
      traineeCount: 0,
      unqualifiedCount: 0,
      complianceStatus: ComplianceStatus.STAFF_SHORTAGE,
      rulesetVersion: "2016-1051",
    },
  });

  // Affectation du permanent
  await prisma.assignment.create({
    data: {
      sessionId: careSession.id,
      source: "INTERNAL_STAFF",
      staffMemberId: staffPermanent.id,
      qualificationLevel: QualificationLevel.QUALIFIED,
      startsAt: startsAt,
      endsAt: endsAt,
    },
  });

  console.log("✅ Seed terminé avec succès.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
