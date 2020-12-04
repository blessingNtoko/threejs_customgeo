import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';
import * as dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { fstat } from 'fs';

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
  public textureLoader = new THREE.TextureLoader();
  public imgLoader = new THREE.ImageLoader();

  ngOnInit() {
    this.init()
  }

  public init() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.camera.position.set(20, 20, 20);
    this.controls.target.set(0, 0, 0);
    this.controls.update();

    this.addLight(-1, 2, 4);
    this.addLight(1, 2, -2);

    const img = this.imgLoader.load('../assets/textures/oip.jpg');
    // const img = this.imgLoader.load('https://threejsfundamentals.org/threejs/resources/images/heightmap-96x64.png');
    console.log('source image ->', img);

    this.createHeightMap(img);

    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    });


    const animate = (time) => {
      time *= .001;

      this.controls.update();

      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

  }

  public makeInst(geometry, color, x, texture?) {
    const material = new THREE.MeshPhongMaterial({
      color,
      map: texture ? texture : null
    });

    const obj3D = new THREE.Mesh(geometry, material);
    this.scene.add(obj3D);

    obj3D.position.x = x;
    return obj3D;
  }

  public addLight(...pos) {
    const color = 'white';
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(pos[0], pos[1], pos[2]);
    this.scene.add(light);
  }

  public createHeightMap(image) {
    // extract the data from the image by drawing it to a canvas and calling getImageData()
    const ctx = document.createElement('canvas').getContext('2d');
    const {width, height} = image;
    console.log('width & height ->', width, height);
    ctx.canvas.width = width;
    ctx.canvas.height = height;
    ctx.drawImage(image, 0, 0);
    const {data} = ctx.getImageData(0, 0, width, height);

    const geometry = new THREE.Geometry();

    const cellsAcross = width - 1;
    const cellsDeep = height - 1;

    for (let z = 0; z < cellsDeep; ++z) {
      for (let x = 0; x < cellsAcross; ++x) {
        // compute row offsets into the height data
        // we multiply by 4 because the data is R, G, B, A but we only care about R
        const base0 = (z * width + x) * 4;
        const base1 = base0 + (width * 4);

        // look up the height for the points aroun the cell
        const h00 = data[base0] / 32;
        const h01 = data[base0 + 4] / 32;
        const h10 = data[base1] / 32;
        const h11 = data[base1 + 4] / 32;
        // compute the average height
        const hm = (h00 + h01 + h10 + h11) / 4;

        // the corner positions
        const x0 = x;
        const x1 = x + 1;
        const z0 = z;
        const z1 = z + 1;

        // remember the first index of these 5 vertices
        const ndx = geometry.vertices.length;

        // add the 4 corners for this cell and the midpoint
        geometry.vertices.push(
          new THREE.Vector3(x0, h00, z0),
          new THREE.Vector3(x1, h01, z0),
          new THREE.Vector3(x0, h10, z1),
          new THREE.Vector3(x1, h11, z1),
          new THREE.Vector3((x0 + x1) / 2, hm, (z0 + z1) / 2),
        );

        // create 4 triangles
        geometry.faces.push(
          new THREE.Face3(ndx + 0, ndx + 4, ndx + 1),
          new THREE.Face3(ndx + 1, ndx + 4, ndx + 3),
          new THREE.Face3(ndx + 3, ndx + 4, ndx + 2),
          new THREE.Face3(ndx + 2, ndx + 4, ndx + 0),
        );

        // add the texture coordinates for each vertex of each face
        const u0 = x / cellsAcross;
        const v0 = z / cellsDeep;
        const u1 = (x + 1) / cellsAcross;
        const v1 = (z + 1) / cellsDeep;
        const um = (u0 + u1) / 2;
        const vm = (v0 + v1) / 2;

        geometry.faceVertexUvs[0].push(
          [new THREE.Vector2(u0, v0), new THREE.Vector2(um, vm), new THREE.Vector2(u1, v0)],
          [new THREE.Vector2(u1, v0), new THREE.Vector2(um, vm), new THREE.Vector2(u1, v1)],
          [new THREE.Vector2(u1, v1), new THREE.Vector2(um, vm), new THREE.Vector2(u0, v1)],
          [new THREE.Vector2(u0, v1), new THREE.Vector2(um, vm), new THREE.Vector2(u0, v0)],
        );

        geometry.computeFaceNormals();

        // center the geometry
        geometry.translate(width / -2, 0, height / -2);

        const texture = this.textureLoader.load('../assets/textures/stars.jpg');

        const material = new THREE.MeshPhongMaterial({
          color: 'green',
          map: texture
        });

        const obj3D = new THREE.Mesh(geometry, material);
        this.scene.add(obj3D);
      }
    }
  }
}
