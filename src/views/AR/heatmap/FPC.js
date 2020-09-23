import React, {useRef, useEffect} from "react";
import {useFrame, useThree} from 'react-three-fiber';
import * as THREE from 'three';

//import mapIndicatorImage from '../../../res/AR/heatmap_man_sprite.png';


function FPC() {

    let loaded = false;
    const ref = useRef();
    const floor = useRef();
    const light = useRef();
    const {camera} = useThree();
    let moveDistance = 7;
    let rotationAngle = 0;
    let rotationOnLoad = 0;
    let positionLocation = [0,0,0];


    useFrame((state, delta) => {

        // Update the rotation for the cube and camera
        rotationAngle = global.tracking.mapRotation;
        positionLocation = global.tracking.heatmapCurrent;

        ref.current.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotationAngle);
        //global.tracking.clearMapRotation();


        ref.current.position.x = positionLocation[0];
        ref.current.position.y = positionLocation[1];
        ref.current.position.z = positionLocation[2];

        floor.current.position.x = positionLocation[0];
        floor.current.position.y = -5;
        floor.current.position.z = positionLocation[2];

        light.current.position.x = positionLocation[0];
        light.current.position.y = positionLocation[1];
        light.current.position.z = positionLocation[2];

        // Update the camera location and rotation
        let relativeCameraOffset = new THREE.Vector3(0, global.tracking.mapTilt,global.tracking.mapZoom);
        let cameraOffset = relativeCameraOffset.applyMatrix4(ref.current.matrixWorld);

        camera.position.x = cameraOffset.x;
        camera.position.y = cameraOffset.y;
        camera.position.z = cameraOffset.z;
        camera.lookAt(ref.current.position);

        // Store the latest coords for the cube position to use with the nodes
        global.tracking.heatmapNode = [Number(ref.current.position.x), Number(ref.current.position.y+3), Number(ref.current.position.z)];
    });
    useEffect(() => {

        // Set the initial rotation on load
        rotationOnLoad = global.tracking.mapRotationOnLoad;

        //let rotateAngle = Math.PI / 2 * delta;
        //let rotation_matrix = new THREE.Matrix4().identity();
        ref.current.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotationOnLoad);
    });

    return (
        <group>
            <pointLight ref={light} intensity={1}/>
            <mesh
                ref={ref}
                scale={[1, 1, 1]}>
                <sphereBufferGeometry attach="geometry" args={[5]} />
                <meshBasicMaterial attach="material" color={'rgb(241,248,255)'} />
            </mesh>
            <mesh ref={floor}>
                <cubeGeometry attach="geometry" position={[0, -5, 0]} args={[400, 0.1, 400]} />
                <meshStandardMaterial attach="material" color={'#02255a'} opacity={1} />
            </mesh>
        </group>
    )
}

/**
 * <Sprite
 url={mapIndicatorImage}
 scale={[1, 1, 1]} />
 */
/**
 * <mesh
 ref={ref}
 scale={[1, 1, 1]}>
 <sphereBufferGeometry attach="geometry" args={[5]} />
 <meshBasicMaterial attach="material" color={'rgb(241,248,255)'} />
 </mesh>
 */

export default FPC;
