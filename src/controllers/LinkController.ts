import { Request, Response } from 'express';
import { parseDatabaseError } from '../utils/db-utils';
import { getUserById } from '../models/UserModel';
import { createNewLink, createLinkId } from '../models/LinkModel';

async function shortenUrl(req: Request, res: Response): Promise<void> {
  const { originalUrl } = req.body as LinkRequest;
  if (req.session.isLoggedIn === false) {
    res.sendStatus(404);
    return;
  }

  const { userId } = req.session.authenticatedUser;
  const user = getUserById(userId);
  if (!user) {
    res.sendStatus(404);
    return;
  }
  if ((await user).isAdmin === false || (await user).isPro === false) {
    if ((await user).links.length >= 5) {
      res.sendStatus(403);
      return;
    }
  }

  const linkId = createLinkId(originalUrl, userId);

  try {
    createNewLink(originalUrl, linkId, await user);
    res.sendStatus(201);
  } catch (err) {
    console.log(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.sendStatus(500).json(databaseErrorMessage);
  }
}

export { shortenUrl };
