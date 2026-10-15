export class RealAudioAnalyser {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  private isDestroyed: boolean = false;

  constructor(streamOrElement?: MediaStream | HTMLAudioElement) {
    if (typeof window === "undefined") return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      this.audioCtx = new AudioContextClass();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      if (streamOrElement instanceof MediaStream) {
        this.sourceNode = this.audioCtx.createMediaStreamSource(streamOrElement);
        this.sourceNode.connect(this.analyser);
      } else if (streamOrElement instanceof HTMLAudioElement) {
        this.sourceNode = this.audioCtx.createMediaElementSource(streamOrElement);
        this.sourceNode.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);
      }
    } catch (err) {
      console.warn("RealAudioAnalyser initialization issue:", err);
    }
  }

  public attachStream(stream: MediaStream) {
    if (!this.audioCtx || this.isDestroyed) return;
    try {
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }
      if (this.sourceNode) {
        try {
          this.sourceNode.disconnect();
        } catch {}
      }
      this.sourceNode = this.audioCtx.createMediaStreamSource(stream);
      if (this.analyser) {
        this.sourceNode.connect(this.analyser);
      }
    } catch (err) {
      console.warn("Failed to attach media stream to audio analyser:", err);
    }
  }

  public attachAudioElement(element: HTMLAudioElement) {
    if (!this.audioCtx || this.isDestroyed) return;
    try {
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }
      if (this.sourceNode) {
        try {
          this.sourceNode.disconnect();
        } catch {}
      }
      this.sourceNode = this.audioCtx.createMediaElementSource(element);
      if (this.analyser) {
        this.sourceNode.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);
      }
    } catch (err) {
      console.warn("Failed to attach audio element to audio analyser:", err);
    }
  }

  public getFrequencies(): number[] {
    if (!this.analyser || !this.dataArray || this.isDestroyed) {
      return new Array(16).fill(0);
    }

    this.analyser.getByteFrequencyData(this.dataArray as any);
    // Downsample to 16 normalized values (0 to 1)
    const step = Math.floor(this.dataArray.length / 16);
    const result: number[] = [];
    for (let i = 0; i < 16; i++) {
      const val = this.dataArray[i * step] || 0;
      result.push(val / 255);
    }
    return result;
  }

  public destroy() {
    this.isDestroyed = true;
    try {
      if (this.sourceNode) this.sourceNode.disconnect();
      if (this.analyser) this.analyser.disconnect();
      if (this.audioCtx && this.audioCtx.state !== "closed") {
        this.audioCtx.close();
      }
    } catch {}
  }
}
