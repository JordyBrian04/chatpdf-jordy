"use client"
import React, { Fragment, useState } from 'react'
import { Button } from './ui/button';
import { PlansAbonnement } from './PlansAbonnement';
// import Modal from './Modal';
import axios from 'axios';


type Props = {
    plan: string;
    type_abonnement: string;
    userId: string
    pays: any
}

const PlanButton = ({ plan, type_abonnement, userId, pays }: Props) => {

    const [showModal, setShowModal] = useState(false)
    const [current_plan, setPlan] = useState('')
    const [user, setUser] = useState('')
    const [loading, setLoading] = React.useState(false)

    const handlePlan = async (plan: string) => {
        const prix = PlansAbonnement.find((p) => p.slug === plan.toLowerCase())?.prix.montant || 0
        const id = PlansAbonnement.find((p) => p.slug === plan.toLowerCase())?.prix.Id_prix.test
        let prixEuro = prix / 655.92
        prixEuro = Number(prixEuro.toFixed(2))*100

        if(plan !== 'Gratuit'){
            try {
                setLoading(true)
                
                const response = await axios.post('/api/stripe', {prixEuro, plan})
                window.location.href = response.data.url
            } catch (error) {
                console.log(`[STRIPE API ERROR] : ${error}`)
            }finally{
                setLoading(false)
            }
        }

    }

    return (
        <Fragment>
            <div className='mb-4'>
                {plan === type_abonnement ? (
                    <Button className='bg-green-400 hover:bg-green-800' onClick={() => { handlePlan(plan) }}>
                        Abonnement actuel
                    </Button>
                ) : plan === 'Gratuit' ? (
                    <Button className='bg-blue-400 hover:bg-blue-600' onClick={() => { handlePlan(plan) }}>
                        Activer cette offre 
                    </Button>
                ) : (
                    <Button className='bg-blue-400 hover:bg-blue-600' onClick={() => { handlePlan(plan) }}>
                        Souscrire à cette offre
                    </Button>
                )}

            </div>
            {/* <Modal Visible={showModal} plan={current_plan} userId={user} onClose={() => setShowModal(false)} pays={pays} /> */}
        </Fragment>
    )
}

export default PlanButton