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

export { getLinkById };
