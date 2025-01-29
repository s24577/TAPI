export function applyFilters(data: any[], filter: any) {
    if (!filter) return data;

    return data.filter(item => {
        let matches = true;
        
        Object.entries(filter).forEach(([key, value]: [string, any]) => {
            if (value && value.eq && item[key] !== value.eq) matches = false;
            if (value && value.contains && !item[key].includes(value.contains)) matches = false;
            if (value && value.gt && item[key] <= value.gt) matches = false;
            if (value && value.lt && item[key] >= value.lt) matches = false;
        });

        return matches;
    });
}

export function applySorting(data: any[], sort: any) {
    if (!sort) return data;

    const { field, direction } = sort;
    return [...data].sort((a, b) => {
        const multiplier = direction === 'DESC' ? -1 : 1;
        return multiplier * (a[field] > b[field] ? 1 : -1);
    });
}

export function applyPagination(data: any[], pagination: any) {
    if (!pagination) return data;

    const { page = 1, pageSize = 10 } = pagination;
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
} 