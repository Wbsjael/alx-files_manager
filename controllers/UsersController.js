import bcrypt from 'bcryptjs';
import mongodb from 'mongodb';
import UserCollection from '../utils/users';
import redisClient from '../utils/redis';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }
    const user = await UserCollection.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = await bcrypt.hash(password, 12); // Using bcrypt to hash the password
    const userId = await UserCollection.createUser({
      email,
      password: hashedPassword,
    });
    return res.status(201).json({ id: userId, email });
  }

  static async getMe(req, res) {
    const token = req.headers['x-token'];
    const id = token ? await redisClient.get(`auth_${token}`) : null;
    if (!id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = await UserCollection.getUser({
      _id: mongodb.ObjectId(id),
    });
    return res.status(200).json({ id, email: user[0].email });
  }
}

export default UsersController;

