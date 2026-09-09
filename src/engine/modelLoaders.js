import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

// Configured local offline DRACOLoader instance
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/gltf/');

/**
 * Load a 3D model (.glb, .gltf, .obj, .ply, .stl) or 2D image (.png, .jpg, .jpeg, .webp, .bmp)
 * completely offline from File / Blob URL.
 */
export async function loadModelFromFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file provided."));
      return;
    }

    const fileName = file.name.toLowerCase();
    const objectUrl = URL.createObjectURL(file);

    // 1. 3D GLTF / GLB Models
    if (fileName.endsWith('.glb') || fileName.endsWith('.gltf')) {
      const loader = new GLTFLoader();
      loader.setDRACOLoader(dracoLoader);
      loader.load(
        objectUrl,
        (gltf) => {
          URL.revokeObjectURL(objectUrl);
          const scene = gltf.scene || gltf.scenes[0];
          scene.name = file.name;
          resolve(scene);
        },
        undefined,
        (err) => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error(`Failed to load GLTF/GLB model: ${err.message}`));
        }
      );
    }
    // 2. 3D Wavefront OBJ Models
    else if (fileName.endsWith('.obj')) {
      const loader = new OBJLoader();
      loader.load(
        objectUrl,
        (obj) => {
          URL.revokeObjectURL(objectUrl);
          obj.name = file.name;
          resolve(obj);
        },
        undefined,
        (err) => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error(`Failed to load OBJ model: ${err.message}`));
        }
      );
    }
    // 3. 3D PLY Point Clouds / Meshes
    else if (fileName.endsWith('.ply')) {
      const loader = new PLYLoader();
      loader.load(
        objectUrl,
        (geometry) => {
          URL.revokeObjectURL(objectUrl);
          geometry.computeVertexNormals();
          const material = new THREE.MeshStandardMaterial({
            color: 0x22d3ee,
            roughness: 0.4,
            metalness: 0.5,
            vertexColors: geometry.hasAttribute('color')
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.name = file.name;
          const group = new THREE.Group();
          group.add(mesh);
          group.name = file.name;
          resolve(group);
        },
        undefined,
        (err) => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error(`Failed to load PLY model: ${err.message}`));
        }
      );
    }
    // 4. 3D STL Stereolithography Geometry
    else if (fileName.endsWith('.stl')) {
      const loader = new STLLoader();
      loader.load(
        objectUrl,
        (geometry) => {
          URL.revokeObjectURL(objectUrl);
          geometry.computeVertexNormals();
          const material = new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            roughness: 0.5,
            metalness: 0.6
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.name = file.name;
          const group = new THREE.Group();
          group.add(mesh);
          group.name = file.name;
          resolve(group);
        },
        undefined,
        (err) => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error(`Failed to load STL model: ${err.message}`));
        }
      );
    }
    // 5. 2D Reference Image Files (.png, .jpg, .jpeg, .webp, .bmp, .svg)
    else if (
      fileName.endsWith('.png') ||
      fileName.endsWith('.jpg') ||
      fileName.endsWith('.jpeg') ||
      fileName.endsWith('.webp') ||
      fileName.endsWith('.bmp') ||
      fileName.endsWith('.svg')
    ) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        objectUrl,
        (texture) => {
          URL.revokeObjectURL(objectUrl);

          const imgWidth = texture.image.width || 1024;
          const imgHeight = texture.image.height || 768;
          const aspect = imgWidth / imgHeight;

          const width = 5.0;
          const height = 5.0 / aspect;
          const depth = 3.412; // Deterministic 3D synthetic depth for demo mode

          // Create a 3D closed box geometry for Demo / Placeholder mode
          const geometry = new THREE.BoxGeometry(width, height, depth);
          
          // Material array: 6 sides (Right, Left, Top, Bottom, Front, Back)
          const sideMaterial = new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            roughness: 0.6,
            metalness: 0.3
          });
          const frontMaterial = new THREE.MeshBasicMaterial({
            map: texture
          });

          const materials = [
            sideMaterial, // Right (+X)
            sideMaterial, // Left (-X)
            sideMaterial, // Top (+Y)
            sideMaterial, // Bottom (-Y)
            frontMaterial, // Front (+Z)
            sideMaterial  // Back (-Z)
          ];

          const mesh = new THREE.Mesh(geometry, materials);
          mesh.position.set(0, height / 2, 0);
          mesh.name = file.name;

          const group = new THREE.Group();
          group.add(mesh);
          group.name = file.name;
          group.userData = { isDemoPlaceholder: true };
          resolve(group);
        },
        undefined,
        (err) => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error(`Failed to load image texture: ${err.message}`));
        }
      );
    } else {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Unsupported file format. Supported formats: .glb, .gltf, .obj, .ply, .stl, .png, .jpg, .jpeg, .webp`));
    }
  });
}
