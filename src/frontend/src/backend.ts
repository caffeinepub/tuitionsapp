// Stub backend interface for local development
// This file is replaced by the build pipeline with auto-generated bindings

export type CreateActorOptions = {
  agentOptions?: Record<string, unknown>;
  [key: string]: unknown;
};

export class ExternalBlob {
  private _bytes: Uint8Array;
  onProgress?: (progress: number) => void;

  constructor(bytes: Uint8Array) {
    this._bytes = bytes;
  }

  async getBytes(): Promise<Uint8Array> {
    return this._bytes;
  }

  static fromURL(url: string): ExternalBlob {
    void url;
    return new ExternalBlob(new Uint8Array());
  }
}

export type backendInterface = {
  _initializeAccessControlWithSecret: (token: string) => Promise<void>;
  [key: string]: unknown;
};

export function createActor(
  _canisterId: string,
  _uploadFile: (blob: ExternalBlob) => Promise<Uint8Array>,
  _downloadFile: (bytes: Uint8Array) => Promise<ExternalBlob>,
  _options?: CreateActorOptions,
): backendInterface {
  return {
    _initializeAccessControlWithSecret: async (_token: string) => {},
  };
}
