
const cloudinary = require('cloudinary').v2;
// Configure with env vars (assuming they are set in shell or I will load them)
// Actually I rely on nextjs env loading but for this script I might need to load dotenv or just rely on global env if passed.
// I'll grab env from process in the run_command.

async function checkUsage() {
    try {
        const result = await cloudinary.api.usage();
        console.log(JSON.stringify(result, null, 2));
    } catch (e) {
        console.error('Error:', e);
    }
}

checkUsage();
