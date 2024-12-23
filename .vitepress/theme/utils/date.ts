function format(n: number): string {
    return String(n).padStart(2, "0");
}

export function date(template: string): string {
    const date = new Date();
    return template
        .replace(/YYYY/g, String(date.getFullYear()))
        .replace(/MM/g, format(date.getMonth() + 1))
        .replace(/DD/g, format(date.getDate()))
        .replace(/HH/g, format(date.getHours()))
        .replace(/mm/g, format(date.getMinutes()))
        .replace(/ss/g, format(date.getSeconds()));
}
