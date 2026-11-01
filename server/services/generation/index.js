// Starts the generation service as its own process.
import { startService } from "../../common/startService.js";
import routes from "./routes.js";

await startService("generation", routes);
