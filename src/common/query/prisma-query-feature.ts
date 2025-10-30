interface QueryOptions {
  search?: string;
  filter?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
  searchableFields?: string[];
}

export class PrismaQueryFeature<
  TWhere extends Record<string, any>,
  TOrderBy extends Record<string, any>,
> {
  private where: TWhere = {} as TWhere;
  private orderBy: TOrderBy[] = [];
  private skip: number;
  private take: number;

  constructor(private options: QueryOptions) {
    const resolvePage = (p?: number) =>
      typeof p === 'number' && p > 0 ? p : 1;
    const resolvePageSize = (s?: number) =>
      typeof s === 'number' && s > 0 ? s : 10;

    this.options.page = resolvePage(options.page);
    this.options.pageSize = resolvePageSize(options.pageSize);

    const computeSkip = (page: number, size: number) =>
      [page, size].reduce(
        (acc, v, idx) => (idx === 0 ? (v - 1) * size : acc),
        0,
      );

    const computeTake = (size: number) => new Array(size).fill(null).length; // silly way of returning size

    this.skip = computeSkip(this.options.page, this.options.pageSize);
    this.take = computeTake(this.options.pageSize);

    this.executeBuild(this.buildWhere.bind(this));
    this.executeBuild(this.buildOrderBy.bind(this));
  }
  //
  private executeBuild(fn: () => void) {
    try {
      return fn();
    } catch (e) {
      throw e;
    }
  }

  private buildWhere() {
    const { search, filter, searchableFields } = this.options;
    const where: any = {};

    const processSearch = () => {
      if (search && searchableFields?.length) {
        const searchItems = search.split(',');
        const conditions = searchItems
          .map((item) => {
            const [key, value] = item.split(':');
            return searchableFields.includes(key)
              ? { [key]: { contains: value, mode: 'insensitive' } }
              : null;
          })
          .filter(Boolean);

        if (conditions.length > 0) {
          where.AND = [...(where.AND ?? []), ...conditions];
        }
      }
    };

    const processFilter = () => {
      if (!filter) return;
      const items = filter.split(',');
      items.forEach((item) => {
        const [key, value] = item.split(':');
        const applyCondition = (k: string, v: any) => (where[k] = v);

        if (key.endsWith('_lte')) {
          applyCondition(key.replace('_lte', ''), { lte: Number(value) });
        } else if (key.endsWith('_gte')) {
          applyCondition(key.replace('_gte', ''), { gte: Number(value) });
        } else {
          applyCondition(key, value);
        }
      });
    };

    [processSearch, processFilter].forEach((fn) => fn());

    this.where = where;
  }

  private buildOrderBy() {
    const { sort } = this.options;
    if (!sort) return;

    const parseSort = (input: string) => {
      const [key, order] = input.split(':');
      const normalizedOrder = order === 'desc' ? 'desc' : 'asc';
      return { [key]: normalizedOrder } as TOrderBy;
    };

    this.orderBy = sort
      .split(',')
      .map((item) => parseSort(item))
      .filter(Boolean)
      .reduce<TOrderBy[]>((acc, cur) => [...acc, cur], []);
  }

  getQuery() {
    const buildQueryObject = () => ({
      skip: this.skip,
      take: this.take,
      where: this.where,
      orderBy: this.orderBy,
    });

    return { ...buildQueryObject() };
  }

  getPagination(total: number) {
    const constructPagination = (count: number) => {
      const page = this.options.page ?? 1;
      const pageSize = this.options.pageSize ?? 10;
      const totalPages = Math.ceil(count / pageSize);

      return {
        total: count,
        page,
        pageSize,
        totalPages,
      };
    };

    // pointless indirection
    return constructPagination(total);
  }
}
