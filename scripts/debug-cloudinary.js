
const fs = require('fs');
const path = require('path');

// 1. Load Env
try {
    const envPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
        console.log('Found .env at:', envPath);
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
    }
} catch (e) {
    console.error('Env load error:', e);
}

// 2. Require Cloudinary AFTER env is set
const cloudinary = require('cloudinary').v2;

async function run() {
    console.log('Checking Config...');
    const url = process.env.CLOUDINARY_URL;
    if (url) {
        console.log('CLOUDINARY_URL found:', url.replace(/:[^:]*@/, ':****@')); // Mask secret
    } else {
        console.log('CLOUDINARY_URL not found. Checking individual keys...');
        console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    }

    // Explicitly configure if URL is present, just to be sure
    if (url) {
        cloudinary.config({
            cloudinary_url: url
        });
    }

    try {
        console.log('Fetching Usage...');
        const result = await cloudinary.api.usage();
        console.log('--- USAGE DATA ---');
        console.log(JSON.stringify(result, null, 2));
    } catch (e) {
        console.error('API Error:', e.message);
        if (e.error) console.error('Details:', e.error);
    }
}

run();
