const BASE_URL = '/api'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

class ApiClient {
  private authToken: string | null = null

  setAuthToken(token: string | null) {
    this.authToken = token
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`
    }

    return headers
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${BASE_URL}${endpoint}`
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`
        
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          // Ignore JSON parsing errors
        }
        
        throw new ApiError(response.status, errorMessage)
      }

      const data = await response.json()
      return data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(0, 'Ошибка сети')
    }
  }

  async get(endpoint: string): Promise<any> {
    return this.request(endpoint, { method: 'GET' })
  }

  async post(endpoint: string, data?: any): Promise<any> {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put(endpoint: string, data?: any): Promise<any> {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete(endpoint: string): Promise<any> {
    return this.request(endpoint, { method: 'DELETE' })
  }

  // Auth methods
  async login(password: string) {
    return this.post('/auth/login', { password })
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.post('/auth/change-password', { currentPassword, newPassword })
  }

  // Sections methods
  async getSections() {
    return this.get('/sections')
  }

  // Subtopics methods
  async createSubtopic(data: { name: string; description?: string; sectionId: number }) {
    return this.post('/subtopics', data)
  }

  async updateSubtopic(id: number, data: { name: string; description?: string }) {
    return this.put(`/subtopics/${id}`, data)
  }

  async deleteSubtopic(id: number) {
    return this.delete(`/subtopics/${id}`)
  }

  // Entries methods
  async getEntries(params?: {
    sectionId?: number
    subtopicId?: number
    tagId?: number
    mood?: string
    search?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const query = searchParams.toString()
    return this.get(`/entries${query ? `?${query}` : ''}`)
  }

  async getEntry(id: number) {
    return this.get(`/entries/${id}`)
  }

  async createEntry(data: {
    title?: string
    content: string
    mood?: string
    intensity?: number
    sectionId: number
    subtopicId?: number
    tagIds?: number[]
    isDraft?: boolean
  }) {
    return this.post('/entries', data)
  }

  async updateEntry(id: number, data: {
    title?: string
    content: string
    mood?: string
    intensity?: number
    sectionId: number
    subtopicId?: number
    tagIds?: number[]
    isDraft?: boolean
  }) {
    return this.put(`/entries/${id}`, data)
  }

  async deleteEntry(id: number) {
    return this.delete(`/entries/${id}`)
  }

  // Tags methods
  async getTags() {
    return this.get('/tags')
  }

  async createTag(data: { name: string; color?: string }) {
    return this.post('/tags', data)
  }

  // Export/Import methods
  async exportData() {
    return this.get('/export')
  }

  async importData(data: any) {
    return this.post('/import', { data })
  }
}

export const api = new ApiClient()
export { ApiError } 