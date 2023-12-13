import { Pinecone, PineconeClient } from "@pinecone-database/pinecone";
import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embeddings";
import { env } from './config'
import { NextResponse } from "next/server";

// export async function getMatchesFromEmbeddings(
//     embeddings: number[],
//     fileKey: string
// ) {
//     try {
//         const client = new Pinecone({
//             environment: env.PINECONE_ENVIRONMENT,
//             apiKey: env.PINECONE_API_KEY,
//         });
//         const pineconeIndex = await client.index(env.PINECONE_INDEX_NAME);
//         const queryResponse = await pineconeIndex.query({
//             vector: embeddings,
//             filter: { fileKey: { $eq: fileKey } },
//             topK: 5,
//             includeMetadata: true,
//         });

//         return queryResponse.matches || [];
//     } catch (error) {
//         console.log("error querying embeddings", error);
//         throw error;
//     }
// }

export async function getMatchesFromEmbeddings(
    embeddings: number[],
    fileKey: string
) {
    try {
        const client = new Pinecone({
            environment: env.PINECONE_ENVIRONMENT,
            apiKey: env.PINECONE_API_KEY,
        });
        const pineconeIndex = await client.index(env.PINECONE_INDEX_NAME);
        const queryResponse = await pineconeIndex.query({
            vector: embeddings,
            filter: { fileKey: { $eq: fileKey } },
            topK: 5,
            includeMetadata: true,
        });

        console.log('query response : ', queryResponse)

        return queryResponse.matches || [];
    } catch (error) {
        console.log("error querying embeddings", error);
        throw error;
    }
}


export async function getContext(query: string, fileKey: string) {
    const queryEmbeddings = await getEmbeddings(query)
    
    const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey)

    const qualifyingDocs = matches.filter((match) => match.score && match.score > 0.7)

    type Metadata = {
        text: string,
        pageNumber: number,
    }

    let docs = qualifyingDocs.map(match => (match.metadata as Metadata).text)
    return docs.join('\n').substring(0, 3000)

}


