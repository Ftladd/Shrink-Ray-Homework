import { createHash } from 'crypto';
import { AppDataSource } from '../dataSource';
import { Link } from '../entities/Link';
import { User } from '../entities/User';

const linkRepository = AppDataSource.getRepository(Link);

async function getLinkById(linkId: string): Promise<Link | null> {
  const link = await linkRepository
    .createQueryBuilder('link')
    .where('linkId = linkId', { linkId })
    .relation(Link, 'user')
    .select(['link.originalUrl', 'link.lastAccessedOn', 'link.numHits'])
    .getOne();

  return link;
}

function createLinkId(originalUrl: string, userId: string): string {
  const md5 = createHash('md5');
  md5.update(originalUrl.concat(userId.toString()));
  const urlHash = md5.digest('base64url');
  const linkId = urlHash.slice(9);

  return linkId;
}

async function createNewLink(originalUrl: string, linkId: string, creator: User): Promise<Link> {
  let newLink = new Link();
  newLink.originalUrl = originalUrl;
  newLink.linkId = linkId;
  newLink.user = creator;

  newLink = await linkRepository.save(newLink);

  return newLink;
}

async function updateLinkVisits(link: Link): Promise<Link> {
  link.numHits += 1;
  const now = new Date();
  link.lastAccessedOn = now;
  link = await linkRepository.save(link);

  return link;
}

async function getLinksByUserId(userId: string): Promise<Link[]> {
  const links = await linkRepository
    .createQueryBuilder('link')
    .where({ user: { userId } })
    .leftJoinAndSelect('link.user', 'links')
    .getMany();

  return links;
}

async function getLinksByUserIdForOwnAccount(userId: string): Promise<Link[]> {
  const links = await linkRepository
    .createQueryBuilder('link')
    .where({ user: { userId } })
    .leftJoinAndSelect('link.user', 'links')
    .getMany();

  return links;
}

export {
  getLinkById,
  createNewLink,
  createLinkId,
  updateLinkVisits,
  getLinksByUserId,
  getLinksByUserIdForOwnAccount,
};
