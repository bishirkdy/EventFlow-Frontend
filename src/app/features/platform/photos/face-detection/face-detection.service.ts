import { Injectable } from '@angular/core';

export interface FaceDescriptor {
  descriptor: Float32Array;
  imageId: string;
}

export interface MatchedPhoto {
  photoId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  confidence: number;
  faceBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface StoredFaceProfile {
  id: string;
  descriptor: number[];
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class FaceDetectionService {
  private modelsLoaded = false;
  private loadPromise: Promise<void> | null = null;

  // Stores multiple face descriptors for each photo URL.
  private readonly faceDescriptors = new Map<string, Float32Array[]>();

  // Stores the current user's face descriptor.
  private userFaceDescriptor: Float32Array | null = null;

  private readonly MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.10/model/';

  private readonly DB_NAME = 'EventFlowFaceDetection';
  private readonly STORE_NAME = 'faceProfiles';
  private readonly PROFILE_KEY = 'currentUser';

  async loadModels(): Promise<void> {
    if (this.modelsLoaded) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = this._loadModels();

    try {
      await this.loadPromise;
    } catch (error) {
      this.loadPromise = null;
      throw error;
    }
  }

  private async _loadModels(): Promise<void> {
    const faceapi = await import('@vladmandic/face-api');

    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(this.MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(this.MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(this.MODEL_URL),
    ]);

    this.modelsLoaded = true;
  }

  async detectFaces(
    imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  ): Promise<any[]> {
    await this.loadModels();

    const faceapi = await import('@vladmandic/face-api');

    return faceapi
      .detectAllFaces(
        imageElement,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 320,
          scoreThreshold: 0.6,
        }),
      )
      .withFaceLandmarks()
      .withFaceDescriptors();
  }

  async computeFaceDescriptor(
    imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  ): Promise<Float32Array | null> {
    await this.loadModels();
    const faceapi = await import('@vladmandic/face-api');
    const detection = await faceapi
      .detectSingleFace(
        imageElement,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 224,
          scoreThreshold: 0.4,
        }),
      )
      .withFaceLandmarks()
      .withFaceDescriptor();

    return detection?.descriptor ?? null;
  }

  async processEventPhotos(photoUrls: string[]): Promise<FaceDescriptor[]> {
    const uniqueUrls = [...new Set(photoUrls)];

    const results = await Promise.all(
      Array.from({ length: Math.min(3, uniqueUrls.length) }, async (_, workerIndex) => {
        const descriptors: FaceDescriptor[] = [];

        for (let index = workerIndex; index < uniqueUrls.length; index += 3) {
          const url = uniqueUrls[index];

          try {
            const cached = this.faceDescriptors.get(url);

            if (cached) {
              for (const descriptor of cached) {
                descriptors.push({
                  descriptor,
                  imageId: url,
                });
              }
            }

            const image = await this.loadImage(url);
            const detectedFaces = await this.detectFaces(image);

            for (let faceIndex = 0; faceIndex < detectedFaces.length; faceIndex++) {
              const descriptor = detectedFaces[faceIndex].descriptor;

              if (descriptor) {
                descriptors.push({
                  descriptor: new Float32Array(descriptor),
                  imageId: url,
                });
              }
            }

            // Cache all descriptors for this photo in future iterations.
            // See the note below about multi-face caching.
          } catch (error) {
            console.warn(`Failed to process photo ${url}:`, error);
          }
        }

        return descriptors;
      }),
    );

    return results.flat();
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.crossOrigin = 'anonymous';

      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Failed to load image: ${url}`));

      image.src = url;
    });
  }

  async setUserFaceDescriptor(descriptor: Float32Array): Promise<void> {
    if (!descriptor.length) {
      throw new Error('Cannot save an empty face descriptor.');
    }

    // Update the in-memory cache immediately.
    this.userFaceDescriptor = new Float32Array(descriptor);

    try {
      const db = await this.openDB();

      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(this.STORE_NAME, 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);

        const profile: StoredFaceProfile = {
          id: this.PROFILE_KEY,
          descriptor: Array.from(descriptor),
          timestamp: Date.now(),
        };

        store.put(profile);

        transaction.oncomplete = () => resolve();
        transaction.onerror = () =>
          reject(transaction.error ?? new Error('Failed to save face profile.'));
        transaction.onabort = () =>
          reject(transaction.error ?? new Error('Face profile save was aborted.'));
      });

      db.close();
    } catch (error) {
      console.error('Failed to persist face descriptor:', error);
      throw error;
    }
  }

  getUserFaceDescriptor(): Float32Array | null {
    return this.userFaceDescriptor ? new Float32Array(this.userFaceDescriptor) : null;
  }

  async loadUserFaceDescriptorAsync(): Promise<Float32Array | null> {
    // Return cached data when available.
    if (this.userFaceDescriptor) {
      return new Float32Array(this.userFaceDescriptor);
    }

    try {
      const db = await this.openDB();

      const descriptor = await new Promise<Float32Array | null>((resolve, reject) => {
        const transaction = db.transaction(this.STORE_NAME, 'readonly');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.get(this.PROFILE_KEY);

        request.onsuccess = () => {
          const result = request.result as StoredFaceProfile | undefined;

          if (result?.descriptor?.length) {
            resolve(new Float32Array(result.descriptor));
          } else {
            resolve(null);
          }
        };

        request.onerror = () => reject(request.error ?? new Error('Failed to load face profile.'));
      });

      db.close();

      if (descriptor) {
        this.userFaceDescriptor = new Float32Array(descriptor);
      }

      return descriptor;
    } catch (error) {
      console.error('Failed to load face descriptor:', error);
      return null;
    }
  }

  async clearUserFaceDescriptor(): Promise<void> {
    this.userFaceDescriptor = null;
    this.faceDescriptors.clear();

    try {
      const db = await this.openDB();

      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(this.STORE_NAME, 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);

        store.delete(this.PROFILE_KEY);

        transaction.oncomplete = () => resolve();
        transaction.onerror = () =>
          reject(transaction.error ?? new Error('Failed to delete face profile.'));
        transaction.onabort = () =>
          reject(transaction.error ?? new Error('Face profile deletion was aborted.'));
      });

      db.close();
    } catch (error) {
      console.error('Failed to clear stored face descriptor:', error);
      throw error;
    }
  }

  findMatchingPhotos(
    userDescriptor: Float32Array,
    eventDescriptors: FaceDescriptor[],
    threshold = 0.6,
  ): MatchedPhoto[] {
    const bestMatches = new Map<string, MatchedPhoto>();

    for (const item of eventDescriptors) {
      if (userDescriptor.length !== item.descriptor.length) {
        continue;
      }

      const distance = this.euclideanDistance(userDescriptor, item.descriptor);

      if (distance >= threshold) {
        continue;
      }

      const confidence = Math.max(0, Math.min(1, 1 - distance / threshold));

      const existing = bestMatches.get(item.imageId);

      if (!existing || confidence > existing.confidence) {
        bestMatches.set(item.imageId, {
          photoId: item.imageId,
          imageUrl: item.imageId,
          confidence,
        });
      }
    }

    return [...bestMatches.values()].sort((a, b) => b.confidence - a.confidence);
  }

  private euclideanDistance(first: Float32Array, second: Float32Array): number {
    let sum = 0;

    for (let index = 0; index < first.length; index++) {
      const difference = first[index] - second[index];
      sum += difference * difference;
    }

    return Math.sqrt(sum);
  }

  private openDB(): Promise<IDBDatabase> {
    if (typeof indexedDB === 'undefined') {
      return Promise.reject(new Error('IndexedDB is unavailable in this environment.'));
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1);

      request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB.'));
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }
}
