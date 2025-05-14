import { NextRequest, NextResponse } from 'next/server';
import { createWriteStream, promises as fs } from 'fs';
import { join } from 'path';
import { Readable } from 'stream';

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parsing for this route
  },
};

const uploadDir = join(process.cwd(), 'public/images/logo'); // Directory to save uploaded files

export async function POST(req: NextRequest) {
  try {
    // Ensure the upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 });
    }

    const boundary = contentType.split('boundary=')[1];
    if (!boundary) {
      return NextResponse.json({ error: 'Missing boundary in content type' }, { status: 400 });
    }

    const reader = req.body?.getReader();
    if (!reader) {
      return NextResponse.json({ error: 'Failed to read request body' }, { status: 400 });
    }

    let fileName = '';
    let fileStream: any;
    let isFile = false;
    let boundaryPattern = new RegExp(`--${boundary}`);

    const processChunk = async (chunk: Uint8Array) => {
      const chunkStr = new TextDecoder('utf-8').decode(chunk);
      console.log("Processing chunk:", chunkStr); // Log the chunk for debugging
      if (chunkStr.includes('filename="')) {
        fileName = chunkStr.match(/filename="(.+?)"/)?.[1] || '';
        fileStream = createWriteStream(join(uploadDir, fileName));
        console.log("Creating file stream for:", fileName); // Log the filename
        isFile = true;
      } else if (isFile) {
        if (boundaryPattern.test(chunkStr)) {
          console.log("Boundary found, ending file stream"); // Log boundary detection
          fileStream?.end();
          isFile = false;
        } else {
          fileStream?.write(chunk);
          console.log("Writing to file stream"); // Log file writing
        }
      }
    };
    

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      await processChunk(value);
    }

    return NextResponse.json({ filePath: `/images/logo/${fileName}` }, { status: 200 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
