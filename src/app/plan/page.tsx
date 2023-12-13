
import { PlansAbonnement } from '@/components/PlansAbonnement'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { db } from '@/lib/db'
import { chats, userAbonnements } from '@/lib/db/schema'
import { cn } from '@/lib/utils'
import { auth, currentUser } from '@clerk/nextjs'
import axios from 'axios'
import { eq } from 'drizzle-orm'
import { ArrowLeft, ArrowRight, Check, HelpCircle, Link, Minus } from 'lucide-react'
import React from 'react';
import { redirect } from 'next/navigation'
import PlanButton from '@/components/PlanButton'



const Plans = async () => {

    const { userId } = await auth()
    if (!userId) {
        redirect('/sign-in')
    }

    const isAuth = !!userId
    let firstChat;
    if (userId) {
        firstChat = await db.select().from(chats).where(eq(chats.userId, userId));
        if (firstChat) {
            firstChat = firstChat[0];
        }
    }

    const _user_abonnement = await db.select().from(userAbonnements).where(eq(userAbonnements.userId, userId))
    var type_abonnement = ''

    if (!_user_abonnement[0]) {
        type_abonnement = 'Gratuit'
    } else {
        type_abonnement = _user_abonnement[0].typeAbonnement
    }

    const pricingItems = [
        {
            plan: 'Gratuit',
            tagline: 'Pour des petits fichiers PDF',
            quota: 5,
            features: [
                {
                    text: '5 pages par PDF',
                    footnote: 'Le nombre maximum de pages par fichier PDF.',
                },
                {
                    text: 'La limite de taille de fichier est de 4 Mo',
                    footnote: 'Taille maximale d\'un seul fichier PDF.',
                },
                {
                    text: '10 questions par fichier PDF',
                    footnote: 'Nombre maximale de questions par fichier PDF',
                },
                {
                    text: 'Des réponses de meilleure qualité',
                    footnote: 'De meilleures réponses algorithmiques pour une qualité de contenu améliorée',
                    negative: true,
                },
                // {
                //     text: 'Assistance prioritaire',
                //     footnote: 'Taille maximale d\'un seul fichier PDF.',
                //     negative: true,
                // },
            ],
        },
        {
            plan: 'Standard',
            tagline: 'Pour des fichiers PDF un peu plus grand',
            quota: PlansAbonnement.find((p) => p.slug === 'standard')!.quota,
            id: PlansAbonnement.find((p) => p.slug === 'standard')!.prix.Id_prix.test,
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
                // {
                //     text: 'Assistance prioritaire',
                //     negative: true,
                // },
            ],
        },
        {
            plan: 'Pro',
            tagline: 'Pour les grands projets avec plus de besoins.',
            quota: PlansAbonnement.find((p) => p.slug === 'pro')!.quota,
            id: PlansAbonnement.find((p) => p.slug === 'pro')!.prix.Id_prix.test,
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

    const pays = await axios.get('https://pbxapi.mixvoip.com/countries/index')
    //console.log(pays.data.data)


    return (

        <div className="flex flex-col space-y-10 pb-20 items-center justify-center">
            <div className='space-y-6 flex flex-col text-center pt-20 px-10 md:px-0'>
                <div className="flex flex-row space-x-2 text-center justify-center items-center">
                    {firstChat && (
                        <a href={`/chat/${firstChat.id}`}>
                            <ArrowLeft />
                        </a>
                    )}

                    <div className='text-gray-800 text-2xl font-extrabold'>Plan d&apos;abonnement</div>
                </div>
            </div>

            <div className='md:flex p-10 md:space-x-10 space-y-10 md:space-y-0 items-center justify-center md:w-3/4 md:mx-auto'>
                {pricingItems.map(({ plan, tagline, quota, features }) => {

                    const prix = PlansAbonnement.find((p) => p.slug === plan.toLowerCase())?.prix.montant || 0
                    const prixEuro = prix / 655.92

                    return (
                        <div key={plan} className='border-gray-500 p-10 rounded-lg border space-y-8 md:w-1/2'>
                            <div className='text-2xl font-bold'>
                                {plan}
                            </div>
                            <div className='text-xl'>{tagline}</div>
                            <div className='text-xl font-semibold'>XOF {prix.toLocaleString()}</div>
                            <div className='text-sm'>Soit <b className='text-black'>{Number(prixEuro.toFixed(2))}€</b> par mois</div>
                            <div><span className='text-green-500 font-semibold'>{quota.toLocaleString()}</span> PDFs/mo inclus</div>

                            <ul className='my-1 space-y-5 px-4'>
                                {features.map(({ text, footnote, negative }) => (
                                    <li key={text} className='flex space-x-5'>
                                        <div className='flex-shrink-0'>
                                            {negative ? (
                                                <Minus className='h-6 w-6 text-gray-300' />
                                            ) : (
                                                <Check className='h-6 w-6 text-green-500' />
                                            )}
                                        </div>
                                        {footnote ? (
                                            <div className='flex items-center space-x-1'>
                                                <p className={cn("text-gray-400", { 'text-gray-600': negative })}>
                                                    {text}
                                                </p>
                                            </div>
                                        ) :
                                            <p className={cn("text-gray-400", { 'text-gray-600': negative })}>
                                                {text}
                                            </p>
                                        }
                                    </li>
                                ))}
                            </ul>

                            <div className="border-t border-gray-200">
                                <div className="pt-5 items-center justify-center text-center">
                                    <PlanButton plan={plan} type_abonnement={type_abonnement} userId={userId} pays={pays.data} />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
        // <div className='w-screen min-h-screen bg-slate-200'>
        //     <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
        //         <div className='flex flex-col items-center text-center w-screen'>
        //             <div className='flex items-center'>
        //                 <h1 className="mr-3 text-2xl font-semibold text-black">Plans d'abonnement</h1>
        //             </div>

        //             <div className="pt-7 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        //                 <TooltipProvider>
        //                     {pricingItems.map(({ plan, tagline, quota, features }) => {
        //                         const prix = PlansAbonnement.find((p) => p.slug === plan.toLowerCase())?.prix.montant || 0
        //                         const id = PlansAbonnement.find((p) => p.slug === plan.toLowerCase())?.prix.Id_prix.test || ''
        //                         const prixEuro = prix/655.92

        //                         return (
        //                             <div key={plan} className={cn("relative rounded-2xl bg-white shadow-lg", {
        //                                 "border-2 border-blue-600 shadow-blue-200": plan === "Pro",
        //                                 "border-2 border-gray-600 shadow-gray-400": plan === "Standard",
        //                                 "border border-gray-200": plan === "Gratuit"
        //                             })}>
        //                                 {plan === "Pro" && (
        //                                     <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-3 py-2 text-sm font-medium text-white">
        //                                         Pro
        //                                     </div>
        //                                 )}

        //                                 {plan === "Standard" && (
        //                                     <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-gray-600 to-gray-300 px-3 py-2 text-sm font-medium text-white">
        //                                         Standard
        //                                     </div>
        //                                 )}

        //                                 <div className="p-5">
        //                                     <h3 className='my-3 text-center font-display text-3xl font-bold'>
        //                                         {plan}
        //                                     </h3>
        //                                     <p className='text-gray-500'>{tagline}</p>
        //                                     <p className='my-5 font-display text-3xl font-semibold'>XOF {prix.toLocaleString()}</p>
        //                                     <p className='text-gray-500'>Soit <b className='text-black'>{Number(prixEuro.toFixed(2))}€</b> par mois  </p>
        //                                 </div>

        //                                 <div className="flex h-20 items-center justify-center border-b border-t border-gray-200 bg-gray-50">
        //                                     <div className="flex items-center space-x-1">
        //                                         <p>{quota.toLocaleString()} PDFs/mo inclus</p>

        //                                         <Tooltip delayDuration={300}>
        //                                             <TooltipTrigger className='cursor-default ml-1.5'>
        //                                                 <HelpCircle className='h-4 w-4 text-zinc-500' />
        //                                             </TooltipTrigger>
        //                                             <TooltipContent>
        //                                                 Combien de PDF vous pouvez uploader par mois.
        //                                             </TooltipContent>
        //                                         </Tooltip>
        //                                     </div>
        //                                 </div>

        //                                 <ul className='my-10 space-y-5 px-8'>
        //                                     {features.map(({ text, footnote, negative }) => (
        //                                         <li key={text} className='flex space-x-5'>
        //                                             <div className='flex-shrink-0'>
        //                                                 {negative ? (
        //                                                     <Minus className='h-6 w-6 text-gray-300' />
        //                                                 ) : (
        //                                                     <Check className='h-6 w-6 text-green-500' />
        //                                                 )}
        //                                             </div>
        //                                             {footnote ? (
        //                                                 <div className='flex items-center space-x-1'>
        //                                                     <p className={cn("text-gray-400", { 'text-gray-600': negative })}>
        //                                                         {text}
        //                                                     </p>

        //                                                     <Tooltip delayDuration={300}>
        //                                                         <TooltipTrigger className='cursor-default ml-1.5'>
        //                                                             <HelpCircle className='h-4 w-4 text-zinc-500' />
        //                                                         </TooltipTrigger>
        //                                                         <TooltipContent>
        //                                                             {footnote}
        //                                                         </TooltipContent>
        //                                                     </Tooltip>
        //                                                 </div>
        //                                             ) :
        //                                                 <p className={cn("text-gray-400", { 'text-gray-600': negative })}>
        //                                                     {text}
        //                                                 </p>
        //                                             }
        //                                         </li>
        //                                     ))}
        //                                 </ul>

        //                                 <div className="border-t border-gray-200">
        //                                     <div className="pt-5 items-center justify-center">
        //                                         <PlanButton plan={plan} type_abonnement={type_abonnement} userId={userId} pays={pays.data}/>

        //                                         {/* {type_abonnement === plan ? (
        //                                             <Button className='mb-4 bg-blue-400' disabled={true}>
        //                                                 Abonnement actuel
        //                                             </Button>
        //                                         ) : (
        //                                             <a href="">
        //                                                 <Button className='mb-4 bg-blue-400 hover:bg-blue-600'>
        //                                                     Souscrire à cette offre
        //                                                     <ArrowRight />
        //                                                 </Button>
        //                                             </a>
        //                                         )} */}
        //                                     </div>
        //                                 </div>
        //                             </div>
        //                         )
        //                     })}
        //                 </TooltipProvider>

        //             </div>
        //         </div>
        //     </div>
        // </div>

    )
}


export default Plans;