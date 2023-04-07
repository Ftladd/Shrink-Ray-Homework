import { Request, Response } from 'express';
import { parseDatabaseError } from '../utils/db-utils';
import { getUserById } from '../models/UserModel';
import { createNewLink, createLinkId, updateLinkVisits, getLinkById } from '../models/LinkModel';

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

async function getOriginalUrl(req: Request, res: Response): Promise<void> {
  const { linkId } = req.params as LinkIdParam;
  if (!linkId) {
    res.sendStatus(404);
    return;
  }
  const link = getLinkById(linkId);
  updateLinkVisits(await link);
  res.redirect(301, (await link).originalUrl);
}

async function getOwnLinks(req: Request, res: Response): Promise<void> {
  const { userId } = req.params as userIdParam;
  if (req.session.isLoggedIn === false) {
    res.sendStatus(403);
  }
}
export { shortenUrl, getOriginalUrl };
