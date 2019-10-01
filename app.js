import * as dotenv from "dotenv";

dotenv.config();

import MicroMQ from "micromq"
import routes from "./src/routes"

const app = new MicroMQ({
    name: 'users',
    rabbit: {
        url: process.env.RABBIT_URL,
    },
});

routes(app);

app.start();