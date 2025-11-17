"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaQueryFeature = void 0;
class PrismaQueryFeature {
    constructor(options) {
        this.options = options;
        this.where = {};
        this.orderBy = [];
        this.options.page = options.page || 1;
        this.options.pageSize = options.pageSize || 10;
        this.skip = (this.options.page - 1) * this.options.pageSize;
        this.take = this.options.pageSize;
        this.buildWhere();
        this.buildOrderBy();
    }
    buildWhere() {
        const { search, filter, searchableFields } = this.options;
        const where = {};
        if (search && searchableFields?.length) {
            const searchItems = search.split(',');
            const AND = [];
            searchItems.forEach((item) => {
                const [key, value] = item.split(':');
                if (key === 'all') {
                    const OR = [];
                    searchableFields.forEach((field) => {
                        if (field.includes('.')) {
                            const parts = field.split('.');
                            let nested = {};
                            let current = nested;
                            parts.forEach((part, i) => {
                                if (i === parts.length - 1) {
                                    current[part] = { contains: value, mode: 'insensitive' };
                                }
                                else {
                                    current[part] = {};
                                    current = current[part];
                                }
                            });
                            OR.push(nested);
                        }
                        else {
                            OR.push({ [field]: { contains: value, mode: 'insensitive' } });
                        }
                    });
                    if (OR.length > 0) {
                        AND.push({ OR });
                    }
                }
                else if (searchableFields.includes(key)) {
                    if (key.includes('.')) {
                        const parts = key.split('.');
                        let nested = {};
                        let current = nested;
                        parts.forEach((part, i) => {
                            if (i === parts.length - 1) {
                                current[part] = { contains: value, mode: 'insensitive' };
                            }
                            else {
                                current[part] = {};
                                current = current[part];
                            }
                        });
                        AND.push(nested);
                    }
                    else {
                        AND.push({ [key]: { contains: value, mode: 'insensitive' } });
                    }
                }
            });
            if (AND.length > 0)
                where.AND = AND;
        }
        if (filter) {
            console.log('filter::', filter);
            const filterItems = filter.split(',');
            filterItems.forEach((item) => {
                const [key, value] = item.split(':');
                console.log(key, value);
                if (key.endsWith('_lte')) {
                    const k = key.replace('_lte', '');
                    if (this.options.dateFields?.includes(k)) {
                        const date = new Date(value);
                        if (!isNaN(date.getTime())) {
                            where[k] = { ...(where[k] || {}), lte: date.toISOString() };
                        }
                    }
                    else {
                        where[k] = { ...(where[k] || {}), lte: Number(value) };
                    }
                }
                else if (key.endsWith('_gte')) {
                    const k = key.replace('_gte', '');
                    if (this.options.dateFields?.includes(k)) {
                        const date = new Date(value);
                        if (!isNaN(date.getTime())) {
                            where[k] = { ...(where[k] || {}), gte: date.toISOString() };
                        }
                    }
                    else {
                        where[k] = { ...(where[k] || {}), gte: Number(value) };
                    }
                }
                else {
                    console.log('value:::', value);
                    if (value?.startsWith('[') && value?.endsWith(']')) {
                        const arr = value
                            .slice(1, -1)
                            .split('|')
                            .map((v) => v.trim());
                        where[key] = { in: arr };
                    }
                    else {
                        let parsedValue;
                        if (value === 'true')
                            parsedValue = true;
                        else if (value === 'false')
                            parsedValue = false;
                        else if (this.options.dateFields?.includes(value)) {
                            const date = new Date(value);
                            parsedValue = date.toISOString();
                        }
                        else
                            parsedValue = value;
                        where[key] = parsedValue;
                    }
                }
            });
        }
        this.where = where;
    }
    buildOrderBy() {
        const { sort } = this.options;
        if (!sort) {
            this.orderBy = [{ createdAt: 'desc' }];
            return;
        }
        this.orderBy = sort.split(',').map((item) => {
            const [key, order] = item.split(':');
            return {
                [key]: order === 'desc' ? 'desc' : 'asc',
            };
        });
    }
    getQuery() {
        return {
            skip: this.skip,
            take: this.take,
            where: this.where,
            orderBy: this.orderBy,
        };
    }
    getPagination(total) {
        return {
            total,
            page: this.options.page,
            pageSize: this.options.pageSize,
            totalPages: Math.ceil(total / this.options.pageSize),
        };
    }
}
exports.PrismaQueryFeature = PrismaQueryFeature;
//# sourceMappingURL=prisma-query-feature.js.map