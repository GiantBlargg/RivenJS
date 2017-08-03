import { TypeHandler } from "./type-handler";
import { readAsArrayBuffer } from "promise-file-reader";
import DataStream from "../data-stream";
import { handle as BLST } from "./BLST";
import tBMP from "./tBMP";

let types = new Map<string, TypeHandler>();

types.set("BLST", BLST);
types.set("tBMP", tBMP);

export default types;
