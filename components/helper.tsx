import React, { useRef, useEffect } from 'react';
import { GLView } from 'expo-gl';
import { ExpoWebGLRenderingContext, GLViewProps } from 'expo-gl';
import { StyleSheet } from 'react-native';
import ChaosArt from './ChaosArt'; // Ensure this path is correct
import { vsSourceChaos, fsSourceChaos } from './canvas_constants';


const ChaosArtView = () => {
    const ref = useRef<GLView>(null);
    const chaosArt = new ChaosArt();

    const initGL = async (gl: ExpoWebGLRenderingContext) => {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

        // Shader creation and linking
        const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSourceChaos);
        const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSourceChaos);
        if (!vertexShader || !fragmentShader) {
            console.error('Shader loading failed.');
            return; // Exit if shaders fail to load
        }

        const shaderProgram = gl.createProgram();
        if (!shaderProgram) {
            console.error('Failed to create shader program.');
            return; // Exit if program creation fails
        }

        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
            return; // Exit if linking fails
        }

        // Buffer initialization
        const positionBuffer = gl.createBuffer();
        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([]), gl.DYNAMIC_DRAW);
        if (!positionBuffer || !colorBuffer) {
            console.error('Failed to create buffers.');
            return; // Exit if buffer creation fails
        }

        const animate = () => {
            if (gl) {
                drawChaosArt(gl, shaderProgram, positionBuffer, colorBuffer);
                gl.endFrameEXP();
                requestAnimationFrame(animate);
            }
        };

        // Start the animation loop
        requestAnimationFrame(animate);
    };

    const drawChaosArt = (gl: ExpoWebGLRenderingContext, program: WebGLProgram, positionBuffer: WebGLBuffer, colorBuffer: WebGLBuffer) => {
        // Compute chaos points and colors (logic needs to be adapted from existing chaos functions)
        // Assume chaosArt is an instance of the ChaosArt class
        const pointsData = chaosArt.computeNextPoints();
        //console.log(pointsData.length);


        const points = new Float32Array(pointsData.flat());
        const colors = new Float32Array(chaosArt.pointColors);  // Assuming pointColors is accessible and formatted appropriately

        // Then use these in your buffer data setup in drawChaosArt function
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, points, gl.DYNAMIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.DYNAMIC_DRAW);


        // Drawing commands here
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        gl.useProgram(program);
        gl.enableVertexAttribArray(0);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        
        gl.enableVertexAttribArray(1);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0);
        
        gl.drawArrays(gl.POINTS, 0, points.length / 2);
    };

    return (
<GLView style={{ width: '100%', height: '70%' }} onContextCreate={onContextCreate} />
    );
};

export default ChaosArtView;

function loadShader(gl: ExpoWebGLRenderingContext, type: number, source: string) {
    const shader = gl.createShader(type);
    if (!shader) {
        console.error('Unable to create shader.');
        return null;
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}


// Vertex shader program
const vsSourceChaos = `
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
const fsSourceChaos = `
    // Fragment shader
    precision mediump float;
    //uniform vec4 colour;
    varying lowp vec4 colour;

    void main() {
        gl_FragColor = colour;
    }
`;
