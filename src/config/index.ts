import {config} from "dotenv";
config();
const { PORT,NODE_EW}=process.env;
export const Config = {
    NODE_EW,
    PORT};
