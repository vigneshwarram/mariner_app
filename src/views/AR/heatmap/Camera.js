import React, {useRef, useEffect, useState, useCallback, useContext, useMemo} from "react";
import {useThree, useFrame} from 'react-three-fiber';

function Camera() {

    function Camera(props) {
        const ref = useRef();
        const { setDefaultCamera } = useThree();
        useEffect(() => void setDefaultCamera(ref.current), []);
        useFrame((state, delta) => {
            let moveDistance = 200 * delta; // 200 pixels per second
            let rotateAngle = Math.PI / 2 * delta;

        });
        return <perspectiveCamera
            ref={ref}
            fov={50}
            near={0.1}
            far={20000}
            position={[0, -5, 150]}
            aspect={window.innerWidth / window.innerHeight}
            onUpdate={self => self.updateProjectionMatrix()}
        />
    }
    return (
        <Camera/>
    );
}

export default Camera;
