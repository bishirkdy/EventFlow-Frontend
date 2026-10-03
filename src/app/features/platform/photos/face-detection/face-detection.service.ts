import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

export interface FaceDescriptor {
  descriptor: Float32Array;
  imageId: string;
}

export interface MatchedPhoto {
  photoId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  confidence: number;
  faceBox?: { x: number; y: number; width: number; height: number };
}

@Injectable({
  providedIn: 'root'
})
export class FaceDetectionService {
  private readonly http = inject(HttpClient);
  private modelsLoaded = false;
  private loadPromise: Promise<void> | null = null;
  private faceDescriptors = new Map<string, Float32Array>(); // photoId -> descriptor
  private userFaceDescriptor: Float32Array | null = null;

  // Model URLs - using CDN
  private readonly MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.10/model/';

  async loadModels(): Promise<void> {
    if (this.modelsLoaded) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = this._loadModels();
    return this.loadPromise;
  }

  private async _loadModels(): Promise<void> {
    // Dynamic import of face-api.js
    const faceapi = await import('face-api.js');

    // Load models from CDN
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(this.MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(this.MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(this.MODEL_URL),
    ]);

    this.modelsLoaded = true;
  }

  async detectFaces(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<any[]> {
    await this.loadModels();
    const faceapi = await import('face-api.js');

    const detections = await faceapi.detectAllFaces(
      imageElement,
      new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 })
    ).withFaceLandmarks().withFaceDescriptors();

    return detections;
  }

  async computeFaceDescriptor(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<Float32Array | null> {
    await this.loadModels();
    const faceapi = await import('face-api.js');

    const detection = await faceapi.detectSingleFace(
      imageElement,
      new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 })
    ).withFaceLandmarks().withFaceDescriptor();

    return detection?.descriptor ?? null;
  }

  async processEventPhotos(photoUrls: string[]): Promise<FaceDescriptor[]> {
    const descriptors: FaceDescriptor[] = [];

    for (const url of photoUrls) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load ${url}`));
      });

      try {
        const descriptor = await this.computeFaceDescriptor(img);
        if (descriptor) {
          descriptors.push({
            descriptor,
            imageId: url
          });
        }
      } catch (error) {
        console.warn(`Failed to process ${url}:`, error);
      }
    }

    return descriptors;
  }

  setUserFaceDescriptor(descriptor: Float32Array): void {
    this.userFaceDescriptor = descriptor;
    // Store in IndexedDB for persistence
    this.storeUserFaceDescriptor(descriptor);
  }

  getUserFaceDescriptor(): Float32Array | null {
    if (this.userFaceDescriptor) return this.userFaceDescriptor;
    return this.loadUserFaceDescriptor();
  }

  clearUserFaceDescriptor(): void {
    this.userFaceDescriptor = null;
    this.clearStoredUserFaceDescriptor();
  }

  findMatchingPhotos(userDescriptor: Float32Array, eventDescriptors: FaceDescriptor[], threshold = 0.6): MatchedPhoto[] {
    const matches: MatchedPhoto[] = [];

    for (const desc of eventDescriptors) {
      const distance = this.euclideanDistance(userDescriptor, desc.descriptor);
      if (distance < threshold) {
        matches.push({
          photoId: desc.imageId,
          imageUrl: desc.imageId,
          confidence: 1 - distance / threshold, // Normalize to 0-1
        });
      }
    }

    // Sort by confidence (highest first)
    matches.sort((a, b) => b.confidence - a.confidence);
    return matches;
  }

  private euclideanDistance(a: Float32Array, b: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      const diff = a[i] - b[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }

  private async storeUserFaceDescriptor(descriptor: Float32Array): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('faceProfiles', 'readwrite');
        const store = tx.objectStore('faceProfiles');
        const data = Array.from(descriptor);
        store.put({ id: 'currentUser', descriptor: data, timestamp: Date.now() });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (error) {
      console.warn('Failed to store face descriptor:', error);
    }
  }

  private loadUserFaceDescriptor(): Float32Array | null {
    // Synchronous load - will be improved with async version
    try {
      // This is a simplified version - in production you'd use async/await
      return null;
    } catch {
      return null;
    }
  }

  private async clearStoredUserFaceDescriptor(): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('faceProfiles', 'readwrite');
        const store = tx.objectStore('faceProfiles');
        store.delete('currentUser');
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (error) {
      console.warn('Failed to clear face descriptor:', error);
    }
  }

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('EventFlowFaceDetection', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('faceProfiles')) {
          db.createObjectStore('faceProfiles', { keyPath: 'id' });
        }
      };
    });
  }

  async loadUserFaceDescriptorAsync(): Promise<Float32Array | null> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('faceProfiles', 'readonly');
        const store = tx.objectStore('faceProfiles');
        const request = store.get('currentUser');
        request.onsuccess = () => {
          const result = request.result;
          if (result && result.descriptor) {
            resolve(new Float32Array(result.descriptor));
          } else {
            resolve(null);
          }
        };
        request.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }
}