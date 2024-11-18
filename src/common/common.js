const formatDate = (date, format) => {
    const y = date.getFullYear();
    const m = date.getMonth() + 1 < 10 ? "0" + date.getMonth() + 1 : date.getMonth() + 1;
    const d = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();

    // eslint-disable-next-line default-case
    switch (format) {
        case 'yyyy-mm-dd':
            return y + "-" + m + '-' + d;
        case 'yy-mm-dd':
            return y.toString().substring(2) + "-" + m + '-' + d;
        case 'dd/mm/yyyy':
            return d + "/" + m + "/" + y;
        case 'mm-dd-yyyy':
            return m + "-" + d + "-" + y;
    }
};

export {
    formatDate
}

export const getFirstAndLastDayOfMonth = (month) => {
    const [year, monthValue] = month.split('-').map(Number);
    const firstDay = new Date(year, monthValue - 1, 1).toISOString().split('T')[0];
    const lastDay = new Date(year, monthValue, 0).toISOString().split('T')[0];
    return { firstDay, lastDay };
};
