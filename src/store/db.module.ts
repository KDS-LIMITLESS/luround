import { MongoClient } from "mongodb"


export const connection = {
  provide: 'CONNECTION',
  useFactory: async function connect (): Promise<any> {
    console.log("here")
    const client = await MongoClient.connect("localhost:27017", {
      maxPoolSize: 100,
      minPoolSize: 0,
      maxIdleTimeMS: 1000,
      socketTimeoutMS: 8000
    })
    client.on("connectionPoolCreated", function(log) {
      console.log(`Connected to Database ${log}`)
    }) 
  }
}

