declare module '@jspawn/ghostscript-wasm' {
  type EmscriptenModule = {
    FS: {
      writeFile: (path: string, data: Uint8Array) => void;
      readFile: (path: string) => Uint8Array;
      unlink: (path: string) => void;
    };
    callMain: (args: string[]) => void;
  };

  type CreateModuleFn = (options?: {
    locateFile?: (path: string, prefix: string) => string;
    noInitialRun?: boolean;
    print?: (text: string) => void;
    printErr?: (text: string) => void;
  }) => Promise<EmscriptenModule>;

  const createModule: CreateModuleFn;
  export default createModule;
}

declare module '@jspawn/ghostscript-wasm/gs.mjs' {
  type EmscriptenModule = {
    FS: {
      writeFile: (path: string, data: Uint8Array) => void;
      readFile: (path: string) => Uint8Array;
      unlink: (path: string) => void;
    };
    callMain: (args: string[]) => void;
  };

  type CreateModuleFn = (options?: {
    locateFile?: (path: string, prefix: string) => string;
    noInitialRun?: boolean;
    print?: (text: string) => void;
    printErr?: (text: string) => void;
  }) => Promise<EmscriptenModule>;

  const createModule: CreateModuleFn;
  export default createModule;
}

declare module '@jspawn/ghostscript-wasm/gs.js' {
  const createModule: any;
  export default createModule;
}
