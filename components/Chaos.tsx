import React, { useEffect, useState } from 'react';
import { Circle } from 'react-native-svg';

// Constants for simulation
const delta = 0.01; // Time step for the simulation
const tStart = -3.0;
const tEnd = 3.0;
const numSteps = Math.floor((tEnd - tStart) / delta);

// Helper to calculate the next point
const getNextPoint = (x: number, y: number, t: number) => {
  const newX = x + delta * y;
  const newY = y + delta * (-(y ** 2) + t ** 2 - x - y);
  return { x: newX, y: newY };
};

// Component to visualize chaos
const Chaos = () => {
  const [points, setPoints] = useState<Array<{x: number, y: number}>>([]);
  const [t, setT] = useState(tStart);

  useEffect(() => {
    let x = t, y = t; // Start each new point at (t, t)
    const intervalId = setInterval(() => {
      if (t < tEnd) {
        const { x: newX, y: newY } = getNextPoint(x, y, t);
        setPoints(pts => [...pts, { x: newX, y: newY }]);
        x = newX;
        y = newY;
        setT(t => t + delta);
      } else {
        clearInterval(intervalId);
      }
    }, 10);

    return () => clearInterval(intervalId);
  }, []);

  // Scale and translate points to fit in the SVG viewbox
  const viewBoxX = 0, viewBoxY = 0, viewBoxWidth = 100, viewBoxHeight = 100;
  const scaleX = (pt: number) => (pt - tStart) * (viewBoxWidth / (tEnd - tStart));
  const scaleY = (pt: number) => viewBoxHeight - (pt + 3) * (viewBoxHeight / 6);

  return (
    <>
      {points.map((point, index) => (
        <Circle
          key={index}
          cx={scaleX(point.x)}
          cy={scaleY(point.y)}
          r="0.5"
          fill="white"
        />
      ))}
    </>
  );
};

export default Chaos;
