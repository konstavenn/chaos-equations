
// Vertex shader program
export const vsSourceChaos = `
    // Vertex shader
/*
    attribute vec4 aVertexPosition;

    void main() {
        gl_Position = aVertexPosition;
        gl_PointSize = 3.0; // Make this large enough to be visible
    }
*/
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    varying lowp vec4 colour;

    void main() {
        gl_Position = aVertexPosition;
        gl_PointSize = 1.0; // Adjust size of the point here
        colour = aVertexColor;
    }
`;


// Fragment shader program
export const fsSourceChaos = `
    // Fragment shader
    precision mediump float;
    //uniform vec4 colour;
    varying lowp vec4 colour;

    void main() {
        gl_FragColor = colour;
    }
`;
