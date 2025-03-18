const isClient = typeof window !== 'undefined';

export const getLocalStorage = <T>(key: string, defaultValue: T): T => {
    if (!isClient) {
        return defaultValue;
    }

    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error getting from localStorage:', error);
        return defaultValue;
    }
};

export const setLocalStorage = <T>(key: string, value: T): void => {
    if (!isClient) {
        return;
    }

    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error setting to localStorage:', error);
    }
};

export const removeLocalStorage = (key: string): void => {
    if (!isClient) {
        return;
    }

    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing from localStorage:', error);
    }
}; 