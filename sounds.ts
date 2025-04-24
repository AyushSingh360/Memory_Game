// This file provides a simple sound API that works in Next.js
export class SoundManager {
  private static instance: SoundManager
  private sounds: Map<string, HTMLAudioElement> = new Map()
  private enabled = true

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager()
    }
    return SoundManager.instance
  }

  public preload(id: string, url: string): void {
    if (typeof window === "undefined") return

    try {
      const audio = new Audio()
      audio.src = url
      audio.preload = "auto"
      audio.volume = 0.5
      this.sounds.set(id, audio)

      // Force preload
      audio.load()
    } catch (error) {
      console.error(`Failed to preload sound ${id}:`, error)
    }
  }

  public play(id: string): void {
    if (!this.enabled || typeof window === "undefined") return

    const sound = this.sounds.get(id)
    if (sound) {
      // Create a clone to allow overlapping sounds
      try {
        const clone = sound.cloneNode() as HTMLAudioElement
        clone.volume = 0.5
        clone.play().catch((e) => {
          console.log(`Error playing ${id}:`, e.message)
        })
      } catch (error) {
        console.error(`Failed to play sound ${id}:`, error)
      }
    }
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  public isEnabled(): boolean {
    return this.enabled
  }
}

export default SoundManager.getInstance()
