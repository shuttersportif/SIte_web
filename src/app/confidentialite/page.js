import LegalPage from "../../components/LegalPage";

export const metadata = {
  title: "Politique de confidentialité — Théo, photographe de course",
};

const sections = [
  {
    heading: "Responsable du traitement",
    paragraphs: [
      "Théo [Nom], photographe, [adresse], 49000 Angers. Contact : contact@theo-photographe.fr.",
    ],
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
];

export default function ConfidentialitePage() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      intro="Texte provisoire, à compléter et à faire valider avant la mise en ligne."
      sections={sections}
    />
  );
}
