import React, {useRef, useEffect} from "react";
import { useFrame } from 'react-three-fiber';
import * as THREE from 'three';

function Node(props) {

    // This reference will give us direct access to the mesh
    const ref = useRef();
    const meshRef = useRef();

    // Rotate mesh every frame, this is outside of React without overhead
    //useFrame(() => (ref.current.rotation.x = ref.current.rotation.y += 0.01));
    useEffect(() => {
       //ref.current.color = props.color;
    });


    return (
        <mesh
            ref={ref}
            scale={[0.5, 0.5, 0.5]}>
            <sphereBufferGeometry attach="geometry" args={[5]} />
            <meshStandardMaterial materalRef={meshRef} attach="material" color={props.color} />
        </mesh>
    )
}

export default Node;
