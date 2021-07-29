export class Emitter<T> {
    private listeners: EmitterListener<T>[] = [];

    add(listener: EmitterListener<T>) {
        if (this.listeners.includes(listener)) return;
        this.listeners.push(listener);
    }
    
    remove(listener: EmitterListener<T>) {
        const index = this.listeners.indexOf(listener);
        if (index == -1) return;
        this.listeners.splice(index, 1);
    }

    emit(obj: T): any[] {
        return this.listeners.map(v => v(obj));
    }
}

export type EmitterListener<T> = (obj: T) => any;