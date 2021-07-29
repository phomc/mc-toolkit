import { ChatText } from "@mangoplex/mc-ui-renderer";

export interface Item {
    id: string;
    amount: number;
    meta?: ItemMeta;
}

export interface ItemMeta {
    tooltip?: ChatText[];
}