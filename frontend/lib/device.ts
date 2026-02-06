import { v4 as uuidv4 } from 'uuid';

const DEVICE_ID_KEY = 'fp_device_id';

/**
 * Retrieves the existing device ID from localStorage or generates a new one.
 * This ID persists across sessions/reload unless storage is cleared.
 */
export const getOrCreateDeviceId = (): string => {
    if (typeof window === 'undefined') return 'server-side-unknown';

    let deviceId = localStorage.getItem(DEVICE_ID_KEY);

    if (!deviceId) {
        deviceId = uuidv4();
        localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }

    return deviceId;
};
