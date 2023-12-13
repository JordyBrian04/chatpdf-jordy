// pages/api/download-and-store-pdf.js
import axios from 'axios';
import fs from 'fs';
import path from 'path';

export async function downloadPDF(file_key: string) {
    try {
        const { data } = await axios.get(`https://mon-rosaire.000webhostapp.com/${file_key}`, {
            responseType: 'arraybuffer',
        });

        // const tempFolderPath = path.join(process.cwd(), 'temp');
        const fileName = `/tmp/pdf-${Date.now()}.pdf`;
        // const filePath = path.join(tempFolderPath, fileName);

        // Create the temp folder if it doesn't exist
        // if (!fs.existsSync(tempFolderPath)) {
        //     fs.mkdirSync(tempFolderPath);
        // }

        // Write the downloaded PDF file to the temp folder
        fs.writeFileSync(fileName, Buffer.from(data));
        return fileName;

        //res.status(200).json({ success: true, filePath });
    } catch (error) {
        console.error('Error downloading and storing PDF: ', error);
        //res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

export function pdfUrl(file_key: string){
    const url = `https://mon-rosaire.000webhostapp.com/${file_key}`;
    return url;
}
