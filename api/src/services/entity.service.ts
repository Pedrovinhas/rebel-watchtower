import type { IEntityDAO, Entity, ListEntitiesFilters } from '../dao/interfaces/IEntityDAO.js';
import { AppError } from '../errors.js';

export interface CreateEntityDto {
  name: string;
}

export class EntityService {
  constructor(private readonly entities: IEntityDAO) {}

  async createEntity(dto: CreateEntityDto): Promise<Entity> {
    const existing = await this.entities.findByName(dto.name);
    if (existing) {
      throw new AppError(
        'entity_name_conflict',
        409,
        `Entity with name "${dto.name}" already exists`,
      );
    }
    return this.entities.insert(dto.name);
  }

  async listEntities(
    page: number,
    limit: number,
    filters?: ListEntitiesFilters,
  ): Promise<{ data: Entity[]; total: number; pages: number }> {
    const { data, total } = await this.entities.list(page, limit, filters);
    return { data, total, pages: Math.ceil(total / limit) };
  }
}
