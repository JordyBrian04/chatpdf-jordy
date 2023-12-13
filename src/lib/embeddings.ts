import { OpenAIApi, Configuration } from 'openai-edge';
import { env } from './config'

const config = new Configuration({
    apiKey: env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

export async function getEmbeddings(text: string) {
    try {
        const response = await openai.createEmbedding({
            model: 'text-embedding-ada-002',
            input: text.replace(/\n/g, ' '),
        });

        const result = await response.json();

        if (result.error) {
            console.error('OpenAI API Error:', result.error);
            throw new Error('OpenAI API Error');
        }

        if (
            result.data &&
            Array.isArray(result.data) &&
            result.data.length > 0 &&
            result.data[0].embedding
        ) {
            return result.data[0].embedding as number[];
        } else {
            console.log("[OPEN AI] Unexpected response structure:", result);
            throw new Error("Unexpected response from OpenAI API");
        }

        //return result.data[0].embedding as number[];
    } catch (error) {
        console.log('error calling openai embeddings api', error);
        throw error;
    }
}


// import {OpenAIApi, Configuration} from 'openai-edge'
// import { env } from './config'

// const config = new Configuration({
//     //apiKey: "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"
//     apiKey: env.OPENAI_API_KEY
// })

// const openai = new OpenAIApi(config)

// export async function getEmbeddings(text: string) {
//     try{
//         const response = await openai.createEmbedding({
//             model: "text-embedding-ada-002",
//             input: text.replace(/\n/g,' ')
//         })
//         const result = await response.json()
//         console.log('response embeddings: ', result)
//         return result.data[0].embedding as number[]
//     }catch (error){
//         console.log('Erreur de connexion à l\‘openai')
//         throw error
//     }
// }