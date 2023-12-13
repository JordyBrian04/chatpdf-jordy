"use client"
import React from 'react'
import { Button } from './ui/button'
import { ArrowRight } from 'lucide-react'

type Props = { isPro: boolean }

const AbonnementButton = (props: Props) => {

    const [loading, setLoading] = React.useState(false)

    const handlePlan = async() => {
        window.location.href = '/plan'
    }

    return (
        <Button disabled={loading} onClick={handlePlan}>
            {props.isPro ? 'Gérer mon abonnement' : 'Devenir Pro'}
            <ArrowRight className="ml-2" />
        </Button>
    )
}

export default AbonnementButton