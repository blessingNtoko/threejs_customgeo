import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';
import * as dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

  public scene = new THREE.Scene();
  public renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  public camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, .1, 1000);
  public controls = new OrbitControls(this.camera, this.renderer.domElement);
  public geometry = new THREE.Geometry();
  public directLight = new THREE.DirectionalLight('white', 1);

  ngOnInit() {
    this.init()
  }

  public init() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.controls.update();
    this.camera.position.z = 5;

    this.directLight.position.set(-1, 2, 4);
    this.scene.add(this.directLight);


    this.geometry.vertices.push(
      new THREE.Vector3(-1, -1, 1), // 0
      new THREE.Vector3(1, -1, 1), // 1
      new THREE.Vector3(-1, 1, 1), // 2
      new THREE.Vector3(1, 1, 1), // 3
      new THREE.Vector3(-1, -1, 1), // 4
      new THREE.Vector3(1, -1, -1), // 5
      new THREE.Vector3(-1, 1, -1), // 6
      new THREE.Vector3(1, 1, -1), // 7
    );

    /*
         6----7
        /|   /|
       2----3 |
       | |  | |
       | 4--|-5
       |/   |/
       0----1
    */

    this.geometry.faces.push(
      // front
      new THREE.Face3(0, 3, 2),
      new THREE.Face3(0, 1, 3),
      // right
      new THREE.Face3(1, 7, 3),
      new THREE.Face3(1, 5, 7),
      // back
      new THREE.Face3(5, 6, 7),
      new THREE.Face3(5, 4, 6),
      // left
      new THREE.Face3(4, 2, 6),
      new THREE.Face3(4, 0, 2),
      // top
      new THREE.Face3(2, 7, 6),
      new THREE.Face3(2, 3, 7),
      // bottom
      new THREE.Face3(4, 1, 0),
      new THREE.Face3(4, 5, 1),
    );

    const cubesArr = [
      this.makeInst(this.geometry, 0x44ff44, 0),
      this.makeInst(this.geometry, 0x4444ff, -4),
      this.makeInst(this.geometry, 0xff4444, 4)
    ];

    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    });


    const animate = (time) => {
      time *= .001;

      cubesArr.forEach((cube, ndx) => {
        const speed = 1 + ndx * .1;
        const rotation = time * speed;
        cube.rotation.x = rotation;
        cube.rotation.y = rotation;
      });

      this.controls.update();

      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

  }

  public makeInst(geometry, color, x) {
    const material = new THREE.MeshBasicMaterial({
      color
    });

    const obj3D = new THREE.Mesh(geometry, material);
    this.scene.add(obj3D);

    obj3D.position.x = x;
    return obj3D;
  }
}
