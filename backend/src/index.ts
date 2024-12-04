import { PORT } from './modules/validateEnv.js';
import { server } from './server.js';

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}.`);
});