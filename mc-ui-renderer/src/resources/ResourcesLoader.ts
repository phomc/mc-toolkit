export interface ResourcesMapping {
    textures: string;
}

export class ResourcesLoader {
    namespaceRoot: Map<string, ResourcesMapping> = new Map();

    constructor() {
        this.namespaceRoot.set("minecraft", {
            textures: "/assets/minecraft/"
        });
    }

    async fetchTexture(namespacedResource: string) {
        if (namespacedResource.includes(":")) {
            let namespace = namespacedResource.split(":")[0];
            namespacedResource = this.namespaceRoot.get(namespace).textures + namespacedResource.substr(namespace.length + 1);
        }

        return await fetch(namespacedResource);
    }

    loadImage(namespacedResource: string) {
        if (namespacedResource.includes(":")) {
            let namespace = namespacedResource.split(":")[0];
            namespacedResource = this.namespaceRoot.get(namespace).textures + namespacedResource.substr(namespace.length + 1);
        }

        return new Promise<HTMLImageElement>((resolve, reject) => {
            let element = new Image();
            element.style.display = "none";
            element.onload = () => {
                resolve(element);
            };
            element.onerror = (err) => {
                reject(err);
            };
            element.src = namespacedResource;
            document.body.appendChild(element);
        });
    }
}