class ErrorHandler {
    static wrap(promise) {
        return promise.catch(error => {
            if (error.code === 'NETWORK_ERROR') {
                throw new Error(`Network error: ${error.message}`);
            }
            if (error.code === 'TIMEOUT') {
                throw new Error(`Operation timed out: ${error.message}`);
            }
            if (error.code === 'CALL_EXCEPTION') {
                throw new Error(`Contract call failed: ${error.message}`);
            }
            throw error;
        });
    }

    static async retryWithBackoff(operation, maxRetries = 3, initialDelay = 1000) {
        let lastError;
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                if (i < maxRetries - 1) {
                    await new Promise(resolve => 
                        setTimeout(resolve, initialDelay * Math.pow(2, i))
                    );
                }
            }
        }
        throw lastError;
    }
}

module.exports = ErrorHandler;
