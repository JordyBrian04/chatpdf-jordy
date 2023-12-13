export const PlansAbonnement = [
    {
        nom: 'Gratuit',
        slug: 'gratuit',
        quota: 5,
        page_par_pdf: 5,
        prix: {
            montant: 0,
            Id_prix: {
                test: '',
                production: ''
            }
        }
    },
    {
        nom: 'Standard',
        slug: 'standard',
        quota: 15,
        page_par_pdf: 30,
        prix: {
            montant: 8000,
            Id_prix: {
                test: 'plan_c00f0c4675b91fb8b918e4079a0b1bac',
                production: ''
            }
        },
        features: [
            {
                text: '30 pages par PDF',
                footnote: 'Le nombre maximum de pages par fichier PDF.',
            },
            {
                text: 'La limite de taille de fichier est de 10 Mo',
                footnote: 'Taille maximale d\'un seul fichier PDF.',
            },
            {
                text: '50 questions par fichier PDF',
                footnote: 'Nombre maximale de questions par fichier PDF',
            },
            {
                text: 'GPT-3.5',
                footnote: 'Nombre maximale de questions par fichier PDF',
            },
            {
                text: 'Des réponses de meilleure qualité',
                footnote: 'De meilleures réponses algorithmiques pour une qualité de contenu améliorée',
                negative: true,
            },
        ],
    },
    {
        nom: 'Pro',
        slug: 'pro',
        quota: 50,
        page_par_pdf: 'illimité',
        prix: {
            montant: 15000,
            Id_prix: {
                test: 'plan_1f0f70bf2b5ad94c7387e64c16dc455a',
                production: ''
            }
        },
        features: [
            {
                text: 'Nombre de page illimité',
                footnote: 'Le nombre maximum de pages par fichier PDF.',
            },
            {
                text: 'La limite de taille de fichier est de 50 Mo',
                footnote: 'Taille maximale d\'un seul fichier PDF.',
            },
            {
                text: 'Nombre de questions illimité',
                footnote: 'Nombre maximale de questions par fichier PDF',
            },
            {
                text: 'Des réponses de meilleure qualité',
                footnote: 'De meilleures réponses algorithmiques pour une qualité de contenu améliorée',
            },
            {
                text: 'GPT-4',
                footnote: 'Une qualité de reponse supérieure',
            },
            // {
            //     text: 'Assistance prioritaire',
            // },
        ],
    },
]