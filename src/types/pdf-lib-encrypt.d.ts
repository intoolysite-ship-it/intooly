declare module "pdf-lib-encrypt" {
  export function configure(pdfLib: unknown): void;
  export function lock(
    plainBytes: Uint8Array,
    password: string,
    opts?: { algo?: "aes256" | "rc4" }
  ): Promise<Uint8Array>;
  export function unlockInPlace(
    pdfDoc: unknown,
    password: string
  ): Promise<boolean>;
}