import { Triangle } from '../meshSimplify/models/Triangle';
import { Vector } from '../meshSimplify/models/Vector';
import { simplify } from '../meshSimplify/simplify';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { BufferAttribute, BufferGeometry, Float32BufferAttribute, Group, ObjectLoader } from 'three';

export default class Service {
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
    group.translateY(50);

    this.scene.add(group);
    loader.load(`origin.stl`, geometry => {
      const arr = [80, 50, 20, 10];
      for (let i = 0; i < arr.length; i++) {
        this.renderGeometryWithALG(geometry.clone(), arr[i], i, group);
      }

      const material = new THREE.MeshLambertMaterial({
        color: 0x00ff00,
        wireframe: true,
      }); //材质对象Material
      const mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
      mesh.rotateX(-Math.PI / 2);
      group.add(mesh); //网格模型添加到场景中
    });

    const arr = [80, 50, 20, 10];
    for (let i = 0; i < arr.length; i++) {
      const ele = arr[i];
      loader.load(`sub${ele}.stl`, geometry => {
        const material = new THREE.MeshLambertMaterial({
          color: 0x00ff00,
          wireframe: true,
        }); //材质对象Material
        const mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
        mesh.rotateX(-Math.PI / 2);
        mesh.translateX(55 * (i + 1));
        group.add(mesh); //网格模型添加到场景中
      });
    }

    this.animate();
  }

  renderGeometryWithALG(geometry: BufferGeometry, factor: number, i: number, parent: Group): void {
    const triangles: Triangle[] = [];
    const array = geometry.getAttribute('position').array;
    for (let i = 0, len = array.length; i < len; ) {
      const v1 = new Vector(array[i++], array[i++], array[i++]);
      const v2 = new Vector(array[i++], array[i++], array[i++]);
      const v3 = new Vector(array[i++], array[i++], array[i++]);
      triangles.push(new Triangle(v1, v2, v3));
    }
    console.time('simplify');
    const data = simplify(triangles, factor / 100);
    console.log(data.vertices.length);

    console.timeEnd('simplify');
    geometry.setAttribute('position', new Float32BufferAttribute(data.vertices, 3));
    geometry.setAttribute('normal', new Float32BufferAttribute(data.normals, 3));
    geometry.computeVertexNormals();
    const material = new THREE.MeshLambertMaterial({
      color: 0x00ff00,
      wireframe: true,
    }); //材质对象Material
    const mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
    mesh.rotateX(-Math.PI / 2);
    mesh.translateX(-55 * (i + 1));
    parent.add(mesh); //网格模型添加到场景中
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
