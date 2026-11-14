/** Columns and rows of the character grid. */
export declare const NC: number
export declare const NR: number
/** Size of the frame-independent part of every frame, in characters. */
export declare const HEAD_LENGTH: () => number
/** One frame of the black hole at time t (seconds), as an SVG document. */
export declare function frame(t: number): string
