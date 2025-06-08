// Modified apiHelper.js to handle API issues gracefully
import { useState, useEffect } from 'react';
import gameStateManager from './gameStateManager';

// Create a standalone API service with proper fallback
const APIService = {
  isOnline: false,
  baseURL: 'https://api.turkiyesiyaseti.net',
  
  // Check if API is available
  async checkConnection() {
    try {
      const response = await fetch(`${this.baseURL}/api/health-check`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 3000 // 3 second timeout
      });
      
      this.isOnline = response.ok;
      return this.isOnline;
    } catch (error) {
      console.log("API Connection Failed:", error.message);
      this.isOnline = false;
      return false;
    }
  },
  
  // Generic request method with local storage fallback
  async request(method, endpoint, data = null) {
    // Check connection if not already verified
    if (!this.isOnline) {
      await this.checkConnection();
    }
    
    if (this.isOnline) {
      try {
        const token = localStorage.getItem('token');
        
        const options = {
          method,
          headers: {
            'Content-Type': 'application/json'
          }
        };
        
        if (token) {
          options.headers['Authorization'] = `Bearer ${token}`;
        }
        
        if (data && (method === 'POST' || method === 'PUT')) {
          options.body = JSON.stringify(data);
        }
        
        const response = await fetch(`${this.baseURL}${endpoint}`, options);
        const responseData = await response.json();
        
        return {
          success: response.ok,
          data: responseData,
          status: response.status,
          message: responseData.message || 'Success'
        };
      } catch (error) {
        console.error("API Request Failed:", error.message);
        // Fall back to local storage
        return this.handleOfflineOperation(method, endpoint, data);
      }
    } else {
      // API is offline, use local storage fallback
      return this.handleOfflineOperation(method, endpoint, data);
    }
  },
  
  // Handle operations in offline mode
  handleOfflineOperation(method, endpoint, data) {
    console.log("Using offline mode for:", endpoint);
    
    // Generate fake success response with local storage persistence
    if (method === 'POST' && endpoint.includes('/create-character')) {
      // Save character to local storage
      if (data.character) {
        localStorage.setItem('character', JSON.stringify(data.character));
      }
      return {
        success: true,
        status: 200,
        message: 'Character saved locally',
        data: { character: data.character }
      };
    }
    
    if (method === 'POST' && endpoint.includes('/create-party')) {
      // Save party to local storage
      if (data.party) {
        localStorage.setItem('party', JSON.stringify(data.party));
        
        // Also update the game state manager if available
        if (typeof gameStateManager !== 'undefined') {
          const slotId = data.slotId || 1;
          gameStateManager.activateSlot(slotId);
          gameStateManager.setParty(data.party);
        }
      }
      return {
        success: true,
        status: 200,
        message: 'Party saved locally',
        data: { party: data.party }
      };
    }
    
    if (method === 'GET' && endpoint.includes('/get-character')) {
      const character = JSON.parse(localStorage.getItem('character') || 'null');
      return {
        success: !!character,
        status: character ? 200 : 404,
        message: character ? 'Character found locally' : 'No character found',
        data: character ? { character } : null
      };
    }
    
    if (method === 'GET' && endpoint.includes('/get-party')) {
      const party = JSON.parse(localStorage.getItem('party') || 'null');
      return {
        success: !!party,
        status: party ? 200 : 404,
        message: party ? 'Party found locally' : 'No party found',
        data: party ? { party } : null
      };
    }
    
    // Default fallback for other requests
    return {
      success: false,
      status: 0,
      message: 'API is offline and no local fallback available for this operation',
      offlineMode: true
    };
  },
  
  // Convenience methods
  get(endpoint) {
    return this.request('GET', endpoint);
  },
  
  post(endpoint, data) {
    return this.request('POST', endpoint, data);
  },
  
  put(endpoint, data) {
    return this.request('PUT', endpoint, data);
  },
  
  delete(endpoint) {
    return this.request('DELETE', endpoint);
  }
};

export default APIService;
