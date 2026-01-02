export class MutationAware<T> {
    #value: T
    #listeners: Set<(value: T) => void> = new Set()

    constructor(initialValue: T) {
        this.#value = initialValue
    }

    get() {
        return this.#value
    }

    set(newValue: T) {
        this.#value = newValue
        this.#listeners.forEach(l => l(newValue))
    }

    subscribe(listener: (value: T) => void) {
        this.#listeners.add(listener)
        return () => this.#listeners.delete(listener)
    }
}