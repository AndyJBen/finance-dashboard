// src/utils/debugHelper.js

// Special console logger with timestamps and color support
export const debugLog = {
    info: (message, data) => {
      const timestamp = new Date().toISOString().substring(11, 23);
      console.log(
        `%c[${timestamp}] %c[INFO] %c${message}`,
        'color: gray',
        'color: blue; font-weight: bold',
        'color: black'
      );
      if (data !== undefined) {
        console.log('%c[DATA]', 'color: purple', data);
      }
    },
    
    error: (message, error) => {
      const timestamp = new Date().toISOString().substring(11, 23);
      console.error(
        `%c[${timestamp}] %c[ERROR] %c${message}`,
        'color: gray',
        'color: red; font-weight: bold',
        'color: black'
      );
      if (error) {
        console.error('%c[ERROR DETAILS]', 'color: red', error);
      }
    },
    
    success: (message, data) => {
      const timestamp = new Date().toISOString().substring(11, 23);
      console.log(
        `%c[${timestamp}] %c[SUCCESS] %c${message}`,
        'color: gray',
        'color: green; font-weight: bold',
        'color: black'
      );
      if (data !== undefined) {
        console.log('%c[DATA]', 'color: purple', data);
      }
    },
    
    trace: (functionName, phase, data) => {
      const timestamp = new Date().toISOString().substring(11, 23);
      console.log(
        `%c[${timestamp}] %c[TRACE] %c${functionName} - ${phase}`,
        'color: gray',
        'color: orange; font-weight: bold',
        'color: black'
      );
      if (data !== undefined) {
        console.log('%c[TRACE DATA]', 'color: orange', data);
      }
    }
  };
  
  // Event tracker to monitor workflow steps
  export const trackEvent = async (eventName, callback) => {
    debugLog.trace(eventName, 'START');
    try {
      const result = await callback();
      debugLog.trace(eventName, 'END', { result });
      return result;
    } catch (error) {
      debugLog.error(`${eventName} failed`, error);
      throw error;
    }
  };
  
  // Response checker for fetch operations
  export const checkResponse = (response) => {
    debugLog.info(`HTTP response: ${response.status} ${response.statusText}`, {
      url: response.url,
      headers: Object.fromEntries([...response.headers.entries()])
    });
    
    return response;
  };
  
  // Network request tracer
  export const traceRequest = async (url, options) => {
    debugLog.info(`Sending request to: ${url}`, options);
    const startTime = performance.now();
    
    try {
      const response = await fetch(url, options);
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      debugLog.info(`Response received in ${duration}ms`, {
        status: response.status,
        statusText: response.statusText
      });
      
      return response;
    } catch (error) {
      debugLog.error(`Request to ${url} failed`, error);
      throw error;
    }
  };