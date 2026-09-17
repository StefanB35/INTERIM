# RGPD et mentions minimales

Document de cadrage du POC Apik. Il ne remplace pas la validation juridique du responsable de traitement.

## Responsable et finalites

Le responsable de traitement est l'organisateur ou l'entité Apik désignée contractuellement, selon le parcours concerné. Les traitements servent à :

- créer et sécuriser un compte employeur ou animateur ;
- vérifier une structure et rattacher un site scolaire ;
- calculer la conformité d'un créneau ;
- rechercher un profil compatible et envoyer les notifications liées à une mission ;
- produire et conserver les éléments nécessaires au contrat de mission ;
- répondre aux demandes d'accès, rectification, effacement et portabilité.

## Bases legales

- **Exécution du contrat** : création du compte, gestion du profil, disponibilité, mission et contrat.
- **Obligation légale** : taux d'encadrement, qualification et vérification d'honorabilité auprès des dispositifs prévus pour les accueils de mineurs.
- **Consentement** : notifications optionnelles et visibilité du profil lorsque la base contractuelle ne suffit pas.
- **Intérêt légitime** : sécurité, prévention des abus, journal technique et amélioration limitée du service, avec mise en balance documentée.

Les consentements doivent être séparés, versionnés et révocables. Le POC expose les enums `ConsentPurpose` et `DataRequestType` dans Prisma, mais le parcours complet de demande RGPD n'est pas encore livré dans l'interface.

## Données et minimisation

- Identité, email, coordonnées et rôle : nécessaires au compte et à la mission.
- Localisation : utilisée pour la distance de matching, avec précision limitée au besoin produit.
- Diplômes, honorabilité et disponibilités : nécessaires aux verrous de sécurité et de conformité.
- Coordonnées bancaires et pièces : données sensibles, chiffrage applicatif prévu par le schéma Prisma; stockage réel à raccorder côté backend.

Les mots de passe ne sont jamais stockés côté frontend. Le JWT reste en mémoire et le refresh repose sur un cookie httpOnly.

## Conservation

- **Coordonnées et profil** : 24 mois après la dernière mission ou le dernier échange contractuel, puis suppression ou anonymisation documentée.
- **Documents d'identité** : suppression en fin de contrat de mission, sauf obligation légale contraire documentée.
- **Justificatif d'honorabilité** : conservation pendant la période nécessaire à la vérification et à la mission, puis purge selon la politique validée par le responsable de traitement.
- **Contrat et pièces comptables** : durée légale applicable au contrat, à préciser par le responsable juridique avant production.
- **Journaux techniques et traces de matching** : durée courte, proportionnée à la sécurité et à la preuve de décision; le POC ne fixe pas encore la durée d'exploitation Mongo.

Une tâche de purge doit être automatisée côté backend. Le frontend ne conserve aucune donnée personnelle dans `localStorage`.

## Droits et sécurité

La personne peut demander accès, rectification, effacement, limitation, opposition ou portabilité via le canal indiqué dans les mentions légales. Les demandes doivent être authentifiées et tracées.

Mesures prévues : TLS en transit, hachage Argon2id des mots de passe, chiffrement AES-256-GCM des champs et documents sensibles au repos, contrôle d'accès par rôle, limitation des logs et séparation des secrets d'environnement.

## Mentions légales minimales à afficher

- identité et coordonnées de l'éditeur ;
- forme sociale, adresse, SIREN/SIRET et responsable de publication ;
- hébergeur et coordonnées ;
- contact RGPD ou DPO ;
- finalités, bases légales, destinataires et durées de conservation ;
- droits des personnes et moyen d'exercice ;
- politique cookies et liste des traceurs éventuels ;
- conditions d'utilisation et responsabilités ;
- informations relatives à l'intérim et au contrat de mission.

Les informations d'identification de l'éditeur et de l'hébergeur restent à compléter avant publication publique.
