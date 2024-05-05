import React, { useEffect, useRef } from 'react';
import { GLView } from 'expo-gl';
import { ExpoWebGLRenderingContext } from 'expo-gl';
import ChaosArt from './ChaosArt';  

const ChaosArtView = () => {
    const chaosArt = ChaosArt.getInstance();


    const onContextCreate = (gl: ExpoWebGLRenderingContext) => {
        const vertices = new Float32Array([
            -1, -1,  // Bottom left
             1, -1,  // Bottom right
             1,  1,  // Top right
            -1,  1,  // Top left
            -1, -1   // Close the loop to bottom left
        ]);
        
        // Square buffer setup
        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        // Points buffer setup
        const pointsBuffer = gl.createBuffer();

        // Shaders
        const vsSource = `
            attribute vec2 position;
            void main() {
                gl_Position = vec4(position, 0.0, 1.0);
                gl_PointSize = 5.0; // Point size
            }
        `;

        const fsSource = `
            precision mediump float;
            void main() {
                gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Points color (red)
            }
        `;

        // Load and compile shaders
        const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
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
        gl.useProgram(shaderProgram);

        const positionAttributeLocation = gl.getAttribLocation(shaderProgram, 'position');

        const render = () => {
            const pointsData = chaosArt.computeNextPoints();
            console.log("Time: ", chaosArt.currentTime);
            const points = new Float32Array(pointsData.flat());

            // Update points buffer with new data
            gl.bindBuffer(gl.ARRAY_BUFFER, pointsBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, points, gl.DYNAMIC_DRAW);

            // Set viewport and clear the canvas
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            gl.clearColor(0, 0, 0, 1);  // Clear to black
            gl.clear(gl.COLOR_BUFFER_BIT);

            // Draw square
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.LINE_STRIP, 0, 5);

            // Draw points
            gl.bindBuffer(gl.ARRAY_BUFFER, pointsBuffer);
            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.POINTS, 0, pointsData.length / 2);

            gl.endFrameEXP();
            requestAnimationFrame(render);
        };

        requestAnimationFrame(render);
    };

    return (
        <GLView style={{ width: '100%', height: '80%' }} onContextCreate={onContextCreate} />
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

export function nextChaosEquation() {

}