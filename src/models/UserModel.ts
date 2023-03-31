import { AppDataSource } from '../dataSource';
import { User } from '../entities/User';

const userRepository = AppDataSource.getRepository(User);

async function addUser(username: string, passwordHash: string): Promise<User> {
  // Create the new user object
  let newUser = new User();
  newUser.username = username;
  newUser.passwordHash = passwordHash;

  // Then save it to the database
  // NOTES: We reassign to `newUser` so we can access
  // NOTES: the fields the database autogenerates (the id & default columns)
  newUser = await userRepository.save(newUser);

  return newUser;
}

async function getUserByUsername(username: string): Promise<User | null> {
  const user = await userRepository.findOne({ where: { username } });
  return user;
}

async function getUserById(userId: string): Promise<User | null> {
  const user = await userRepository
    .createQueryBuilder('user')
    .where('userId = userId', { userId })
    .relation(User, 'links')
    .select(['user.username', 'user.isAdmin', 'user.isPro'])
    .getOne();

  return user;
}

export { addUser, getUserByUsername, getUserById };
