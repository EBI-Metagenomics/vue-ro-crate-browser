declare module 'ro-crate' {
    export class ROCrate {
        constructor(metadata: any, options?: { link?: boolean; array?: boolean });
        getNormalizedTree(): any;
    }
}