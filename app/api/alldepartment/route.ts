import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);
export async function GET(req) {
  
  try {
    await client.connect();
    const database = client.db('ProjectSphere');
    const departmentsCollection = database.collection("departments"); // Access the departments collection
    const departments = await departmentsCollection.find({}).toArray(); // Fetch all departments

    return new Response(JSON.stringify(departments), { status: 200 });
  } catch (error) {
    console.error("Error fetching departments:", error);
    return new Response("Failed to fetch departments", { status: 500 });
  }
}
