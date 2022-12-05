import { v4 as uuid } from 'uuid';

type CacheGetter = () => string;
type CacheSetter = (newValue: string | undefined) => void;
type CacheResetter = () => void;

const getCachedIdentifier = (
    key: string,
    storage: Storage
): [CacheGetter, CacheSetter, CacheResetter] => {
    let inMemory = uuid();

    return [
        () => {
            try {
                const fromStorage = storage.getItem(key);

                if (fromStorage) {
                    return fromStorage;
                }

                storage.setItem(key, inMemory);
            } catch (e) {
                try {
                    // Just in case the error wasn't related to the storage's availability,
                    // we might be able to recover so we can link some sessions together
                    storage.setItem(key, inMemory);
                } catch (saveError) {
                    // Do nothing
                }
            }

            return inMemory;
        },
        (newValue) => {
            if (newValue) {
                inMemory = newValue;

                try {
                    storage.setItem(key, newValue);
                } catch (e) {
                    // Do nothing
                }
            } else {
                inMemory = uuid();

                try {
                    storage.removeItem(key);
                } catch (e) {
                    // Do nothing
                }
            }
        },
        () => {
            inMemory = uuid();

            try {
                storage.removeItem(key);
                // The next run of the getter will store the new value
            } catch (e) {
                // Do nothing
            }
        },
    ];
};

export { getCachedIdentifier };
