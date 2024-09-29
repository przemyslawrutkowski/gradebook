const PORT = process.env.PORT!;
const SECRET_KEY = process.env.SECRET_KEY!;
const DATABASE_URL = process.env.DATABASE_URL!;
const DATABASE_TEST_URL = process.env.DATABASE_TEST_URL!;
const SMTP_USER = process.env.SMTP_USER!;
const SMTP_PASS = process.env.SMTP_PASS!;
const BEARER_TOKEN = process.env.BEARER_TOKEN!;

if (!PORT || !SECRET_KEY || !DATABASE_URL || !DATABASE_TEST_URL || !SMTP_USER || !SMTP_PASS || !BEARER_TOKEN) {
    throw new Error('Missing required environment variables. Please check your .env file.');
}

export { PORT, SECRET_KEY, DATABASE_URL, DATABASE_TEST_URL, SMTP_USER, SMTP_PASS, BEARER_TOKEN };