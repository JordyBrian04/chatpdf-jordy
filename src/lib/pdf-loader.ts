import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { env } from './config'
import { downloadPDF } from './pdf-server'

type PDFPage = {
    pageContent: string;
    metadata: {
        loc: { pageNumber: number }
    }
}

export async function getChunkedDocsFromPDF(fileKey: string) {
    try {
        //1. obtain the pdf -> download and read pdf 
        const file_name = await downloadPDF(fileKey)

        if (!file_name) {
            throw new Error('[pdf-loader.ts] : Erreur de téléchargement du fichier');
        }

        const loader = new PDFLoader(file_name)
        const doc = await loader.load()
        //const pages = (await loader.load()) as PDFPage[]

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        })

        const chunkedDoc = await textSplitter.splitDocuments(doc)
        return chunkedDoc

    } catch (error) {
        console.log(`[pdf-loader.ts] : ${error}`)
        throw new Error('[pdf-loader.ts] : Échec du regroupement des documents PDF')
    }
}