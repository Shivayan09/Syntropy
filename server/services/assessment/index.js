// Starts the assessment service as its own process.
import { startService } from "../../common/startService.js";
import routes from "./routes.js";

await startService("assessment", routes);
