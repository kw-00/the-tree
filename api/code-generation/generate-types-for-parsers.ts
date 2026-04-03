import path from "path"
import fs from "fs"
import ts from"typescript"

const SOURCE_FILES_FILENAME = "parsers.ts"
const DESTINATION_FILES_FILENAME = "types.generated.ts"

type DomainPaths = {
    domainName: string
    source: string
    destination: string
}

const domainPaths = []

const domainsFolderPath = "domains"
const domainsFolder = fs.opendirSync(domainsFolderPath)
while (true) {
    const entry = domainsFolder.readSync()
    if (entry === null) break

    domainPaths.push({
        domainName: entry.name,
        source: path.join(entry.parentPath, entry.name, SOURCE_FILES_FILENAME),
        destination: path.join(entry.parentPath, entry.name, DESTINATION_FILES_FILENAME)
    })
}
domainsFolder.close()

const authDomainName = "auth"
domainPaths.push({
    domainName: authDomainName,
    source: path.join(authDomainName, SOURCE_FILES_FILENAME),
    destination: path.join(authDomainName, DESTINATION_FILES_FILENAME)
})

domainPaths.forEach(({domainName, source, destination}) => {
    const sourceCode = fs.readFileSync(source, "utf-8")
    const sourceFile = ts.createSourceFile(
        destination,
        sourceCode,
        ts.ScriptTarget.ESNext,
        true
    )

    const domainNameCapitalized = `${domainName[0]?.toUpperCase()}${domainName.slice(1)}`
    const parserClassName = `${domainNameCapitalized}Parsers`
    
    const endpointNames: string[] = []
    searchAndOperate(sourceFile, node => {
        if (ts.isClassDeclaration(node)) {
            const name = node.name
            if (name === undefined || name.getText() !== parserClassName) return true
        }
        if (ts.isClassElement(node)) {
            const endpointName = node.getChildAt(1).getText()
            endpointNames.push(endpointName)
            return true
        }
    })

    const parserImportPath = path.join("@", path.dirname(source), `${path.basename(source, ".ts")}.js`).replaceAll(/\\/g, "/")
    let destinationCode = 
    `/** Auto-generated code — do not modify */`
    + `\n\nimport ${parserClassName} from "${parserImportPath}"`
    + "\n\n\n"
    
    
    endpointNames.forEach(endpoint => {
        const endpointCapitalized = `${endpoint[0]?.toUpperCase()}${endpoint.slice(1)}`
        destinationCode += 
            `export type ${endpointCapitalized}Request = ReturnType<typeof ${parserClassName}.${endpoint}.parseRequest>`
            + `\nexport type ${endpointCapitalized}Response = ReturnType<typeof ${parserClassName}.${endpoint}.parseResponse>`
            + `\n\n`
    })
    fs.writeFile(destination, destinationCode, (err) => {
        if (err !== null) {
            throw new Error("An error occurred during writing generated code.")
        }
    })
})

function searchAndOperate(node: ts.Node, operation: (node: ts.Node) => boolean | undefined) {
    const stop = operation(node)
    if (stop) return
    node.forEachChild(c => searchAndOperate(c, operation))
}

