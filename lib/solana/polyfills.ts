import { Buffer } from "buffer";
import process from "process";

if (typeof window !== "undefined") {
  (window as unknown as Window & { global: Window; Buffer: typeof Buffer }).global = window;
  (window as unknown as Window & { global: Window; Buffer: typeof Buffer }).Buffer = Buffer;
  (window as unknown as Window & { process: typeof process }).process = (window as unknown as Window & { process: typeof process }).process ?? process;
}
