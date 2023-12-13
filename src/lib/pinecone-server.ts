import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { downloadPDF } from './pdf-server'
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import md5 from "md5";
import {
    Document,
    RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { getEmbeddings } from "./embeddings";
import { convertToAscii } from "./utils";
import { env } from "./config";
import { PDFDocumentProxy } from 'pdfjs-dist';

export const getPineconeClient = () => {
    return new Pinecone({
        environment: env.PINECONE_ENVIRONMENT,
        apiKey: env.PINECONE_API_KEY,
    });
};

async function createIndex(client: Pinecone, indexName: string) {
    try {
        await client.createIndex({
            name: indexName,
            dimension: 1536,
            metric: 'cosine'
        })

        console.log(
            `Patientez ${env.INDEX_INIT_TIMEOUT} secondes pour la creation de l'index...`
        )

        console.log('Index created')
    } catch (error) {
        console.log(error)
        throw new Error('Error creating index')
    }
}

// export async function getPineconeClient() {

//     try {
//         const pinecone = new Pinecone({
//             environment: env.PINECONE_ENVIRONMENT,
//             apiKey: env.PINECONE_API_KEY
//         })

//         const indexName = env.PINECONE_INDEX_NAME

//         const ListeDesIndex = await pinecone.listIndexes()

//         if(!ListeDesIndex.includes(indexName)){
//             createIndex(pinecone, indexName)
//         }else{
//             console.log(`L'index ${indexName} existe`)
//         }

//         return pinecone;
//     } catch (error) {
//         console.log(error)
//         throw new Error('Erreur d\'initialisation de pinecone')
//     }

// }


type PDFPage = {
    pageContent: string;
    metadata: {
        loc: { pageNumber: number; fileKey: string };
    };
};

export async function loadS3IntoPinecone(fileKey: string, plan: any) {
    console.log("downloading s3 into file system");
    const file_name = await downloadPDF(fileKey);
    if (!file_name) throw new Error("could not download file from s3");
    const loader = new PDFLoader(file_name);

    const pages = (await loader.load()) as PDFPage[];
    console.log(pages.length, "pages, plan : ", plan);

    if(plan == 'Gratuit' && pages.length > 5){
        return 100
    }

    if(plan == 'Standard' && pages.length > 30){
        return 150
    }

    const documents = await Promise.all(
        pages.map((page) => prepareDocument(page, fileKey))
    );

    const vectors = await Promise.all(
        documents.flat().map((doc) => embedDocument(doc, fileKey))
    );


    const client = await getPineconeClient();
    const pineconeIndex = await client.index(env.PINECONE_INDEX_NAME);

    console.log("Inserting vectors into pinecone...");
    const request = vectors;

    const batchSize = 100; // Adjust the batch size as needed
    const totalVectors = vectors.length;

    for (let i = 0; i < totalVectors; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        try {
            console.log(`Inserting vectors into Pinecone (batch ${i / batchSize + 1})...`);
            await pineconeIndex.upsert(batch);
            console.log(`Inserted vectors into Pinecone (batch ${i / batchSize + 1})`);
        } catch (error) {
            console.error(`Error upserting vectors into Pinecone (batch ${i / batchSize + 1}):`, error);
            // Handle the error appropriately
            throw error;
        }
    }
    // try {
    //     // Pinecone upsert operation
    //     await pineconeIndex.upsert(request);
    //     console.log("Inserted vectors into Pinecone");
    // } catch (error) {
    //     console.error("Error upserting vectors into Pinecone:", error);
    //     // Handle the error appropriately
    //     throw error;
    // }
    console.log("Inserted vectors into pinecone");

    return documents[0];
}

async function embedDocument(doc: Document, fileKey: string) {
    try {
        const embeddings = await getEmbeddings(doc.pageContent);
        const hash = md5(doc.pageContent);

        return {
            id: hash,
            values: embeddings,
            metadata: {
                text: doc.metadata.text,
                pageNumber: doc.metadata.pageNumber,
                fileKey,
            },
        } as PineconeRecord;
    } catch (error) {
        console.log("error embedding document", error);
        throw error;
    }
}

export const truncateStringByBytes = (str: string, bytes: number) => {
    const enc = new TextEncoder();
    return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

async function prepareDocument(page: PDFPage, fileKey: string) {
    //console.log(page, "page in preparedoc");
    let { pageContent, metadata } = page;
    pageContent = pageContent.replace(/\n/g, "");
    // split the docs
    const splitter = new RecursiveCharacterTextSplitter();
    const docs = await splitter.splitDocuments([
        new Document({
            pageContent,
            metadata: {
                pageNumber: metadata.loc.pageNumber,
                text: truncateStringByBytes(pageContent, 36000),
                fileKey,
            },
        }),
    ]);
    return docs;
}

