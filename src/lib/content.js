// tous les textes éditables du site, centralisés ici (schéma + valeurs par
// défaut). Ce fichier est importé aussi bien par des Server Components que
// par l'admin (Client Components) : il ne doit donc rien contenir qui ne
// soit utilisable que côté serveur. La lecture réelle en base se fait dans
// getContent.js (server-only, mis en cache).

export const DEFAULT_CONTENT = {
  hero: {
    title: "Théo — Photographe de course",
    intro:
      "Salut, je m'appelle Théo, photographe venant d'Angers. La photographie est pour moi une passion, une façon de capturer un souvenir, une émotion. Chaque photo que je prends a son histoire et raconte quelque chose.",
    cta: "Voir la galerie",
  },
  contact: {
    hookLine1: "Parlons de votre",
    hookLine2: "prochaine course.",
    responseNote: "Réponse sous 48 h",
    formTitle: "Votre projet",
    interestsLabel: "Je suis intéressé par",
    interests: ["Couverture de course", "Équipe / pilote", "Organisateur", "Tirage", "Autre"],
    sentTitle: "Merci, votre message est bien parti.",
    sentNote: "Je vous réponds sous 48 h à l'adresse indiquée.",
  },
  about: {
    heroKicker: "Théo, photographe de course à Angers",
    heroTitle: "À propos",
    introTitle: "Capter l'instant où la vitesse devient visible.",
    introP1: "Je suis photographe à Angers. Je suis les courses cyclistes et les épreuves de sport mécanique, au bord des routes de l'Anjou comme sur les circuits.",
    introP2: "Ce qui m'intéresse, c'est l'instant où la vitesse devient visible : un passage, une trajectoire, un regard avant le départ. Je travaille en noir et blanc pour garder l'essentiel.",
    introNote: "Basé à Angers, déplacements dans toute la France.",
    seasonTitle: "Ma saison",
    cta: "Écrire à Théo",
  },
  prestations: {
    intro: "Je couvre les courses cyclistes et le sport mécanique pour les organisateurs, les équipes et les pilotes.",
    cta: "Demander un devis",
    services: [
      {
        titre: "Couverture de courses",
        description:
          "Reportage complet de l'épreuve, du départ à l'arrivée : l'action, les coulisses, le podium. Une sélection retouchée est livrée après la course pour vos supports.",
      },
      {
        titre: "Équipes et pilotes",
        description:
          "Suivi sur une course ou sur toute la saison : photos en course, portraits, images de l'équipe et des partenaires, prêtes pour les réseaux et la presse.",
      },
      {
        titre: "Organisateurs",
        description:
          "Images pour l'affiche, le programme, le site et le bilan de l'événement, avec des droits d'utilisation définis à l'avance.",
      },
      {
        titre: "Fichiers numériques et licences",
        description:
          "Les photos de la galerie en fichiers numériques haute définition, et des licences d'utilisation pour les médias et les marques.",
      },
    ],
  },
  portfolio: {
    motorsport: {
      nom: "Motorsport",
      accroche: "Rallye, circuit et paddock : la vitesse, les trajectoires et l'ambiance des courses.",
      intro1: "Je me place là où la vitesse se lit : sortie de virage, freinage, ligne de départ.",
      intro2: "Je couvre la piste comme le paddock, et je livre une sélection retouchée, prête pour vos supports, vos partenaires et la presse.",
      cta: "Vous organisez un événement motorsport ?",
    },
    cyclisme: {
      nom: "Cyclisme / VTT",
      accroche: "Sur route et en forêt, l'effort et le geste au plus près des coureurs.",
      intro1: "Sur route comme en VTT, je suis la course au plus près : les ascensions, les descentes, l'effort et les visages.",
      intro2: "Je livre rapidement une sélection pour les organisateurs, les équipes et les coureurs, utilisable sur tous vos supports.",
      cta: "Vous organisez une course de cyclisme ou de VTT ?",
    },
  },
  legal: {
    mentionsLegales: {
      intro: "Texte provisoire, à compléter et à faire valider avant la mise en ligne.",
      lastUpdated: "2026-10-15",
      sections: [
        {
          heading: "Éditeur du site",
          paragraphs: [
            "Théo [Nom], photographe, entrepreneur individuel.",
            "Adresse : [adresse postale], 49000 Angers, France.",
            "SIRET : [à compléter]. Code APE : 74.20Z, activités photographiques.",
            "E-mail : contact@theo-photographe.fr. Téléphone : [à compléter].",
          ],
        },
        { heading: "Directeur de la publication", paragraphs: ["Théo [Nom]."] },
        { heading: "Hébergement", paragraphs: ["Le site est hébergé par [nom de l'hébergeur], [adresse], [téléphone]."] },
        { heading: "Conception", paragraphs: ["Site réalisé par plc-studio.fr."] },
        {
          heading: "Propriété intellectuelle",
          paragraphs: [
            "Toutes les photographies publiées sur ce site sont protégées par le droit d'auteur et restent la propriété de Théo. Toute reproduction, représentation ou diffusion, totale ou partielle, sans autorisation écrite préalable est interdite.",
            "L'achat d'un fichier numérique donne un droit d'usage personnel et non commercial, défini dans les conditions générales de vente. Il ne transfère pas les droits d'auteur.",
          ],
        },
        {
          heading: "Responsabilité",
          paragraphs: [
            "Théo s'efforce de fournir des informations exactes et à jour, sans pouvoir garantir l'absence d'erreur. Les liens vers des sites tiers n'engagent pas sa responsabilité.",
          ],
        },
        {
          heading: "Données personnelles",
          paragraphs: ["Le traitement des données personnelles est décrit dans la politique de confidentialité."],
        },
      ],
    },
    cgv: {
      intro: "Texte provisoire, à compléter et à faire valider par un professionnel du droit avant la mise en ligne.",
      lastUpdated: "2026-10-15",
      sections: [
        {
          heading: "1. Objet",
          paragraphs: [
            "Les présentes conditions régissent la vente, sur ce site, de fichiers numériques de photographies réalisées par Théo [Nom], entrepreneur individuel, SIRET [à compléter] (le « Vendeur »), à toute personne physique ou morale (le « Client »).",
            "Le Vendeur vend exclusivement des fichiers numériques. Aucun tirage papier ni support matériel n'est expédié.",
          ],
        },
        {
          heading: "2. Produits",
          paragraphs: [
            "Chaque produit est un fichier numérique haute définition au format JPEG, sans filigrane, d'une photographie présentée dans la galerie publique ou dans une galerie privée.",
            "Les photos affichées sur le site portent un filigrane et sont compressées. Le fichier livré est la version haute définition de la même image.",
          ],
        },
        {
          heading: "3. Prix",
          paragraphs: [
            "Les prix sont indiqués en euros, toutes taxes comprises. TVA non applicable, article 293 B du Code général des impôts [à vérifier selon le statut du Vendeur].",
            "Une remise dégressive peut s'appliquer selon le nombre de photos commandées ; elle est indiquée dans le panier avant le paiement.",
          ],
        },
        {
          heading: "4. Commande",
          paragraphs: [
            "Le Client sélectionne ses photos, vérifie son panier, se connecte à son espace client puis valide sa commande par le paiement. La commande est définitive après confirmation du paiement.",
            "Un e-mail de confirmation récapitulant la commande est envoyé au Client.",
          ],
        },
        {
          heading: "5. Paiement",
          paragraphs: [
            "Le paiement s'effectue en ligne par carte bancaire, Apple Pay ou Google Pay, via un prestataire de paiement sécurisé [Stripe]. Le Vendeur n'a jamais accès aux données de carte du Client.",
          ],
        },
        {
          heading: "6. Livraison des fichiers",
          paragraphs: [
            "Les fichiers sont disponibles immédiatement après le paiement, depuis la page de confirmation et depuis la rubrique « Mes téléchargements » de l'espace client.",
            "Ils restent disponibles au téléchargement pendant [durée à définir, par exemple 12 mois] à compter de l'achat.",
          ],
        },
        {
          heading: "7. Droit de rétractation",
          paragraphs: [
            "Conformément à l'article L221-28, 13° du Code de la consommation, le droit de rétractation ne peut pas être exercé pour la fourniture d'un contenu numérique non fourni sur un support matériel dont l'exécution a commencé avec l'accord préalable et exprès du Client, et pour lequel il a renoncé à son droit de rétractation.",
            "Au moment du paiement, le Client demande expressément l'accès immédiat aux fichiers et reconnaît qu'il perd son droit de rétractation dès le début du téléchargement.",
            "Tant qu'aucun fichier de la commande n'a été téléchargé, le Client peut demander l'annulation de sa commande en écrivant à contact@theo-photographe.fr dans un délai de 14 jours.",
          ],
        },
        {
          heading: "8. Licence d'utilisation",
          paragraphs: [
            "L'achat confère au Client un droit d'usage personnel et non commercial du fichier : impression pour un usage privé, partage sur ses réseaux sociaux personnels avec la mention « © Théo ».",
            "Tout usage commercial, publicitaire ou éditorial (presse, sponsors, marques, revente) nécessite une licence spécifique, à demander via la page Contact.",
            "Les droits d'auteur restent la propriété exclusive de Théo.",
          ],
        },
        {
          heading: "9. Réclamations et défaut de conformité",
          paragraphs: [
            "En cas de fichier défectueux ou ne correspondant pas à la photo commandée, le Client contacte le Vendeur, qui fournit un fichier conforme ou rembourse la photo concernée.",
          ],
        },
        {
          heading: "10. Médiation et droit applicable",
          paragraphs: [
            "Les présentes conditions sont soumises au droit français. En cas de litige, le Client peut recourir gratuitement au médiateur de la consommation : [nom et coordonnées du médiateur].",
          ],
        },
      ],
    },
    confidentialite: {
      intro: "Texte provisoire, à compléter et à faire valider avant la mise en ligne.",
      lastUpdated: "2026-10-15",
      sections: [
        {
          heading: "Responsable du traitement",
          paragraphs: ["Théo [Nom], photographe, [adresse], 49000 Angers. Contact : contact@theo-photographe.fr."],
        },
        {
          heading: "Données collectées",
          paragraphs: [
            "Compte client : prénom, nom, adresse e-mail, mot de passe (stocké sous forme chiffrée).",
            "Commandes : photos achetées, montants, date, historique de téléchargement. Les données de carte bancaire sont traitées uniquement par le prestataire de paiement.",
            "Formulaire de contact : nom, e-mail, téléphone facultatif et message.",
            "Mesure d'audience : statistiques de visite, uniquement si vous l'acceptez.",
          ],
        },
        {
          heading: "Finalités et bases légales",
          paragraphs: [
            "Gérer votre compte, vos commandes et l'accès à vos fichiers (exécution du contrat).",
            "Établir les factures et respecter les obligations comptables (obligation légale).",
            "Répondre à vos messages (intérêt légitime).",
            "Mesurer l'audience du site (consentement).",
          ],
        },
        {
          heading: "Durées de conservation",
          paragraphs: [
            "Compte client : jusqu'à sa suppression, ou 3 ans après la dernière activité.",
            "Factures : 10 ans, conformément au Code de commerce.",
            "Messages de contact : 3 ans après le dernier échange.",
            "Cookies de mesure d'audience : 13 mois au maximum.",
          ],
        },
        {
          heading: "Destinataires",
          paragraphs: [
            "Vos données sont destinées uniquement à Théo et à ses prestataires techniques : hébergeur [à compléter], prestataire de paiement [Stripe], service d'envoi d'e-mails [à compléter]. Elles ne sont jamais vendues.",
          ],
        },
        {
          heading: "Cookies",
          paragraphs: [
            "Le site utilise des cookies nécessaires à son fonctionnement (panier, connexion) et, avec votre accord, des cookies de mesure d'audience.",
            "Vous pouvez accepter ou refuser ces derniers dans le bandeau affiché lors de votre première visite. Refuser n'a aucune conséquence sur l'achat de photos.",
          ],
        },
        {
          heading: "Vos droits",
          paragraphs: [
            "Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité de vos données. Vous pouvez supprimer votre compte à tout moment depuis « Mes informations ».",
            "Pour exercer vos droits : contact@theo-photographe.fr. Vous pouvez aussi adresser une réclamation à la CNIL (cnil.fr).",
          ],
        },
      ],
    },
  },
};

// fusion profonde simple : ne garde que les clés déjà présentes dans les
// valeurs par défaut, pour qu'une surcharge partielle ou mal formée ne
// casse jamais l'affichage du site
export function mergeDefaults(defaults, overrides) {
  if (!overrides) return defaults;
  const out = Array.isArray(defaults) ? [...defaults] : { ...defaults };
  for (const key of Object.keys(defaults)) {
    const d = defaults[key];
    const o = overrides[key];
    if (o === undefined) continue;
    if (d && typeof d === "object" && !Array.isArray(d) && typeof o === "object") {
      out[key] = mergeDefaults(d, o);
    } else if (typeof o === typeof d) {
      out[key] = o;
    }
  }
  return out;
}

