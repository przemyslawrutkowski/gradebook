import { PORT } from './modules/validateEnv.js'
import app from './server.js';

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}.`);
});
