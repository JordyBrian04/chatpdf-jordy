'use client'
import { Inbox, Loader2 } from 'lucide-react';
import React, { useEffect } from 'react'
import {useDropzone} from 'react-dropzone'
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { redirect, useRouter }  from 'next/navigation'

type Props = {
    type_abonnement: any;
}


const FileUpload = ({type_abonnement}:Props) => {

    const router = useRouter()

    const [uploading, setUploading] = React.useState(false);


    const {mutate} = useMutation({
        mutationFn: async ({file_key, file_name} : {file_key: string, file_name: string}) => {
            const response = await axios.post('/api/create-chat',{
                file_key,
                file_name
            })
            console.log('data',response)
            return response.data;

        }
    })


    const {getRootProps, getInputProps} = useDropzone({
        accept: {'application/pdf' : [".pdf"]},
        maxFiles:1,
        onDrop: async (acceptedFiles) => {
            //console.log(acceptedFiles)
            const file = acceptedFiles[0];
            
            if(type_abonnement == 'Gratuit' && file.size > 4*1024*1024){
                toast.error('Veuillez sélectionner un fichier inférieur à 4 mb');
                return;
            }

            if(type_abonnement == 'Standard' && file.size > 10*1024*1024){
                toast.error('Veuillez sélectionner un fichier inférieur à 10 mb');
                return;
            }

            if(type_abonnement == 'Pro' && file.size > 50*1024*1024){
                toast.error('Veuillez sélectionner un fichier inférieur à 30 mb');
                return;
            }

            //On importe le fichier
            try{
                setUploading(true);
                const formData = new FormData();
                formData.append('file', file);
    
                const response = await axios.post('https://mon-rosaire.000webhostapp.com/pdf/upload-pdf.php', formData);

                if(!response.data.file_key || !response.data.file_name){
                    toast.error('Une erreur est survenue');
                    return;
                }
                //console.log(response.data);

                mutate(response.data, {
                    onSuccess: ({chat_id,message}) => {
                        if(message){
                            toast.error(message)
                            return
                        }
                        toast.success('Conversation crée avec succés')
                        router.push(`/chat/${chat_id}`)
                    },

                    onError: (error) => {
                        toast.error("Erreur de création de la discution")
                        console.error('ee',error)
                    }
                })

                //Success
            }catch(erreur){
                console.error('Erreur d\'importataion :', erreur);
                alert('Une erreur s\'est produite lors de l\'importation du fichier.');
            }finally {
                setUploading(false);
            }

        }
    });

    return (
        <div className='p-2 bg-white rounded-xl'>
            <div 
                {...getRootProps({
                    className: 'border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col'
                })}
            >
                <input {...getInputProps()} />
                {uploading ? (
                    <>
                        <Loader2 className='w-10 h-10 text-blue-500 animate-spin' />
                        <p className='mt-2 text-sm text-slate-500'>
                            Creation de la conversation...
                        </p>
                    </>
                ) : (
                    <>
                        <Inbox className='w-10 h-10 text-blue-500' />
                        <p className='mt-2 text-sm text-slate-400'>Glissez deposez votre fichier PDF ici</p>
                    </>
                )}

            </div>
        </div>
    )
}

export default FileUpload