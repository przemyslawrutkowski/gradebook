const PORT = process.env.PORT!;
const SECRET_KEY = process.env.SECRET_KEY!;
const DATABASE_URL = process.env.DATABASE_URL!;
const DATABASE_TEST_URL = process.env.DATABASE_TEST_URL!;
const SMTP_USER = process.env.SMTP_USER!;
const SMTP_PASS = process.env.SMTP_PASS!;
const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluaXN0cmF0b3JAZXhhbXBsZS5jb20iLCJmaXJzdE5hbWUiOiJKYW1lcyIsImxhc3ROYW1lIjoiTWFydGluZXoiLCJyb2xlIjoiYWRtaW5pc3RyYXRvciIsImlhdCI6MTcyNDE3NDM5MH0.nx64DBB6X_8rXHPlp7eDZxeRz5LaFIE8Dcwf1mE8Mm0';

if (!PORT || !SECRET_KEY || !DATABASE_URL || !DATABASE_TEST_URL || !SMTP_USER || !SMTP_PASS || !BEARER_TOKEN) {
    throw new Error('Missing required environment variables. Please check your .env file.');
}

export { PORT, SECRET_KEY, DATABASE_URL, DATABASE_TEST_URL, SMTP_USER, SMTP_PASS, BEARER_TOKEN };