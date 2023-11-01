export class Utils {

    public static arrayIsEmpty(array: any[]): boolean{
        return array.length == 0;
    }

    public static objectIsEmpty(object: object): boolean{
        return Object.keys(object).length == 0;
    }

    public static stringIsEmpty(string: string): boolean{
        return string == "";
    }

    public static removeEntry(index: number, array: any[]): any[]{
        if (index < 0 || index >= array.length){
            return array;
        }
        return array.slice(0, index).concat(array.slice(index + 1, array.length));
    }

    public static mergeAny(array1: any[], array2: any[]): any[]{
        return [... new Set([...array1, ...array2])];
    }

    public static merge<Type>(array1: Type[], array2: Type[]): Type[]{
        return [... new Set([...array1, ...array2])];
    }

    public static buildSemperAPIUrl(path: string): string{
        return  process.env.API_URL + path + "?accessToken=$" + process.env.API_ACCESS_TOKEN;
    }

    public static buildSemperAPIUrlWithServerId(path: string): string{
        return this.buildSemperAPIUrl(path + "/" + process.env.serverId)
    }

}