export interface FontProvider {
    type: "bitmap";
    file: string;
    height: number;
    ascent: number;
    chars: string[];
}