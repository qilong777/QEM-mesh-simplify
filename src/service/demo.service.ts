import { Triangle } from '../meshSimplify/models/Triangle';
import { Vector } from '../meshSimplify/models/Vector';
import { simplify } from '../meshSimplify/simplify';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { BufferGeometry, Float32BufferAttribute, Group } from 'three';
const bunny = require('bunny');
const wireframe = false;
export default class DemoService {
  private scene = new THREE.Scene();
  private renderer = new THREE.WebGLRenderer({ antialias: true });
  private camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
  private controls = new OrbitControls(this.camera, this.renderer.domElement);

  constructor() {
    this.scene.background = new THREE.Color(0xffffff);

    const axesHelper = new THREE.AxesHelper(5000);
    this.scene.add(axesHelper);

    this.renderer.setPixelRatio(window.innerWidth / window.innerHeight);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
    this.camera.position.set(0, 500, 500);
    this.controls.enableZoom = true;
    this.controls.zoomSpeed = 2;
    this.controls.mouseButtons = {
      // 左键
      LEFT: THREE.MOUSE.PAN,
      // 滚轮滑动
      MIDDLE: THREE.MOUSE.PAN,
      // 右键
      RIGHT: THREE.MOUSE.ROTATE,
    };
    this.controls.update();
    // lights

    const dirLight1 = new THREE.DirectionalLight(0xffffff);
    dirLight1.position.set(1, 1, 1);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff);
    dirLight2.position.set(-1, -1, -1);
    this.scene.add(dirLight2);

    const ambientLight = new THREE.AmbientLight(0x222222);
    this.scene.add(ambientLight);

    document.querySelector('#app')?.appendChild(this.renderer.domElement);

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }
  public init(): void {
    const loader = new STLLoader();
    const group = new Group();
    const group1 = new Group();
    group.translateY(100);

    this.scene.add(group);
    this.scene.add(group1);
    group1.rotateX(-Math.PI / 2);
    group1.translateY(50);

    const arr = [100, 80, 50, 20, 10, 5];
    const geometry = new BufferGeometry();
    const vertices: number[] = [];
    bunny.cells.forEach((cell: number[]) => {
      vertices.push(...bunny.positions[cell[0]]);
      vertices.push(...bunny.positions[cell[1]]);
      vertices.push(...bunny.positions[cell[2]]);
    });

    geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    this.renderGeometryWithALG(geometry.clone(), arr, group);

    loader.load(`origin.stl`, geometry1 => {
      const arr = [100, 80, 50, 20, 10, 5];
      this.renderGeometryWithALG(geometry1.clone(), arr, group1);
    });

    this.animate();
  }

  async renderGeometryWithALG(geometry: BufferGeometry, factors: number[], parent: Group): Promise<void> {
    const triangles: Triangle[] = [];
    const array = geometry.getAttribute('position').array;
    for (let i = 0, len = array.length; i < len; ) {
      const v1 = new Vector(array[i++], array[i++], array[i++]);
      const v2 = new Vector(array[i++], array[i++], array[i++]);
      const v3 = new Vector(array[i++], array[i++], array[i++]);
      triangles.push(new Triangle(v1, v2, v3));
    }
    console.log(triangles.length);

    console.time('simplify');
    const attrArr = simplify(
      triangles,
      factors.map(ele => ele / 100),
    );

    console.timeEnd('simplify');

    for (let i = 0; i < attrArr.length; i++) {
      const data = attrArr[i];
      const nowGeo = geometry.clone();
      nowGeo.setAttribute('position', new Float32BufferAttribute(data.vertices, 3));
      nowGeo.setAttribute('normal', new Float32BufferAttribute(data.normals, 3));
      nowGeo.computeVertexNormals();
      const material = new THREE.MeshLambertMaterial({
        color: 0x00ff00,
        wireframe: wireframe,
      }); //材质对象Material
      const mesh = new THREE.Mesh(nowGeo, material); //网格模型对象Mesh
      // mesh.rotateX(-Math.PI / 2);
      mesh.translateX(-55 * i);
      parent.add(mesh); //网格模型添加到场景中
    }
  }

  animate(): void {
    requestAnimationFrame(this.animate.bind(this));

    this.controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

    this.render();
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize(): void {
    const camera = this.camera;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
