import LegalPage from "../../components/LegalPage";

export const metadata = {
  title: "Mentions légales — Théo, photographe de course",
};

const sections = [
  {
    heading: "Éditeur du site",
    paragraphs: [
      "Théo [Nom], photographe, entrepreneur individuel.",
      "Adresse : [adresse postale], 49000 Angers, France.",
      "SIRET : [à compléter]. Code APE : 74.20Z, activités photographiques.",
      "E-mail : contact@theo-photographe.fr. Téléphone : [à compléter].",
    ],
  },
  {
    heading: "Directeur de la publication",
    paragraphs: ["Théo [Nom]."],
  },
  {
    heading: "Hébergement",
    paragraphs: ["Le site est hébergé par [nom de l'hébergeur], [adresse], [téléphone]."],
  },
  {
    heading: "Conception",
    paragraphs: ["Site réalisé par plc-studio.fr."],
  },
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
];

export default function MentionsLegalesPage() {
  return (
    <LegalPage
      title="Mentions légales"
      intro="Texte provisoire, à compléter et à faire valider avant la mise en ligne."
      sections={sections}
    />
  );
}
