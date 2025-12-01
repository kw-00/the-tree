import DatabaseInterface from "./database-interface";




export default class DatabaseService {
    databaseInterface: DatabaseInterface

    constructor(databaseInterface: DatabaseInterface) {
        this.databaseInterface = databaseInterface
    }
}