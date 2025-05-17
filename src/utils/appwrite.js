import { Client, Storage, ID } from 'appwrite';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1') // Replace with your Appwrite endpoint
  .setProject('[681df7420036a19aa0e1]'); // Replace with your project ID

const storage = new Storage(client);

export { client, storage, ID };