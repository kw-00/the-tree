import "./global.css"

const sizes = ["3xs", "2xs", "xs", "s", "sm", "m", "ml", "l", "xl", "2xl", "3xl", "a"]
const padding = ["3xs", "2xs", "xs", "s", "sm", "m", "ml", "l", "xl", "2xl", "3xl", "4xl", "5xl"]
const fontSizes = ["3xs", "2xs", "xs", "s", "sm", "m", "ml", "l", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl"]
const borderWidths = ["xs", "s", "m", "l", "xl"]
const borderRadii = ["3xs", "2xs", "xs", "s", "sm", "m", "ml", "l", "xl", "2xl", "3xl", "full"]
const borderStyles = ["none", "hidden", "solid", "dashed", "dotted", "double", "groove", "ridge", "inset", "outset"];
const flexGrowShrink = [0, 1, 2, 3, 4, 5]
const justifyContent = ["fs", "c", "fe", "sb", "se", "sa"]
const alignItemsSelf = ["fs", "c", "fe", "st"]
const textAlign = ["s", "c", "e", "j"]



// Attribute placeholder = %, value placeholder = $
function createStyles(
        classTemplate: string, 
        valueTemplate: string,
        attributeNames: string[] | string,
        values: string[]): string {

    if (typeof attributeNames === "string") attributeNames = [attributeNames]
    
    let result = ""
    values.forEach(v => {
        result += `.${classTemplate.replace("$", v)}`.padEnd(20) + "{ "
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

const config = [
    // Width, Height and Flex-Basis
    [["w-$", "h-$", "fl-bs-$"], ["var(--size-$)", ["width", "height", "flex-basis"], sizes]],

    // Padding
    [
        ["pad-$", "pad-t-$", "pad-b-$", "pad-l-$", "pad-r-$", "pad-h-$", "pad-v-$"], 
        [   
            "var(--padding-$)", 
            [
                "padding", "padding-top", "padding-bottom", "padding-left", "padding-right", 
                ["padding-left", "padding-right"], ["padding-top", "padding-bottom"]
            ],
            padding
        ]
    ],

    // Border-Width
    [
        ["bw-$", "bw-t-$", "bw-b-$", "bw-l-$", "bw-r-$", "bw-h-$", "bw-v-$"],
        [
            "var(--border-width-$)",
            [
                "border-width", "border-top-width", "border-bottom-width", "border-left-width", "border-right-width",
                ["border-left-width", "border-right-width"], ["border-top-width", "border-bottom-width"]
            ],
            borderWidths
        ]
    ],

    // Border-Radius
    [["br-$"], ["var(--border-radius-$)", ["border-radius"], borderRadii]],

    // Border-Style
    [["bs-$"], ["$", ["border-style"], borderStyles]],

    // Font-Size
    [["font-$"], ["var(--font-$)", ["font-size"], fontSizes]],

    // Flex-Grow/Shrink
    [["fl-gr-$", "fl-sr-$"], ["$", ["flex-grow", "flex-shrink"], flexGrowShrink]],

    // Justify-Content
    [["jst-$"], ["var(--$)", ["justify-content"], justifyContent]],

    // Align-Items
    [["al-i-$"], ["var(--$)", ["align-items"], alignItemsSelf]],

    // Align-Self
    [["al-s-$"], ["var(--$)", ["align-self"], alignItemsSelf]],

    // Text-Align
    [["tx-$"], ["var(--$)", ["text-align"], textAlign]]
]


let css = ""
config.forEach(cfg => css += createStylesForClassesFromList(...cfg) + "\n")

var styleElement = document.createElement("style")
styleElement.appendChild(document.createTextNode(css))
document.head.appendChild(styleElement)

console.log(css)

