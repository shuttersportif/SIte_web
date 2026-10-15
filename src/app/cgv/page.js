import LegalPage from "../../components/LegalPage";

export const metadata = {
  title: "CGV — Théo, photographe de course",
};

const sections = [
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
];

export default function CgvPage() {
  return (
    <LegalPage
      title="Conditions générales de vente"
      intro="Texte provisoire, à compléter et à faire valider par un professionnel du droit avant la mise en ligne."
      sections={sections}
    />
  );
}
