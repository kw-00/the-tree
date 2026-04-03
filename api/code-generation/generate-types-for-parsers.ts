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

const domainsFolderPath = path.resolve(process.cwd(), "domains")
const domainsFolder = fs.opendirSync(domainsFolderPath)
while (true) {
    const entry = domainsFolder.readSync()
    if (entry === null) break

    domainPaths.push({
        domainName: entry.name,
        source: path.resolve(entry.parentPath, entry.name, SOURCE_FILES_FILENAME),
        destination: path.resolve(entry.parentPath, entry.name, DESTINATION_FILES_FILENAME)
    })
}
domainsFolder.close()

const authDomainName = "auth"
domainPaths.push({
    domainName: authDomainName,
    source: path.resolve(process.cwd(), authDomainName, SOURCE_FILES_FILENAME),
    destination: path.resolve(process.cwd(), authDomainName, DESTINATION_FILES_FILENAME)
})

domainPaths.forEach(({domainName, source, destination}) => {
    const sourceCode = fs.readFileSync(source, "utf-8")
    const sourceFile = ts.createSourceFile
})

