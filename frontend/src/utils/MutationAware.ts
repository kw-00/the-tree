
let count = 0

export class MutationAware<T> {
    #value: T
    #listeners: Set<(value: T) => void> = new Set()

    constructor(initialValue: T) {
        count++
        console.log("Count", count)
        this.#value = initialValue
    }

    get() {
        return this.#value
    }

    set(newValue: T) {
        console.log("Set", newValue)
        this.#value = newValue
        console.log(this.#listeners.size)
        this.#listeners.forEach(l => l(newValue))
    }

    subscribe(listener: (value: T) => void) {
        this.#listeners.add(listener)
        return () => this.#listeners.delete(listener)
    }
}