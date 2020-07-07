import React, { useRef } from 'react';
import { extend, useThree, useFrame } from 'react-three-fiber';
import {FirstPersonControls} from 'three/examples/jsm/controls/FirstPersonControls';

import { EventRegister } from 'react-native-event-listeners';

extend({ FirstPersonControls });

function Controls() {
    const controlsRef = useRef();
    const { camera, gl } = useThree();

    EventRegister.addEventListener("UpdateCameraMovement", (data) => {
        //camera.position.z += 10;
        //controlsRef.current.update();
    });

    camera.position.set(0, 150, 400 );
    //camera.up.set(0,0,1)
    useFrame(() => {
        //camera.rotation.set(40, 0, 45);
        //requestAnimationFrame( animate );

        controlsRef.current && controlsRef.current.update();
    });

    return (
        <firstPersonControls
            ref={controlsRef}
            lookspeed={0.4}
            movementspeed={20}
            nofly={true}
            lookVertical={false}
            lon={-150}
            lat={120}
        />
    );
}

export default Controls;
