// API Configuration
// Update this IP address to match your backend server
export const BASE_URL = "http://192.168.1.100:8000";

export interface Memory {
  id: string;
  title?: string;
  date?: string;
  thumbnail?: string;
  images?: string[];
  video?: string;
  audio?: string;
  story?: string;
  captions?: string[];
  transcript?: string;
  faces?: Face[];
}

export interface Face {
  image: string;
  label?: string;
}

export interface SearchResult {
  id: string;
  title?: string;
  date?: string;
  thumbnail?: string;
  matchReason?: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async getMemories(): Promise<Memory[]> {
    try {
      const response = await fetch(`${this.baseUrl}/memories`);
      const data = await response.json();
      return data.memories || [];
    } catch (error) {
      console.error('Error fetching memories:', error);
      throw error;
    }
  }

  async getMemory(id: string): Promise<Memory> {
    try {
      const response = await fetch(`${this.baseUrl}/memory/${id}`);
      if (!response.ok) {
        throw new Error('Memory not found');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching memory:', error);
      throw error;
    }
  }

  async uploadMemory(formData: FormData): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading memory:', error);
      throw error;
    }
  }

  async saveFaceLabels(memoryId: string, labels: Record<number, string>): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/memory/${memoryId}/faces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ labels }),
      });

      if (!response.ok) {
        throw new Error('Failed to save face labels');
      }
    } catch (error) {
      console.error('Error saving face labels:', error);
      throw error;
    }
  }

  async generateStory(memoryId: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/memory/${memoryId}/generate-story`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate story');
      }

      const data = await response.json();
      return data.story;
    } catch (error) {
      console.error('Error generating story:', error);
      throw error;
    }
  }

  async searchMemories(query: string): Promise<SearchResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error searching memories:', error);
      throw error;
    }
  }

  getAudioUrl(memoryId: string): string {
    return `${this.baseUrl}/memory/${memoryId}/audio`;
  }

  getImageUrl(imagePath: string): string {
    return `${this.baseUrl}${imagePath}`;
  }
}

export const apiService = new ApiService();