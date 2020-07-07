import React, {useRef, useEffect, useState, useCallback, useContext, useMemo} from "react";
import {useThree, Camera, useFrame} from 'react-three-fiber';
import * as THREE from 'three';

function Scene() {

    //const [floor] = require('../../../assets/logo.png');

    const floorRef = useRef();
    useFrame(() => {
        //camera.rotation.set(40, 0, 45);
        //requestAnimationFrame( animate );
    });
    //floorRef.current.position.y = -0.5;
    //floorRef.current.rotation.x = Math.PI / 2;


    return (
        <group args={[1000, 1, 1000]}>
            <mesh>
                <cubeGeometry attach="geometry" position={[0, -5, 0]} args={[20, 1, 20]} />
                <meshStandardMaterial attach="material" color={'darkgray'} opacity={1} />
            </mesh>
            <mesh>
                <cubeGeometry attach="geometry" position={[-20, -5, 20]} args={[20, 1, 20]} />
                <meshStandardMaterial attach="material" color={'blue'} opacity={0.9} />
            </mesh>
        </group>
    );
}

export default Scene;
