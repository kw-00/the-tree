import { ListWindow } from "./list-window"


function createTestArray(size: number) {
    const elements = new Array(size)
    for (let i = 0; i < elements.length; i++) {
        elements[i] = i
    }

    return elements
}

const array = createTestArray(100)
const listWindow = new ListWindow(array, 20, 10, 0)


test('hasNext() boundary for positive cursor', () => {
    listWindow.cursor = 70
    expect(listWindow.hasNext()).toEqual(true)
    listWindow.cursor = 80
    expect(listWindow.hasNext()).toEqual(false)
    listWindow.cursor = 100
    expect(listWindow.hasNext()).toEqual(false)
    listWindow.cursor = 110
    expect(listWindow.hasNext()).toEqual(false)

})

test('hasNext() boundary for negative cursor', () => {
    listWindow.cursor = -30
    expect(listWindow.hasNext()).toEqual(true)
    listWindow.cursor = -20
    expect(listWindow.hasNext()).toEqual(false)
    listWindow.cursor = -1
    expect(listWindow.hasNext()).toEqual(false)
})

test('hasPrevious() boundary for positive cursor', () => {
    listWindow.cursor = 30
    expect(listWindow.hasPrevious()).toEqual(true)
    listWindow.cursor = 20
    expect(listWindow.hasPrevious()).toEqual(true)
    listWindow.cursor = 10
    expect(listWindow.hasPrevious()).toEqual(true)
    listWindow.cursor = 0
    expect(listWindow.hasPrevious()).toEqual(false)

})

test('hasPrevious() boundary for negative cursor', () => {
    listWindow.cursor = -70
    expect(listWindow.hasPrevious()).toEqual(true)
    listWindow.cursor = -80
    expect(listWindow.hasPrevious()).toEqual(true)
    listWindow.cursor = -100
    expect(listWindow.hasPrevious()).toEqual(false)
    listWindow.cursor = -110
    expect(listWindow.hasPrevious()).toEqual(false)

})

test("anchorStart and anchorEnd work", () => {
    for (let cursor = -200; cursor < 200; cursor++) {
        listWindow.cursor = cursor
        const original = 
        listWindow.current()
        if (listWindow.cursor >= 0) {
            listWindow.anchorEnd()
        } else {
            listWindow.anchorStart()
        }
        const flipped = listWindow.current()

        expect(original).toEqual(flipped)
    }
})

test("window is sized properly", () => {
    for (let cursor = -200; cursor < 200; cursor++) {
        listWindow.cursor = cursor
        expect(listWindow.current().length = listWindow.size)
    }
})

