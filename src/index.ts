import 'dotenv/config';
import app from './server.js';

const port = process.env.PORT;

if (!port) {
    console.error('Missing required environment variables.');
    process.exit(1);
}

app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});
