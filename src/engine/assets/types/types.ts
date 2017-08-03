import { TypeHandler } from "./type-handler";
import { readAsArrayBuffer } from "promise-file-reader";
import DataStream from "../data-stream";
import { handle as BLST } from "./BLST";
import { handle as PLST } from "./PLST";
import tBMP from "./tBMP";

let types = new Map<string, TypeHandler>();

types.set("BLST", BLST);
types.set("PLST", PLST);
types.set("tBMP", tBMP);

export default types;
