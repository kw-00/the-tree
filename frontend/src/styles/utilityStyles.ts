


const sizes = ["3xs", "2xs", "xs", "s", "sm", "m", "ml", "l", "xl", "2xl", "3xl"]

const justifyContent = ["flex-start", "center", "flex-end", "space-between", "space-evently", "space-around"]
const alignItems = ["flex-start", "center", "flex-end", "stretch"]
const alignSelf = alignItems

const flexGrow = [0, 1, 2, 3, 4, 5]
const flexShrink = flexGrow


// Attribute placeholder = %, value placeholder = $
function createStyles(
        classTemplate: string, 
        valueTemplate: string,
        attributeNames: string[] | string,
        values: string[]): string {

    if (typeof attributeNames === "string") attributeNames = [attributeNames]
    
    let result = ""
    values.forEach(v => {
        result += `.${classTemplate.replace("$", v)}`.padEnd(20) + "{"
        attributeNames.forEach(a => {
            result += `${a}: ${valueTemplate.replaceAll("$", v)}; `
        }) 
        result += "}\n"
    })
    return result
}

function createStylesForClasses (
        classTemplates: string[], 
        valueTemplate: string,
        attributeNames: string[][],
        values: string[]): string {
    
    let result = ""
    const classTemplatesAndAttributeNames = classTemplates.map((c, i) => {
        return {c, a: attributeNames[i]}
    })
    classTemplatesAndAttributeNames.forEach(({c, a}) => result += createStyles(c, valueTemplate, a, values) + "\n")
    return result
}

function createStylesForClassesFromList(...args: any) {
    const classTemplates = args[0]
    const valueTemplate = args[1][0]
    const attributeNames = args[1][1]
    const values = args[1][2]
    return createStylesForClasses(classTemplates, valueTemplate, attributeNames, values)
}


let css = ""

const config = [
    [["w-$", "h-$"], ["var(--size-$)", ["width", "height"], sizes]]
]



css += createStylesForClassesFromList(...config[0])

console.log(css)

