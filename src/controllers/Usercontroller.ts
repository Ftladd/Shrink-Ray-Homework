import { Request, Response } from 'express';
import argon2 from 'argon2';
import { parseDatabaseError } from '../utils/db-utils';
import { addUser, getUserByUsername } from '../models/UserModel';

async function registerUser(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body as AuthRequest;
  // console.log(req.body);

  if (!(await getUserByUsername(username))) {
    res.sendStatus(404);
    return;
  }

  // IMPORTANT: Hash the password
  const passwordHash = await argon2.hash(password);

  try {
    // IMPORTANT: Store the `passwordHash` and NOT the plaintext password
    const newUser = await addUser(username, passwordHash);
    console.log(newUser);
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
}

async function logIn(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body as AuthRequest;

  const user = await getUserByUsername(username);

  if (!user) {
    res.sendStatus(404);
    return; // exit the function
  }

  const { passwordHash } = user;

  // Check password
  if (!(await argon2.verify(passwordHash, password))) {
    res.sendStatus(404);
    return;
  }

  await req.session.clearSession();
  req.session.authenticatedUser = {
    userId: user.userId,
    username: user.username,
    isPro: user.isPro,
    isAdmin: user.isAdmin,
  };
  req.session.isLoggedIn = true;

  res.sendStatus(200);
}

export { registerUser, logIn };
