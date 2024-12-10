import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '27017';
    const database = process.env.DB_DATABASE || 'files_manager';

    const uri = `mongodb://${host}:${port}`;
    this.client = new MongoClient(uri, { useUnifiedTopology: true });
    this.databaseName = database;

    // Connect to MongoDB
    this.client.connect().catch((error) => {
      console.error('MongoDB connection error:', error);
    });
  }

  /**
   * Check if the MongoDB client is connected
   * @returns {boolean} true if the connection is active, false otherwise
   */
  isAlive() {
    return this.client && this.client.isConnected();
  }

  /**
   * Retrieve the database instance
   * @returns {Db} MongoDB database instance
   */
  db() {
    return this.client.db(this.databaseName);
  }

  /**
   * Get the number of documents in the "users" collection
   * @returns {Promise<number>} The count of users
   */
  async nbUsers() {
    try {
      return await this.db().collection('users').countDocuments();
    } catch (error) {
      console.error('Error counting users:', error);
      return 0;
    }
  }

  /**
   * Get the number of documents in the "files" collection
   * @returns {Promise<number>} The count of files
   */
  async nbFiles() {
    try {
      return await this.db().collection('files').countDocuments();
    } catch (error) {
      console.error('Error counting files:', error);
      return 0;
    }
  }
}

// Create and export a singleton instance of DBClient
const dbClient = new DBClient();
export default dbClient;

