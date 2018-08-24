import { ItemFunction } from '.';
export default interface PluginItem {
    id: string;
    name: string;
    functionName: string;
    url: string;
    functions: Array<ItemFunction>;
}