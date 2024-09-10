const PORT = process.env.PORT!;
const SECRET_KEY = process.env.SECRET_KEY!;
const DATABASE_URL = process.env.DATABASE_URL!;
const SMTP_USER = process.env.SMTP_USER!;
const SMTP_PASS = process.env.SMTP_PASS!;

if (!PORT || !SECRET_KEY || !DATABASE_URL || !SMTP_USER || !SMTP_PASS) {
    throw new Error('Missing required environment variables. Please check your .env file.');
}

export { PORT, SECRET_KEY, DATABASE_URL, SMTP_USER, SMTP_PASS };