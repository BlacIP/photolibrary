
const fs = require('fs');
const path = require('path');

// Load Env BEFORE requiring cloudinary (to test if it picks it up, or if we need manual config)
try {
    const envPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
        console.log('Loading .env from', envPath);
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
            if (match) {
                let key = match[1];
                let value = match[2] || '';
                if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
                if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
                process.env[key] = value;
            }
        });
    } else {
        console.warn('.env file not found at', envPath);
    }
} catch (e) {
    console.error('Env load error:', e);
}

// Require Cloudinary AFTER env load
const cloudinary = require('cloudinary').v2;

console.log('CLOUDINARY_URL loaded:', process.env.CLOUDINARY_URL ? 'Yes (Length: ' + process.env.CLOUDINARY_URL.length + ')' : 'No');

// Explicitly config
if (process.env.CLOUDINARY_URL) {
    cloudinary.config({
        cloudinary_url: process.env.CLOUDINARY_URL
    });
} else {
    console.warn('NO CLOUDINARY_URL ENV VAR SET!');
}

async function run() {
    console.log('Attempting upload...');
    try {
        const buffer = Buffer.from('Test upload for debugging ' + Date.now());
        
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'photolibrary/debug' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(buffer);
        });
        
        console.log('Upload SUCCESS!');
        console.log('URL:', result.secure_url);
        
        console.log('Deleting debug file:', result.public_id);
        await cloudinary.uploader.destroy(result.public_id);
        console.log('Cleanup SUCCESS');
        
    } catch (e) {
        console.error('Upload FAILED:');
        console.error(e);
        if (e.error) console.error('Cloudinary Error Details:', e.error);
    }
}

run();
