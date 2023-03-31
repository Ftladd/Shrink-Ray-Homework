import { createHash } from 'crypto';
import { AppDataSource } from '../dataSource';
import { Link } from '../entities/Link';

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

  console.log(`MD5 Hash: ${urlHash}`);
  console.log(`linkId: ${linkId}`);

  return linkId;
}

export { getLinkById, createLinkId };
